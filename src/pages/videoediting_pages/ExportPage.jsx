import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Download, Share2, Play, Camera, MessageCircle, CheckCircle2, Loader2, Sparkles, Sliders, Monitor, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';
import { getProject } from '../../services/projectServices';
import VideoPreview from '../../components/shared/VideoPreview';
import api from '../../services/api';
import { API_URL } from '../../config/envConfig';
import { loadProject } from '../../redux/editor/editorSlice';
import { initNotificationStream } from '../../services/notificationServices';
import {
  updateExportProgress,
  resetExportState,
  startExportAsync,
  selectExportState
} from '../../redux/export/exportSlice';
import { toast } from '../../utils/toastHandler';

const ExportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  /** @type {any} */
  const dispatch = useDispatch();

  // Redux State
  const {
    status: renderingStatus,
    progress,
    statusMessage
  } = useSelector(selectExportState);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [exportSettings, setExportSettings] = useState({
    fileName: "Untitled-1",
    format: "mp4",
    resolution: "1080p",
    audioQuality: 80,
    videoQuality: 80,
  });

  const accessToken = useSelector((/** @type {any} */ state) => state.auth?.accessToken);
  /** @type {any} */
  const editorState = useSelector((/** @type {any} */ state) => state.editor.editor);

  const [isTriggering, setIsTriggering] = useState(false);

  const performRender = async () => {
    if (isTriggering) return;
    setIsTriggering(true);

    // Instant UI feedback: Move to rendering state immediately
    dispatch(updateExportProgress({
      progress: 10,
      message: "Initializing render...",
      status: "rendering"
    }));

    try {
      console.log("[ExportPage] Requesting Export Start...");
      await (/** @type {any} */ (dispatch(startExportAsync({
        projectId: id,
        options: {
          editor: editorState,
          resolution: exportSettings.resolution,
          videoQuality: exportSettings.videoQuality,
          audioQuality: exportSettings.audioQuality
        }
      })))).unwrap();

      toast.success("Export started successfully!");
    } catch (err) {
      console.error("[ExportPage] Export Trigger Failed:", err);
      toast.error(typeof err === 'string' ? err : "Failed to start export");
      // Reset if it fails early
      dispatch(resetExportState());
    } finally {
      setIsTriggering(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;

    // IF COMPLETED: Download the latest export
    if (renderingStatus === 'completed' && project?.recent_exports?.length > 0) {
      const latestExport = project.recent_exports[0];
      try {
        console.log("[ExportPage] Requesting signed download URL for export:", latestExport.id);
        const { data } = await api.get(`/api/export/${id}/exports/${latestExport.id}/download`);
        const downloadUrl = data.data.downloadUrl;

        console.log("[ExportPage] Triggering download from:", downloadUrl);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('target', '_blank');
        link.setAttribute('download', `${exportSettings.fileName || 'video'}.mp4`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      } catch (err) {
        console.error("[ExportPage] Download Failed:", err);
        toast.error("Failed to generate download link.");
      }
      return;
    }

    await performRender();
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      try {
        const res = await getProject(id);
        if (res?.data) {
          console.group("[ExportPage] Syncing Project Data");
          const projectData = res.data;
          console.log("DB Status:", projectData.status);
          console.log("Current Redux Status:", renderingStatus);
          
          let finalSourceUrl = projectData.video_url?.startsWith('http') 
            ? projectData.video_url 
            : `${API_URL}${projectData.video_url}`;

          // If a merged cut exists, we MUST use it for the final export preview
          if (projectData.merged_s3_key) {
            try {
              const presignRes = await api.get('/api/storage/presign/download', { 
                params: { s3Key: projectData.merged_s3_key } 
              });
              if (presignRes.data?.data?.downloadUrl) {
                finalSourceUrl = presignRes.data.data.downloadUrl;
              }
            } catch (e) {
              console.error("Failed to presign merged video for export:", e);
            }
          }

          setProject(projectData);

          dispatch(loadProject({
            projectId: id,
            editor: projectData.editor_json || {},
            sourceUrl: finalSourceUrl
          }));

          setExportSettings(prev => ({
            ...prev,
            fileName: projectData.title || "Untitled-1"
          }));

          // Handle local state sync
          if (res.data.status === 'exporting') {
            // Only set to 10% if we aren't already tracking an active render
            if (renderingStatus !== 'rendering' && renderingStatus !== 'completed') {
              console.log("Export in progress (DB). Transitioning UI to rendering.");
              dispatch(updateExportProgress({
                progress: 10,
                message: "Resuming export...",
                status: "rendering"
              }));
            }
          } else if (res.data.status === 'completed') {
            if (renderingStatus !== 'completed') {
              console.log("Export finished (DB). Transitioning UI to completed.");
              dispatch(updateExportProgress({
                progress: 100,
                message: "Export completed!",
                status: "completed"
              }));
            }
          } else if (renderingStatus === 'rendering') {
            // If DB says idle but UI says rendering, and it wasn't a fresh start, reset
            console.warn("Status mismatch: DB is idle but UI is rendering. Resetting UI state.");
            dispatch(resetExportState());
          }
          console.groupEnd();
        }
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id, dispatch]); // Removed renderingStatus dependency to break the update loop

  // LISTEN FOR PROGRESS
  useEffect(() => {
    // Note: We remove !accessToken check here because the backend 
    // can authenticate via cookies if the token is missing from Redux state.
    if (!id) return;

    console.log("[SSE] Opening stream for project:", id);
    const closeStream = initNotificationStream({
      token: accessToken, // Still pass it if available, backend handles fallback
      onNotification: (data) => console.log("[SSE] Global Notification:", data),
      onProgress: (/** @type {any} */ payload) => {
        console.group("[SSE] Update Received");
        console.log("Payload:", payload);
        console.log("Current Page ID:", id);
        
        // Ensure ID match (case-insensitive for safety)
        const isMatch = String(payload.projectId).toLowerCase() === String(id).toLowerCase();
        console.log("ID Match:", isMatch);

        if (isMatch) {
          console.log("Executing State Update...");
          dispatch(updateExportProgress({
            progress: payload.progress || 0,
            message: payload.message || (payload.eventType === 'done' ? "Export finished!" : "Rendering..."),
            status: (payload.status === 'completed' || payload.eventType === 'done') ? 'completed' : 'rendering'
          }));

          if (payload.status === 'completed' || payload.progress >= 100 || payload.eventType === 'done') {
            console.log("SUCCESS DETECTED. Fetching final project data...");
            getProject(id).then(res => {
              if (res?.data) {
                console.log("Project data refreshed successfully.");
                setProject(res.data);
              }
            });
          }
        }
        console.groupEnd();
      }
    });

    return () => closeStream();
  }, [accessToken, id, dispatch]);

  /**
   * @param {string} key
   * @param {any} val
   */
  const handleSettingChange = (key, val) => {
    setExportSettings(prev => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading Export Settings...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Left: Configuration */}
        <div className="flex-1 w-full space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-charcoal tracking-tight">Final Video Export</h1>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} />
              AI Optimized
            </div>
          </div>

          {/* Export Settings Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />

            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-2xl bg-brand-gradient text-white shadow-lg">
                <Sliders size={20} />
              </div>
              <h2 className="text-xl font-bold text-charcoal">Export Settings</h2>
            </div>

            <div className="space-y-8">
              {/* File Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">File Name</label>
                <input
                  type="text"
                  value={exportSettings.fileName}
                  onChange={(e) => handleSettingChange('fileName', e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-6 py-4 text-lg font-medium text-charcoal outline-none transition-all placeholder:text-gray-300"
                  placeholder="Enter video name..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Format */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">File Format</label>
                  <div className="relative">
                    <select
                      value={exportSettings.format}
                      onChange={(e) => handleSettingChange('format', e.target.value)}
                      className="w-full appearance-none bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-charcoal outline-none transition-all"
                    >
                      <option value="mp4">MP4 (H.264)</option>
                      <option value="mov">QuickTime (MOV)</option>
                      <option value="webm">WebM</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <CheckCircle2 size={16} className="text-primary" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium px-1 italic">Most compatible for social media</p>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolution</label>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">(1080x1920)</span>
                  </div>
                  <div className="relative">
                    <select
                      value={exportSettings.resolution}
                      onChange={(e) => handleSettingChange('resolution', e.target.value)}
                      className="w-full appearance-none bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-charcoal outline-none transition-all"
                    >
                      <option value="720p">720p HD</option>
                      <option value="1080p">1080p Full HD (9:16)</option>
                      <option value="4k">4K Ultra HD</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Monitor size={16} className="text-primary" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium px-1 italic">Social media optimized profile</p>
                </div>
              </div>

              {/* Quality Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <QualitySlider
                  label="Audio Quality"
                  value={exportSettings.audioQuality}
                  onChange={(val) => handleSettingChange('audioQuality', val)}
                />
                <QualitySlider
                  label="Video Quality"
                  value={exportSettings.videoQuality}
                  onChange={(val) => handleSettingChange('videoQuality', val)}
                />
              </div>

              {/* Action Button & Progress */}
              <div className="pt-6 space-y-4">
                {renderingStatus === "rendering" ? (
                  <div className="space-y-3 animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-between items-end px-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{statusMessage}</span>
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Antigravity Patch: Active</span>
                      </div>
                      <span className="text-sm font-black text-charcoal">{progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50">
                      <div
                        className="h-full bg-brand-gradient rounded-full shadow-[0_0_15px_rgba(206,0,255,0.4)] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleExport}
                      disabled={renderingStatus === "loading" || isTriggering}
                      className={cn(
                        "w-full bg-brand-gradient py-5 rounded-[20px] text-white font-black text-lg shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 group",
                        (renderingStatus === "loading" || isTriggering) ? "opacity-70 cursor-not-allowed translate-y-0" : "hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                      )}
                    >
                      {renderingStatus === "loading" || isTriggering ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Download className="group-hover:animate-bounce" />
                      )}
                      {renderingStatus === "loading" || isTriggering
                        ? "Initializing..."
                        : renderingStatus === "completed"
                          ? "Download Exported Video"
                          : "Start Export Render"}
                    </button>

                    {renderingStatus === "completed" && (
                      <button
                        onClick={performRender}
                        className="w-full bg-gray-50 border-2 border-gray-100 py-4 rounded-[20px] text-gray-500 font-bold text-sm hover:bg-white hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-[0.98]"
                      >
                        <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        Render Again (Update Version)
                      </button>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-center text-gray-400 font-medium">
                  {renderingStatus === "rendering"
                    ? "Please keep this tab open for the fastest processing."
                    : "Rendering usually takes 1-3 minutes depending on length."}
                </p>
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 group opacity-50 contrast-75">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Share2 size={20} />
                </div>
                <h2 className="text-xl font-bold text-charcoal">Direct Social Media Posting</h2>
              </div>
              <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Coming Soon</span>
            </div>

            <div className="flex gap-4">
              {[Play, Camera, MessageCircle].map((Icon, i) => (
                <div key={i} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                  <Icon size={24} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview Column */}
        <div className="w-full lg:w-[380px] shrink-0">
          <VideoPreview
            project={project}
            title="Export Preview"
            className="sticky top-8"
            actionButton={
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal">Optimized for Export</h4>
                    <p className="text-[10px] text-gray-400">All filters and grades applied.</p>
                  </div>
                </div>
              </div>
            }
          />
        </div>

      </div>
    </div>
  );
};

/**
 * @param {{label: string, value: number, onChange: (val: number) => void}} props
 */
const QualitySlider = ({ label, value, onChange }) => {
  const percentage = value;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs font-black text-charcoal uppercase tracking-widest px-1">
        <span>{label}</span>
        <span className={cn(
          "font-mono px-2 py-0.5 rounded text-[10px]",
          value > 80 ? "bg-green-100 text-green-600" : value > 50 ? "bg-primary/10 text-primary" : "bg-red-100 text-red-600"
        )}>
          {value > 80 ? 'High' : value > 50 ? 'Good' : 'Medium'}
        </span>
      </div>
      <div className="relative h-1.5 w-full flex items-center group/slide">
        <div className="absolute inset-0 rounded-full bg-gray-100" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient shadow-[0_0_10px_rgba(206,0,255,0.3)]"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min="1"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-6 h-6 bg-white rounded-full shadow-2xl border-4 border-primary/20 pointer-events-none transition-all group-hover/slide:scale-110"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>
      <div className="flex justify-between px-1">
        <span className="text-[9px] font-bold text-gray-300">LOW</span>
        <span className="text-[9px] font-bold text-gray-300">HIGH</span>
      </div>
    </div>
  );
};

export default ExportPage;
