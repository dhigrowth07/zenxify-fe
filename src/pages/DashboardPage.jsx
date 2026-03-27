import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logoutAsync } from '../redux/auth/authSlice';
import { User, Mail, Shield, Zap, LogOut, Layout } from "lucide-react";
import { toast } from '../utils/toastHandler';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutAsync());
        toast.info("Logged Out", "You have been logged out successfully.");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark pt-24 pb-12 px-4 transition-colors">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 font-display">
                            <Layout className="text-primary" size={32} />
                            DASHBOARD
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Welcome back, <span className="font-semibold text-primary">{user.full_name}</span>!
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold text-sm active:scale-95"
                    >
                        <LogOut size={18} />
                        Logout Session
                    </button>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Profile Info */}
                    <div className="md:col-span-2 space-y-6">
                        <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                            {/* Decorative Sparkle */}
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Zap size={120} className="text-primary" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-4">
                                    Account Profile
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Full Name</p>
                                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{user.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shrink-0">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Email Address</p>
                                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 shrink-0">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Role / Permission</p>
                                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-tighter">{user.role || 'User'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Stats Card */}
                    <div className="space-y-6">
                        <section className="bg-brand-gradient rounded-3xl p-6 text-white shadow-xl flex flex-col items-center text-center">
                            <div className="mb-4 p-4 bg-white/20 rounded-full backdrop-blur-md">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-xl font-bold uppercase">Zenxify Plan</h3>
                            <p className="text-white/80 text-xs mb-4">Your current subscription level</p>

                            <div className="text-3xl font-black mb-6 uppercase tracking-tighter">
                                {user.plan || 'Free Plan'}
                            </div>

                            <button className="w-full bg-white text-primary font-bold py-2.5 rounded-xl hover:bg-opacity-90 transition-all shadow-lg active:scale-95 text-sm uppercase">
                                Upgrade to Pro
                            </button>
                        </section>

                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-md">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase">System Status</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">API Status</span>
                                    <span className="flex items-center gap-1.5 text-green-500 font-bold">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Operational
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Security Layers</span>
                                    <span className="text-primary font-bold uppercase tracking-tight">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
