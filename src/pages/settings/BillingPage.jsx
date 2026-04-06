import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
    CreditCard, 
    Zap, 
    Package, 
    ArrowUpCircle, 
    History, 
    CheckCircle2, 
    ShieldCheck,
    Clock,
    PlusCircle,
    Info,
    RefreshCcw,
    ChevronRight,
    Star
} from 'lucide-react';
import { 
    fetchPlansAsync, 
    fetchTopUpsAsync, 
    fetchMySubscriptionAsync,
    selectUserSubscription,
    selectAllPlans,
    selectTopUps,
    selectBillingLoading 
} from '../../redux/billing/billingSlice';
import { showComingSoonToast } from '../../utils/toastHandler';

const BillingPage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    
    // Parse query params to allow switching tabs via URL (e.g., ?tab=plans)
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const initialTab = queryParams.get('tab') || 'overview';

    const mySub = useSelector(selectUserSubscription);
    /** @type {any[]} */
    const plans = useSelector(selectAllPlans);
    /** @type {any[]} */
    const topUps = useSelector(selectTopUps);
    const isLoading = useSelector(selectBillingLoading);

    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync state if URL param changes after initial mount
    useEffect(() => {
        const tab = queryParams.get('tab');
        if (tab && (tab === 'plans' || tab === 'topups' || tab === 'overview')) {
            setActiveTab(tab);
        }
    }, [queryParams]);

    useEffect(() => {
        /** @type {any} */ (dispatch)(fetchMySubscriptionAsync());
        /** @type {any} */ (dispatch)(fetchPlansAsync());
        /** @type {any} */ (dispatch)(fetchTopUpsAsync());
    }, [dispatch]);

    const tabs = [
        { id: 'overview', label: 'Subscription Overview', icon: CreditCard },
        { id: 'plans', label: 'Upgrade Plans', icon: Star },
        { id: 'topups', label: 'Add Credits', icon: Zap },
    ];

    return (
        <div className="flex flex-col gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            {/* Page Header */}
            <div className="flex flex-col gap-1 px-2 md:px-0">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-charcoal dark:text-white uppercase font-display leading-tight">
                    Billing <span className="text-primary italic">& Plans</span>
                </h1>
                <p className="text-[10px] md:text-sm font-bold text-gray-500 dark:text-gray-400 opacity-80 uppercase tracking-widest">
                    Manage your subscription, credits and payment history
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex w-full md:w-fit bg-white/80 dark:bg-gray-900/50 p-1.5 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-none sticky top-[72px] md:top-32 z-30 backdrop-blur-xl shadow-lg shadow-charcoal/5">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center gap-2.5 px-5 md:px-8 py-3 md:py-4 rounded-[20px] md:rounded-[24px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 md:flex-none ${
                            activeTab === tab.id 
                            ? 'bg-charcoal dark:bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                            : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
                <button 
                    onClick={() => {
                        /** @type {any} */ (dispatch)(fetchMySubscriptionAsync());
                        /** @type {any} */ (dispatch)(fetchPlansAsync());
                        /** @type {any} */ (dispatch)(fetchTopUpsAsync());
                    }}
                    className="p-3 text-gray-400 hover:text-primary transition-colors pr-5"
                >
                    <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {activeTab === 'overview' && (
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Usage Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 flex flex-col gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Zap size={24} fill="currentColor" className="opacity-20" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Balance</span>
                                        <h3 className="text-2xl font-black text-charcoal dark:text-white">{mySub.credits.total} <span className="text-xs text-gray-400 font-bold tracking-normal italic ml-1">Credits</span></h3>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400">Monthly Allowance</span>
                                        <span className="text-xs font-black text-charcoal dark:text-white">{mySub.credits.monthly}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000" 
                                            style={{ width: `${Math.min(100, (mySub.credits.monthly / (mySub.plan.details?.monthly_credits || 100)) * 100)}%` }} 
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Clock size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            Resets on {mySub.credits.next_reset ? new Date(mySub.credits.next_reset).toLocaleDateString() : 'Next Billing Cycle'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 flex flex-col gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <PlusCircle size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Purchased Credits</span>
                                        <h3 className="text-2xl font-black text-charcoal dark:text-white">{mySub.credits.purchased} <span className="text-xs text-gray-400 font-bold tracking-normal italic ml-1">Never Expires</span></h3>
                                    </div>
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 leading-relaxed">
                                    Extra credits you've purchased manually. These stay in your account forever until used.
                                </p>
                                <button 
                                    onClick={() => setActiveTab('topups')}
                                    className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline mt-auto"
                                >
                                    Get More Credits <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Current Plan Section */}
                        <div className="p-8 md:p-12 bg-charcoal dark:bg-gray-800/50 rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-charcoal/20">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 -mr-32 -mt-32 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-4 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Active Plan</div>
                                        {mySub.subscription_status === 'active' && <CheckCircle2 size={16} className="text-green-400" />}
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black uppercase italic font-display tracking-tight leading-none">
                                        {mySub.plan.slug || 'Free'} <span className="text-primary italic">Tier</span>
                                    </h2>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <CheckCircle2 size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {mySub.plan.details?.monthly_credits || 100} Credits / mo
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/60">
                                            <CheckCircle2 size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">1080p Export</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveTab('plans')}
                                    className="w-full md:w-fit px-10 py-5 bg-white text-charcoal rounded-[32px] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/10"
                                >
                                    Change Plan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="lg:col-span-12 flex flex-col gap-8 px-2 md:px-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.length > 0 ? (
                                plans.map((plan) => (
                                    <div 
                                        key={plan.id}
                                        className={`p-10 rounded-[48px] border flex flex-col gap-8 transition-all hover:scale-[1.02] relative group overflow-hidden ${
                                            mySub.plan.slug === plan.slug
                                            ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/10 border-2' 
                                            : 'bg-white dark:bg-gray-900/50 border-gray-600 dark:border-gray-800'
                                        }`}
                                    >
                                        {mySub.plan.slug === plan.slug && (
                                            <div className="absolute top-10 right-10 flex flex-col items-end">
                                                <div className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Current</div>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-2xl font-black text-charcoal dark:text-white uppercase italic tracking-tight">{plan.label || plan.name}</h3>
                                            <div className="flex items-baseline gap-1 mt-2">
                                                <span className="text-4xl font-black text-charcoal dark:text-white">
                                                    ${plan.price_usd_monthly || (plan.price_inr_monthly / 83).toFixed(0) || 0}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/ month</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                    <CheckCircle2 size={12} />
                                                </div>
                                                <span className="text-[11px] font-bold text-charcoal dark:text-gray-300 uppercase tracking-tight">{plan.monthly_credits} Monthly Credits</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                    <CheckCircle2 size={12} />
                                                </div>
                                                <span className="text-[11px] font-bold text-charcoal dark:text-gray-300 uppercase tracking-tight">AI B-Roll Generations</span>
                                            </div>
                                            {plan.features?.export_4k && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                        <CheckCircle2 size={12} />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-charcoal dark:text-gray-300 uppercase tracking-tight">4K Ultra HD Export</span>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            disabled={mySub.plan.slug === plan.slug}
                                            onClick={() => showComingSoonToast('Stripe Integration')}
                                            className={`w-full py-5 rounded-[28px] font-black uppercase tracking-widest text-[11px] transition-all ${
                                                mySub.plan.slug === plan.slug
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                : 'bg-charcoal dark:bg-white dark:text-charcoal text-white hover:scale-105 active:scale-95 shadow-xl hover:shadow-primary/20'
                                            }`}
                                        >
                                            {mySub.plan.slug === plan.slug ? 'Active Plan' : 'Choose Plan'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center animate-pulse text-gray-400 font-black uppercase tracking-widest text-xs">
                                    Loading available tiers...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'topups' && (
                    <div className="lg:col-span-12 flex flex-col gap-10 px-2 md:px-0">
                        <div className="p-8 md:p-12 bg-brand-gradient rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex flex-col gap-4 max-w-lg">
                                <h2 className="text-3xl md:text-5xl font-black uppercase italic font-display tracking-tight leading-none">Run out of <span className="text-charcoal italic">juice?</span></h2>
                                <p className="text-xs md:text-sm font-bold text-white/80 leading-relaxed uppercase tracking-widest">
                                    Keep the momentum going. Buy one-time credit packs whenever you need them. No subscriptions attached.
                                </p>
                            </div>
                            <PlusCircle size={100} className="text-white/20 hidden md:block" strokeWidth={1} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {topUps.length > 0 ? (
                                topUps.map((pack) => (
                                    <div 
                                        key={pack.id}
                                        className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-800 dark:border-gray-800 shadow-xl shadow-charcoal/5 flex flex-col gap-6 text-center group hover:border-primary/30 transition-all hover:-translate-y-2"
                                    >
                                        <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                                            <Zap size={32} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-2xl font-black text-charcoal dark:text-white uppercase">{pack.credits} <span className="text-xs italic opacity-50">Credits</span></h4>
                                            <span className="text-sm font-black text-primary uppercase tracking-tight">
                                                {pack.price_usd ? `$${pack.price_usd}` : `₹${pack.price_inr / 100}`}
                                            </span>
                                        </div>
                                        <div className="text-[9px] font-bold text-gray-700 uppercase tracking-widest opacity-60 px-2 line-clamp-1">
                                            {pack.best_for || pack.label}
                                        </div>
                                        <button 
                                            onClick={() => showComingSoonToast('Top-up Checkout')}
                                            className="w-full py-4 bg-charcoal dark:bg-gray-800 text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-lg active:scale-95"
                                        >
                                            Buy Pack
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                    Fetching Credit Packs...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Account Details Sidebar - only on Overview */}
                {activeTab === 'overview' && (
                    <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-52">
                        <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-900 dark:border-gray-600 shadow-xl shadow-charcoal/5 flex flex-col gap-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Quick Links</h4>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => showComingSoonToast('Billing History')}
                                    className="w-full p-5 bg-[#F9F9FB] dark:bg-gray-800/50 rounded-[24px] flex items-center justify-between group hover:bg-primary/5 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <History size={18} className="text-gray-400 group-hover:text-primary" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-charcoal dark:text-white group-hover:text-primary">Payment History</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                                
                                <button 
                                    onClick={() => showComingSoonToast('Receipt Downloads')}
                                    className="w-full p-5 bg-[#F9F9FB] dark:bg-gray-800/50 rounded-[24px] flex items-center justify-between group hover:bg-primary/5 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <Package size={18} className="text-gray-400 group-hover:text-primary" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-charcoal dark:text-white group-hover:text-primary">Invoices</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="p-10 bg-yellow-400 text-charcoal rounded-[48px] shadow-2xl shadow-yellow-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 -mr-16 -mt-16 rounded-full blur-2xl" />
                            <div className="relative flex flex-col gap-4">
                                <ShieldCheck size={40} className="text-charcoal/20" />
                                <h4 className="text-lg font-black uppercase leading-tight tracking-tight italic">Security Check</h4>
                                <p className="text-[11px] font-bold text-charcoal/70 leading-relaxed uppercase tracking-tight">
                                    All your payment information is encrypted and processed via secure gateways.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BillingPage;
