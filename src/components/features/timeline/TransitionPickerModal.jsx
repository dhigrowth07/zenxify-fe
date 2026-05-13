import React from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

const TRANSITIONS = [
  { id: 'none', name: 'None', description: 'Hard cut — no transition', preview: 'bg-slate-400' },
  { id: 'fade', name: 'Fade', description: 'Smooth transparency blend', preview: 'bg-blue-400' },
  { id: 'zoom', name: 'Zoom', description: 'Dynamic scale transition', preview: 'bg-orange-400' },
  { id: 'blur', name: 'Blur', description: 'Soft focus dissolve effect', preview: 'bg-purple-400' },
  { id: 'glitch', name: 'Glitch', description: 'Digital distortion effect', preview: 'bg-red-400' },
];


const TransitionPickerModal = ({ isOpen, onClose, onSelect, currentTransition }) => {
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
            <h2 className="text-lg font-black text-charcoal tracking-tight">Transitions</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Select style</p>
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
            {TRANSITIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className={cn(
                  "group relative p-3 rounded-xl border-2 transition-all text-left flex flex-col gap-2",
                  currentTransition === t.id 
                    ? "border-primary bg-primary/5 shadow-sm scale-[0.98]" 
                    : "border-gray-100 hover:border-primary/30 hover:bg-gray-50"
                )}
              >
                {/* Preview Box */}
                <div className={cn("w-full aspect-video rounded-lg shadow-inner relative overflow-hidden", t.preview)}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  {currentTransition === t.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xs font-black text-charcoal">{t.name}</h3>
                  <p className="text-[9px] font-medium text-gray-400 mt-0.5 line-clamp-1">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/30 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-charcoal text-white font-black text-xs shadow-md hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            Apply Transition
          </button>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />
    </div>,
    document.body
  );
};

export default TransitionPickerModal;
