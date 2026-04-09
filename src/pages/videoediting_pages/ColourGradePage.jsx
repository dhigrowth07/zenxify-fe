import React, { useState } from 'react';
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
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @param {...any} inputs 
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
  const [selectedPreset, setSelectedPreset] = useState("none");
  const [color, setColor] = useState({
    exposure: 0.15,
    contrast: 1.1,
    highlights: -5,
    shadows: 8,
    whites: -3,
    blacks: 5,
    saturation: 1.2,
    vibrance: 0.12,
    clarity: 15,
    temperature: 0,
    tint: 0,
    hue: 12,
    hsl: { hue: 12, saturation: 100, luminance: 0 }
  });

  /**
   * @param {any} preset 
   */
  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setColor(prev => ({
      ...prev,
      ...preset.color,
      hsl: { ...prev.hsl } // Keep current HSL adjustments
    }));
  };

  /**
   * @param {string} key 
   * @param {number} val 
   */
  const updateColor = (key, val) => {
    setColor(prev => ({ ...prev, [key]: val }));
    setSelectedPreset("custom");
  };

  /**
   * @param {string} key 
   * @param {number} val 
   */
  const updateHsl = (key, val) => {
    setColor(prev => ({
      ...prev,
      hsl: { ...prev.hsl, [key]: val }
    }));
  };

  // Convert state to react-aria color object for the wheel
  const wheelColor = parseColor(`hsl(${color.hsl.hue}, ${color.hsl.saturation}%, 50%)`);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column (Presets & HSL) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 order-2 lg:order-1">
          {/* Colour Grade Presets */}
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

          {/* HSL Adjustments */}
          <div className="bg-white rounded-3xl p-4 shadow-[1px_1px_5px_2px_rgba(0,0,0,0.2)] border border-[#e9e4f0]">
            <h2 className="text-lg font-bold text-charcoal mb-2">HSL Adjustments</h2>
            
            <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start">
              {/* Interactive Color Wheel Section */}
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
                
                {/* Custom Zenxify Center Overlay - Perfectly Centered */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-1">
                   <div 
                     className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                     style={{ 
                       backgroundColor: `hsl(${color.hsl.hue}, ${color.hsl.saturation}%, ${(color.hsl.luminance / 2) + 50}%)` 
                     }}
                   >
                      <div className="w-[85%] h-[85%] rounded-full relative shadow-inner flex items-center justify-center mix-blend-overlay">
                        <div className="absolute w-2 h-2 bg-white/40 rounded-full top-1/4 left-1/4" />
                      </div>
                   </div>
                </div>
              </div>

              {/* HSL Sliders - Constrained to prevent overflow */}
              <div className="flex-1 w-full min-w-0 space-y-2.5">
                <Slider 
                  label="Hue" 
                  value={color.hsl.hue} 
                  min={0} max={360} 
                  trackClass="bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-cyan-400 via-blue-500 via-purple-500 to-red-500"
                  onChange={(v) => updateHsl('hue', v)}
                />
                <Slider 
                  label="Saturation" 
                  value={color.hsl.saturation} 
                  min={0} max={100} 
                  trackClass="bg-gradient-to-r from-[#5D4037] to-[#8D6E63]"
                  onChange={(v) => updateHsl('saturation', v)}
                />
                <Slider 
                  label="Luminance" 
                  value={color.hsl.luminance} 
                  min={-100} max={100} 
                  trackClass="bg-gradient-to-r from-[#424242] via-[#FDD835] to-[#FFFFFF]"
                  onChange={(v) => updateHsl('luminance', v)}
                />

                <div className="pt-2">
                  <button className="w-full py-2.5 rounded-xl bg-brand-gradient text-white font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all">
                    Apply Adjustments
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column (Basic Adjustments) */}
        <div className="col-span-12 lg:col-span-4 order-3 lg:order-2">
          <div className="bg-white rounded-3xl px-4 py-4 shadow-[1px_1px_5px_2px_rgba(0,0,0,0.2)] border border-[#e9e4f0]">
            <h2 className="text-lg font-bold text-charcoal mb-4">Basic Adjustments</h2>
            <div className="space-y-4">
              <Slider 
                label="Exposure" 
                value={color.exposure} 
                min={-1} max={1} step={0.01}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('exposure', v)}
              />
              <Slider 
                label="Contrast" 
                value={color.contrast} 
                min={0.5} max={2} step={0.01}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('contrast', v)}
              />
              <Slider 
                label="Highlights" 
                value={color.highlights} 
                min={-100} max={100}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('highlights', v)}
              />
              <Slider 
                label="Shadows" 
                value={color.shadows} 
                min={-100} max={100}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('shadows', v)}
              />
              <Slider 
                label="Whites" 
                value={color.whites} 
                min={-100} max={100}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('whites', v)}
              />
              <Slider 
                label="Blacks" 
                value={color.blacks} 
                min={-100} max={100}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('blacks', v)}
              />
              <Slider 
                label="Saturation" 
                value={color.saturation} 
                min={0} max={3} step={0.01}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('saturation', v)}
              />
              <Slider 
                label="Vibrance" 
                value={color.vibrance} 
                min={-1} max={1} step={0.01}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('vibrance', v)}
              />
              <Slider 
                label="Clarity" 
                value={color.clarity} 
                min={-100} max={100}
                trackClass="bg-brand-gradient"
                onChange={(v) => updateColor('clarity', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Column (Preview & Action) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col pt-1 order-1 lg:order-3">
           <div className="flex justify-between items-end mb-2 px-1">
              <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest opacity-70">Preview</h2>
              <div className="flex gap-3 text-charcoal">
                <Monitor size={20} className="cursor-pointer hover:text-primary transition-colors" />
                <Maximize2 size={20} className="cursor-pointer hover:text-primary transition-colors" />
              </div>
           </div>

           <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-9/16 bg-black border-[6px] border-white">
              <img 
                src="https://images.unsplash.com/photo-1590086782792-42dd2350140d?q=80&w=1000&auto=format&fit=crop" 
                alt="Preview"
                className="w-full h-full object-cover"
              />
           </div>

           {/* Media Controls - Tightened */}
           <div className="flex justify-center items-center gap-8 py-4">
              <SkipBack size={24} className="text-charcoal cursor-pointer hover:scale-110 transition-transform" />
              <Play size={32} className="text-charcoal cursor-pointer hover:scale-110 transition-transform" fill="currentColor" />
              <SkipForward size={24} className="text-charcoal cursor-pointer hover:scale-110 transition-transform" />
           </div>

           {/* Bottom CTA */}
           <button className="w-full py-3.5 rounded-xl bg-brand-gradient text-white font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all">
             Add B-roll
           </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @param {{ label: string, value: number, min?: number, max?: number, step?: number, onChange: (v: number) => void, trackClass: string, isFloating?: boolean }} props
 */
const Slider = ({ label, value, min = -100, max = 100, step, onChange, trackClass, isFloating = false }) => {
  const isDecimal = (step && step < 1) || isFloating;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-xs font-bold text-charcoal">
        <span>{label}</span>
        <span className="font-mono opacity-80">
          {value > 0 ? '+' : ''}
          {isDecimal ? value.toFixed(2) : value}
        </span>
      </div>
      <div className="relative h-2 w-full flex items-center">
         {/* Background Track (Grey) */}
         <div className="absolute inset-0 rounded-full bg-[#E5E7EB]" />
         
         {/* Filled Track (Colored) */}
         <div 
           className={cn("absolute inset-y-0 left-0 rounded-full", trackClass)} 
           style={{ width: `${percentage}%` }}
         />

         <input 
           type="range"
           min={min}
           max={max}
           step={step || (isFloating ? 0.01 : 1)}
           value={value}
           onChange={(e) => onChange(parseFloat(e.target.value))}
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
         />
         
         {/* Custom Thumb */}
         <div 
          className="absolute w-5 h-5 bg-white rounded-full shadow-md border-2 border-white pointer-events-none transition-transform"
          style={{ left: `calc(${percentage}% - 10px)` }}
         />
      </div>
    </div>
  );
};

export default ColourGradePage;
