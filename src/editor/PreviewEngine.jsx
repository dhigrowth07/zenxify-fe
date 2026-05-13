import React, { useRef, useEffect } from "react";
import { Surface } from "gl-react-dom";
import { useSelector, useDispatch } from "react-redux";
import ColorGradeLayer from "./layers/ColorGradeLayer";
import VideoLayer from "./layers/VideoLayer";
import BrollOverlay from "./overlays/BrollOverlay";
import { setPreviewTime, setIsPlaying } from "../redux/editor/editorSlice";

/**
 * PreviewEngine
 * The heart of the Zenxify video editor.
 * Manages the GL pipeline and the hidden source video.
 */
/**
 * @param {object} props
 * @param {number} [props.volume]
 * @param {boolean} [props.muted]
 * @param {number} [props.resizeMode]
 * @param {function} [props.onMetadataLoaded]
 * @param {boolean} [props.isPlaying]
 */
export default function PreviewEngine({ 
  volume = 1,
  muted = false,
  resizeMode = 0, // 0: Cover, 1: Contain
  onMetadataLoaded = (/** @type {any} */ meta) => {},
  isPlaying: controlledIsPlaying = undefined,
  segments = []
}) {
  const dispatch = useDispatch();
  /** @type {any} */
  const editorState = useSelector((state) => (/** @type {any} */(state)).editor.editor);
  const sourceUrl = useSelector((state) => (/** @type {any} */(state)).editor.sourceUrl);
  const isPlayingRedux = useSelector((state) => (/** @type {any} */(state)).editor.isPlaying);
  const previewTime = useSelector((state) => (/** @type {any} */(state)).editor.previewTime);
  
  // Use controlled prop if provided, otherwise fallback to Redux
  const isPlaying = controlledIsPlaying !== undefined ? controlledIsPlaying : isPlayingRedux;
  
  const containerRef = useRef();
  const videoRef = useRef();
  const [size, setSize] = React.useState({ width: 360, height: 640 });

  // Helper: compact snapshot of video element state for logs
  const snap = () => {
    const v = videoRef.current;
    if (!v) return '(no video)';
    const bufferedEnd = v.buffered.length > 0 ? v.buffered.end(v.buffered.length - 1).toFixed(2) : 'none';
    return `t=${v.currentTime.toFixed(3)} paused=${v.paused} readyState=${v.readyState} networkState=${v.networkState} bufferedEnd=${bufferedEnd}`;
  };

  // Dynamically track container size for the GPU Surface
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = containerRef.current?.clientWidth || 0;
        const height = containerRef.current?.clientHeight || 0;
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Sync Global Play/Pause state to the underlying video element
  useEffect(() => {
    if (!videoRef.current) return;
    console.log(`[PE:isPlaying] effect fired — isPlaying=${isPlaying} | ${snap()}`);
    if (isPlaying) {
      if (videoRef.current.readyState >= 2) {
        console.log('[PE:isPlaying] calling play()...');
        videoRef.current.play().catch(e => {
          console.error(`[PE:isPlaying] play() REJECTED — name=${e.name} msg=${e.message} | ${snap()}`);
        });
      } else {
        console.warn(`[PE:isPlaying] NOT ready for play — readyState=${videoRef.current.readyState} | ${snap()}`);
      }
    } else {
      console.log('[PE:isPlaying] calling pause() | ${snap()}');
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Sync Global Seek state (manual jumps)
  useEffect(() => {
    if (!videoRef.current) return;
    const diff = Math.abs(videoRef.current.currentTime - previewTime);
    console.log(`[PE:seek] effect — redux=${previewTime.toFixed(3)} | ${snap()} | diff=${diff.toFixed(3)} willSeek=${diff > 0.5}`);
    if (diff > 0.5) {
      console.log(`[PE:seek] SEEKING to ${previewTime.toFixed(3)}`);
      videoRef.current.currentTime = previewTime;
    }
  }, [previewTime]);

  // Ensure the browser reloads the video when the source URL changes
  useEffect(() => {
    if (sourceUrl && videoRef.current) {
      console.log(`[PE:sourceUrl] source changed — calling load(). url=${sourceUrl}`);
      videoRef.current.load();
    }
  }, [sourceUrl]);

  // ── Heartbeat watchdog ─────────────────────────────────────────────────────
  // Fires every 2s while isPlaying=true to detect silent stalls
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = videoRef.current?.currentTime ?? 0;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (!v) return;
      const advanced = v.currentTime - lastTime;
      if (advanced < 0.05) {
        console.warn(`[PE:watchdog] STUCK — time did not advance! advanced=${advanced.toFixed(4)} | ${snap()} | redux_isPlaying=${isPlaying}`);
      } else {
        console.log(`[PE:watchdog] OK — advanced ${advanced.toFixed(3)}s in last 2s | ${snap()}`);
      }
      lastTime = v.currentTime;
    }, 2000);
    return () => clearInterval(id);
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
    >
      {/* 
        HIDDEN SOURCE VIDEO
      */}
      <video
        ref={videoRef}
        className="absolute opacity-0 pointer-events-none"
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        loop
        muted 
        onLoadedMetadata={(e) => {
          /** @type {any} */
          const target = e.target;
          const { videoWidth, videoHeight } = target;
          console.log(`[PE:loadedmetadata] ${videoWidth}x${videoHeight} | ${snap()}`);
          if (videoWidth && videoHeight) {
            const aspect = videoWidth / videoHeight;
            if (Math.abs(aspect - (editorState?.color?.hsl?.lastAspect || 0)) > 0.01) {
              onMetadataLoaded?.({ width: videoWidth, height: videoHeight, aspect });
            }
          }
        }}
        onTimeUpdate={(e) => {
          /** @type {any} */
          const video = e.target;
          dispatch(setPreviewTime(video.currentTime));
        }}
        onError={(e) => {
          /** @type {any} */
          const video = videoRef.current;
          console.error("[PE:error] Video error:", video?.error, "url:", sourceUrl);
        }}
        onCanPlay={() => {
          console.log(`[PE:canPlay] fired | ${snap()}`);
          // Only call play() if currently paused — canPlay fires on every buffer refill
          if (isPlaying && videoRef.current && videoRef.current.paused) {
            console.log('[PE:canPlay] video is paused but should play — calling play()');
            videoRef.current.play().catch((/** @type {any} */ e) => console.warn("[PE:canPlay] play() blocked:", e));
          }
        }}
        onPlaying={() => {
          console.log(`[PE:playing] video started/resumed | ${snap()}`);
        }}
        onPause={() => {
          console.log(`[PE:pause] video PAUSED | ${snap()} | redux_isPlaying=${isPlaying}`);
        }}more
        onSeeking={() => {
          console.log(`[PE:seeking] seek started | ${snap()}`);
        }}
        onSeeked={() => {
          console.log(`[PE:seeked] seek complete | ${snap()} | redux_isPlaying=${isPlaying}`);
        }}
        onWaiting={() => {
          console.warn(`[PE:waiting] BUFFERING/WAITING | ${snap()}`);
        }}
        onStalled={() => {
          console.warn(`[PE:stalled] STALLED — browser stopped fetching data | ${snap()}`);
        }}
        onSuspend={() => {
          console.warn(`[PE:suspend] SUSPENDED — browser suspended loading | ${snap()}`);
        }}
        onEnded={() => {
          console.log(`[PE:ended] video ended | ${snap()}`);
        }}
      >
        {sourceUrl && <source src={sourceUrl} type="video/mp4" />}
      </video>

      {/* 
        GL-REACT SURFACE
        The "GPU Window" where the graded video is rendered.
      */}
      {sourceUrl && size.width > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Surface 
            width={size.width} 
            height={size.height} 
            pixelRatio={window.devicePixelRatio || 1}
            style={{ width: '100%', height: '100%' }}
            webglContextAttributes={{
                preserveDrawingBuffer: true,
                alpha: false
            }}
          >
            <ColorGradeLayer color={editorState.color}>
              <VideoLayer 
                videoRef={videoRef} 
                surfaceWidth={size.width} 
                surfaceHeight={size.height} 
                resizeMode={resizeMode}
              />
            </ColorGradeLayer>
          </Surface>
        </div>
      )}

      {/* 
        OVERLAYS
      */}
      <BrollOverlay segments={segments} />

      {/* FUTURE: CaptionLayer goes here as overlays */}
    </div>
  );
}
