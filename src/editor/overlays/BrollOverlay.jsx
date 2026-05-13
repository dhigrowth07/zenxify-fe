import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';

const BROLL_KEYFRAMES = `
  @keyframes broll-zoom-in   { from { transform: scale(1.02); } to { transform: scale(1.12); } }
  @keyframes broll-pan-left  { from { transform: scale(1.15) translateX(6%); } to { transform: scale(1.15) translateX(-6%); } }
  @keyframes broll-pan-right { from { transform: scale(1.15) translateX(-6%); } to { transform: scale(1.15) translateX(6%); } }
  @keyframes broll-tilt-up   { from { transform: scale(1.15) translateY(6%); } to { transform: scale(1.15) translateY(-6%); } }
  @keyframes broll-tilt-down { from { transform: scale(1.15) translateY(-6%); } to { transform: scale(1.15) translateY(6%); } }
  @keyframes broll-ken-burns { from { transform: scale(1.04) translate(0%,0%); } to { transform: scale(1.16) translate(4%,3%); } }
`;

const ANIM_NAME_MAP = {
  zoom_in: 'broll-zoom-in', pan_left: 'broll-pan-left', pan_right: 'broll-pan-right',
  tilt_up: 'broll-tilt-up', tilt_down: 'broll-tilt-down', ken_burns: 'broll-ken-burns',
};

const getPausedTransform = (anim, p) => {
  if (anim === 'zoom_in')    return `scale(${1.02 + p * 0.1})`;
  if (anim === 'pan_left')   return `scale(1.15) translateX(${(0.5 - p) * 12}%)`;
  if (anim === 'pan_right')  return `scale(1.15) translateX(${(p - 0.5) * 12}%)`;
  if (anim === 'tilt_up')    return `scale(1.15) translateY(${(0.5 - p) * 12}%)`;
  if (anim === 'tilt_down')  return `scale(1.15) translateY(${(p - 0.5) * 12}%)`;
  if (anim === 'ken_burns')  return `scale(${1.04 + p * 0.12}) translate(${p * 4}%,${p * 3}%)`;
  return 'scale(1.01)';
};

let keyframesInjected = false;
const ensureKeyframes = () => {
  if (keyframesInjected) return;
  const s = document.createElement('style');
  s.textContent = BROLL_KEYFRAMES;
  document.head.appendChild(s);
  keyframesInjected = true;
};

const resolveUrl = (seg) => seg.final_url || seg.ai_image_url || seg.web_image_url || null;
const isVideoUrl  = (url) => /\.(mp4|webm)/i.test(url) || url.includes('video');

/**
 * BrollOverlay
 *
 * Animation strategy — eliminates the "stuck-and-play" lag:
 *
 * ROOT CAUSE: `animationDelay` was recalculated from Redux `previewTime`
 * (sampled every ~250ms). Changing animationDelay on a running CSS animation
 * restarts it → visible as a stutter 4× per second.
 *
 * FIX:
 * 1. `frozenElapsedRef` captures the elapsed time ONCE when play starts or
 *    the segment changes. This value does NOT change during playback.
 * 2. `playingAnimStyle` is memoized on [segmentId, animTrigger] — NOT previewTime.
 *    The memo returns the SAME object reference every render while playing.
 *    React sees no style change → zero DOM updates → CSS animation runs free.
 * 3. When PAUSED, a separate inline `transform` is derived from live
 *    `previewTime`, correctly showing the seek frame without any animation.
 */
