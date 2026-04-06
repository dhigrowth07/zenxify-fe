import React, { useState } from 'react';
import {
    Upload,
    ArrowRight,
    Check,
    ChevronRight,
    Globe,
    Sparkles,
    Scissors,
    Video,
    Layout,
    ArrowLeft,
    Info,
    CheckCircle2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from '../../utils/toastHandler';
import { 
    createProjectAsync, 
    selectProjectLoading, 
    resetProjectState,
    selectAllProjects,
    fetchProjectsAsync
} from '../../redux/projects/projectSlice';
import { useEffect } from 'react';

/**
 * Generates next available untitled name
 * @param {any[]} projects 
 * @returns {string}
 */
const getNextUntitledName = (projects) => {
    const untitledBase = "Untitled Project";
    const existingNames = projects.map(p => p.title?.toLowerCase() || "");
    
    if (!existingNames.includes(untitledBase.toLowerCase())) {
        return untitledBase;
    }

    let counter = 1;
    while (existingNames.includes(`${untitledBase.toLowerCase()} ${counter}`)) {
        counter++;
    }
    return `${untitledBase} ${counter}`;
};

const STEPS = [
    { id: 1, name: 'Languages', icon: Globe, description: 'Config & Voice' },
    { id: 2, name: 'AI Features', icon: Sparkles, description: 'B-Roll & Style' },
    { id: 3, name: 'Auto-Cut', icon: Scissors, description: 'AI Sensitivity' }
];

const SPOKEN_LANGUAGES = [
    { code: "english", display: "English" },
    { code: "hindi", display: "Hindi" },
    { code: "tamil", display: "Tamil" },
    { code: "telugu", display: "Telugu" },
    { code: "kannada", display: "Kannada" },
    { code: "malayalam", display: "Malayalam" }
];

const CAPTION_LANGUAGES = [
    { code: "english", display: "English" },
    { code: "hindi", display: "Hindi" },
    { code: "tamil", display: "Tamil" },
    { code: "telugu", display: "Telugu" },
    { code: "kannada", display: "Kannada" },
    { code: "malayalam", display: "Malayalam" },
    { code: "tanglish", display: "Tanglish (Tamil + English)" },
    { code: "hinglish", display: "Hinglish (Hindi + English)" },
    { code: "tenglish", display: "Tenglish (Telugu + English)" },
    { code: "kanglish", display: "Kanglish (Kannada + English)" },
    { code: "manglish", display: "Manglish (Malayalam + English)" }
];

const LAYOUT_TEMPLATES = [
    { id: 'overlay', name: 'Overlay Style', desc: 'Face video with dynamic stock overlays', icon: Video },
    { id: '2_column', name: '2 Column Style', desc: 'Split screen: Stock (top) + Face (bottom)', icon: Layout },
    { id: 'center', name: 'Center Style', desc: '1:1 square face video with blurred background', icon: CheckCircle2 }
];

const CAPTION_STYLES = [
    { id: 'hormozi', name: 'Hormozi Style', color: '#FFD700' },
    { id: 'mrbeast', name: 'MrBeast Style', color: '#00BFFF' },
    { id: 'tiktok', name: 'TikTok Style', color: '#FFFFFF' },
    { id: 'leon', name: 'Leon Style', color: '#ADFF2F' },
    { id: 'noah', name: 'Noah Style', color: '#FFFFFF' },
    { id: 'custom', name: 'Custom Style', color: '#888888' }
];

const SENSITIVITY_PRESETS = [
    { id: 'natural', name: 'Natural', desc: 'Preserves natural pauses and breathing room.', details: 'Minimal cutting, high retention.' },
    { id: 'default', name: 'Default', desc: 'Balanced cutting for most content.', details: 'The recommended setting for clarity.' },
    { id: 'aggressive', name: 'Aggressive', desc: 'Removes all silence and filler breaths.', details: 'Tight, high-energy cuts for TikTok/Reels.' }
];

const ProjectCreationPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isLoading = useSelector(selectProjectLoading);
    const projects = useSelector(selectAllProjects);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        file: null,
        spoken_language: 'english',
        caption_language: 'english',
        broll_opted_in: true,
        layout_template: 'overlay',
        caption_style: 'hormozi',
        sensitivity: 'default'
    });

    useEffect(() => {
        dispatch(resetProjectState());
        // Fetch projects if not already available to check for untitled names
        if (!projects || projects.length === 0) {
            /** @type {any} */ (dispatch)(fetchProjectsAsync({ page: 1, limit: 100 }));
        }
    }, [dispatch]);

    // Auto-set title if it's empty
    useEffect(() => {
        if (!formData.title && projects?.length >= 0) {
            const nextName = getNextUntitledName(projects);
            setFormData(prev => ({ ...prev, title: nextName }));
        }
    }, [projects]);

    const handleNext = async () => {
        if (currentStep === 1 && !formData.title.trim()) {
            toast.error("Title Required", "Please enter a project title to continue.");
            return;
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            // Deferred Project Creation: Pass config to upload page
            const { file, ...projectData } = formData;
            navigate(`/video-editor/upload`, { state: { projectConfig: projectData } });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFileChange = (/** @type {any} */ event) => {
        const file = event.target.files?.[0];
        if (file) {
            setFormData({ ...formData, file, title: formData.title || file.name.split('.')[0] });
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen pb-32">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-black text-charcoal dark:text-white font-display tracking-tight uppercase leading-none mb-2">
                        Create New Project
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                        Project Wizard • AI Powered Workflow
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                >
                    <span className="font-black text-xs uppercase tracking-widest px-2">Cancel</span>
                </button>
            </div>

            {/* Stepper Component */}
            <div className="relative mb-16 flex justify-between px-4">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 dark:bg-gray-800 -translate-y-1/2" />
                <div
                    className="absolute top-1/2 left-0 h-[2.5px] bg-primary -translate-y-1/2 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 outline outline-offset-4 ${isActive
                                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30 outline-primary/20'
                                    : isCompleted
                                        ? 'bg-green-500 text-white outline-transparent'
                                        : 'bg-white dark:bg-gray-900 text-gray-400 outline-transparent'
                                    }`}
                            >
                                {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} strokeWidth={2.5} />}
                            </div>
                            <div className="absolute top-16 text-center whitespace-nowrap">
                                <span className={`block text-[11px] font-black uppercase tracking-widest mb-0.5 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                    {step.name}
                                </span>
                                <span className="text-[9px] text-gray-500 opacity-60 font-bold uppercase tracking-tight">
                                    {step.description}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Content Area with Glassmorphism Effect */}
            <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-charcoal/5 dark:shadow-none min-h-[500px] flex flex-col">

                {/* Step 1: Languages & Title */}
                {currentStep === 1 && (
                    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Project Name</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter a catchy title for your video..."
                                className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-charcoal dark:text-white font-bold tracking-tight focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:opacity-30"
                            />
                        </div>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Spoken Language</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SPOKEN_LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setFormData({ ...formData, spoken_language: lang.code })}
                                            className={`p-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${formData.spoken_language === lang.code
                                                ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                                                : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {lang.display}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Caption Language</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {CAPTION_LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setFormData({ ...formData, caption_language: lang.code })}
                                            className={`flex justify-between items-center px-6 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${formData.caption_language === lang.code
                                                ? 'border-primary bg-primary/5 text-primary shadow-inner'
                                                : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {lang.display}
                                            {formData.caption_language === lang.code && <Check size={16} strokeWidth={4} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Step 2: AI Selection */}
                {currentStep === 2 && (
                    <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between p-6 bg-primary/5 border-2 border-primary/20 rounded-3xl mb-12">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-charcoal dark:text-white uppercase tracking-tight">AI B-Roll Integration</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase opacity-60">Automatically overlay visual stock footage based on transcript.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, broll_opted_in: !formData.broll_opted_in })}
                                className={`w-14 h-8 rounded-full transition-all relative ${formData.broll_opted_in ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.broll_opted_in ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>

                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Visual Layout Template</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {LAYOUT_TEMPLATES.map(temp => (
                                <button
                                    key={temp.id}
                                    onClick={() => setFormData({ ...formData, layout_template: temp.id })}
                                    className={`relative flex flex-col p-6 rounded-[32px] border-2 transition-all group overflow-hidden ${formData.layout_template === temp.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 dark:border-gray-800 hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/5'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${formData.layout_template === temp.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        }`}>
                                        <temp.icon size={24} />
                                    </div>
                                    <h5 className={`text-xs font-black uppercase tracking-wider mb-2 ${formData.layout_template === temp.id ? 'text-primary' : 'text-charcoal dark:text-white'}`}>
                                        {temp.name}
                                    </h5>
                                    <p className="text-[10px] font-bold text-gray-400 leading-tight">
                                        {temp.desc}
                                    </p>
                                    {formData.layout_template === temp.id && (
                                        <div className="absolute top-4 right-4 text-primary">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Initial Caption Font Style</label>
                        <div className="flex flex-wrap gap-4">
                            {CAPTION_STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setFormData({ ...formData, caption_style: style.id })}
                                    className={`px-8 py-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest ${formData.caption_style === style.id
                                        ? 'border-primary bg-primary/5 text-primary scale-105 shadow-lg'
                                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    style={{ textShadow: formData.caption_style === style.id ? `0 0 10px ${style.color}40` : 'none' }}
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Auto-Cut */}
                {currentStep === 3 && (
                    <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                        <div className="max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-brand-gradient rounded-full mx-auto mb-8 flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                                <Scissors size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-charcoal dark:text-white uppercase tracking-tight mb-4">AI Silence Removal</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] mb-12 opacity-60">Choose your precision level for the multi-cut VAD process.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {SENSITIVITY_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setFormData({ ...formData, sensitivity: preset.id })}
                                        className={`group relative flex flex-col p-8 rounded-[40px] border-2 transition-all ${formData.sensitivity === preset.id
                                            ? 'border-primary bg-primary/5 scale-105 shadow-xl ring-2 ring-primary/5'
                                            : 'border-gray-200 dark:border-gray-800 hover:border-primary/20 hover:bg-gray-50'
                                            }`}
                                    >
                                        <h5 className={`text-sm font-black uppercase tracking-widest mb-3 ${formData.sensitivity === preset.id ? 'text-primary' : 'text-charcoal dark:text-white'}`}>
                                            {preset.name}
                                        </h5>
                                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed mb-4">
                                            {preset.desc}
                                        </p>
                                        <div className={`mt-auto text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl ${formData.sensitivity === preset.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                            }`}>
                                            {preset.details}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-between items-center mt-auto pt-16">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={isLoading}
                        className={`group flex items-center gap-4 bg-brand-gradient text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="animate-pulse">Seeding...</span>
                            </span>
                        ) : (
                            <>
                                {currentStep === STEPS.length ? 'Start Processing' : 'Next Step'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Hint / Disclaimer */}
            <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-40">
                Zenxify uses industrial-grade AI models for transcription & rendering. Large files may take more time to process.
            </p>
        </div>
    );
};

export default ProjectCreationPage;
