import React, { useRef, useState } from 'react';
import { 
  Monitor, 
  Maximize2, 
  SkipBack, 
  Play, 
  Pause,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '../../lib/utils';
import VideoModal from './VideoModal';

/**
 * @param {object} props
 * @param {any} props.project - Project data with video_url and thumbnail_url
 * @param {any} props.color - Grading color state
 * @param {React.ReactNode} [props.actionButton] - Optional action button for the bottom
 * @param {string} [props.title] - Section title
 * @param {string} [props.className] - Container classes
 */
const VideoPreview = ({ 
  project, 
  color, 
  actionButton, 
  title = "Preview", 
  className 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(true);

  const filterString = `
    brightness(${1 + (color?.exposure || 0)}) 
    contrast(${color?.contrast || 1}) 
    saturate(${color?.saturation || 1})
    hue-rotate(${color?.hsl?.hue || 0}deg)
  `;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    if (newVolume > 0) setIsMuted(false);
    else setIsMuted(true);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  return (
    <div className={cn("flex flex-col pt-1 self-stretch", className)}>
      <div className="flex justify-between items-end mb-2 px-1">
        <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest opacity-70">
          {title}
        </h2>
        <div className="flex gap-3 text-charcoal">
          <Maximize2 
            size={20} 
            className="cursor-pointer hover:text-primary transition-colors active:scale-90" 
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-9/16 bg-black border-[6px] border-white group/video">
        {project?.video_url ? (
          <video 
            ref={videoRef}
            src={project.video_url} 
            poster={project.thumbnail_url}
            className="w-full h-full object-cover transition-all duration-300"
            style={{ filter: filterString }}
            playsInline
            loop
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
        ) : (
          <img 
            src={project?.thumbnail_url || "https://images.unsplash.com/photo-1590086782792-42dd2350140d?q=80&w=1000&auto=format&fit=crop"} 
            alt="Preview" 
            className="w-full h-full object-cover" 
          />
        )}
      </div>

      <div className="mt-auto">
        <div className="flex rounded-2xl shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] items-center gap-3 px-2 mb-4 mt-2 py-3 group/volume">
          <button 
            onClick={toggleMute}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="relative flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden cursor-pointer">
            <div 
              className="absolute inset-y-0 left-0 bg-brand-gradient transition-all duration-200"
              style={{ width: `${volume * 100}%` }}
            />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
          <span className="text-[10px] font-mono text-gray-400 w-8">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        <div className="flex justify-center items-center gap-8 py-3 bg-gray-50/50 rounded-2xl mb-4 border border-gray-100/50 shadow-inner">
          <SkipBack 
            size={20} 
            className="text-charcoal cursor-pointer hover:scale-110 transition-all hover:text-primary" 
            onClick={() => skip(-10)}
          />
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all active:scale-95 group/play"
          >
            {isPlaying ? (
              <Pause size={20} className="text-charcoal group-hover:text-primary transition-colors" fill="currentColor" />
            ) : (
              <Play size={20} className="text-charcoal translate-x-0.5 group-hover:text-primary transition-colors" fill="currentColor" />
            )}
          </button>
          <SkipForward 
            size={20} 
            className="text-charcoal cursor-pointer hover:scale-110 transition-all hover:text-primary" 
            onClick={() => skip(10)}
          />
        </div>
        {actionButton}
      </div>

      <VideoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={project?.video_url}
        title={project?.title}
        filters={filterString}
      />
    </div>
  );
};

export default VideoPreview;
