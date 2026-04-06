/**
 * zenxify-fe/src/components/shared/NotificationPanel.jsx
 * ────────────────────────────────────────────────────────
 * High-fidelity dropdown panel for displaying user notifications.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Bell, 
    CheckCircle2, 
    Trash2, 
    Clock, 
    Sparkles, 
    AlertCircle, 
    CheckCircle,
    X
} from 'lucide-react';
import { 
    selectNotifications, 
    markAsReadAsync, 
    markAllAsReadAsync, 
    clearAllNotificationsAsync,
    selectNotificationLoading
} from '../../redux/notifications/notificationSlice';
import moment from 'moment';

/** @param {{ onClose: () => void }} props */
const NotificationPanel = ({ onClose }) => {
    const dispatch = useDispatch();
    const notifications = useSelector(selectNotifications);
    const isLoading = useSelector(selectNotificationLoading);

    /** @param {string} type */
    const getIcon = (type) => {
        switch (type) {
            case 'processing_complete': return <CheckCircle size={16} className="text-green-500" />;
            case 'export_ready': return <Sparkles size={16} className="text-primary" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            case 'low_credits': return <AlertCircle size={16} className="text-amber-500" />;
            default: return <Bell size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="fixed md:absolute top-[90px] md:top-full inset-x-4 md:inset-auto md:right-[-10px] md:mt-4 md:w-[380px] bg-white dark:bg-[#12101D] rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 z-70 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Pointer Arrow - Desktop Only */}
            <div className="hidden md:block absolute top-[-6px] right-[24px] w-3 h-3 bg-white dark:bg-[#12101D] border-t border-l border-gray-100 dark:border-gray-800 rotate-45 z-0" />
            
            {/* Header ... */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-charcoal dark:text-white uppercase tracking-wider">Notifications</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-70">
                            {notifications.filter((/** @type {any} */ n) => !n.is_read).length} Unread
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => /** @type {any} */ (dispatch)(markAllAsReadAsync())}
                        title="Mark all as read"
                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-primary/5"
                    >
                        <CheckCircle2 size={18} />
                    </button>
                    <button 
                        onClick={() => onClose()}
                        className="p-2 text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* List Area */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="py-16 px-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-[24px] bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-300 mb-4">
                            <Bell size={32} opacity={0.3} />
                        </div>
                        <h4 className="text-sm font-black text-charcoal dark:text-gray-400 uppercase tracking-wider mb-1">Clear as crystal</h4>
                        <p className="text-xs text-gray-400 font-bold">No notifications to show right now</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((/** @type {any} */ notification) => (
                            <div 
                                key={notification.id}
                                onClick={() => !notification.is_read && /** @type {any} */ (dispatch)(markAsReadAsync(notification.id))}
                                className={`group p-4 border-b border-gray-50 dark:border-gray-800/30 transition-all cursor-pointer flex items-start gap-4 ${
                                    !notification.is_read ? 'bg-primary/2 dark:bg-primary/3' : 'hover:bg-gray-50 dark:hover:bg-gray-800/20'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                                    !notification.is_read 
                                    ? 'bg-white dark:bg-gray-900 border-primary/20 scale-100' 
                                    : 'bg-gray-50 dark:bg-gray-800 border-transparent opacity-60'
                                }`}>
                                    {getIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center justify-between mb-0.5 gap-2">
                                        <h5 className={`text-[12px] font-black tracking-tight truncate ${
                                            !notification.is_read ? 'text-charcoal dark:text-white' : 'text-gray-500'
                                        }`}>
                                            {notification.title}
                                        </h5>
                                        <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap flex items-center gap-1">
                                            <Clock size={10} />
                                            {moment(notification.created_at).fromNow(true)}
                                        </span>
                                    </div>
                                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                                        !notification.is_read ? 'text-gray-600 dark:text-gray-300 font-bold' : 'text-gray-400 font-medium'
                                    }`}>
                                        {notification.message}
                                    </p>
                                </div>

                                {!notification.is_read && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-50 dark:border-gray-800/50 flex justify-center">
                    <button 
                        onClick={() => /** @type {any} */ (dispatch)(clearAllNotificationsAsync())}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-500 transition-all flex items-center gap-2 group"
                    >
                        <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
                        Clear All History
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
