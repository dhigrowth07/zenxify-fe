import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
    AlertTriangle, 
    X, 
    RefreshCcw, 
    AlertCircle, 
    Info 
} from 'lucide-react';

/**
 * @typedef {'danger' | 'warning' | 'info'} ModalVariant
 * @typedef {Object} ConfirmationModalProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {() => void} onConfirm
 * @property {string} title
 * @property {string} description
 * @property {string} [confirmLabel]
 * @property {string} [cancelLabel]
 * @property {boolean} [isLoading]
 * @property {ModalVariant} [variant]
 */

/** @type {React.FC<ConfirmationModalProps>} */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading = false,
    variant = 'danger'
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    /** @param {React.MouseEvent} e */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const variants = {
        danger: {
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/10',
            border: 'border-red-100 dark:border-red-900/50',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
        },
        warning: {
            icon: AlertCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/10',
            border: 'border-amber-100 dark:border-amber-900/50',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
        },
        info: {
            icon: Info,
            color: 'text-primary',
            bg: 'bg-primary/5',
            border: 'border-primary/10',
            button: 'bg-primary hover:bg-primary/90 shadow-primary/20'
        }
    };

    const config = variants[variant] || variants.danger;
    const Icon = config.icon;

    return createPortal(
        <div 
            className={`fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onAnimationEnd={() => !isOpen && setIsAnimating(false)}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md" 
                onClick={handleBackdropClick}
            />

            {/* Modal Card */}
            <div 
                className={`relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[40px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all duration-500 ease-out ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
            >
                {/* Header Decoration */}
                <div className={`h-2 ${config.bg} ${config.color}`} />

                <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-8">
                    {/* Icon Circle */}
                    <div className={`w-20 h-20 ${config.bg} rounded-[32px] flex items-center justify-center ${config.color} shadow-inner`}>
                        <Icon size={36} strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-2xl font-black text-charcoal dark:text-white uppercase font-display tracking-tight leading-tight">
                            {title}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                            {description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-4">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onClose}
                            className="w-full py-4 bg-[#F9F9FB] dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-[24px] font-black uppercase tracking-widest text-xs hover:text-charcoal dark:hover:text-white transition-all active:scale-95 disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onConfirm}
                            className={`w-full py-4 text-white ${config.button} rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-xl disabled:opacity-70`}
                        >
                            {isLoading ? (
                                <RefreshCcw className="animate-spin" size={18} />
                            ) : null}
                            {isLoading ? 'Processing...' : confirmLabel}
                        </button>
                    </div>
                </div>

                {/* Close Button UI */}
                <button 
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-charcoal dark:hover:text-white rounded-full transition-colors disabled:opacity-0"
                >
                    <X size={20} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
