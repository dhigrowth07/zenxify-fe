import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Monitor,
  SkipBack,
  Play,
  SkipForward,
  Maximize2
} from 'lucide-react';
import {
  ColorWheel,
  ColorWheelTrack,
  ColorThumb,
  parseColor
} from 'react-aria-components';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';
import { getProject } from '../../services/projectServices';
import VideoPreview from '../../components/shared/VideoPreview';
import {
  loadProject,
  setColor,
  setHsl
} from '../../redux/editor/editorSlice';
import { API_URL } from '../../config/envConfig';
import { useAutoSave } from '../../hooks/useAutoSave';

const COLOR_PRESETS = [
  {
    id: "none",
    name: "None",
    color: {
      exposure: 0, contrast: 1, saturation: 1, vibrance: 0,
      highlights: 0, shadows: 0, whites: 0, blacks: 0,
      clarity: 0, hue: 0, temperature: 0, tint: 0
    }
  },
  {
    id: "cinematic",
    name: "Cinematic",
    color: {
      exposure: 0.05, contrast: 1.2, saturation: 0.95, vibrance: 0.2,
      highlights: -20, shadows: 15, whites: -5, blacks: 8,
      clarity: 18, hue: 0, temperature: 10, tint: 3
    }
  },
  {
    id: "warm",
    name: "Warm",
    color: {
      exposure: 0.03, contrast: 1.05, saturation: 1.1, vibrance: 0.25,
      highlights: -5, shadows: 5, whites: 0, blacks: 3,
      clarity: 5, hue: 0, temperature: 25, tint: 5
    }
  },
  {
    id: "cool",
    name: "Cool",
    color: {
      exposure: 0, contrast: 1.1, saturation: 1, vibrance: 0.15,
      highlights: -10, shadows: 8, whites: -2, blacks: 4,
      clarity: 10, hue: 0, temperature: -20, tint: -2
    }
  },
  {
    id: "vivid",
    name: "Vivid",
    color: {
      exposure: 0, contrast: 1.15, saturation: 1.25, vibrance: 0.35,
      highlights: -5, shadows: 5, whites: 2, blacks: 3,
      clarity: 12, hue: 0, temperature: 5, tint: 0
    }
  },
  {
    id: "soft",
    name: "Soft",
    color: {
      exposure: 0.02, contrast: 0.9, saturation: 0.95, vibrance: 0.1,
      highlights: 10, shadows: -5, whites: 5, blacks: -3,
      clarity: -10, hue: 0, temperature: 8, tint: 2
    }
  },
  {
    id: "dramatic",
    name: "Dramatic",
    color: {
      exposure: -0.02, contrast: 1.35, saturation: 0.9, vibrance: 0.2,
      highlights: -30, shadows: 20, whites: -10, blacks: 15,
      clarity: 22, hue: 0, temperature: -5, tint: 0
    }
  },
  {
    id: "podcast",
    name: "Podcast",
    color: {
      exposure: 0.04, contrast: 1.08, saturation: 1.05, vibrance: 0.15,
      highlights: -8, shadows: 10, whites: -3, blacks: 4,
      clarity: 8, hue: 0, temperature: 12, tint: 2
    }
  }
];

const ColourGradePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Persistence Hook
  useAutoSave();

  // Redux State
  const editorState = useSelector((state) => state.editor.editor);
  const color = editorState?.color || {};
  const isSyncing = useSelector((state) => state.editor.isLoading);

  const [project, setProject] = useState(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("none");

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      try {
        const res = await getProject(id);
        if (res?.data) {
          setProject(res.data);
          dispatch(loadProject({
            projectId: id,
            editor: res.data.editor_json || {},
            sourceUrl: res.data.video_url?.startsWith('http')
              ? res.data.video_url
              : `${API_URL}${res.data.video_url}`
          }));
        }
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setInternalLoading(false);
      }
    };
    fetchProjectData();
  }, [id, dispatch]);

  /** @param {any} preset */
  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    // Merge preset color with existing HSL to prevent resetting wheel adjustments
    const newColor = {
      ...preset.color,
      hsl: color.hsl || { hue: 0, saturation: 0, luminance: 0 }
    };
    dispatch(setColor(newColor));
  };

  /**
   * @param {string} key 
   * @param {number} val 
   */
  const updateColor = (key, val) => {
    dispatch(setColor({ [key]: val }));
    setSelectedPreset("custom");
  };

  /**
   * @param {string} key 
   * @param {number} val 
   */
  const updateHsl = (key, val) => {
    dispatch(setHsl({ [key]: val }));
  };

  const wheelColor = parseColor(`hsl(${color?.hsl?.hue || 0}, ${color?.hsl?.saturation || 0}%, 50%)`);

  // Unify loading detection
  const isPageLoading = internalLoading || isSyncing;

  if (isPageLoading) {
    return (
      <div className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 h-[220px]">
            <Skeleton className="w-32 h-6 mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex-1 flex flex-col items-center">
            <Skeleton className="w-32 h-6 self-start mb-6" />
            <Skeleton variant="circle" className="w-32 h-32 mb-8" />
            <div className="w-full space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 h-full">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 h-full flex flex-col">
            <Skeleton className="w-40 h-6 mb-6" />
            <div className="space-y-6 flex-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-16 h-3" />
                    <Skeleton className="w-8 h-3" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full mt-6 rounded-xl" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col">
          <div className="flex justify-between items-end mb-4 px-1">
            <Skeleton className="w-24 h-8" />
            <div className="flex gap-3">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="w-5 h-5" />
            </div>
          </div>
          <Skeleton className="aspect-9/16 w-full rounded-3xl mb-6" />
          <div className="flex justify-center gap-8 mb-6">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-6 h-6" />
          </div>
          <Skeleton className="h-14 w-full mt-auto rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Left Column (Presets & HSL) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 order-2 lg:order-1 self-stretch">
          <div className="bg-white rounded-3xl p-4 shadow-[1px_1px_5px_2px_rgba(0,0,0,0.2)] border border-[#e9e4f0]">
            <h2 className="text-lg font-bold text-charcoal mb-2">Colour grade presets</h2>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group",
                    selectedPreset === preset.id ? "border-primary shadow-lg scale-95" : "border-transparent hover:border-gray-200"
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center p-2 text-center transition-opacity group-hover:opacity-90",
                      preset.id === 'none' ? 'bg-[#F3F4F6]' : ''
                    )}
                    style={{
                      background: preset.id === 'none' ? undefined :
                        preset.id === 'cinematic' ? 'linear-gradient(45deg, #004d4d, #b35900)' :
                          preset.id === 'warm' ? 'linear-gradient(45deg, #ff9933, #ffcc00)' :
                            preset.id === 'cool' ? 'linear-gradient(45deg, #006699, #66ccff)' :
                              preset.id === 'vivid' ? 'linear-gradient(45deg, #ff0066, #ffcc00)' :
                                preset.id === 'soft' ? 'linear-gradient(45deg, #e6b3cc, #ffcc99)' :
                                  preset.id === 'dramatic' ? 'linear-gradient(45deg, #1a1a1a, #660000)' :
                                    preset.id === 'podcast' ? 'linear-gradient(45deg, #4d2600, #996633)' :
                                      'var(--brand-gradient)'
                    }}
                  >
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-tight group-hover:scale-110 transition-transform",
                      preset.id === 'none' ? 'text-gray-400' : 'text-white'
                    )}>
                      {preset.name}
                    </span>
                  </div>
                  {selectedPreset === preset.id && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-[1px_1px_5px_2px_rgba(0,0,0,0.2)] border border-[#e9e4f0] flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-charcoal mb-2">HSL Adjustments</h2>
            <div className="flex flex-col gap-4 items-center flex-1">
              <div className="relative shrink-0 flex items-center justify-center p-1">
                <ColorWheel
                  value={wheelColor}
                  onChange={(c) => updateHsl('hue', c.getChannelValue('hue'))}
                  outerRadius={65}
                  innerRadius={50}
                >
                  <ColorWheelTrack className="w-32 h-32 rounded-full" />
                  <ColorThumb className="w-5 h-5 bg-white border-2 border-charcoal rounded-full shadow-md focus-visible:ring-2 ring-primary cursor-pointer transition-transform active:scale-125 z-20" />
                </ColorWheel>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-1">
                  <div
                    className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    style={{
                      backgroundColor: `hsl(${color?.hsl?.hue || 0}, ${color?.hsl?.saturation || 0}%, ${(color?.hsl?.luminance / 2 || 0) + 50}%)`
                    }}
                  >
                    <div className="w-[85%] h-[85%] rounded-full relative shadow-inner flex items-center justify-center mix-blend-overlay">
                      <div className="absolute w-2 h-2 bg-white/40 rounded-full top-1/4 left-1/4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full min-w-0 flex flex-col justify-center">
                <div className="space-y-2.5">
                  <Slider
                    label="Hue"
                    value={color?.hsl?.hue || 0}
                    min={0} max={360}
                    step={1}
                    trackClass="bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-cyan-400 via-blue-500 via-purple-500 to-red-500"
                    onChange={(val) => updateHsl('hue', val)}
                  />
                  <Slider
                    label="Saturation"
                    value={color?.hsl?.saturation || 0}
                    min={0} max={100}
                    step={1}
                    trackClass="bg-gradient-to-r from-[#5D4037] to-[#8D6E63]"
                    onChange={(val) => updateHsl('saturation', val)}
                  />
                  <Slider
                    label="Luminance"
                    value={color?.hsl?.luminance || 0}
                    min={-100} max={100}
                    step={1}
                    trackClass="bg-gradient-to-r from-[#424242] via-[#FDD835] to-[#FFFFFF]"
                    onChange={(val) => updateHsl('luminance', val)}
                  />
                </div>
                <div className="mt-auto pt-4">
                  <button className="w-full py-2.5 rounded-xl bg-brand-gradient text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all">
                    Apply Adjustments
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column (Basic Adjustments) */}
        <div className="col-span-12 lg:col-span-4 order-3 lg:order-2 self-stretch">
          <div className="bg-white rounded-3xl p-4 shadow-[1px_1px_5px_2px_rgba(0,0,0,0.2)] border border-[#e9e4f0] flex flex-col h-full">
            <h2 className="text-lg font-bold text-charcoal mb-4">Basic Adjustments</h2>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 flex-1">
              <Slider label="Exposure" value={color.exposure} min={-1} max={1} step={0.01} trackClass="bg-brand-gradient" onChange={(val) => updateColor('exposure', val)} />
              <Slider label="Contrast" value={color.contrast} min={0.5} max={2} step={0.01} trackClass="bg-brand-gradient" onChange={(val) => updateColor('contrast', val)} />
              <Slider label="Highlights" value={color.highlights} min={-100} max={100} step={1} trackClass="bg-brand-gradient" onChange={(val) => updateColor('highlights', val)} />
              <Slider label="Shadows" value={color.shadows} min={-100} max={100} step={1} trackClass="bg-brand-gradient" onChange={(val) => updateColor('shadows', val)} />
              <Slider label="Whites" value={color.whites} min={-100} max={100} step={1} trackClass="bg-brand-gradient" onChange={(val) => updateColor('whites', val)} />
              <Slider label="Blacks" value={color.blacks} min={-100} max={100} step={1} trackClass="bg-brand-gradient" onChange={(val) => updateColor('blacks', val)} />
              <Slider label="Saturation" value={color.saturation} min={0} max={3} step={0.01} trackClass="bg-brand-gradient" onChange={(val) => updateColor('saturation', val)} />
              <Slider label="Vibrance" value={color.vibrance} min={-1} max={1} step={0.01} trackClass="bg-brand-gradient" onChange={(val) => updateColor('vibrance', val)} />
              <Slider label="Clarity" value={color.clarity} min={-100} max={100} step={1} trackClass="bg-brand-gradient" onChange={(val) => updateColor('clarity', val)} />
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100">
              <button onClick={() => applyPreset(COLOR_PRESETS[0])} className="w-full py-2.5 rounded-xl border-2 border-[#e9e4f0] text-charcoal font-bold text-sm hover:bg-gray-50 transition-all active:scale-[0.98]">Reset to Default</button>
            </div>
          </div>
        </div>

        {/* Right Column (Preview & Action) */}
        <VideoPreview
          project={project}
          className="col-span-12 lg:col-span-3 order-1 lg:order-3"
          actionButton={
            <button className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all">
              Add B-roll
            </button>
          }
        />
      </div>
    </div>
  );
};

const Slider = ({ label, value = 0, min = -100, max = 100, step = 1, onChange, trackClass, isFloating = false }) => {
  const safeValue = typeof value === 'number' ? value : 0;
  const isDecimal = (step && step < 1) || isFloating;
  const percentage = ((safeValue - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-xs font-bold text-charcoal">
        <span>{label}</span>
        <span className="font-mono opacity-80">{safeValue > 0 ? '+' : ''}{isDecimal ? safeValue.toFixed(2) : safeValue}</span>
      </div>
      <div className="relative h-2 w-full flex items-center">
        <div className="absolute inset-0 rounded-full bg-[#E5E7EB]" />
        <div className={cn("absolute inset-y-0 left-0 rounded-full", trackClass)} style={{ width: `${percentage}%` }} />
        <input type="range" min={min} max={max} step={step || (isFloating ? 0.01 : 1)} value={safeValue} onChange={(e) => onChange(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
        <div className="absolute w-5 h-5 bg-white rounded-full shadow-md border-2 border-white pointer-events-none transition-transform" style={{ left: `calc(${percentage}% - 10px)` }} />
      </div>
    </div>
  );
};

export default ColourGradePage;
