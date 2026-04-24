import React, { useState, useRef } from 'react';
import {
    Upload,
    Monitor,
    Smartphone,
    CloudIcon,
    X,
    ChevronRight
} from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createProjectAsync } from '../../redux/projects/projectSlice';
import { toast } from '../../utils/toastHandler';
import { getPresignedUploadUrl, uploadFileToS3, confirmFileUpload } from '../../services/storageServices';
import { FileVideo, CheckCircle2, AlertCircle, Loader2, PlayCircle } from 'lucide-react';

const VideoUploadPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // projectId might be in URL (if continuing) or we might have config in state (if new)
    const [projectId, setProjectId] = useState(searchParams.get('projectId'));
    const projectConfig = location.state?.projectConfig;

    /** @type {React.MutableRefObject<HTMLInputElement | null>} */
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [currentUploadingIndex, setCurrentUploadingIndex] = useState(-1);
    const [uploadProgress, setUploadProgress] = useState(0);

    /** @type {[File[], React.Dispatch<React.SetStateAction<File[]>>]} */
    const [selectedFiles, setSelectedFiles] = useState(/** @type {File[]} */([]));

    // Status tracking for each file: 'queued', 'uploading', 'completed', 'error'
    const [fileStatuses, setFileStatuses] = useState(/** @type {Record<string, string>} */({}));

    /** @type {[File | null, React.Dispatch<React.SetStateAction<File | null>>]} */
    const [previewFile, setPreviewFile] = useState(/** @type {File | null} */(null));

    /** @type {[Record<string, number>, React.Dispatch<React.SetStateAction<Record<string, number>>>]} */
    const [fileDurations, setFileDurations] = useState({});

    // Track persistent local URLs for previews to prevent memory leaks
    const [previewUrls, setPreviewUrls] = useState(/** @type {Map<string, string>} */(new Map()));

    // Cleanup ALL object URLs when the page is closed
    React.useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    // Safety check: ensure we have context to work with
    React.useEffect(() => {
        if (!projectId && !projectConfig) {
            toast.error("Missing Project Context", "Redirecting back to project creation.");
            navigate('/video-editor/create');
        }
    }, [projectId, projectConfig, navigate]);

    const handleDragOver = (/** @type {React.DragEvent} */ e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (/** @type {React.DragEvent} */ e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        validateAndAddFiles(files);
    };

    const handleFileSelect = (/** @type {React.ChangeEvent<HTMLInputElement>} */ e) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        validateAndAddFiles(files);
    };

    const validateAndAddFiles = async (/** @type {File[]} */ files) => {
        if (!files.length) return;

        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
        const maxSize = 4 * 1024 * 1024 * 1024; // 4GB
        const maxDuration = 15 * 60; // 15 minutes in seconds

        setIsValidating(true);
        /** @type {File[]} */
        const newFiles = [];
        const existingKeys = new Set(selectedFiles.map(f => f.name + f.size));

        for (const file of files) {
            // 1. Basic Type Check
            const isValidType = validTypes.includes(file.type) || file.name.endsWith('.mov') || file.name.endsWith('.mkv');
            if (!isValidType) {
                toast.error("Invalid Type", `${file.name} is not supported.`);
                continue;
            }

            // 2. Duplicate Check
            if (existingKeys.has(file.name + file.size)) {
                toast.info("Duplicate File", `${file.name} is already in queue.`);
                continue;
            }

            // 3. Size Check
            if (file.size > maxSize) {
                toast.error("Too Large", `${file.name} exceeds 4GB.`);
                continue;
            }

            // 4. Duration Check (The "Professional" Validation)
            try {
                const duration = await getVideoDuration(file);
                if (duration > maxDuration) {
                    toast.error("Too Long", `${file.name} is over 15 minutes.`);
                    continue;
                }
                setFileDurations(prev => ({ ...prev, [file.name + file.size]: duration }));
                newFiles.push(file);
            } catch (err) {
                toast.error("Validation Failed", `Could not read ${file.name}.`);
            }
        }

        if (newFiles.length) {
            const newPreviewUrls = new Map(previewUrls);
            const newDurations = { ...fileDurations };

            newFiles.forEach(file => {
                const url = URL.createObjectURL(file);
                newPreviewUrls.set(file.name + file.size, url);
                // Duration is already calculated and verified at this point
            });

            setPreviewUrls(newPreviewUrls);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            toast.success("Ready", `Added ${newFiles.length} valid file(s).`);
        }
        setIsValidating(false);
    };

    /** 
     * Helper to get video duration without fully loading the file
     * @param {File} file 
     * @returns {Promise<number>}
     */
    const getVideoDuration = (file) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = () => reject("Invalid video file");
            video.src = URL.createObjectURL(file);
        });
    };

    /** @param {number} index */
    const removeFile = (index) => {
        if (isUploading) return;
        const file = selectedFiles[index];
        const key = file.name + file.size;

        // Revoke the specific URL to free memory immediately
        if (previewUrls.has(key)) {
            URL.revokeObjectURL(previewUrls.get(key) || '');
            const newUrls = new Map(previewUrls);
            newUrls.delete(key);
            setPreviewUrls(newUrls);
        }

        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    /** @param {File} file */
    const openPreview = (file) => {
        setPreviewFile(file);
    };

    const handleProcessVideo = async () => {
        if (!selectedFiles.length || (!projectId && !projectConfig)) return;

        setIsUploading(true);
        const newStatuses = { ...fileStatuses };

        try {
            let activeProjectId = projectId;

            // Step 0: Create Project if it doesn't exist yet
            if (!activeProjectId && projectConfig) {
                toast.info("Initializing...", "Setting up your project workspace.");
                /** @type {any} */
                const createResult = await dispatch(createProjectAsync(projectConfig));

                if (createProjectAsync.fulfilled.match(createResult)) {
                    activeProjectId = createResult.payload.id;
                    setProjectId(activeProjectId);
                } else {
                    throw new Error("Project creation failed. Please try again.");
                }
            }

            if (!activeProjectId) throw new Error("No active project ID found.");

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                setCurrentUploadingIndex(i);
                setUploadProgress(10);

                newStatuses[file.name] = 'uploading';
                setFileStatuses({ ...newStatuses });

                // Step 1: Get Presigned URL
                const presignResult = await getPresignedUploadUrl({
                    projectId: activeProjectId,
                    contentType: file.type || 'video/mp4',
                    filename: file.name
                });

                if (presignResult.status !== "success") throw new Error(presignResult.message);
                const { uploadUrl, s3Key } = presignResult.data;
                setUploadProgress(30);

                // Step 2: S3 Upload
                await uploadFileToS3(
                    uploadUrl,
                    file,
                    file.type || 'video/mp4',
                    /** @param {number} percent */
                    (percent) => setUploadProgress(percent)
                );

                // Step 3: Confirmation
                const confirmResult = await confirmFileUpload({
                    projectId: activeProjectId,
                    s3Key: s3Key,
                    fileSize: file.size,
                    duration: fileDurations[file.name + file.size] || 0,
                    filename: file.name
                });

                if (confirmResult.status !== 'success') throw new Error(confirmResult.message);

                newStatuses[file.name] = 'completed';
                setFileStatuses({ ...newStatuses });
                setUploadProgress(100);
            }

            toast.success("Finished!", "All files uploaded successfully.");
            setTimeout(() => navigate(`/video-editor/vad-triming/${activeProjectId}`), 1000);

        } catch (error) {
            const failedFile = selectedFiles[currentUploadingIndex]?.name;
            if (failedFile) {
                newStatuses[failedFile] = 'error';
                setFileStatuses({ ...newStatuses });
            }
            toast.error("Process Failed", (/** @type {any} */(error)).message || "Network error occurred.");
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center max-w-5xl mx-auto pt-4 animate-in fade-in duration-700">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-video md:aspect-21/9 rounded-[40px] border-[3px] border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-8 relative group ${isDragging
                    ? 'border-primary bg-primary/5 scale-[0.99]'
                    : 'border-purple-300 dark:border-purple-900/30 hover:border-primary/50'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="video/*"
                    multiple
                />

                {selectedFiles.length > 0 ? (
                    <div className="w-full flex flex-col h-full p-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-4 px-4 pt-2">
                            <h3 className="text-xl font-black text-charcoal dark:text-white uppercase tracking-tight">
                                Upload Queue <span className="text-primary ml-2">{selectedFiles.length}</span>
                            </h3>
                            {!isUploading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedFiles([]); }}
                                    className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scroll space-y-3 px-2">
                            {selectedFiles.map((file, idx) => (
                                <div
                                    key={`${file.name}-${idx}`}
                                    className={`group/item flex items-center gap-4 bg-white dark:bg-gray-800/50 p-4 rounded-2xl border transition-all hover:border-primary/30 ${currentUploadingIndex === idx ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100 dark:border-gray-800'
                                        }`}
                                >
                                    <div
                                        onClick={(e) => { e.stopPropagation(); openPreview(file); }}
                                        className="relative w-16 h-10 bg-black rounded-lg overflow-hidden cursor-zoom-in group/thumb shrink-0 border border-white/10"
                                    >
                                        <video
                                            src={previewUrls.get(file.name + file.size)}
                                            className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                                            muted
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                            <PlayCircle size={16} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-charcoal dark:text-white truncate pr-4">
                                                {file.name}
                                            </p>
                                            <span className="text-[10px] font-black text-gray-400">
                                                {(file.size / (1024 * 1024)).toFixed(1)}MB
                                            </span>
                                        </div>
                                        {currentUploadingIndex === idx && (
                                            <div className="w-full h-1 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {fileStatuses[file.name] === 'completed' ? (
                                            <CheckCircle2 size={18} className="text-green-500" />
                                        ) : fileStatuses[file.name] === 'error' ? (
                                            <AlertCircle size={18} className="text-red-500" />
                                        ) : currentUploadingIndex === idx ? (
                                            <Loader2 size={18} className="text-primary animate-spin" />
                                        ) : !isUploading ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-6 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                        </div>

                        <h2 className="text-3xl font-black text-charcoal dark:text-white text-center mb-1">
                            Upload <span className="text-primary italic">videos</span>
                        </h2>
                        <p className="text-charcoal dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">
                            for AI auto editing
                        </p>

                        <div className="px-6 py-2.5 bg-white dark:bg-gray-900 border-2 border-purple-100 dark:border-purple-900/30 rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                            <span className="text-lg font-bold text-charcoal">Drag & Drop videos here</span>
                        </div>

                        <div className="absolute bottom-8 left-0 w-full text-center">
                            <p className="text-[11px] font-black text-charcoal uppercase tracking-widest opacity-60">
                                supported file: mp4, mov | max 4GB file | max 15 mins
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Source Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8 mb-8">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-3 bg-brand-gradient text-white py-4 px-6 rounded-[20px] font-black text-sm uppercase tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Monitor size={28} />
                    From my computer
                </button>

                <button
                    onClick={() => toast.info("Coming Soon", "Direct phone upload via QR code will be available soon.")}
                    className="flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-charcoal dark:text-white py-4 px-6 rounded-[20px] font-black text-sm uppercase tracking-tight hover:border-primary/30 transition-all group"
                >
                    <Smartphone size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                    From my phone
                </button>

                <button
                    onClick={() => toast.info("Coming Soon", "Google Drive integration is being implemented.")}
                    className="flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-charcoal dark:text-white py-4 px-6 rounded-[20px] font-black text-sm uppercase tracking-tight hover:border-primary/30 transition-all group"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" className="fill-gray-400 group-hover:fill-primary transition-colors">
                        <path d="M7.714 6.429l3.429 6h-6.857l3.428-6zm6.857 0l2.571 4.543-3.428 6L11.143 12.429l3.428-6zM3.429 13.714h17.142L17.143 20H6.857l-3.428-6.286z" />
                    </svg>
                    From Google Drive
                </button>
            </div>

            {/* Continue Button (Conditional) */}
            {selectedFiles.length > 0 && (
                <button
                    onClick={handleProcessVideo}
                    disabled={isUploading || isValidating}
                    className={`group flex items-center gap-4 bg-brand-gradient text-white px-12 py-5 rounded-[24px] font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all fixed bottom-12 right-12 animate-in slide-in-from-right-12 ${isUploading || isValidating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isUploading ? (
                        <span className="flex items-center gap-3">
                            <Loader2 size={24} className="animate-spin" />
                            Uploading {currentUploadingIndex + 1}/{selectedFiles.length}
                        </span>
                    ) : isValidating ? (
                        <span className="flex items-center gap-3">
                            <Loader2 size={24} className="animate-spin" />
                            Validating Files...
                        </span>
                    ) : (
                        <>
                            Upload & Process
                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            )}

            {/* Video Preview Modal */}
            {previewFile && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-8 animate-in fade-in duration-300"
                    onClick={() => setPreviewFile(null)}
                >
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                    <div
                        className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300 ring-1 ring-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-linear-to-b from-black/80 to-transparent">
                            <div>
                                <h4 className="text-white font-black text-lg uppercase tracking-tight truncate max-w-md">
                                    {previewFile.name}
                                </h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    {(previewFile.size / (1024 * 1024)).toFixed(2)} MB • Previewing Local Media
                                </p>
                            </div>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all backdrop-blur-md"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Video Player */}
                        <video
                            src={previewUrls.get(previewFile.name + previewFile.size)}
                            controls
                            autoPlay
                            className="w-full h-full object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoUploadPage;
