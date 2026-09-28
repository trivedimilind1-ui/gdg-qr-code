import React from 'react';
import { QrCode, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { QRConfig, ReliabilityAssessment } from '../types/qr';
import { ReliabilityIndicator } from './ReliabilityIndicator';
import { DownloadButtons } from './DownloadButtons';

interface QRPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  config: QRConfig;
  payload: string;
  isGenerating: boolean;
  error: string | null;
  isValid: boolean;
  reliability: ReliabilityAssessment;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onRecordHistory: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  canvasRef,
  config,
  payload,
  isGenerating,
  error,
  isValid,
  reliability,
  onShowToast,
  onRecordHistory,
}) => {
  const hasPayload = Boolean(payload && payload.trim());
  const showLiveCode = hasPayload && isValid && !error;

  return (
    <div className="space-y-5 lg:sticky lg:top-20">
      {/* Main Preview Card */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center transition-colors">
        {/* Top Badges */}
        <div className="w-full flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {config.type}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
              {config.size} × {config.size}px
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {isGenerating ? (
              <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering...</span>
              </span>
            ) : showLiveCode ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Preview</span>
              </span>
            ) : (
              <span>Draft</span>
            )}
          </div>
        </div>

        {/* QR Canvas / Empty State Container */}
        <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
          {/* Active Canvas */}
          <canvas
            ref={canvasRef}
            className={`w-full h-full max-w-[280px] max-h-[280px] object-contain rounded-xl shadow-sm transition-opacity duration-200 ${
              showLiveCode ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
            }`}
          />

          {/* Empty State */}
          {!showLiveCode && (
            <div className="text-center p-6 space-y-3 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {error ? (
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                ) : (
                  <QrCode className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {error ? 'Unable to generate code' : 'Create your QR code'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                  {error
                    ? error
                    : 'Enter your information on the left to generate an authentic QR code instantly.'}
                </p>
              </div>
              {!error && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>Real-time instant rendering</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Payload Preview Hint */}
        {showLiveCode && (
          <div className="mt-4 w-full text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono max-w-[280px] mx-auto" title={payload}>
              {payload}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full mt-6">
          <DownloadButtons
            config={config}
            isDisabled={!showLiveCode}
            onShowToast={onShowToast}
            onRecordHistory={onRecordHistory}
          />
        </div>
      </div>

      {/* Scan Reliability Diagnostics */}
      {showLiveCode && (
        <ReliabilityIndicator assessment={reliability} />
      )}
    </div>
  );
};
