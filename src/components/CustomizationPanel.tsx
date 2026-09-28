import React, { useState } from 'react';
import { Sliders, Palette, Shield, Maximize2, Image as ImageIcon, Trash2, HelpCircle } from 'lucide-react';
import type { ErrorCorrectionLevel, QRConfig } from '../types/qr';
import { isValidHexColor } from '../utils/validation';

interface CustomizationPanelProps {
  config: QRConfig;
  onChange: <K extends keyof QRConfig>(key: K, value: QRConfig[K]) => void;
  onLogoUpload: (dataUrl: string | null) => void;
}

const ERROR_LEVELS: { id: ErrorCorrectionLevel; label: string; desc: string; recovery: string }[] = [
  { id: 'L', label: 'Low (L)', desc: 'Fastest & least dense', recovery: '~7%' },
  { id: 'M', label: 'Medium (M)', desc: 'Standard balance', recovery: '~15%' },
  { id: 'Q', label: 'Quartile (Q)', desc: 'Good for printed codes', recovery: '~25%' },
  { id: 'H', label: 'High (H)', desc: 'Best for logos & damage', recovery: '~30%' },
];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  config,
  onChange,
  onLogoUpload,
}) => {
  const [fgDraft, setFgDraft] = useState<string | null>(null);
  const [prevFg, setPrevFg] = useState(config.foreground);
  if (config.foreground !== prevFg) {
    setPrevFg(config.foreground);
    setFgDraft(null);
  }
  const fgHexInput = fgDraft !== null ? fgDraft : config.foreground;

  const [bgDraft, setBgDraft] = useState<string | null>(null);
  const [prevBg, setPrevBg] = useState(config.background);
  if (config.background !== prevBg) {
    setPrevBg(config.background);
    setBgDraft(null);
  }
  const bgHexInput = bgDraft !== null ? bgDraft : config.background;

  const handleFgHexChange = (val: string) => {
    setFgDraft(val);
    if (isValidHexColor(val)) {
      onChange('foreground', val);
    }
  };

  const handleBgHexChange = (val: string) => {
    setBgDraft(val);
    if (isValidHexColor(val)) {
      onChange('background', val);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 3MB for client-side logo
    if (file.size > 3 * 1024 * 1024) {
      alert('Logo image should be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onLogoUpload(result);
        // Automatically suggest or elevate error correction to H for resilience
        if (config.errorCorrection !== 'H') {
          onChange('errorCorrection', 'H');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Design & Customization
        </h3>
      </div>

      {/* Colors Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Colors & Contrast</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Foreground Color */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
            <label htmlFor="fg-color-picker" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Foreground (Modules)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 cursor-pointer shadow-xs">
                <input
                  id="fg-color-picker"
                  type="color"
                  value={config.foreground}
                  onChange={(e) => {
                    onChange('foreground', e.target.value);
                    setFgDraft(e.target.value);
                  }}
                  className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0"
                />
              </div>
              <input
                type="text"
                value={fgHexInput}
                onChange={(e) => handleFgHexChange(e.target.value)}
                maxLength={7}
                placeholder="#000000"
                className="w-full px-2.5 py-1.5 font-mono text-xs uppercase bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
            <label htmlFor="bg-color-picker" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Background
            </label>
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 cursor-pointer shadow-xs">
                <input
                  id="bg-color-picker"
                  type="color"
                  value={config.background}
                  onChange={(e) => {
                    onChange('background', e.target.value);
                    setBgDraft(e.target.value);
                  }}
                  className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0"
                />
              </div>
              <input
                type="text"
                value={bgHexInput}
                onChange={(e) => handleBgHexChange(e.target.value)}
                maxLength={7}
                placeholder="#FFFFFF"
                className="w-full px-2.5 py-1.5 font-mono text-xs uppercase bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Size & Margin Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dimensions Slider */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="size-slider" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Resolution</span>
            </label>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {config.size} × {config.size}px
            </span>
          </div>
          <input
            id="size-slider"
            type="range"
            min={128}
            max={1024}
            step={32}
            value={config.size}
            onChange={(e) => onChange('size', Number(e.target.value))}
            className="w-full accent-indigo-600 dark:accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>128px</span>
            <span>512px (Standard)</span>
            <span>1024px (HD)</span>
          </div>
        </div>

        {/* Quiet Zone / Margin Slider */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="margin-slider" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Quiet Zone (Margin)</span>
            </label>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {config.margin} {config.margin === 1 ? 'block' : 'blocks'}
            </span>
          </div>
          <input
            id="margin-slider"
            type="range"
            min={0}
            max={6}
            step={1}
            value={config.margin}
            onChange={(e) => onChange('margin', Number(e.target.value))}
            className="w-full accent-indigo-600 dark:accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0 (Tight)</span>
            <span>2-3 (Optimal)</span>
            <span>6 (Wide)</span>
          </div>
        </div>
      </div>

      {/* Error Correction Level */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Error Correction Capacity</span>
          </label>
          <div className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <div className="absolute right-0 bottom-6 hidden group-hover:block w-56 p-2 rounded-lg bg-slate-900 text-white text-[11px] leading-tight z-30 shadow-xl">
              Higher error correction allows QR codes to be decoded even if damaged or obscured by a logo.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ERROR_LEVELS.map(({ id, label, recovery }) => {
            const isSelected = config.errorCorrection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange('errorCorrection', id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{label}</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {recovery}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Restores {recovery} damage
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Logo Upload (Optional Feature #43) */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Center Logo / Icon Overlay
            </span>
          </div>
          <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
            Client-Only
          </span>
        </div>

        {config.logo ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={config.logo}
                alt="Logo preview"
                className="w-10 h-10 object-contain rounded-lg bg-white p-1 border shadow-xs"
              />
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Custom logo applied</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">High (H) error correction active</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onLogoUpload(null)}
              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
              title="Remove logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <label
              htmlFor="logo-file-input"
              className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span>Upload image / logo (PNG, JPG, SVG)</span>
            </label>
            <input
              id="logo-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoFileChange}
              className="hidden"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 text-center">
              Processed locally in browser. Adds clean protective backing automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
