import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import type { ReliabilityAssessment } from '../types/qr';

interface ReliabilityIndicatorProps {
  assessment: ReliabilityAssessment;
}

export const ReliabilityIndicator: React.FC<ReliabilityIndicatorProps> = ({ assessment }) => {
  const { status, score, contrastRatio, contrastLabel, contrastStatus, warnings, tips } = assessment;

  const isExcellent = status === 'excellent';
  const isGood = status === 'good';
  const isWarning = status === 'warning';

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 space-y-3">
      {/* Header with Score and Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Estimated Scan Readability
          </span>
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isExcellent
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : isGood
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {isExcellent && <CheckCircle2 className="w-3.5 h-3.5" />}
          {isGood && <Info className="w-3.5 h-3.5" />}
          {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{isExcellent ? 'Optimal' : isGood ? 'Good' : 'Needs Review'} ({score}/100)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isExcellent
              ? 'bg-emerald-500'
              : isGood
              ? 'bg-blue-500'
              : 'bg-amber-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Color Contrast
          </span>
          <span
            className={`font-semibold ${
              contrastStatus === 'strong'
                ? 'text-emerald-600 dark:text-emerald-400'
                : contrastStatus === 'acceptable'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {contrastLabel}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Contrast Ratio
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
            {contrastRatio}:1
          </span>
        </div>
      </div>

      {/* Warnings & Suggestions */}
      {warnings.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {warnings.map((warn, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-200"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {tips.length > 0 && warnings.length === 0 && (
        <div className="space-y-1 pt-1">
          {tips.slice(0, 2).map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <span className="text-indigo-500 font-bold">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-1 leading-relaxed">
        * Based on contrast, quiet zone, error correction and customization. Actual scan performance can vary by device, screen, lighting and printing conditions.
      </p>
    </div>
  );
};