const BrollOverlay = ({ segments = [] }) => {
  const previewTime = useSelector((s) => s.editor.previewTime);
  const isPlaying   = useSelector((s) => s.editor.isPlaying);

  const videoRef        = useRef(null);
  const frozenElapsedRef = useRef(0);   // elapsed captured at play-start
  const prevPlayingRef  = useRef(false);

  const [activeSegment, setActiveSegment] = useState(null);
  const [isVisible,     setIsVisible]     = useState(false);
  const [animTrigger,   setAnimTrigger]   = useState(0); // bumped to reset CSS anim

  useEffect(() => ensureKeyframes(), []);

  // ─── Segment Detection (runs on previewTime) ───────────────────────────────
  useEffect(() => {
    const active = segments.find((seg) => {
      if (seg.is_footage !== true || !resolveUrl(seg)) return false;
      const start = parseFloat(seg.start_time);
      return previewTime >= start && previewTime < (start + parseFloat(seg.duration));
    });

    if ((active?.id ?? null) === (activeSegment?.id ?? null)) return;

    if (!active) {
      setIsVisible(false);
      const t = setTimeout(() => setActiveSegment(null), 420);
      return () => clearTimeout(t);
    }

    // New segment — capture frozen elapsed and reset animation
    frozenElapsedRef.current = Math.max(0, previewTime - parseFloat(active.start_time));
    setActiveSegment(active);
    setAnimTrigger((k) => k + 1);
    setIsVisible(false);
    const t = setTimeout(() => setIsVisible(true), 16);
    return () => clearTimeout(t);
  }, [previewTime, segments]); // eslint-disable-line

  // ─── Capture Elapsed on Play-Start (post-seek resume) ──────────────────────
  useEffect(() => {
    const justStarted = isPlaying && !prevPlayingRef.current;
    prevPlayingRef.current = isPlaying;

    if (justStarted && activeSegment) {
      frozenElapsedRef.current = Math.max(0, previewTime - parseFloat(activeSegment.start_time));
      setAnimTrigger((k) => k + 1); // Reset CSS animation with correct offset
    }
  }, [isPlaying]); // eslint-disable-line

  // ─── Video Sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const url = activeSegment && resolveUrl(activeSegment);
    if (!url || !isVideoUrl(url) || !videoRef.current) return;

    if (isPlaying) videoRef.current.play().catch(() => {});
    else           videoRef.current.pause();

    const rel   = previewTime - parseFloat(activeSegment.start_time);
    const drift = Math.abs(videoRef.current.currentTime - rel);
    if (drift > 0.3) videoRef.current.currentTime = Math.max(0, rel);
  }, [isPlaying, previewTime, activeSegment]);

  // ─── Animation Styles ──────────────────────────────────────────────────────

  /**
   * PLAYING style — memoized on [segId, animTrigger].
   * Does NOT depend on previewTime → same object reference every render while
   * playing → React skips DOM style update → CSS animation runs uninterrupted.
   */
  const playingAnimStyle = useMemo(() => {
    if (!activeSegment) return { transform: 'scale(1.01)' };
    const animName = ANIM_NAME_MAP[activeSegment.animation];
    if (!animName)  return { transform: 'scale(1.01)' };
    const duration = parseFloat(activeSegment.duration);
    return {
      animationName:           animName,
      animationDuration:       `${duration}s`,
      animationDelay:          `-${frozenElapsedRef.current.toFixed(3)}s`,
      animationTimingFunction: 'linear',
      animationFillMode:       'both',
      animationPlayState:      'running',
      willChange:              'transform',
    };
  }, [activeSegment?.id, animTrigger]); // eslint-disable-line

  /**
   * PAUSED style — derived from live previewTime for accurate seek display.
   * Only used when the video is paused.
   */
  const pausedAnimStyle = useMemo(() => {
    if (!activeSegment) return { transform: 'scale(1.01)' };
    const start    = parseFloat(activeSegment.start_time);
    const duration = parseFloat(activeSegment.duration);
    const progress = Math.min(1, Math.max(0, (previewTime - start) / duration));
    return { transform: getPausedTransform(activeSegment.animation, progress) };
  }, [activeSegment?.id, previewTime]); // eslint-disable-line

  // ─── Render ────────────────────────────────────────────────────────────────
  if (!activeSegment) return null;
  const url  = resolveUrl(activeSegment);
  if (!url) return null;
  const isVid = isVideoUrl(url);

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease-in-out' }}
    >
      {/*
        key = segId + animTrigger → remounts div to reset CSS animation cleanly.
        Changing key only when needed (segment change or play-start), NOT on
        every previewTime tick.
      */}
      <div
        key={`${activeSegment.id}-${animTrigger}`}
        className="w-full h-full"
        style={isPlaying ? playingAnimStyle : pausedAnimStyle}
      >
        {isVid ? (
          <video key={url} ref={videoRef} src={url}
            className="w-full h-full object-cover" muted playsInline loop />
        ) : (
          <img key={url} src={url} alt="B-roll overlay"
            className="w-full h-full object-cover" />
        )}
      </div>
    </div>
  );
};

export default BrollOverlay;
