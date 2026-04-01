import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/auth/authSlice';
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

/** @param {{ image: string, title: string, description: string }} props */
const ActionCard = ({ image, title, description }) => (
    <div className="group cursor-pointer">
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

/** @param {{ title: string, image: string }} props */
const ProjectCard = ({ title, image }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-9/16 rounded-[24px] overflow-hidden mb-3 shadow-md group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
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

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);

    if (!user) return null;

    const quickActions = [
        { image: video_editing_scripting, title: 'Scripting', description: 'Generate your script here...' },
        { image: video_editing_voiceover, title: 'Voice Over', description: 'Generate your voice over here...' },
        { image: video_editing_video_editing, title: 'Video editing', description: 'Generate your video editing here...' },
        { image: video_editing_video_cloning, title: 'Video cloning', description: 'Generate your video clone here...' },
    ];

    const recentProjects = [
        { title: 'Untitled project 1..', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600' },
        { title: 'Untitled project 2..', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600' },
        { title: 'Untitled project 3..', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600' },
        { title: 'Untitled project 4..', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600' }
    ];

    return (
        <div className="w-full h-full">
            {/* Hero Section from Image */}
            <section className="relative w-full rounded-[40px] bg-white dark:bg-gray-900 p-12 overflow-hidden border border-gray-50 dark:border-gray-800 shadow-2xl mb-10 group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute top-10 right-10 opacity-10 blur-3xl w-64 h-64 bg-primary rounded-full group-hover:scale-125 transition-transform duration-1000" />

                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-6 py-2 bg-pink-100 dark:bg-pink-900/20 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-pink-200 dark:border-pink-900/30">
                        <Sparkles size={14} fill="currentColor" />
                        AI Video Editing
                    </span>

                    <h1 className="text-6xl font-black text-charcoal dark:text-white leading-[1.05] tracking-tighter mb-8 font-display uppercase">
                        Create <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-primary italic">Magic</span> in <br />
                        minutes with <span className="text-primary italic">AI</span>
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                        Your personal AI video editor. Turn raw footage into viral content.
                        Just ask our AI to clip, caption, Broll, and polish for you.
                    </p>

                    <button className="px-10 py-4 bg-brand-gradient text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-primary/40 flex items-center gap-3">
                        <Plus size={20} strokeWidth={3} />
                        Get Started
                    </button>
                </div>
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
                        <ActionCard key={action.title} {...action} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recentProjects.map((project) => (
                        <ProjectCard key={project.title} {...project} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
