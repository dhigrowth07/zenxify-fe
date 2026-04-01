import React, { useState } from 'react';
import { Search, Bell, Zap } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';

const DashboardLayout = () => {
    // Default to collapsed if on mobile (width < 768px)
    const [isCollapsed, setIsCollapsed] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => {
            // Auto-collapse if window is resized below 768px
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
            <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen flex flex-col p-4 pt-6 transition-all duration-300 ease-in-out`}>
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
                        <button className="relative p-3 bg-[#EEF2F6] dark:bg-gray-900/50 text-charcoal dark:text-gray-400 hover:text-primary transition-all hover:bg-primary/5 rounded-full group active:scale-90 shadow-sm border border-black/5 dark:border-white/5">
                            <Bell size={20} strokeWidth={2} />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-md transform group-hover:scale-110 transition-transform">
                                1
                            </div>
                        </button>
                        <button className="flex items-center gap-3 px-8 py-3.5 bg-charcoal dark:bg-primary text-white rounded-[20px] font-black uppercase tracking-widest text-xs hover:scale-[1.03] active:scale-95 transition-all shadow-xl hover:shadow-primary/30">
                            <Zap size={16} fill="currentColor" strokeWidth={0} />
                            Upgrade
                        </button>
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
