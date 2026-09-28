import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Loader2 } from 'lucide-react';
import type { QRConfig } from '../types/qr';
import { downloadPNG, downloadSVG, copyQRToClipboard } from '../utils/download';

interface DownloadButtonsProps {
  config: QRConfig;
  isDisabled: boolean;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onRecordHistory: () => void;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  config,
  isDisabled,
  onShowToast,
  onRecordHistory,
}) => {
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isDownloadingSvg, setIsDownloadingSvg] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedRecently, setCopiedRecently] = useState(false);

  const handleDownloadPng = async () => {
    if (isDisabled) return;
    try {
      setIsDownloadingPng(true);
      await downloadPNG(config, `qr-${config.type}-${config.size}px.png`);
      onRecordHistory();
      onShowToast(`Downloaded high-res PNG (${config.size}×${config.size}px)`, 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to download PNG image', 'error');
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleDownloadSvg = async () => {
    if (isDisabled) return;
    try {
      setIsDownloadingSvg(true);
      await downloadSVG(config, `qr-${config.type}-vector.svg`);
      onRecordHistory();
      onShowToast('Downloaded vector SVG file', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to download SVG file', 'error');
    } finally {
      setIsDownloadingSvg(false);
    }
  };

  const handleCopy = async () => {
    if (isDisabled) return;
    try {
      setIsCopying(true);
      const result = await copyQRToClipboard(config);
      if (result.success) {
        setCopiedRecently(true);
        setTimeout(() => setCopiedRecently(false), 2500);
        onRecordHistory();
        onShowToast('QR code copied to clipboard!', 'success');
      } else {
        onShowToast(result.message, 'error');
      }
    } catch {
      onShowToast('Clipboard copy not permitted by browser', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* Primary PNG Download Button */}
      <button
        type="button"
        disabled={isDisabled || isDownloadingPng}
        onClick={handleDownloadPng}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-bold text-sm shadow-md shadow-indigo-500/20 disabled:shadow-none transition-all duration-150 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {isDownloadingPng ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Download PNG ({config.size}px)</span>
      </button>

      {/* Secondary Actions: SVG & Copy to Clipboard */}
      <div className="grid grid-cols-2 gap-2">
        {/* SVG Download */}
        <button
          type="button"
          disabled={isDisabled || isDownloadingSvg}
          onClick={handleDownloadSvg}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isDownloadingSvg ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>Download SVG</span>
        </button>

        {/* Copy to Clipboard */}
        <button
          type="button"
          disabled={isDisabled || isCopying}
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isCopying ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : copiedRecently ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>{copiedRecently ? 'Copied!' : 'Copy to Clipboard'}</span>
        </button>
      </div>
    </div>
  );
};
