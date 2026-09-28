import React, { useState, useEffect } from 'react';
import { Sliders, Palette, Shield, Maximize2, Image as ImageIcon, Trash2, HelpCircle, AlertCircle } from 'lucide-react';
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
  // Local input states for free text editing
  const [fgInput, setFgInput] = useState(config.foreground);
  const [bgInput, setBgInput] = useState(config.background);
  const [fgError, setFgError] = useState<string | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);

  // Synchronize when config changes externally (e.g. preset selection or history restore)
  useEffect(() => {
    setFgInput(config.foreground);
    setFgError(null);
  }, [config.foreground]);

  useEffect(() => {
    setBgInput(config.background);
    setBgError(null);
  }, [config.background]);

  const handleFgHexChange = (val: string) => {
    setFgInput(val);
    if (isValidHexColor(val)) {
      setFgError(null);
      onChange('foreground', val);
    } else {
      setFgError('Invalid HEX color (e.g. #000000 or #333)');
    }
  };

  const handleBgHexChange = (val: string) => {
    setBgInput(val);
    if (isValidHexColor(val)) {
      setBgError(null);
      onChange('background', val);
    } else {
      setBgError('Invalid HEX color (e.g. #FFFFFF or #F0F)');
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo image should be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawResult = event.target?.result as string;
      if (!rawResult) return;

      // Downscale logo to max 256x256 using an offscreen canvas to keep localStorage usage small & fast
      const img = new Image();
      img.onload = () => {
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/png');
          onLogoUpload(optimizedDataUrl);
        } else {
          onLogoUpload(rawResult);
        }

        // Elevate error correction to High (H) automatically for logo safety
        if (config.errorCorrection !== 'H') {
          onChange('errorCorrection', 'H');
        }
      };
      img.onerror = () => {
        onLogoUpload(rawResult);
      };
      img.src = rawResult;
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
                  value={isValidHexColor(fgInput) ? fgInput : config.foreground}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setFgInput(newColor);
                    setFgError(null);
                    onChange('foreground', newColor);
                  }}
                  className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0"
                  aria-label="Foreground color picker"
                />
              </div>
              <input
                type="text"
                value={fgInput}
                onChange={(e) => handleFgHexChange(e.target.value)}
                maxLength={7}
                placeholder="#000000"
                aria-label="Foreground hex code"
                aria-invalid={Boolean(fgError)}
                aria-describedby={fgError ? 'fg-error' : undefined}
                className={`w-full px-2.5 py-1.5 font-mono text-xs uppercase bg-slate-50 dark:bg-slate-800/80 border rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  fgError
                    ? 'border-rose-400 dark:border-rose-600 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
            </div>
            {fgError && (
              <p id="fg-error" role="alert" className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fgError}</span>
              </p>
            )}
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
                  value={isValidHexColor(bgInput) ? bgInput : config.background}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setBgInput(newColor);
                    setBgError(null);
                    onChange('background', newColor);
                  }}
                  className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0"
                  aria-label="Background color picker"
                />
              </div>
              <input
                type="text"
                value={bgInput}
                onChange={(e) => handleBgHexChange(e.target.value)}
                maxLength={7}
                placeholder="#FFFFFF"
                aria-label="Background hex code"
                aria-invalid={Boolean(bgError)}
                aria-describedby={bgError ? 'bg-error' : undefined}
                className={`w-full px-2.5 py-1.5 font-mono text-xs uppercase bg-slate-50 dark:bg-slate-800/80 border rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  bgError
                    ? 'border-rose-400 dark:border-rose-600 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
            </div>
            {bgError && (
              <p id="bg-error" role="alert" className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{bgError}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Export Size & Margin Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PNG Export Resolution */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="size-slider" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>PNG Export Resolution</span>
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
          <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
            Sets downloaded PNG pixel dimension. Live preview remains optimized at 512px.
          </p>
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
          <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
            Margin is the clear border area scanners require around the code.
          </p>
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
              Higher error correction allows QR codes to be decoded even if partially damaged or obscured by a logo.
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

      {/* Center Logo Upload */}
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
          <div className="space-y-3">
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

            {/* Logo Scale Control */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Logo Scale</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {config.logoSize || 20}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={25}
                step={1}
                value={config.logoSize || 20}
                onChange={(e) => onChange('logoSize', Number(e.target.value))}
                className="w-full accent-indigo-600 dark:accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10% (Subtle)</span>
                <span>20% (Standard)</span>
                <span>25% (Maximum)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
              Logos cover center data modules. Supported in both PNG and vector SVG exports with protective backing.
            </p>
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
              Processed locally in browser. Automatically scales image for fast rendering and storage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
