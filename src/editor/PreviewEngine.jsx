import React, { useRef, useEffect } from "react";
import { Surface } from "gl-react-dom";
import { useSelector, useDispatch } from "react-redux";
import ColorGradeLayer from "./layers/ColorGradeLayer";
import VideoLayer from "./layers/VideoLayer";
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
  isPlaying: controlledIsPlaying = undefined
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
    if (isPlaying) {
      videoRef.current.play().catch(e => console.warn("Autoplay blocked", e));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Sync Global Seek state (manual jumps)
  useEffect(() => {
    if (!videoRef.current) return;
    const diff = Math.abs(videoRef.current.currentTime - previewTime);
    if (diff > 0.5) { // Only force seek if the difference is significant
      videoRef.current.currentTime = previewTime;
    }
  }, [previewTime]);

  // Ensure the browser reloads the video when the source URL changes
  useEffect(() => {
    if (sourceUrl && videoRef.current) {
      videoRef.current.load();
    }
  }, [sourceUrl]);

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
          if (videoWidth && videoHeight) {
            const aspect = videoWidth / videoHeight;
            onMetadataLoaded?.({ width: videoWidth, height: videoHeight, aspect });
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
          console.error("GPU Video Source Error:", video?.error);
          console.error("Attempted URL:", sourceUrl);
        }}
        onCanPlay={() => {
          if (isPlaying && videoRef.current) {
            videoRef.current.play().catch((/** @type {any} */ e) => console.warn("Autoplay blocked:", e));
          }
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

      {/* FUTURE: BrollLayer and CaptionLayer go here as overlays */}
    </div>
  );
}
