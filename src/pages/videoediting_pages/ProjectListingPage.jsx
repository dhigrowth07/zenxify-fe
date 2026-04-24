import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Copy,
    Clock,
    CheckCircle2,
    AlertCircle,
    Play,
    Sparkles,
    Filter,
    LayoutGrid,
    List,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProjectsAsync,
    selectAllProjects,
    selectProjectLoading,
    selectProjectPagination,
    deleteProjectAsync
} from '../../redux/projects/projectSlice';
import { toast } from '../../utils/toastHandler';

/**
 * @param {object} props
 * @param {string} props.status
 */
const StatusBadge = ({ status }) => {
    /** @type {Record<string, {color: string, icon: any, label: string}>} */
    const statusMap = {
        'created': { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock, label: 'Pending' },
        'uploaded': { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock, label: 'Media Ready' },
        'vad_review': { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Play, label: 'Reviewing' },
        'transcribed': { color: 'bg-purple-50 text-purple-600 border-purple-200', icon: Sparkles, label: 'Transcribed' },
        'merge_complete': { color: 'bg-cyan-50 text-cyan-600 border-cyan-200', icon: CheckCircle2, label: 'Merged' },
        'completed': { color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2, label: 'Finished' },
        'failed': { color: 'bg-red-50 text-red-600 border-red-200', icon: AlertCircle, label: 'Failed' }
    };

    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock, label: status };
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${config.color}`}>
            <Icon size={12} strokeWidth={3} />
            {config.label}
        </div>
    );
};

/** @param {number} seconds */
const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ProjectListingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const projects = useSelector(selectAllProjects);
    const isLoading = useSelector(selectProjectLoading);
    const pagination = useSelector(selectProjectPagination);

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [activeFilter, setActiveFilter] = useState('all');
    const [openMenuId, setOpenMenuId] = useState(/** @type {string | null} */(null));

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        /** @type {any} */ (dispatch)(fetchProjectsAsync({ page: 1, limit: 20 }));
    }, [dispatch]);

    const handleDeleteProject = async (/** @type {string} */ id, /** @type {string} */ title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            /** @type {any} */
            const result = await dispatch(deleteProjectAsync(id));
            if (deleteProjectAsync.fulfilled.match(result)) {
                toast.success("Deleted", "Project removed successfully.");
            } else {
                toast.error("Error", "Failed to delete project.");
            }
        }
    };

    const filteredProjects = projects?.filter((/** @type {any} */ p) => {
        const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-charcoal dark:text-white font-display tracking-tight uppercase leading-none mb-3">
                        My Projects
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        {projects?.length || 0} Total Projects • {formatDuration(projects?.reduce((acc, p) => acc + (p.total_duration || 0), 0))} Total Duration
                    </p>
                </div>

                <button
                    onClick={() => navigate('/video-editor/create')}
                    className="group bg-brand-gradient text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                >
                    <Plus size={20} strokeWidth={3} />
                    New Project
                </button>
            </div>

            {/* Tool Bar & Filters */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-4 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects by title..."
                        className="w-full bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold placeholder:text-gray-400 outline-none transition-all shadow-inner"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
                    {['all', 'completed', 'uploaded', 'vad_review', 'created'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* View Toggles */}
                <div className="hidden sm:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl shrink-0">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Project Display */}
            {isLoading && projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                    <p className="font-black text-xs uppercase tracking-widest text-gray-400">Loading your creative workspace...</p>
                </div>
            ) : filteredProjects?.length === 0 ? (
                <div className="bg-white/40 dark:bg-gray-900/40 rounded-[40px] border border-gray-100 dark:border-gray-800 p-20 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Plus size={40} />
                    </div>
                    <h3 className="text-xl font-black text-charcoal dark:text-white uppercase tracking-tight mb-2">No projects found</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Ready to start your next viral video?</p>
                    <button
                        onClick={() => navigate('/video-editor/create')}
                        className="text-primary font-black text-xs uppercase tracking-widest border-b-2 border-primary pb-1 hover:opacity-70"
                    >
                        Initialize First Project
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProjects.map((/** @type {any} */ project) => (
                        <div
                            key={project.id}
                            className={`group relative flex flex-col h-full bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm p-4 rounded-[32px] border border-gray-600/80 dark:border-gray-800/80 shadow-[10px_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] hover:border-primary/90 transition-all duration-500 cursor-pointer ${openMenuId === project.id ? 'z-30' : 'z-0'}`}
                            onClick={() => navigate(`/video-editor/vad-triming/${project.id}`)}
                        >
                            {/* Card Media Preview */}
                            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-[24px] overflow-hidden mb-5 shadow-inner ring-1 ring-gray-100/50 dark:ring-gray-800/50 transition-all duration-500 group-hover:ring-primary/10">
                                {project.thumbnail_url ? (
                                    <img
                                        src={project.thumbnail_url}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : project.main_video_url ? (
                                    <video
                                        src={project.main_video_url}
                                        className="w-full h-full object-cover"
                                        muted
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                                        <Play size={32} className="text-gray-200 group-hover:text-primary transition-colors" />
                                    </div>
                                )}

                                {/* Overlay Badge */}
                                <div className="absolute top-3 left-3 z-10 scale-90 origin-top-left">
                                    <StatusBadge status={project.status} />
                                </div>

                                {/* Hover Play Icon */}
                                <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500">
                                        <Play fill="currentColor" size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Card Info */}
                            <div className="flex flex-col flex-1 px-1">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h4 className="font-black text-charcoal dark:text-white uppercase tracking-tight text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                                        {project.title || 'Untitled Project'}
                                    </h4>
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === project.id ? null : project.id);
                                            }}
                                            className={`p-1.5 rounded-lg text-gray-400 transition-colors ${openMenuId === project.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {openMenuId === project.id && (
                                            <div
                                                className="absolute  right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-[1px_2px_5px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-800 py-2 z-40 ring-1 ring-gray-400 dark:ring-gray-800 animate-in fade-in slide-in-from-top-2 duration-200"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); navigate(`/video-editor/vad-triming/${project.id}`); }}
                                                    className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary flex items-center gap-3 transition-colors"
                                                >
                                                    <Edit2 size={14} /> Open Editor
                                                </button>
                                                <div className="h-px bg-gray-50 dark:bg-gray-800 mx-2 my-1" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleDeleteProject(project.id, project.title); }}
                                                    className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100/50 dark:border-gray-800/50">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <Clock size={10} strokeWidth={3} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                        MP4 • {formatDuration(project.total_duration)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* LIST VIEW */
                <div className="flex flex-col gap-4">
                    {filteredProjects.map((/** @type {any} */ project) => (
                        <div
                            key={project.id}
                            onClick={() => navigate(`/video-editor/vad-triming/${project.id}`)}
                            className={`group relative bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-[32px] border border-gray-100/80 dark:border-gray-800/80 p-5 flex items-center gap-6 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:border-primary/30 cursor-pointer ${openMenuId === project.id ? 'z-30' : 'z-0'}`}
                        >
                            <div className="w-24 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                {project.thumbnail_url ? (
                                    <img src={project.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                ) : project.main_video_url ? (
                                    <video src={project.main_video_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" muted />
                                ) : (
                                    <Play size={20} className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-charcoal dark:text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                                    {project.title || 'Untitled Project'}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <StatusBadge status={project.status} />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        Created: {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                        {formatDuration(project.total_duration)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === project.id ? null : project.id);
                                        }}
                                        className={`p-3 rounded-xl transition-all ${openMenuId === project.id ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {openMenuId === project.id && (
                                        <div
                                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); navigate(`/video-editor/vad-triming/${project.id}`); }}
                                                className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary flex items-center gap-3 transition-colors"
                                            >
                                                <Edit2 size={14} /> Open Editor
                                            </button>
                                            <div className="h-px bg-gray-50 dark:bg-gray-800 mx-2 my-1" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleDeleteProject(project.id, project.title); }}
                                                className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectListingPage;
