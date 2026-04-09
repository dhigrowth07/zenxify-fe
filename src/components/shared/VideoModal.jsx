import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {string} props.videoUrl
 * @param {string} [props.title]
 * @param {string} [props.filters] - CSS filters to apply (grading)
 */
const VideoModal = ({ isOpen, onClose, videoUrl, title, filters }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
      onClick={() => onClose()}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      <div 
        className="relative w-auto max-w-5xl max-h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300 ring-1 ring-white/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-linear-to-b from-black/90 via-black/40 to-transparent">
          <div className="min-w-0 pr-4">
            <h4 className="text-white font-black text-lg uppercase tracking-tight truncate">
              {title || 'Video Preview'}
            </h4>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
              Cinema Mode • Dynamic Grade Preview
            </p>
          </div>
          <button 
            onClick={() => onClose()}
            className="shrink-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all backdrop-blur-md active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        <video 
          src={videoUrl} 
          controls 
          autoPlay 
          className="w-full h-full max-h-[90vh] object-contain shadow-2xl"
          style={{ filter: filters }}
        />
      </div>
    </div>
  );
};

export default VideoModal;
