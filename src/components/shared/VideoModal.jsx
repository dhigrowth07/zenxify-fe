import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '../../lib/utils';
import PreviewEngine from '../../editor/PreviewEngine';
import { setIsPlaying, setPreviewTime } from '../../redux/editor/editorSlice';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {string} props.videoUrl
 * @param {string} [props.title]
 */
const VideoModal = ({ isOpen, onClose, videoUrl, title }) => {
  const dispatch = useDispatch();
  const isPlaying = useSelector((state) => state.editor.isPlaying);
  const previewTime = useSelector((state) => state.editor.previewTime);

  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [videoMeta, setVideoMeta] = useState({ aspect: 16 / 9 });

  // Auto-play when modal opens
  React.useEffect(() => {
    if (isOpen) {
      dispatch(setIsPlaying(true));
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const togglePlay = (e) => {
    e.stopPropagation();
    dispatch(setIsPlaying(!isPlaying));
  };

  const skip = (e, seconds) => {
    e.stopPropagation();
    dispatch(setPreviewTime(Math.max(0, previewTime + seconds)));
  };

  console.log("Metadata", videoMeta);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
      onClick={() => onClose()}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />

      <div
        className="relative bg-black rounded-[32px] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col group/modal"
        style={{
          width: '95vw',
          // Use a default wide stage until metadata is loaded to prevent collapse
          maxWidth: videoMeta?.aspect 
            ? `calc(85vh * ${videoMeta.aspect})` 
            : 'calc(85vh * 1.77)',
          aspectRatio: videoMeta?.aspect ? `${videoMeta.aspect} / 1` : '1.77 / 1',
          maxHeight: '85vh',
          minHeight: '200px' // Safety minimum
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-linear-to-b from-black/80 via-black/10 to-transparent">
          <div className="min-w-0 pr-4">
            <h4 className="text-white font-black text-lg uppercase tracking-tight truncate drop-shadow-lg">
              {title || 'Cinematic Preview'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                GPU Pipeline Active
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="shrink-0 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-xl active:scale-90 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        {/* Dynamic GPU Preview Wrapper */}
        <div
          className="relative flex-1 cursor-pointer overflow-hidden"
          onClick={togglePlay}
        >
          <div className="w-full h-full flex items-center justify-center bg-black/40">
            <PreviewEngine
              volume={volume}
              muted={isMuted}
              resizeMode={1}
              isPlaying={isPlaying}
              onMetadataLoaded={setVideoMeta}
            />
          </div>

          {/* Center Feedback Icon */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300",
            isPlaying ? "opacity-0 scale-150" : "opacity-100 scale-100"
          )}>
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl">
              {isPlaying ? <Pause size={32} className="text-white fill-white" /> : <Play size={32} className="text-white fill-white translate-x-1" />}
            </div>
          </div>
        </div>

        {/* Cinematic Control Bar - COMPACT VERSION */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full flex items-center gap-6 shadow-2xl opacity-0 hover:opacity-100 group-hover/modal:opacity-100 transition-all duration-500 z-50">

          {/* Skip Back */}
          <button onClick={(e) => skip(e, -10)} className="text-white/50 hover:text-white transition-colors active:scale-90">
            <SkipBack size={18} />
          </button>

          {/* Master Play/Pause */}
          <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all active:scale-95">
            {isPlaying ? <Pause size={20} className="text-black fill-black" /> : <Play size={20} className="text-black fill-black translate-x-0.5" />}
          </button>

          {/* Skip Forward */}
          <button onClick={(e) => skip(e, 10)} className="text-white/50 hover:text-white transition-colors active:scale-90">
            <SkipForward size={18} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Volume Control */}
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="relative w-20 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer">
              <div className="absolute h-full bg-primary" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (parseFloat(e.target.value) > 0) setIsMuted(false);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Status Tip */}
        <div className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 font-bold text-[9px] uppercase tracking-[0.4em] pointer-events-none transition-opacity duration-300",
          isPlaying ? "opacity-0" : "opacity-100"
        )}>
          Press space or click to play
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
