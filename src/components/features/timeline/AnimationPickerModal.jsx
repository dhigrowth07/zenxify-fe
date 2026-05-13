import React from 'react';
import { createPortal } from 'react-dom';
import { X, Check, MoveRight, Maximize, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

const ANIMATIONS = [
  { id: 'none', name: 'None', description: 'Static visual display', icon: X, color: 'bg-slate-400' },
  { id: 'pan_left', name: 'Pan Left', description: 'Slow slide to the left', icon: MoveRight, color: 'bg-blue-400', className: 'rotate-180' },
  { id: 'pan_right', name: 'Pan Right', description: 'Slow slide to the right', icon: MoveRight, color: 'bg-indigo-400' },
  { id: 'zoom_in', name: 'Zoom In', description: 'Cinematic forward crawl', icon: Maximize, color: 'bg-purple-400' },
  { id: 'tilt_up', name: 'Tilt Up', description: 'Vertical upward pan', icon: ArrowUp, color: 'bg-emerald-400' },
  { id: 'tilt_down', name: 'Tilt Down', description: 'Vertical downward pan', icon: ArrowDown, color: 'bg-teal-400' },
  { id: 'ken_burns', name: 'Ken Burns', description: 'Dynamic zoom and pan', icon: Sparkles, color: 'bg-amber-400' },
];

const AnimationPickerModal = ({ isOpen, onClose, onSelect, currentAnimation }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-50 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 shrink-0">
          <div>
            <h2 className="text-lg font-black text-charcoal tracking-tight">Cinematic Effects</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Select Animation Style</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-charcoal transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid Area - Scrollable */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-3">
            {ANIMATIONS.map((anim) => {
              const Icon = anim.icon;
              return (
                <button
                  key={anim.id}
                  onClick={() => onSelect(anim)}
                  className={cn(
                    "group relative p-3 rounded-xl border-2 transition-all text-left flex flex-col gap-2",
                    currentAnimation === anim.id 
                      ? "border-primary bg-primary/5 shadow-sm scale-[0.98]" 
                      : "border-gray-100 hover:border-primary/30 hover:bg-gray-50"
                  )}
                >
                  {/* Preview Box */}
                  <div className={cn("w-full aspect-video rounded-lg shadow-inner relative overflow-hidden flex items-center justify-center", anim.color)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <Icon className={cn("text-white/80 group-hover:scale-110 transition-transform", anim.className)} size={32} strokeWidth={3} />
                    
                    {currentAnimation === anim.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-black text-charcoal">{anim.name}</h3>
                    <p className="text-[9px] font-medium text-gray-400 mt-0.5 line-clamp-1">{anim.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/30 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-charcoal text-white font-black text-xs shadow-md hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            Apply Animation
          </button>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />
    </div>,
    document.body
  );
};

export default AnimationPickerModal;
