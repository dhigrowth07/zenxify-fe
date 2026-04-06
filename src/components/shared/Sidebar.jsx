import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    LayoutGrid,
    Folder,
    Sparkles,
    Settings,
    ChevronRight,
    LogOut,
    BadgeCheck,
    Bell,
    CreditCard,
    MoreVertical,
    PanelLeftClose,
    PanelLeft,
    Users,
    Activity,
    CreditCard as BillingIcon
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logoutAsync } from '../../redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../../redux/store';
import { showComingSoonToast } from '../../utils/toastHandler';

/**
 * @param {object} props
 * @param {import('lucide-react').LucideIcon} props.icon
 * @param {string} props.label
 * @param {string} props.href
 * @param {boolean} props.active
 * @param {boolean} props.isCollapsed
 * @param {Array<{label: string, href: string}>} [props.subItems]
 */
const SidebarItem = ({ icon: Icon, label, href, active, isCollapsed, subItems = [] }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();

    /** @param {React.MouseEvent} e */
    const handleToggle = (e) => {
        if (subItems?.length && !isCollapsed) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="flex flex-col">
            <Link
                to={subItems?.length > 0 ? '#' : href}
                onClick={handleToggle}
                className={`flex items-center gap-3 relative transition-all group ${isCollapsed ? 'justify-center px-0 py-4' : 'px-8 py-3.5'
                    } ${active || (subItems && subItems.some(sub => location.pathname === sub.href))
                        ? 'text-primary'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    }`}
            >
                {(active || (subItems && subItems.some(sub => location.pathname === sub.href))) && !isCollapsed && (
                    <div className="absolute right-0 w-[4px] bg-primary rounded-l-full shadow-[0_0_15px_rgba(140,43,238,0.8)] top-1/4 bottom-1/4 transition-all" />
                )}

                <Icon size={22} strokeWidth={active ? 3 : 2} className={`transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />

                {!isCollapsed && (
                    <>
                        <span className={`text-[14px] uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex-1 ${active ? 'font-black' : 'font-bold'}`}>
                            {label}
                        </span>
                        {subItems?.length > 0 && (
                            <ChevronRight
                                size={16}
                                className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''} ${active ? 'text-primary' : 'text-gray-400'}`}
                            />
                        )}
                    </>
                )}

                {isCollapsed && (
                    /* Custom Tooltip for Collapsed State */
                    <div className={`absolute left-full ml-4 px-3 py-2 bg-charcoal dark:bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50 shadow-xl whitespace-nowrap border border-white/10 ${subItems?.length > 0 ? 'group-hover:flex flex-col gap-2' : ''}`}>
                        {label}
                        {subItems?.length > 0 && (
                            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10 mt-1">
                                {subItems.map((/** @type {{label: string}} */ sub) => (
                                    <button
                                        key={sub.label}
                                        onClick={() => showComingSoonToast(sub.label)}
                                        className="hover:text-white/80 transition-colors text-left"
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Tooltip Arrow */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-charcoal dark:border-r-primary" />
                    </div>
                )}
            </Link>

            {/* Sub-menu rendering for expanded sidebar */}
            {subItems?.length > 0 && !isCollapsed && (
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-52 opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col pl-16 pr-8 gap-3 py-2">
                        {subItems.map((/** @type {{label: string, href: string}} */ sub) => (
                            <Link
                                key={sub.label}
                                to={sub.href}
                                onClick={(e) => {
                                    if (sub.label === 'Billing') {
                                        e.preventDefault();
                                        showComingSoonToast(sub.label);
                                    }
                                }}
                                className={`text-[12px] font-black uppercase tracking-widest text-left transition-all hover:text-primary ${location.pathname === sub.href ? 'text-primary' : 'text-gray-400 opacity-60 hover:opacity-100 font-bold'
                                    }`}
                            >
                                {sub.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ isCollapsed, onToggle }) => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const menuRef = React.useRef(null);

    const navItems = [
        { icon: Home, label: 'Home', href: '/dashboard' },
        { icon: LayoutGrid, label: 'Templates', href: '/templates' },
        { icon: Folder, label: 'Assets', href: '/assets' },
        { icon: Sparkles, label: 'AI Tools', href: '/ai-tools' },
        {
            icon: Settings,
            label: 'Settings',
            href: '/settings',
            subItems: [
                { label: 'General', href: '/settings/general' },
                { label: 'Billing', href: '/settings/billing' }
            ]
        },
    ];

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            setIsMenuOpen(false);
            await dispatch(logoutAsync()).unwrap();
            await persistor.purge();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            await persistor.purge();
            navigate('/login');
        }
    };

    const profileMenuItems = [
        { icon: Sparkles, label: 'Upgrade (Pro)', href: '/settings/billing', color: 'primary' },
        { icon: BadgeCheck, label: 'Account', href: '/settings/account' },
        { icon: BillingIcon, label: 'Billing', href: '/settings/billing' },
        { icon: Bell, label: 'Notifications', href: '/settings/notifications' },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen border-r border-gray-100 shadow-[3px_0px_2px_rgba(0,0,0,0.15)] dark:border-gray-800 bg-[#F9F9FB] dark:bg-[#0D0B14] flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out`}>
            {/* Header & Toggle */}
            <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
                {!isCollapsed && (
                    <Link to="/dashboard" className="pl-4">
                        <span className="text-xl font-black tracking-tighter text-charcoal dark:text-white font-display uppercase">
                            zen
                            <span className="inline-flex items-center justify-center bg-primary text-white w-6 h-6 rounded-lg ml-1 text-xs transform rotate-3 shadow-lg shadow-primary/20">x</span>
                            ify
                        </span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-black rotate-3 shadow-lg">x</div>
                )}

                <button
                    onClick={onToggle}
                    className={`p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all ${!isCollapsed ? 'mr-0' : 'hidden'}`}
                >
                    <PanelLeftClose size={20} />
                </button>
            </div>

            {/* Re-add expand button for collapsed state */}
            {isCollapsed && (
                <button
                    onClick={onToggle}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all mx-auto mt-2"
                >
                    <PanelLeft size={24} />
                </button>
            )}

            {/* Navigation */}
            <nav
                className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'mt-4' : 'mt-8'}`}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                <style>
                    {`
                    nav::-webkit-scrollbar {
                        display: none;
                    }
                    `}
                </style>
                {navItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        {...item}
                        isCollapsed={isCollapsed}
                        active={location.pathname === item.href}
                    />
                ))}
            </nav>

            {/* User Support / Profile Footer */}
            <div className="relative mt-auto p-4" ref={menuRef}>
                {/* Profile Modal / Dropdown Content - Sideways Positioning */}
                {isMenuOpen && (
                    <div className={`absolute left-full ml-3 bottom-0 mb-2 bg-white dark:bg-gray-900 rounded-3xl shadow-[5px_5px_25px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-800 p-2 z-60 transition-all animate-in fade-in slide-in-from-left-4 duration-300 w-56`}>
                        {/* Header Section */}
                        <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-brand-gradient p-[1.5px]">
                                <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}`}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-black text-charcoal dark:text-gray-100 truncate">
                                    {user?.full_name || 'Shadcn'}
                                </span>
                                <span className="text-[10px] text-gray-500 truncate lowercase font-bold opacity-80">
                                    {user?.email || 'm@example.com'}
                                </span>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="flex flex-col gap-0.5">
                            {profileMenuItems.map((item, index) => (
                                <React.Fragment key={item.label}>
                                    {index === 1 && <div className="h-px bg-gray-50 dark:bg-gray-800/50 my-1 mx-2" />}
                                    <Link
                                        to={item.href}
                                        onClick={(e) => {
                                            setIsMenuOpen(false);
                                            if (!['Account', 'Settings', 'General', 'Upgrade (Pro)'].includes(item.label)) {
                                                e.preventDefault();
                                                showComingSoonToast(item.label);
                                            }
                                        }}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-wider group ${item.color === 'primary'
                                                ? 'hover:bg-primary/5 text-gray-600 dark:text-gray-400 hover:text-primary'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <item.icon size={16} className={item.color === 'primary' ? 'group-hover:scale-110 transition-transform' : ''} />
                                        {item.label}
                                    </Link>
                                </React.Fragment>
                            ))}
                            <div className="h-px bg-gray-50 dark:bg-gray-800/50 my-1 mx-2" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-all text-xs font-black uppercase tracking-wider"
                            >
                                <LogOut size={16} />
                                Log out
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Trigger Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-full flex items-center rounded-2xl transition-all group ${isCollapsed ? 'justify-center p-0' : 'bg-white dark:bg-gray-900/50 p-2 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-95'}`}
                >
                    <div className="relative shrink-0">
                        <div className={`${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-brand-gradient p-[1.5px] shadow-lg group-hover:rotate-12 transition-transform`}>
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                                <img
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}`}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-[3px] border-white dark:border-gray-900 rounded-full" />
                        )}
                    </div>

                    {!isCollapsed && (
                        <>
                            <div className="flex flex-col flex-1 min-w-0 pr-1 ml-3 text-left">
                                <span className="text-[13px] font-black text-charcoal dark:text-gray-100 truncate font-display tracking-tight leading-none mb-0.5">
                                    {user?.full_name?.split(' ')[0] || 'Unknown'}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black opacity-80">
                                    {user?.plan || 'Free Plan'}
                                </span>
                            </div>

                            <div className="text-gray-400 group-hover:text-primary transition-colors">
                                <MoreVertical size={16} strokeWidth={3} />
                            </div>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
