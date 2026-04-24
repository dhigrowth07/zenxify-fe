import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Settings, Mic, Zap, Wind, Video, Music, AlertCircle, Box } from 'lucide-react';
import VideoPreview from '../../components/shared/VideoPreview';
import { useTheme } from '../../hooks/useTheme';
import { toast } from '../../utils/toastHandler';
import { getSegments, runVad, updateSegments, confirmCuts } from '../../services/vadServices';
import {
    loadProject,
    setProjectJson,
    setVadSegments,
    setVadStats,
    setVadStatus,
    setVadError,
    updateVadConfig
} from '../../redux/editor/editorSlice';
import { API_URL } from '../../config/envConfig';
import api from '../../services/api';
import { store } from '../../redux/store';


import { selectNotifications } from '../../redux/notifications/notificationSlice';
import TimelineEditor from '../../components/features/timeline/TimelineEditor';
import { transformVadToTimeline } from '../../components/features/timeline/timelineUtils';

const VadTrimingPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    // Selectors from our new modular VAD state
    const vad = useSelector((state) => state.editor.vad);
    const { segments, status: vadStatus, config: vadConfig, stats: vadStats } = vad;

    // Redux State
    const isPlaying = useSelector((state) => state.editor.isPlaying);
    const notifications = useSelector(selectNotifications);
    const projectJson = useSelector((state) => state.editor.editor.projectJson);


    const { isDark } = useTheme();

    // Local UI State
    const [project, setProject] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("");

    // Helper to fetch/refresh data
    const fetchProjectData = async (isRefresh = false) => {
        if (!id) return;
        if (!isRefresh && !project) setIsInitialLoading(true);
        if (!isRefresh && project) setLoading(true);
        try {
            const res = await getSegments(id);
            if (res?.data) {
                const rawData = res.data.data || res.data;
                setProject(rawData);

                // --- ENHANCEMENT: Presign B-Roll and SFX assets ---
                // The API returns raw S3 keys or IDs in editor_json. The browser needs presigned URLs to play them.
                const sfxSegments = rawData.sfx_segments || [];
                const brollSegments = rawData.broll_segments || [];

                // Helper to presign an S3 key
                const getPresigned = async (s3Key) => {
                    if (!s3Key) return null;
                    if (s3Key.startsWith('http')) return s3Key;
                    try {
                        const response = await api.get('/api/storage/presign/download', { params: { s3Key } });
                        return response.data?.data?.downloadUrl;
                    } catch (e) { return null; }
                };

                // Presign SFX
                const hydratedSFX = await Promise.all(sfxSegments.map(async (s) => ({
                    ...s,
                    url: await getPresigned(s.s3_key)
                })));

                // Presign B-Roll
                const hydratedBroll = await Promise.all(brollSegments.map(async (s) => ({
                    ...s,
                    clip_url: await getPresigned(s.clip_s3_key)
                })));
                // Merge hydrated items back into rawData for transformation
                const enrichedData = {
                    ...rawData,
                    video_url: rawData.videoUrl || rawData.project?.video_url, // Fix naming conflict
                    sfx_segments: hydratedSFX,
                    broll_segments: hydratedBroll
                };

                setProject(enrichedData);

                // Sync VAD specific Data to Redux Store
                if (enrichedData.segments) {
                    dispatch(setVadSegments(enrichedData.segments));
                }
                if (enrichedData.stats) {
                    dispatch(setVadStats(enrichedData.stats));
                }
                if (enrichedData.project?.sensitivity) {
                    dispatch(updateVadConfig({ sensitivity: enrichedData.project.sensitivity }));
                }


                // Load basic metadata into Redux
                dispatch(loadProject({
                    projectId: id,
                    editor: enrichedData.project?.editor_json || {},
                    sourceUrl: enrichedData.videoUrl || (enrichedData.project?.video_url?.startsWith('http')
                        ? enrichedData.project.video_url
                        : `${API_URL}${enrichedData.project?.video_url}`)
                }));

                dispatch(setVadStatus('success'));
            }
        } catch (err) {
            console.error("Failed to fetch project:", err);
            dispatch(setVadError(err.message));
        } finally {
            setIsInitialLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id, dispatch]);

    // Ref to prevent double-refresh for the same notification
    const lastHandledNotificationId = useRef(null);

    // Real-time listener for multi-stage progress
    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        const latest = notifications[0];
        if (latest.id === lastHandledNotificationId.current) return;

        const isForThisProject = latest.projectId === id || latest.data?.projectId === id;
        if (!isForThisProject) return;

        // 1. VAD Completion (Existing logic)
        const isVadEvent = latest.type === 'vad_done' || latest.type === 'vad_complete';
        const reflectsCompletion = latest.message?.toLowerCase().includes('vad completed') ||
            latest.message?.toLowerCase().includes('analyzed');

        if ((isVadEvent || reflectsCompletion)) {
            console.log(`[VAD] Completion notification (${latest.id}) detected. Refreshing...`);
            lastHandledNotificationId.current = latest.id;
            fetchProjectData(true); // silent refresh
            return;
        }

        // 2. Merge Job Lifecycle
        if (latest.type === 'job_started' || latest.type === 'job:started') {
            setProgress(75);
            setProgressMessage("Processing video...");
            lastHandledNotificationId.current = latest.id;
        } else if (latest.type === 'job_completed' || latest.type === 'job:completed' || latest.type === 'merge_complete') {
            setProgress(100);
            setProgressMessage("Finalizing...");
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
                setProgressMessage("");
                toast.success("Project Finalized!", "Your video is ready.");
                fetchProjectData(true);
            }, 1000);
            lastHandledNotificationId.current = latest.id;
        } else if (latest.type === 'job_failed' || latest.type === 'job:failed') {
            setLoading(false);
            setProgress(0);
            toast.error("Process Failed", latest.message || "An error occurred during merging.");
            lastHandledNotificationId.current = latest.id;
        }
    }, [notifications, id]);

    const handleFinalize = async () => {
        if (!id || !project) return;
        
        // Get segments from Redux state (latest edited version)
        const currentSegments = store.getState().editor.vad.segments;
        if (!currentSegments || currentSegments.length === 0) return;

        try {
            setLoading(true);
            setProgress(10);
            setProgressMessage("Syncing metadata...");

            // ROBUST DETECTION: Are we looking at tracks data or flat segments?
            const isTracksData = currentSegments[0] && Array.isArray(currentSegments[0].actions);
            const sourceArray = isTracksData ? currentSegments[0].actions : currentSegments;

            const keptIndices = [];
            const changes = sourceArray.map(item => {
                // If it's a track action, it has .data.is_kept. If it's a flat segment, it has .is_kept.
                const isKept = item.data ? item.data?.is_kept !== false : item.is_kept !== false;
                const segmentIndex = item.data ? (item.data?.segment_index || 0) : (item.segment_index || 0);

                if (isKept) {
                    keptIndices.push(segmentIndex);
                }
                return {
                    segment_index: segmentIndex,
                    is_kept: isKept
                };
            });

            // 1. Sync the metadata first
            await updateSegments(id, changes);
            setProgress(35);
            setProgressMessage("Queuing merge job...");
            
            // 2. Trigger the actual Merge/Rendering job
            const mergeRes = await confirmCuts(id, keptIndices);
            
            if (mergeRes?.status === 'success') {
                setProgress(55);
                setProgressMessage("Waiting for worker...");
                
                // Clear local draft
                console.log(`[DRAFT] Clearing draft for ${id} after successful sync and merge trigger.`);
                localStorage.removeItem(`vad_draft_${id}`);
            } else {
                throw new Error(mergeRes?.message || "Failed to trigger merge job.");
            }
        } catch (err) {
            console.error("Finalization failed:", err);
            toast.error("Finalization failed", err.message);
            setLoading(false);
            setProgress(0);
        }
    };

    const handleRunAnalysis = async () => {
        if (!id) return;
        dispatch(setVadStatus('running'));
        try {
            const res = await runVad(id, {
                sensitivity: vadConfig.sensitivity,
                autoCutFillers: vadConfig.autoCutFillers
            });
            if (res?.status === 'success') {
                // Background job started
            }
        } catch (err) {
            dispatch(setVadError(err.message));
        }
    };

    // Transform VAD segments for the Timeline Editor
    const timelineData = useMemo(() => {
        if (!project) return null;
        return transformVadToTimeline(project);
    }, [project]);

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-[#f3f4f6] p-4 md:px-8 pt-0 animate-in fade-in duration-500">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6 items-start">
                        {/* Config Skeleton */}
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#e5e7eb] h-[500px] relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-gray-100 rounded-2xl shimmer"></div>
                                <div className="w-48 h-6 bg-gray-100 rounded-lg shimmer"></div>
                            </div>
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <div className="w-8 h-8 bg-gray-100 rounded-xl shimmer"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="w-1/3 h-4 bg-gray-100 rounded shimmer"></div>
                                            <div className="w-2/3 h-3 bg-gray-100/60 rounded shimmer"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Timeline Area Skeleton */}
                            <div className="mt-12 pt-8 border-t border-gray-100 space-y-4">
                                <div className="w-32 h-3 bg-gray-100 rounded shimmer"></div>
                                <div className="w-full h-32 bg-gray-50 rounded-2xl shimmer"></div>
                            </div>
                        </div>
                        {/* Sidebar Skeleton */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[32px] p-4 shadow-sm border border-[#e5e7eb] h-[400px] flex flex-col items-center justify-center gap-4">
                                <div className="w-full aspect-video bg-gray-100 rounded-2xl shimmer"></div>
                                <div className="w-full h-12 bg-gray-100 rounded-2xl shimmer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f3f4f6] p-4 md:px-8 pt-0 font-sans fade-in">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6 items-start">

                    {/* VAD Configuration Card */}
                    <div className="bg-white rounded-[32px] pt-6 shadow-sm border border-[#e5e7eb] relative overflow-hidden h-fit flex flex-col">
                        <div className="absolute inset-0 border-[1.5px] border-[#d900ff]/10 rounded-[32px] pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-6 px-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#d900ff]/10 rounded-2xl">
                                    <Settings className="w-5 h-5 text-[#d900ff]" />
                                </div>
                                <h2 className="text-xl font-bold text-[#111827]">VAD Analysis</h2>
                            </div>
                            <button
                                onClick={handleRunAnalysis}
                                disabled={vadStatus === 'running'}
                                className={`bg-brand-gradient text-white px-6 py-2 relative z-20 rounded-xl text-xs font-bold shadow-lg shadow-[#d900ff]/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50`}
                            >
                                {vadStatus === 'running' ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                        </div>

                        <div className="space-y-3 px-6">
                            {/* Sensitivity Configuration */}
                            <div className="group cursor-pointer">
                                <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="mt-1 p-2 bg-blue-500/10 rounded-xl">
                                        <Mic className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="font-bold text-[#111827] text-sm">Sensitivity</h3>
                                            <select
                                                value={vadConfig.sensitivity}
                                                onChange={(e) => dispatch(updateVadConfig({ sensitivity: e.target.value }))}
                                                className="bg-white border border-gray-200 rounded-lg text-[10px] px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-[#d900ff]/20"
                                            >
                                                <option value="balanced">Balanced</option>
                                                <option value="aggressive">Aggressive</option>
                                                <option value="gentle">Gentle</option>
                                                <option value="natural">Natural</option>
                                                <option value="default">Default</option>
                                            </select>
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-tight">
                                            Adjusts detection threshold for voice.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Auto-Cut Fillers */}
                            <div
                                className="group cursor-pointer"
                                onClick={() => dispatch(updateVadConfig({ autoCutFillers: !vadConfig.autoCutFillers }))}
                            >
                                <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="mt-1 p-2 bg-amber-500/10 rounded-xl">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="font-bold text-[#111827] text-sm">Auto-Cut Fillers</h3>
                                            <div className={`w-8 h-4 ${vadConfig.autoCutFillers ? 'bg-[#d900ff]' : 'bg-gray-200'} rounded-full relative transition-colors cursor-pointer`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${vadConfig.autoCutFillers ? 'right-0.5' : 'left-0.5'}`} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-tight">
                                            AI removal of fillers and long pauses.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* Integrated Timeline View */}
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between px-6">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Multi-Track Editor</h3>
                            </div>

                            <div className={`bg-[#f9fafb] border-y border-gray-100 overflow-hidden min-h-[160px] relative transition-colors duration-300 ${!isDark ? 'twick-light bg-white' : 'bg-[#141419]'}`}>
                                {timelineData ? (
                                    <div className="flex flex-col h-full">
                                        <TimelineEditor data={timelineData} projectId={id} />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                                        <Box className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-lg font-medium">Initializing Editor...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* 
                        <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> AI-powered Timeline SDK</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full font-bold">READY</span>
                        </div> */}
                    </div>

                    <VideoPreview
                        project={project}
                        title="Preview"
                        className="w-full"
                        actionButton={
                            <button 
                                className="w-full relative overflow-hidden bg-[#1E1F22] border border-white/10 hover:border-[#d900ff]/50 text-white py-4 rounded-3xl text-sm font-bold shadow-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-90"
                                onClick={handleFinalize}
                                disabled={loading}
                            >
                                {/* PROGRESS BAR BACKGROUND */}
                                {loading && (
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d900ff]/30 to-[#d900ff]/10 transition-all duration-1000 ease-in-out border-r border-[#d900ff]/30"
                                        style={{ width: `${progress}%` }}
                                    />
                                )}
                                
                                <div className="relative z-10 flex items-center justify-between px-6 w-full">
                                    {loading ? (
                                        <>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="flex-shrink-0 w-4 h-4 border-2 border-[#d900ff]/30 border-t-[#d900ff] rounded-full animate-spin" />
                                                <span className="whitespace-nowrap truncate opacity-90">{progressMessage || "Saving..."}</span>
                                            </div>
                                            <span className="flex-shrink-0 font-mono text-[11px] bg-white/5 px-2 py-1 rounded-md text-white/50 border border-white/5">
                                                {progress}%
                                            </span>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3 w-full">
                                            <span className="tracking-wide">CONFIRM & PROCESS</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        }
                    />
                </div>

            </div>
        </div>
    );
};

export default VadTrimingPage;