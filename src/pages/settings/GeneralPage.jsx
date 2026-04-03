import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Globe, 
    Monitor, 
    Mic2, 
    Subtitles, 
    History,
    Save, 
    RefreshCcw,
    CheckCircle2,
    Settings2,
    HelpCircle
} from 'lucide-react';
import { selectCurrentUser, setUser } from '../../redux/auth/authSlice';
import { 
    updatePreferencesAsync, 
    selectProfileLoading,
    selectProfileError
} from '../../redux/profile/profileSlice';

const GeneralPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isLoading = useSelector(selectProfileLoading);
    
    // Preferences Form State
    const [preferences, setPreferences] = useState({
        primary_language: user?.primary_language || 'english',
        interface_language: user?.interface_language || 'english',
        default_spoken_lang: user?.default_spoken_lang || 'english',
        default_caption_lang: user?.default_caption_lang || 'english',
        tutorial_completed: user?.tutorial_completed ?? false
    });

    const allLanguages = [
        { value: 'english', label: 'English', flag: '🇺🇸', isSpoken: true, isCaption: true },
        { value: 'hindi', label: 'Hindi', flag: '🇮🇳', isSpoken: true, isCaption: true },
        { value: 'tamil', label: 'Tamil', flag: '🇮🇳', isSpoken: true, isCaption: true },
        { value: 'telugu', label: 'Telugu', flag: '🇮🇳', isSpoken: true, isCaption: true },
        { value: 'kannada', label: 'Kannada', flag: '🇮🇳', isSpoken: true, isCaption: true },
        { value: 'malayalam', label: 'Malayalam', flag: '🇮🇳', isSpoken: true, isCaption: true },
        { value: 'tanglish', label: 'Tanglish', flag: '🇮🇳', isSpoken: false, isCaption: true },
        { value: 'hinglish', label: 'Hinglish', flag: '🇮🇳', isSpoken: false, isCaption: true },
        { value: 'tenglish', label: 'Tenglish', flag: '🇮🇳', isSpoken: false, isCaption: true },
        { value: 'kanglish', label: 'Kanglish', flag: '🇮🇳', isSpoken: false, isCaption: true },
        { value: 'manglish', label: 'Manglish', flag: '🇮🇳', isSpoken: false, isCaption: true },
    ];

    const spokenLanguages = allLanguages.filter(l => l.isSpoken);
    const captionLanguages = allLanguages.filter(l => l.isCaption);
    const interfaceLanguages = allLanguages.filter(l => l.value === 'english'); // UI currently only supports English

    /** @param {React.FormEvent} e */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await /** @type {any} */ (dispatch)(updatePreferencesAsync(preferences)).unwrap();
            
            // Update auth state to keep header/sidebar in sync
            dispatch(setUser(updatedUser));
            
            const { toast } = await import('../../utils/toastHandler');
            toast.success("Preferences Saved!", "Your overall configuration has been updated successfully.");
        } catch (err) {
            console.error('Update failed:', err);
            const { toast } = await import('../../utils/toastHandler');
            toast.error("Update Failed", /** @type {any} */ (err).message || "Something went wrong while saving preferences.");
        }
    };

    const handleResetTutorial = () => {
        setPreferences({ ...preferences, tutorial_completed: false });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black tracking-tight text-charcoal dark:text-white uppercase font-display leading-tight">
                    General <span className="text-primary italic">Preferences</span>
                </h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 opacity-80 uppercase tracking-widest">
                    Manage your app localization and AI behavior
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Main Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Localization Section */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                            
                            <div className="relative flex flex-col gap-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                        <Globe size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-charcoal dark:text-white uppercase font-display">Localization</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Primary Language */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                            Primary Language
                                            <span title="Your native language for content processing">
                                                <HelpCircle size={12} className="text-gray-300" />
                                            </span>
                                        </label>
                                        <select 
                                            value={preferences.primary_language}
                                            onChange={(e) => setPreferences({...preferences, primary_language: e.target.value})}
                                            className="appearance-none px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                        >
                                            {allLanguages.map((/** @type {any} */ lang) => (
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.flag} &nbsp; {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Interface Language */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                            Interface Language
                                            <span title="Language used for the dashboard UI">
                                                <HelpCircle size={12} className="text-gray-300" />
                                            </span>
                                        </label>
                                        <select 
                                            value={preferences.interface_language}
                                            onChange={(e) => setPreferences({...preferences, interface_language: e.target.value})}
                                            className="appearance-none px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                        >
                                            {interfaceLanguages.map((/** @type {any} */ lang) => (
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.flag} &nbsp; {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Defaults Section */}
                        <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                            
                            <div className="relative flex flex-col gap-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                        <Mic2 size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-charcoal dark:text-white uppercase font-display">AI Defaults</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Default Spoken */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                            Default Spoken Detection
                                        </label>
                                        <select 
                                            value={preferences.default_spoken_lang}
                                            onChange={(e) => setPreferences({...preferences, default_spoken_lang: e.target.value})}
                                            className="appearance-none px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                        >
                                            {spokenLanguages.map((/** @type {any} */ lang) => (
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.flag} &nbsp; {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Default Captions */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                            Default Caption Language
                                        </label>
                                        <select 
                                            value={preferences.default_caption_lang}
                                            onChange={(e) => setPreferences({...preferences, default_caption_lang: e.target.value})}
                                            className="appearance-none px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                        >
                                            {captionLanguages.map((/** @type {any} */ lang) => (
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.flag} &nbsp; {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App Features Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-8 sticky top-52">
                        {/* Tutorial Section */}
                        <div className="p-8 bg-charcoal dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 flex flex-col gap-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <History size={20} />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Experience</h4>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Guide Completion</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-white">{preferences.tutorial_completed ? 'COMPLETED' : 'PENDING'}</span>
                                        <div className={`w-10 h-5 rounded-full p-1 transition-all cursor-pointer ${preferences.tutorial_completed ? 'bg-green-500' : 'bg-gray-700'}`} onClick={() => setPreferences({...preferences, tutorial_completed: !preferences.tutorial_completed})}>
                                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${preferences.tutorial_completed ? 'ml-5' : 'ml-0'}`} />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleResetTutorial}
                                    className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-[24px] font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw size={14} className={!preferences.tutorial_completed ? 'animate-spin' : ''} />
                                    Reset Tutorial
                                </button>
                                
                                <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed text-center opacity-60">
                                    Resetting the tutorial will re-enable all help tooltips and the onboarding guide.
                                </p>
                            </div>
                        </div>

                        {/* Credits Balance (View only) */}
                        <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 flex flex-col gap-6 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-gradient" />
                            <div className="flex flex-col gap-1">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Credits Overview</h4>
                                <p className="text-3xl font-black text-charcoal dark:text-white uppercase font-display leading-none mt-2">
                                    {user?.monthly_credits_balance + user?.purchased_credits_balance || 0} <span className="text-primary italic">XP</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-green-500 uppercase tracking-widest">
                                <CheckCircle2 size={12} />
                                Verified Credits
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sticky Action Footer for Form Submission */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 z-50">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="px-12 py-5 bg-charcoal dark:bg-primary text-white rounded-[28px] font-black uppercase tracking-widest text-xs flex items-center gap-4 shadow-2xl hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 group border-4 border-white dark:border-gray-900"
                    >
                        {isLoading ? <RefreshCcw size={20} className="animate-spin text-white" /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
                        {isLoading ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GeneralPage;
