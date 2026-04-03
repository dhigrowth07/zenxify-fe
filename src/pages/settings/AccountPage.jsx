import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    User, 
    Shield, 
    Smartphone, 
    LogOut, 
    Camera, 
    Save, 
    RefreshCcw,
    XCircle,
    UserPlus,
    LayoutGrid,
    CheckCircle2
} from 'lucide-react';
import { selectCurrentUser, setUser } from '../../redux/auth/authSlice';
import { 
    updateProfileAsync, 
    changePasswordAsync, 
    fetchSessionsAsync, 
    revokeSessionAsync,
    selectProfileLoading,
    selectIsSessionsLoading,
    selectSessions,
    selectProfileError,
    clearProfileError
} from '../../redux/profile/profileSlice';
import { showComingSoonToast } from '../../utils/toastHandler';
import ConfirmationModal from '../../components/shared/ConfirmationModal';

const AccountPage = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const sessions = useSelector(selectSessions);
    const isLoading = useSelector(selectProfileLoading);
    const isSessionsLoading = useSelector(selectIsSessionsLoading);
    const error = useSelector(selectProfileError);

    const [activeTab, setActiveTab] = useState('profile');
    
    // Modal State
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [sessionToRevoke, setSessionToRevoke] = useState(/** @type {string | null} */ (null));

    // Profile Form State
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        social_links: user?.social_links || {}
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (activeTab === 'sessions') {
            /** @type {any} */ (dispatch)(fetchSessionsAsync());
        }
    }, [activeTab, dispatch]);

    /** @param {React.FormEvent} e */
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await /** @type {any} */ (dispatch)(updateProfileAsync(profileData)).unwrap();
            
            // Update auth state to keep header/sidebar in sync
            dispatch(setUser(updatedUser));

            const { toast } = await import('../../utils/toastHandler');
            toast.success("Profile Updated!", "Your personal information has been saved successfully.");
        } catch (err) {
            console.error('Update failed:', err);
            const { toast } = await import('../../utils/toastHandler');
            toast.error("Update Failed", /** @type {any} */ (err).message || "Your profile changes could not be saved.");
        }
    };

    /** @param {React.FormEvent} e */
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            const { toast } = await import('../../utils/toastHandler');
            toast.error("Validation Error", "Passwords do not match.");
            return;
        }
        try {
            await /** @type {any} */ (dispatch)(changePasswordAsync({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            })).unwrap();
            const { toast } = await import('../../utils/toastHandler');
            toast.success("Password Changed!", "Your security credentials have been updated.");
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            console.error('Password change failed:', err);
            const { toast } = await import('../../utils/toastHandler');
            toast.error("Security Error", /** @type {any} */ (err).message || "Your current password was incorrect.");
        }
    };

    /** @param {string} sessionId */
    const handleRevokeSession = (sessionId) => {
        setSessionToRevoke(sessionId);
        setIsRevokeModalOpen(true);
    };

    const handleRevokeConfirm = async () => {
        if (sessionToRevoke) {
            try {
                await /** @type {any} */ (dispatch)(revokeSessionAsync(sessionToRevoke)).unwrap();
                setIsRevokeModalOpen(false);
                setSessionToRevoke(null);
                const { toast } = await import('../../utils/toastHandler');
                toast.success("Session Revoked", "The device has been successfully terminated.");
            } catch (err) {
                console.error('Revoke failed:', err);
            }
        }
    };

    const tabs = [
        { id: 'profile', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black tracking-tight text-charcoal dark:text-white uppercase font-display leading-tight">
                    Account <span className="text-primary italic">Settings</span>
                </h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 opacity-80 uppercase tracking-widest">
                    Manage your identity, security and sessions
                </p>
            </div>

            {/* Mobile Responsive Tabs */}
            <div className="flex w-fit bg-[#F9F9FB] dark:bg-gray-900/50 p-1.5 rounded-[24px] border border-gray-600 dark:border-gray-800 overflow-x-auto scrollbar-none sticky top-32 z-30 backdrop-blur-md">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-charcoal dark:bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                            : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {activeTab === 'profile' && (
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Profile Section */}
                        <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 rounded-full blur-3xl transition-all group-hover:bg-primary/10" />
                            
                            <form onSubmit={handleProfileSubmit} className="relative flex flex-col gap-10">
                                {/* Avatar Section */}
                                <div className="flex flex-wrap items-center gap-8">
                                    <div className="relative group/avatar">
                                        <div className="w-28 h-28 rounded-[36px] bg-brand-gradient p-[2px] shadow-2xl transition-transform group-hover/avatar:rotate-6">
                                            <div className="w-full h-full rounded-[34px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden border-4 border-transparent">
                                                <img 
                                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}`} 
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => showComingSoonToast('Avatar Upload')}
                                            className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-charcoal text-primary rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 hover:scale-110 active:scale-90 transition-all font-black"
                                        >
                                            <Camera size={20} />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-xl font-black text-charcoal dark:text-white uppercase font-display leading-none">
                                            {user?.full_name}
                                        </h3>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full w-fit">
                                            <CheckCircle2 size={12} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Verified Account</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.full_name}
                                            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                                            className="px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
                                        <input 
                                            type="text" 
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                            className="px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                            placeholder="@johndoe"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3 md:col-span-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Bio</label>
                                        <textarea 
                                            rows={3}
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                            className="px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-[32px] focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={isLoading}
                                    className="w-full md:w-fit px-10 py-4 bg-charcoal dark:bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl hover:shadow-primary/30 disabled:opacity-50"
                                >
                                    {isLoading ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Profile Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                            
                            <form onSubmit={handlePasswordSubmit} className="relative flex flex-col gap-8">
                                <h3 className="text-xl font-black text-charcoal dark:text-white uppercase font-display">Change Password</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-3 md:col-span-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Password</label>
                                        <input 
                                            type="password" 
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                            className="px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                                        <input 
                                            type="password" 
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                            className="px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                            className="px-6 py-4 bg-[#F9F9FB] dark:bg-gray-800/50 border border-transparent dark:border-gray-800 rounded-3xl focus:border-primary/30 focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all font-bold text-charcoal dark:text-white text-sm"
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={isLoading}
                                    className="w-full md:w-fit px-10 py-4 bg-charcoal dark:bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCcw className="animate-spin" size={18} />
                                            Updating Password...
                                        </>
                                    ) : (
                                        <>
                                            <Shield size={18} />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-[40px] border border-red-100 dark:border-red-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-red-900 dark:text-red-400 font-black uppercase text-sm tracking-wider">Delete Account</h4>
                                <p className="text-xs font-bold text-red-900/60 dark:text-red-400/60 leading-relaxed max-w-sm">
                                    Permanently delete your account and all associated projects. This action cannot be undone.
                                </p>
                            </div>
                            <button 
                                onClick={() => showComingSoonToast('Account Deletion')}
                                className="px-8 py-3.5 bg-red-600 text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 whitespace-nowrap"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-black text-charcoal dark:text-white uppercase font-display">Active Sessions</h3>
                                <button 
                                    onClick={() => /** @type {any} */ (dispatch)(fetchSessionsAsync())}
                                    disabled={isSessionsLoading}
                                    className="p-3 bg-[#F9F9FB] dark:bg-gray-800/50 text-gray-500 hover:text-primary rounded-2xl transition-all border border-transparent dark:border-gray-800 disabled:opacity-50"
                                >
                                    <RefreshCcw size={18} className={isSessionsLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {sessions && sessions.length > 0 ? (
                                    sessions.map((/** @type {any} */ session) => (
                                        <div 
                                            key={session.id}
                                            className="p-6 bg-white dark:bg-gray-900/50 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-lg shadow-charcoal/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-primary/20 transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-[22px] flex items-center justify-center p-3">
                                                    <Smartphone size={24} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-charcoal dark:text-white text-sm uppercase tracking-tight">
                                                            {session.device_info || session.user_agent || 'Unknown Device'}
                                                        </span>
                                                        {session.isCurrent && (
                                                            <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Current</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {session.ip_address} • Last active {new Date(session.last_active_at || session.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {!session.isCurrent && (
                                                <button 
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
                                                >
                                                    <XCircle size={14} />
                                                    Terminate
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-16 bg-[#F9F9FB]/50 dark:bg-gray-900/20 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="w-20 h-20 bg-white dark:bg-gray-800 shadow-xl rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                            <Smartphone size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-sm font-black text-charcoal dark:text-white uppercase tracking-widest">No Other Sessions</h4>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] max-w-[240px] leading-relaxed opacity-60">
                                                Your account is currently not active on any other devices.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Sidebar (visible on desktop) */}
                <div className="lg:col-span-4 flex flex-col gap-8 sticky top-52">
                    <div className="p-8 bg-charcoal dark:bg-primary text-white rounded-[40px] shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-2xl" />
                        
                        <div className="relative flex flex-col gap-6">
                            <h4 className="text-lg font-black uppercase font-display leading-tight tracking-tight">Need a boost?</h4>
                            <p className="text-xs font-bold text-white/70 leading-relaxed">
                                Upgrade to **Pro** to unlock word-level sync, unlimited cloud storage and priority AI processing.
                            </p>
                            <button className="w-fit px-10 py-4 bg-white text-primary rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                View Plans
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-charcoal/5 flex flex-col gap-6">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Support Hub</h4>
                        <div className="flex flex-col gap-4">
                            <button className="flex items-center gap-3 text-xs font-black text-charcoal dark:text-white uppercase tracking-wider hover:text-primary transition-all">
                                <LayoutGrid size={16} className="text-primary" />
                                Documentation
                            </button>
                            <button className="flex items-center gap-3 text-xs font-black text-charcoal dark:text-white uppercase tracking-wider hover:text-primary transition-all">
                                <Smartphone size={16} className="text-primary" />
                                Community Discord
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <ConfirmationModal 
                isOpen={isRevokeModalOpen}
                onClose={() => !isLoading && setIsRevokeModalOpen(false)}
                onConfirm={handleRevokeConfirm}
                isLoading={isLoading}
                title="Terminate Session"
                description="Are you sure you want to log out from this device? This will immediately revoke the refresh token and terminate the active session."
                confirmLabel="Log out Device"
                variant="danger"
            />
        </div>
    );
};

export default AccountPage;
