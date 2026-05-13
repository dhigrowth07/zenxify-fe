import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Trash2,
  MoreHorizontal,
  Plus,
  Infinity,
  Maximize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  Sparkles,
  Search,
  UploadCloud,
  X,
  Film,
  Zap,
  Check,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import VideoPreview from '../../components/shared/VideoPreview';
import { cn } from '../../lib/utils';
import TransitionPickerModal from '../../components/features/timeline/TransitionPickerModal';
import AnimationPickerModal from '../../components/features/timeline/AnimationPickerModal';
import brollServices from '../../services/brollServices';
import { getProject } from '../../services/projectServices';
import { API_URL } from '../../config/envConfig';
import {
  fetchBrollResults,
  syncAnalysisStatus,
  triggerBrollAnalysis,
  updateSegment,
  applyBrollToEditor
} from '../../redux/broll/brollSlice';
import {
  loadProject
} from '../../redux/editor/editorSlice';
import ConfirmationModal from '../../components/shared/ConfirmationModal';


const BrollPage = () => {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();
  const { isCollapsed } = useOutletContext() || {};

  const { results, status, analysisStatus, error } = useSelector((state) => state.broll);
  const editorProject = useSelector((state) => state.editor);
  const projectStatus = editorProject?.editor?.projectJson?.status;

  // ─── Hydrate editor state on page refresh ──────────────────────────────────
  // BrollPage may be navigated to directly (or refreshed), at which point the
  // Redux editor state is empty. We mirror the pattern from ColourGradePage:
  // fetch the project, resolve the correct video URL, and dispatch loadProject.
  useEffect(() => {
    const hydrateProject = async () => {
      // Skip if sourceUrl is already in Redux (navigated from another editor page)
      if (editorProject?.sourceUrl) return;
      if (!projectId) return;
      try {
        const res = await getProject(projectId);
        if (res?.data) {
          const projectData = res.data;
          const sourceUrl = projectData.video_url?.startsWith('http')
            ? projectData.video_url
            : `${API_URL}${projectData.video_url}`;
          dispatch(loadProject({
            projectId,
            editor: projectData.editor_json || {},
            sourceUrl
          }));
        }
      } catch (err) {
        console.error('[BrollPage] Failed to hydrate project:', err);
      }
    };
    hydrateProject();
  }, [projectId, dispatch]); // intentionally omit editorProject to run once

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeTransitionIdx, setActiveTransitionIdx] = useState(null);
  const [currentTransitionType, setCurrentTransitionType] = useState('fade');

  const [isAnimPickerOpen, setIsAnimPickerOpen] = useState(false);
  const [activeAnimIdx, setActiveAnimIdx] = useState(null);
  const [currentAnimType, setCurrentAnimType] = useState('none');

  // Replace & Advanced Replace State
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [activeModalSegment, setActiveModalSegment] = useState(null);
  const [webSearchRequired, setWebSearchRequired] = useState(false);
  const [replaceTab, setReplaceTab] = useState('upload'); // 'upload' or 'library'

  // Library Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOrientation, setSearchOrientation] = useState('portrait');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Advanced Regen State
  const [promptOverride, setPromptOverride] = useState('');
  const [queryOverride, setQueryOverride] = useState('');
  const [forceType, setForceType] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmSegment, setConfirmSegment] = useState(null);

  const handleOpenReplace = (segment) => {
    setActiveModalSegment(segment);
    setIsReplaceModalOpen(true);
    setReplaceTab('upload');
  };

  const handleOpenAdvanced = (segment) => {
    setActiveModalSegment(segment);
    setPromptOverride('');
    setQueryOverride('');
    setForceType('');
    setWebSearchRequired(segment.web_search_required || false);
    setIsAdvancedModalOpen(true);
  };

  const handleSearchLibrary = async (overrideOrientation) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await brollServices.searchLibrary({
        query: searchQuery,
        orientation: overrideOrientation || searchOrientation,
        perPage: 12
      });
      setSearchResults(response.data || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLibraryClip = async (clip, segmentOverride) => {
    const seg = segmentOverride || activeModalSegment;
    if (!seg) return;
    const loadingToast = toast.loading('Updating segment...');
    try {
      if (clip.source_type && clip.source_type !== 'stock_video') {
        // Switch back to AI or Web generated visuals
        await brollServices.updateBrollSegment(projectId, seg.segment_index, {
          source_type: clip.source_type,
          user_confirmed: true
        });
      } else {
        // Stock footage replacement
        const getBestLink = (c) => {
          if (!c.video_files || c.video_files.length === 0) return c.url;
          const files = c.video_files;
          return (files.find(f => f.quality === 'hd' && f.width >= 720) ||
            files.find(f => f.quality === 'hd') ||
            files.find(f => f.quality === 'sd') ||
            files[0]).link;
        };
        const bestLink = getBestLink(clip);
        await brollServices.replaceFromLibrary(projectId, seg.segment_index, {
          ...clip,
          clip_url: bestLink,
          provider: clip.provider,
          clip_id: String(clip.id),
          thumbnail: clip.thumbnail
        });
      }
      toast.success('Segment updated successfully', { id: loadingToast });
      setIsReplaceModalOpen(false);
      dispatch(fetchBrollResults(projectId));
    } catch (err) {
      toast.error('Failed to update segment', { id: loadingToast });
    }
  };

  const handleFileUpload = async (file) => {
    if (!activeModalSegment) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Presign
      const presign = await brollServices.presignCustomReplace(projectId, activeModalSegment.segment_index, file.type);
      const { uploadUrl, s3Key } = presign.data;

      // Step 2: S3 Upload
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Step 3: Confirm
      await brollServices.confirmCustomReplace(projectId, activeModalSegment.segment_index, {
        s3Key,
        fileSize: file.size
      });

      toast.success('File uploaded successfully');
      setIsReplaceModalOpen(false);
      dispatch(fetchBrollResults(projectId));
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdvancedRegenerate = async () => {
    if (!activeModalSegment) return;
    setIsRegenerating(true);
    const loadingToast = toast.loading('Regenerating segment...');
    try {
      await brollServices.regenerateSegmentVisuals(projectId, activeModalSegment.segment_index, {
        prompt_override: promptOverride || undefined,
        query_override: queryOverride || undefined,
        force_type: forceType || undefined,
        web_search_required: webSearchRequired
      });
      toast.success('Regeneration complete!', { id: loadingToast });
      setIsAdvancedModalOpen(false);
      dispatch(fetchBrollResults(projectId));
    } catch (err) {
      toast.error('Regeneration failed', { id: loadingToast });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDirectRegenerate = (segment) => {
    if (!segment) return;
    setConfirmSegment(segment);
    setIsConfirmOpen(true);
  };

  const executeDirectRegenerate = async () => {
    if (!confirmSegment) return;

    setIsRegenerating(true);
    const loadingToast = toast.loading('Regenerating visuals...');
    try {
      await brollServices.regenerateSegmentVisuals(projectId, confirmSegment.segment_index, {});
      toast.success('Visuals regenerated!', { id: loadingToast });
      setIsConfirmOpen(false);
      dispatch(fetchBrollResults(projectId));
    } catch (err) {
      toast.error('Regeneration failed', { id: loadingToast });
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      dispatch(fetchBrollResults(projectId));
    }
  }, [dispatch, projectId]);

  // Sync analysis status from project global status
  useEffect(() => {
    if (projectStatus) {
      dispatch(syncAnalysisStatus(projectStatus));
    }
  }, [dispatch, projectStatus]);

  // Poll for results if analyzing
  useEffect(() => {
    let interval;
    if (analysisStatus === 'analyzing' && projectId) {
      interval = setInterval(() => {
        dispatch(fetchBrollResults(projectId));
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dispatch, projectId, analysisStatus]);

  // Create virtual timeline with transitions between segments
  const displayTimeline = React.useMemo(() => {
    if (!results || !Array.isArray(results) || results.length === 0) return [];

    const timeline = [];
    results.forEach((item, index) => {
      timeline.push({ ...item, isTransition: false });

      // Add transition item if not the last segment
      if (index < results.length - 1) {
        timeline.push({
          id: `trans-${item.segment_index}`,
          isTransition: true,
          type: item.transition || 'fade',
          name: item.transition ? item.transition.charAt(0).toUpperCase() + item.transition.slice(1) : 'Fade',
          segment_index: item.segment_index // Transition belongs to the segment it follows
        });
      }
    });
    return timeline;
  }, [results]);

  const handleTriggerAnalysis = () => {
    dispatch(triggerBrollAnalysis(projectId));
  };

  const handleApplyToEditor = () => {
    dispatch(applyBrollToEditor({
      projectId,
      data: { template_name: 'overlay', fit_mode: 'cover' }
    }));
  };

  const handleTransitionSelect = (t) => {
    setCurrentTransitionType(t.id);
    dispatch(updateSegment({
      projectId,
      segmentIndex: activeTransitionIdx,
      data: { transition: t.id }
    }));
    setIsPickerOpen(false);
  };

  const handleAnimationSelect = (anim) => {
    setCurrentAnimType(anim.id);
    dispatch(updateSegment({
      projectId,
      segmentIndex: activeAnimIdx,
      data: { animation: anim.id }
    }));
    setIsAnimPickerOpen(false);
  };

  // For the preview component
  const projectMetadata = {
    title: editorProject?.editor?.projectJson?.name || "B-Roll Project",
    video_url: editorProject?.sourceUrl,
    thumbnail_url: editorProject?.editor?.projectJson?.thumbnail_url || "https://images.unsplash.com/photo-1590086782792-42dd2350140d?q=80&w=1000&auto=format&fit=crop"
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-black text-charcoal uppercase tracking-widest">Loading B-Roll Data...</p>
      </div>
    );
  }

  if (results.length === 0) {
    if (analysisStatus === 'analyzing') {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6 max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Loader2 size={40} className="animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-charcoal tracking-tight">AI is working...</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">We are currently transcribing and analyzing your video. This may take a minute or two.</p>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-charcoal tracking-tight">Generate B-Roll</h2>
          <p className="text-sm font-medium text-gray-500 mt-2">We haven't analyzed your video for B-roll yet. Let our AI suggest the best visuals for your story.</p>
        </div>
        <button
          onClick={handleTriggerAnalysis}
          className="px-8 py-4 rounded-2xl bg-brand-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest"
        >
          Start AI Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 w-full max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 w-full">
        {/* Left Column: B-Roll List (Fluid) */}
        <div className="min-w-0 relative">
          <h1 className="text-3xl font-black text-charcoal mb-10 ml-2">B-Roll</h1>

          <div className="h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden pr-4 custom-scrollbar relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[19.5px] top-4 bottom-0 w-px bg-gray-300 z-0" />

            <div className="space-y-4 pb-10">
              {analysisStatus === 'analyzing' && (
                <div className="p-10 bg-white rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center gap-4 animate-pulse">
                  <div className="relative">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <Sparkles className="absolute -top-2 -right-2 text-primary" size={16} />
                  </div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">AI is analyzing your script...</p>
                </div>
              )}

              {displayTimeline.map((item, index) => (
                item.isTransition ? (
                  <TransitionRow
                    key={item.id}
                    name={item.name}
                    onClick={() => {
                      setActiveTransitionIdx(item.segment_index);
                      setCurrentTransitionType(item.type || 'fade');
                      setIsPickerOpen(true);
                    }}
                  />
                ) : (
                  <BrollCard
                    key={item.id}
                    data={item}
                    isSidebarExpanded={!isCollapsed}
                    onReplace={() => handleOpenReplace(item)}
                    onAdvanced={() => handleOpenAdvanced(item)}
                    onRegenerate={handleDirectRegenerate}
                    isRegenerating={isRegenerating}
                    onEffects={() => {
                      setActiveAnimIdx(item.segment_index);
                      setCurrentAnimType(item.animation || 'none');
                      setIsAnimPickerOpen(true);
                    }}
                    onQuickSwap={(clip) => handleSelectLibraryClip(clip, item)}
                  />
                )
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview (Sticky) */}
        <div className={cn(
          "shrink-0 transition-all duration-300",
          isCollapsed ? "lg:w-[300px]" : "lg:w-[230px]"
        )}>
          <div className="sticky top-6 space-y-4">
            <VideoPreview
              project={projectMetadata}
              title="Preview"
              segments={results}
              actionButton={
                <button
                  onClick={handleApplyToEditor}
                  className="w-full py-4 rounded bg-brand-gradient text-white font-black text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-widest mt-4"
                >
                  Apply to Editor
                </button>
              }
            />
          </div>
        </div>
      </div>

      <TransitionPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentTransition={currentTransitionType}
        onSelect={handleTransitionSelect}
      />

      <AnimationPickerModal
        isOpen={isAnimPickerOpen}
        onClose={() => setIsAnimPickerOpen(false)}
        currentAnimation={currentAnimType}
        onSelect={handleAnimationSelect}
      />

      {/* REPLACE B-ROLL MODAL */}
      <ReplaceBrollModal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        activeTab={replaceTab}
        setActiveTab={setReplaceTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOrientation={searchOrientation}
        setSearchOrientation={setSearchOrientation}
        searchResults={searchResults}
        onSearch={handleSearchLibrary}
        isSearching={isSearching}
        onSelectClip={handleSelectLibraryClip}
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      {/* ADVANCED REGEN MODAL */}
      <AdvancedRegenModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        currentPrompt={activeModalSegment?.prompt_used}
        prompt={promptOverride}
        setPrompt={setPromptOverride}
        query={queryOverride}
        setQuery={setQueryOverride}
        type={forceType}
        setType={setForceType}
        webSearchRequired={webSearchRequired}
        setWebSearchRequired={setWebSearchRequired}
        onExecute={handleAdvancedRegenerate}
        isRegenerating={isRegenerating}
        segmentIndex={activeModalSegment?.segment_index || 0}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDirectRegenerate}
        title="Regenerate Visuals?"
        description={`Are you sure you want to regenerate visuals for segment #${(confirmSegment?.segment_index ?? 0) + 1}? This will reset the current selection and find new candidates.`}
        confirmLabel="Regenerate"
        variant="warning"
        isLoading={isRegenerating}
      />
    </div>
  );
};

const BrollCard = ({ data, isSidebarExpanded, onReplace, onAdvanced, onRegenerate, isRegenerating, onEffects, onQuickSwap }) => {
  const isFootage = data.is_footage === true;
  const [showCandidates, setShowCandidates] = useState(false);
  const [previewClip, setPreviewClip] = useState(null);

  /** Unified list of all available visual candidates (AI, Web, Stock) */
  const candidates = useMemo(() => {
    const list = [];

    // 1. AI Image
    if (data.ai_image_url) {
      list.push({
        id: 'ai_img_' + data.id,
        type: 'image',
        source_type: 'ai_generated',
        provider: 'AI',
        label: 'AI IMG',
        thumbnail: data.ai_image_url,
        url: data.ai_image_url,
      });
    }

    // 2. Web Image
    if (data.web_image_url) {
      list.push({
        id: 'web_img_' + data.id,
        type: 'image',
        source_type: 'web_image',
        provider: 'WEB',
        label: 'WEB IMG',
        thumbnail: data.web_image_url,
        url: data.web_image_url,
      });
    }

    // 3. Stock Videos
    (data.stock_clips_json || []).slice(0, 5).forEach((v, i) => {
      list.push({
        ...v,
        type: 'video',
        source_type: 'stock_video',
        label: `STOCK VID`,
        rank: i + 1
      });
    });

    return list;
  }, [data.id, data.ai_image_url, data.web_image_url, data.stock_clips_json]);

  /** Best video link from a clip's video_files array. */
  const getBestLink = (clip) => {
    const files = clip.video_files || [];
    return (files.find(f => f.quality === 'hd' && f.width >= 720) ||
      files.find(f => f.quality === 'hd') ||
      files.find(f => f.quality === 'sd') ||
      files[0])?.link || clip.url;
  };


  return (
    <div className="flex items-center gap-4 group relative w-full max-w-3xl">
      {/* Horizontal connector line */}
      <div className="absolute left-[19.5px] top-1/2 w-8 h-px bg-gray-200 -z-10" />

      {/* Index Number Wrapper */}
      <div className="w-10 flex justify-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm relative z-10">
          {data.segment_index + 1}
        </div>
      </div>

      {/* Card Body */}
      <div className={cn(
        "flex-1 w-full min-w-0 overflow-hidden bg-white rounded p-3 ring ring-gray-400 mt-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all",
        !isFootage && "opacity-80"
      )}>
        <div className="flex gap-4 items-center">
          {/* Thumbnail */}
          <div className={cn(
            "aspect-video rounded bg-gray-50 border border-dashed border-gray-200 overflow-hidden relative flex items-center justify-center group/thumb shrink-0 transition-all",
            isSidebarExpanded ? "w-24 h-16" : "w-28 h-20"
          )}>
            {(() => {
              const url = data.final_url || data.ai_image_url || data.web_image_url;
              if (!url) return <div className="flex flex-col items-center gap-1"><Plus size={24} className="text-gray-300" /></div>;
              const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('video');
              if (isVideo) return (
                <video src={url} className="w-full h-full object-cover" muted playsInline
                  onMouseOver={e => e.target.play()} onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }} />
              );
              return <img src={url} alt={data.title || data.spoken_word} className="w-full h-full object-cover" />;
            })()}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
              <button className="p-2 bg-white rounded-full text-charcoal shadow-lg transform scale-90 group-hover/thumb:scale-100 transition-transform">
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          {/* Info & Actions */}
          <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h3 className="text-base font-black text-charcoal tracking-tight leading-tight whitespace-normal break-words">
                  {(data.segment_index + 1).toString().padStart(2, '0')}: {data.title || data.spoken_word}
                </h3>
                {data.english_transcript && (
                  <p className="text-[11px] font-medium text-gray-500 mt-1 whitespace-normal break-words italic">
                    {data.english_transcript}
                  </p>
                )}
                {data.prompt_used && (
                  <div className="mt-2 group/prompt relative max-w-[90%]">
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-1 opacity-80">
                      <Sparkles size={10} className="text-indigo-500" /> AI Prompt
                    </p>
                    <p className="text-[10px] text-slate-500 italic line-clamp-1 group-hover/prompt:line-clamp-none transition-all duration-300 cursor-help">
                      "{data.prompt_used}"
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", isFootage ? "bg-indigo-500" : "bg-gray-400")} />
                    {isFootage ? (
                      data.source_type === 'ai_generated' ? 'AI Image' :
                        data.source_type === 'stock_video' ? 'Stock Video' :
                          data.source_type === 'web_image' ? 'Web Search' :
                            (data.type || 'B-ROLL')
                    ) : 'TALKING HEAD'}
                  </p>
                  {isFootage && (data.animation || data.transition) && (
                    <div className="flex gap-1 ml-1">
                      {data.animation && (
                        <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
                          {data.animation.replace('_', ' ')}
                        </span>
                      )}
                      {data.transition && (
                        <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
                          {data.transition}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
                <span className="text-[9px] font-mono font-bold text-charcoal bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                  {data.duration}s
                </span>
                {/* More button — toggles Quick-Swap candidate strip */}
                <button
                  onClick={() => setShowCandidates(v => !v)}
                  className={cn(
                    "p-1.5 transition-colors rounded",
                    showCandidates ? "text-indigo-500 bg-indigo-50" : "text-gray-300 hover:text-charcoal"
                  )}
                  title="Quick-swap candidates"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* Sub Buttons */}
            <div className={cn(
              "flex items-center mt-3",
              isSidebarExpanded ? "flex-wrap gap-1" : "flex-nowrap gap-2"
            )}>
              {isFootage && (
                <>
                  <ActionButton label="Replace B-roll" onClick={onReplace} isSidebarExpanded={isSidebarExpanded} />
                  <ActionButton label="Advanced Generate" onClick={onAdvanced} isSidebarExpanded={isSidebarExpanded} />
                  <ActionButton
                    label="Regenerate"
                    onClick={() => onRegenerate && onRegenerate(data)}
                    disabled={isRegenerating}
                    isSidebarExpanded={isSidebarExpanded}
                  />
                </>
              )}
              {/* <ActionButton label="Resize" isSidebarExpanded={isSidebarExpanded} /> */}
              <ActionButton label="Effects" onClick={onEffects} isSidebarExpanded={isSidebarExpanded} />
            </div>
          </div>
        </div>

        {/* ─── Quick-Swap Candidate Strip ──────────────────────────────── */}
        {showCandidates && isFootage && candidates.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 w-full overflow-hidden">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              AI Candidates — Click to swap
            </p>
            <div className="w-full overflow-x-auto pb-1 custom-scrollbar">
              <div className="flex flex-nowrap gap-2 pb-1">
                {candidates.map((clip, i) => {
                  const thumb = clip.thumbnail || null;
                  const bestLink = clip.type === 'video' ? getBestLink(clip) : clip.url;

                  const isCurrent = (clip.source_type === data.source_type) && (
                    clip.source_type === 'stock_video'
                      ? (data.final_url === bestLink || (data.final_s3_key && data.final_s3_key === bestLink))
                      : true
                  );

                  return (
                    <div key={clip.id} className="relative shrink-0 group/clip">
                      {/* Thumbnail — click to PREVIEW */}
                      <button
                        onClick={() => setPreviewClip({ ...clip, bestLink })}
                        title={`Preview ${clip.label}`}
                        className={cn(
                          "relative w-20 h-[88px] rounded overflow-hidden border-2 transition-all block",
                          isCurrent
                            ? "border-indigo-500 ring-2 ring-indigo-300"
                            : "border-transparent hover:border-indigo-400"
                        )}
                      >
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Film size={16} className="text-gray-300" />
                          </div>
                        )}

                        {/* Preview icon overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/clip:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
                          <Maximize2 size={14} className="text-white" />
                          <span className="text-[7px] font-black text-white uppercase tracking-tight">Preview</span>
                        </div>

                        {/* Source/Type badge */}
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[7px] font-black bg-black/60 text-white py-0.5 uppercase tracking-widest">
                          {clip.label}
                        </span>

                        {/* Rank badge for stock */}
                        {clip.rank && (
                          <span className="absolute top-1 left-1 text-[7px] font-black bg-white/90 text-charcoal px-1 rounded leading-tight">
                            #{clip.rank}
                          </span>
                        )}

                        {isCurrent && (
                          <span className="absolute top-1 right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
                        )}
                      </button>
                      {/* Use button — click to SWAP */}
                      <button
                        onClick={() => onQuickSwap && onQuickSwap(clip)}
                        className="w-full mt-1 text-[7px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded py-0.5 transition-colors uppercase tracking-tight"
                      >
                        Use
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Candidate fullscreen preview */}
      {previewClip && (
        <CandidatePreviewModal
          clip={previewClip}
          onClose={() => setPreviewClip(null)}
          onUse={() => { onQuickSwap && onQuickSwap(previewClip); setPreviewClip(null); }}
        />
      )}
    </div>
  );
};

/**
 * CandidatePreviewModal
 * Fullscreen portal showing the selected candidate clip (image or playable video).
 * Separate from the swap action — user can watch first, then decide.
 */
const CandidatePreviewModal = ({ clip, onClose, onUse }) => {
  const isVideo = clip.type === 'video';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm max-h-[90vh] flex flex-col items-center gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Media */}
        <div className="w-full rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ maxHeight: '75vh' }}>
          {isVideo ? (
            <video
              src={clip.bestLink}
              className="w-full h-full object-contain"
              controls
              autoPlay
              style={{ maxHeight: '75vh' }}
            />
          ) : (
            <img
              src={clip.bestLink || clip.thumbnail}
              alt=""
              className="w-full object-contain"
              style={{ maxHeight: '75vh' }}
            />
          )}
        </div>

        {/* Meta + CTA */}
        <div className="flex items-center justify-between w-full px-1">
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">{clip.provider}</p>
            <p className="text-[9px] text-white/50 mt-0.5">{clip.duration}s · {clip.tags?.slice(0, 3).join(', ')}</p>
          </div>
          <button
            onClick={onUse}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Check size={14} /> Use This Clip
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ActionButton = ({ label, isSidebarExpanded, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "rounded border border-gray-100 font-black text-charcoal hover:bg-gray-50 ring ring-gray-400 transition-all active:scale-95 shadow-sm bg-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
      isSidebarExpanded ? "px-3 py-1 text-[9px]" : "px-4 py-1 text-[10px]"
    )}
  >
    {label}
  </button>
);

// --- MODAL COMPONENTS ---

const ReplaceBrollModal = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchOrientation,
  setSearchOrientation,
  searchResults,
  onSearch,
  isSearching,
  onSelectClip,
  onFileUpload,
  isUploading,
  uploadProgress
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Replace B-Roll</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Select a new visual source</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              "flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2",
              activeTab === 'upload' ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <UploadCloud size={14} /> Custom Upload
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              "flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2",
              activeTab === 'library' ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <Film size={14} /> Footage Library
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[calc(90vh-120px)] p-6 custom-scrollbar">
          {activeTab === 'upload' ? (
            <div className="h-full flex flex-col items-center justify-center">
              {!isUploading ? (
                <div
                  className="w-full border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                  onClick={() => document.getElementById('modalFileInput').click()}
                >
                  <UploadCloud size={48} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <div className="text-center">
                    <p className="text-base font-black text-slate-300">Drop file here or click to browse</p>
                    <p className="text-[11px] text-slate-600 mt-2 uppercase tracking-widest">MP4 · MOV · WEBM · JPG · PNG</p>
                  </div>
                  <input
                    id="modalFileInput"
                    type="file"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && onFileUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="w-full space-y-4 px-12">
                  <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>Uploading to S3...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center uppercase font-black tracking-widest animate-pulse">Please do not close this window</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSearch()}
                    placeholder="Search stock footage... (e.g. 'dubai skyline')"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <select
                  value={searchOrientation}
                  onChange={e => {
                    const val = e.target.value;
                    setSearchOrientation(val);
                    onSearch(val);
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="square">Square</option>
                </select>
                <button
                  onClick={onSearch}
                  disabled={isSearching}
                  className="btn-primary !py-2 !px-6 !text-[11px] uppercase font-black tracking-widest flex items-center gap-2"
                >
                  {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Search
                </button>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-3 gap-4">
                {searchResults.length > 0 ? (
                  searchResults.map(clip => (
                    <div key={clip.id} className="group relative aspect-video bg-black rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg">
                      <img src={clip.thumbnail} alt={clip.id} className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectClip(clip)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl"
                        >
                          Use Clip
                        </button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-black/60 text-slate-300 border border-white/10">{clip.provider}</span>
                      </div>
                    </div>
                  ))
                ) : !isSearching && (
                  <div className="col-span-3 py-20 flex flex-col items-center justify-center text-slate-600 gap-4">
                    <Search size={48} className="opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">Search to browse footage library</p>
                  </div>
                )}
                {isSearching && (
                  <div className="col-span-3 py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={48} className="text-indigo-500 animate-spin opacity-50" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Searching providers...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Confirmed changes are saved immediately</p>
          <button onClick={onClose} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AdvancedRegenModal = ({
  isOpen,
  onClose,
  currentPrompt,
  prompt,
  setPrompt,
  query,
  setQuery,
  type,
  setType,
  webSearchRequired,
  setWebSearchRequired,
  onExecute,
  isRegenerating,
  segmentIndex
}) => {
  if (!isOpen) return null;

  // Auto-enable web search if query is typed
  const handleQueryChange = (val) => {
    setQuery(val);
    if (val.trim()) setWebSearchRequired(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Regenerate</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Override AI Segment #{segmentIndex + 1}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {currentPrompt && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Current AI Prompt</label>
              <div className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-slate-300 italic leading-relaxed">
                "{currentPrompt}"
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Prompt Override</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="E.g. A futuristic city skyline with flying cars..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
            />
            <p className="text-[9px] text-slate-600 font-medium">Controls AI image generation and search context.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Search Query Override</label>
            <input
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Force specific search terms..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Force Source Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">No Override (AI Choice)</option>
              <option value="stock_video">Force Stock Video</option>
              <option value="ai_generated">Force AI Image</option>
              <option value="web_image">Force Web Image</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Web Search Required</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Allow searching Google/Bing for visuals</span>
            </div>
            <button
              onClick={() => setWebSearchRequired(!webSearchRequired)}
              className={cn(
                "w-10 h-5 rounded-full transition-all relative",
                webSearchRequired ? "bg-indigo-600" : "bg-slate-700"
              )}
            >
              <div className={cn(
                "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                webSearchRequired ? "right-1" : "left-1"
              )} />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-4">
          <button onClick={onClose} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Cancel</button>
          <button
            onClick={onExecute}
            disabled={isRegenerating}
            className="btn-primary !py-2.5 !px-8 !text-[11px] uppercase font-black tracking-widest flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
          >
            {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Execute Regeneration
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TransitionRow = ({ name, onClick }) => (
  <div className="flex flex-row items-center justify-center gap-4 my-0 py-0 w-full">
    <div
      onClick={onClick}
      className="size-8 rounded bg-brand-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20 transform rotate-[-5deg] hover:rotate-0 transition-all cursor-pointer group shrink-0"
    >
      <Infinity size={18} className="group-hover:scale-110 transition-transform" />
    </div>
    <span className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase">
      {name}
    </span>
  </div>
);

export default BrollPage;
