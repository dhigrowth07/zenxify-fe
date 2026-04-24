import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Zap } from 'lucide-react';
import { Outlet, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/shared/Sidebar';
// ... rest of imports (simulated)
import NotificationPanel from '../components/shared/NotificationPanel';
import { 
    fetchNotificationsAsync, 
    addNotification, 
    selectUnreadCount 
} from '../redux/notifications/notificationSlice';
import { initNotificationStream } from '../services/notificationServices';

const DashboardLayout = () => {
    const dispatch = useDispatch();
    const unreadCount = useSelector(selectUnreadCount);
    const accessToken = useSelector((/** @type {any} */ state) => state.auth?.accessToken);
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
    const [showNotifications, setShowNotifications] = useState(false);
    /** @type {React.MutableRefObject<HTMLDivElement|null>} */
    const notificationRef = useRef(null);

    // Initialize notifications and SSE stream
    useEffect(() => {
        console.log("[SSE] effect running. token present:", !!accessToken);
        // Note: We no longer return early if accessToken is missing because 
        // the backend can authenticate via HttpOnly cookies.
        
        // Fetch initial notifications if we have any auth indicator (or try regardless)
        /** @type {any} */ (dispatch)(fetchNotificationsAsync({ page: 1, limit: 20 }));

        // Init real-time stream
        const closeStream = initNotificationStream({
            token: accessToken,
            onNotification: (notification) => {
                console.log("[SSE] Received new notification:", notification);
                dispatch(addNotification(notification));
            },
            onError: (err) => {
                console.warn("[SSE] Notification stream error, auto-reconnecting...", err);
            }
        });

        const handleClickOutside = (/** @type {MouseEvent} */ event) => {
            if (notificationRef.current && !notificationRef.current.contains(/** @type {Node} */ (event.target))) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            closeStream();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dispatch, accessToken]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && !isCollapsed) {
                setIsCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isCollapsed]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0D0B14] flex selection:bg-primary/20 selection:text-primary transition-colors">
            {/* Dynamic Sidebar */}
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

            {/* Main Content Wrapper - Dynamic Margin */}
            <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen flex flex-col p-4 bg-zenxify-bg pt-6 transition-all duration-300 ease-in-out`}>
                {/* Global Dashboard Header - Floating Style */}
                <header className="flex items-center justify-between mb-8 sticky top-4 bg-white/90 dark:bg-[#0D0B14]/90 backdrop-blur-xl z-40 py-3 px-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 mx-2">
                    <div className="relative w-full max-w-md group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/search:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-12 pr-6 py-3 bg-[#F9F9FB] dark:bg-gray-900/50 border border-transparent dark:border-gray-800 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-sm tracking-tight text-charcoal shadow-inner"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-3 transition-all rounded-full group active:scale-90 shadow-sm border ${
                                    showNotifications 
                                    ? 'bg-primary/10 text-primary border-primary/20' 
                                    : 'bg-[#EEF2F6] dark:bg-gray-900/50 text-charcoal dark:text-gray-400 hover:text-primary hover:bg-primary/5 border-black/5 dark:border-white/5'
                                }`}
                            >
                                <Bell size={20} strokeWidth={2} />
                                {unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-md transform group-hover:scale-110 transition-transform">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </div>
                                )}
                            </button>

                            {showNotifications && (
                                <NotificationPanel onClose={() => setShowNotifications(false)} />
                            )}
                        </div>

                        <Link 
                            to="/settings/billing?tab=plans"
                            className="flex items-center gap-3 px-8 py-3.5 bg-charcoal dark:bg-primary text-white rounded-[20px] font-black uppercase tracking-widest text-xs hover:scale-[1.03] active:scale-95 transition-all shadow-xl hover:shadow-primary/30"
                        >
                            <Zap size={16} fill="currentColor" strokeWidth={0} />
                            Upgrade
                        </Link>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 w-full flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
