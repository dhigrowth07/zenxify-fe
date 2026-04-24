import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Search, 
    Upload, 
    Play, 
    Music, 
    Sparkles, 
    Clock, 
    Plus,
    CloudUpload
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';
import { getProject } from '../../services/projectServices';
import VideoPreview from '../../components/shared/VideoPreview';
import { loadProject } from '../../redux/editor/editorSlice';
import { API_URL } from '../../config/envConfig';
import api from '../../services/api';

const SFX_CATEGORIES = [
    "Nature", "Urban", "Cinematic", "Foley", "Sci-Fi", "Comedy"
];

const MOCK_SFX = [
    { id: 1, name: "01: Nature Ambiance", duration: "0.15s", category: "Nature" },
    { id: 2, name: "01: Nature Ambiance", duration: "0.15s", category: "Nature" },
    { id: 3, name: "01: Nature Ambiance", duration: "0.15s", category: "Nature" },
    { id: 4, name: "01: Nature Ambiance", duration: "0.15s", category: "Nature" },
    { id: 5, name: "01: Nature Ambiance", duration: "0.15s", category: "Nature" },
];

const SfxPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('library'); // 'library' | 'my_uploads' | 'ai_picks'
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!id) return;
            try {
                const res = await getProject(id);
                if (res?.data) {
                    const projectData = res.data;
                    let finalSourceUrl = projectData.video_url?.startsWith('http') 
                        ? projectData.video_url 
                        : `${API_URL}${projectData.video_url}`;

                    if (projectData.merged_s3_key) {
                        try {
                            const presignRes = await api.get('/api/storage/presign/download', { 
                                params: { s3Key: projectData.merged_s3_key } 
                            });
                            if (presignRes.data?.data?.downloadUrl) {
                                finalSourceUrl = presignRes.data.data.downloadUrl;
                            }
                        } catch (e) {
                            console.error("Failed to presign merged video:", e);
                        }
                    }

                    setProject(projectData);
                    dispatch(loadProject({
                        projectId: id,
                        editor: projectData.editor_json || {},
                        sourceUrl: finalSourceUrl
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch project:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectData();
    }, [id, dispatch]);

    const [visibleCount, setVisibleCount] = useState(4);

    const handleViewMore = () => {
        setVisibleCount(prev => prev + 4);
    };

    const hasMore = visibleCount < MOCK_SFX.length;

    if (loading) {
        return <div className="p-8 text-center bg-white rounded-3xl animate-pulse text-gray-400">Loading SFX Environment...</div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-full">
            <div className="grid grid-cols-12 gap-8 items-start">
                
                {/* COLUMN 1: SFX LIBRARY & TABS */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-black text-[#111827] tracking-tight">SFX Generation & Library</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enhance your story with AI-curated sound effects</p>
                        </div>
                        <button className="flex items-center gap-2 bg-white border-2 border-[#EFEFEF] px-5 py-2.5 rounded-xl text-xs font-black text-charcoal hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
                            <CloudUpload size={16} className="text-primary" />
                            Upload SFX Library
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex gap-8 border-b border-gray-100 px-2 pb-px">
                        {['library', 'my_uploads', 'ai_picks'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setVisibleCount(4); // Reset on tab change
                                }}
                                className={cn(
                                    "pb-4 text-xs font-black uppercase tracking-widest relative transition-all",
                                    activeTab === tab ? "text-primary" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {tab.replace('_', ' ')}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_6px_rgba(206,0,255,0.4)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* SFX LIST WITH FIXED HEIGHT */}
                    <div className="relative">
                        <div className="space-y-4 h-[520px] overflow-y-auto pr-2 custom-scrollbar pb-20">
                            {MOCK_SFX.slice(0, visibleCount).map((sfx, idx) => (
                                <div 
                                    key={idx}
                                    className="group bg-white p-6 rounded-[28px] border border-gray-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-xl hover:shadow-primary/5 hover:border-primary/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-6">
                                        <button className="w-12 h-12 bg-[#EFEFEF] rounded-full flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                            <Play size={20} fill="currentColor" className="ml-1" />
                                        </button>
                                        <div>
                                            <h3 className="font-black text-sm text-[#111827] tracking-tight">{sfx.name}</h3>
                                            <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-bold">{sfx.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 scale-90">
                                        <button className="bg-brand-gradient text-white px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                            Add
                                        </button>
                                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center">Duration</span>
                                    </div>
                                </div>
                            ))}

                            {/* VIEW MORE SECTION */}
                            {hasMore && (
                                <div className="flex justify-center pt-4 pb-8">
                                    <button 
                                        onClick={handleViewMore}
                                        className="group flex flex-col items-center gap-2 hover:opacity-80 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary group-hover:translate-y-1 transition-transform">
                                            <Plus size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">View More Sounds</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* SUBTLE GRADIENT FADE AT BOTTOM FOR USER FRIENDLY FEEL */}
                        {hasMore && (
                             <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f3f4f6] to-transparent pointer-events-none" />
                        )}
                    </div>
                </div>

                {/* COLUMN 3: PREVIEW & ACTION */}
                <div className="col-span-12 lg:col-span-3">
                    <VideoPreview 
                        project={project}
                        title="Preview"
                        actionButton={
                            <button className="w-full bg-brand-gradient text-white py-4 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.01] active:translate-y-1 transition-all">
                                Add BG Audio
                            </button>
                        }
                    />
                </div>

            </div>
        </div>
    );
};

export default SfxPage;
