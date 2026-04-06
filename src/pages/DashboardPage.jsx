import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../redux/auth/authSlice';
import { 
    fetchDashboardStatsAsync, 
    selectDashboardStats, 
    selectProfileLoading 
} from '../redux/profile/profileSlice';
import {
    Sparkles,
    Mic2,
    Video,
    User,
    Plus,
    Clock
} from "lucide-react";
import {
    video_editing_scripting,
    video_editing_voiceover,
    video_editing_video_editing,
    video_editing_video_cloning
} from '../assets/imgs';


import { toast } from '../utils/toastHandler';

/** @param {{ image: string, title: string, description: string, onClick?: () => void }} props */
const ActionCard = ({ image, title, description, onClick }) => (
    <div className="group cursor-pointer" onClick={onClick}>
        <div className="bg-[#E9E9E9] dark:bg-gray-800 rounded-[10px] aspect-video flex items-center justify-center overflow-hidden mb-4 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-1">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500"
            />
        </div>
        <h3 className="text-xl font-semibold  text-charcoal dark:text-gray-100 font-display tracking-tight leading-tight group-hover:text-primary transition-colors">
            {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed opacity-80 border-b border-transparent group-hover:border-primary/20 pb-1 w-fit transition-all">
            {description}
        </p>
    </div>
);

/** @param {{ title: string, image: string, status?: string }} props */
const ProjectCard = ({ title, image, status }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-9/16 rounded-[24px] overflow-hidden mb-3 shadow-md group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {status && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-white tracking-[0.15em] border border-white/20">
                    {status.replace(/_/g, ' ')}
                </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Video size={16} />
            </div>
        </div>
        <h4 className="text-sm font-bold text-charcoal dark:text-gray-100 group-hover:text-primary transition-colors truncate">
            {title}
        </h4>
    </div>
);

/** 
 * @param {{ 
 *  icon: any, 
 *  title: string, 
 *  value: string | number, 
 *  unit: string, 
 *  color: 'orange' | 'purple' | 'blue', 
 *  children?: React.ReactNode,
 *  decoratorPos?: 'top-right' | 'bottom-left' | 'top-left'
 * }} props 
 */
const StatCard = ({ icon: Icon, title, value, unit, color, children, decoratorPos = 'top-right' }) => {
    const colorMap = {
        orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-500',
        purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-500',
        blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-500'
    };

    const decoratorClasses = {
        'top-right': '-top-10 -right-10',
        'bottom-left': '-bottom-10 -left-10',
        'top-left': '-top-10 -left-10'
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-[3px_3px_2px_rgba(0,0,0,0.1)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.3)] transition-all group overflow-hidden relative">
            {/* Background Blur Decorator */}
            <div className={`absolute ${decoratorClasses[decoratorPos] || decoratorClasses['top-right']} w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

            <div className="flex items-center gap-5 mb-6 relative">
                <div className={`w-14 h-14 rounded-2xl ${colorMap[color] || colorMap.blue} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1 leading-none">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-charcoal dark:text-white tracking-tighter">
                            {value}
                        </span>
                        <span className="text-xs font-bold text-gray-400">{unit}</span>
                    </div>
                </div>
            </div>
            <div className="relative">
                {children}
            </div>
        </div>
    );
};



const DashboardPage = () => {
    /** @type {any} */
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const stats = useSelector(selectDashboardStats);
    const isLoading = useSelector(selectProfileLoading);

    React.useEffect(() => {
        dispatch(fetchDashboardStatsAsync());
    }, [dispatch]);

    if (!user) return null;

    if (isLoading && !stats) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const quickActions = [
        { image: video_editing_scripting, title: 'Scripting', description: 'Generate your script here...' },
        { image: video_editing_voiceover, title: 'Voice Over', description: 'Generate your voice over here...' },
        { image: video_editing_video_editing, title: 'Video editing', description: 'Generate your video editing here...' },
        { image: video_editing_video_cloning, title: 'Video cloning', description: 'Generate your video clone here...' },
    ];

    const recentProjects = stats?.recentProjects || [];

    return (
        <div className="w-full h-full">
            {/* Stats Cards Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Projects Stat Card */}
                <StatCard
                    icon={Video}
                    title="Video Projects"
                    value={stats?.projects?.total || 0}
                    unit="Total"
                    color="orange"
                    decoratorPos="top-right"
                >
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Processing</span>
                            <span className="text-xl font-black text-primary">{stats?.projects?.processing || 0}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Completed</span>
                            <span className="text-xl font-black text-green-500">{stats?.projects?.completed || 0}</span>
                        </div>
                    </div>
                </StatCard>

                {/* Credits Stat Card */}
                <StatCard
                    icon={Sparkles}
                    title="Credits Balance"
                    value={stats?.credits?.total || 0}
                    unit="Available"
                    color="purple"
                    decoratorPos="bottom-left"
                >
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold px-1">
                            <span className="text-gray-500">Plan Credits</span>
                            <span className="text-charcoal dark:text-white">{stats?.credits?.monthly || 0}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-gradient transition-all duration-1000"
                                style={{ width: `${Math.min(100, ((stats?.credits?.monthly || 0) / (stats?.credits?.total || 1)) * 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest pt-1 px-1">
                            <span>Purchased: {stats?.credits?.purchased || 0}</span>
                            <button 
                                onClick={() => navigate('/settings/billing?tab=topups')}
                                className="text-primary hover:underline"
                            >
                                Top Up
                            </button>
                        </div>
                    </div>
                </StatCard>

                {/* Storage Stat Card */}
                <StatCard
                    icon={Plus}
                    title="Cloud Storage"
                    value={stats?.storage?.usedGb || '0.00'}
                    unit="GB Used"
                    color="blue"
                    decoratorPos="top-left"
                >
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold px-1">
                            <span className="text-gray-500">{stats?.storage?.usagePercentage || 0}% of your quota used</span>
                            <span className="text-charcoal dark:text-white">{stats?.storage?.quotaGb || 0} GB</span>
                        </div>
                        <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden p-1 shadow-inner border border-gray-50 dark:border-white/5">
                            <div
                                className={`h-full rounded-lg transition-all duration-1000 ${(stats?.storage?.usagePercentage || 0) > 90 ? 'bg-red-500' :
                                        (stats?.storage?.usagePercentage || 0) > 70 ? 'bg-orange-500' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                    }`}
                                style={{ width: `${stats?.storage?.usagePercentage || 0}%` }}
                            />
                        </div>
                        <div className="flex justify-center pt-2">
                            <button className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                                Manage Subscription
                            </button>
                        </div>
                    </div>
                </StatCard>
            </section>


            {/* Quick Actions Row */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-charcoal dark:text-white font-display uppercase tracking-tight flex items-center gap-2">
                        Select what you need to do
                        <span className="text-primary">✨</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action) => (
                        <ActionCard 
                            key={action.title} 
                            {...action} 
                            onClick={() => {
                                if (action.title === 'Video editing') {
                                    navigate('/video-editor/create');
                                } else {
                                    toast.warning("Feature Coming Soon!", "This feature will be available in a future update.");
                                }
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Recent Projects Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-charcoal dark:text-white font-display uppercase tracking-tight flex items-center gap-2">
                        Recent Projects
                        <span className="text-primary">🚀</span>
                    </h2>
                    <button className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors group">
                        View All
                        <Clock size={16} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recentProjects.map((/** @type {any} */ project) => {
                        const thumbnailUrl = project.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600';

                        return (
                            <ProjectCard
                                key={project.id}
                                title={project.title}
                                image={thumbnailUrl}
                                status={project.status}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
