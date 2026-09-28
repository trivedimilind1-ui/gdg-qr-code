import React from 'react';
import { Sparkles } from 'lucide-react';
import { PRESETS } from '../utils/presets';
import type { QRPreset } from '../types/qr';

interface PresetSelectorProps {
  onSelectPreset: (preset: QRPreset) => void;
  currentForeground: string;
  currentBackground: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
  currentForeground,
  currentBackground,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Design Presets</h3>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">1-click styling</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const isSelected =
            preset.foreground.toUpperCase() === currentForeground.toUpperCase() &&
            preset.background.toUpperCase() === currentBackground.toUpperCase();

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`group relative p-2.5 rounded-xl border text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              {/* Color swatch mini preview */}
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shrink-0 shadow-xs"
                  style={{ backgroundColor: preset.foreground }}
                  title={`Foreground: ${preset.foreground}`}
                />
                <div
                  className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shrink-0 shadow-xs"
                  style={{ backgroundColor: preset.background }}
                  title={`Background: ${preset.background}`}
                />
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ml-auto">
                  {preset.tag}
                </span>
              </div>

              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                {preset.name}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                EC {preset.errorCorrection} • M{preset.margin}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
