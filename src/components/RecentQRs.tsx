import React, { useState } from 'react';
import { History, RotateCcw, Trash2, Globe, FileText, Mail, Phone, Wifi, AlertTriangle } from 'lucide-react';
import type { RecentQREntry, QRType, QRConfig } from '../types/qr';

interface RecentQRsProps {
  entries: RecentQREntry[];
  onReuse: (config: QRConfig) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const TYPE_ICONS: Record<QRType, React.FC<{ className?: string }>> = {
  url: Globe,
  text: FileText,
  email: Mail,
  phone: Phone,
  wifi: Wifi,
};

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const RecentQRs: React.FC<RecentQRsProps> = ({
  entries,
  onReuse,
  onDelete,
  onClearAll,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 text-center">
        <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Recent QR Codes</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
          Generated and saved QR codes will appear here in your browser's private local storage.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Recent QR Codes ({entries.length})
          </h3>
        </div>

        {/* Clear All Trigger */}
        {!showClearConfirm ? (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
          >
            Clear all
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Clear?
            </span>
            <button
              type="button"
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="text-xs px-2 py-0.5 rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Entry Cards List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {entries.map((entry) => {
          const Icon = TYPE_ICONS[entry.type] || Globe;
          return (
            <div
              key={entry.id}
              className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150"
            >
              {/* Type Icon & Swatches */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs"
                  style={{
                    backgroundColor: entry.config.background,
                    color: entry.config.foreground,
                    borderColor: 'rgba(0,0,0,0.08)',
                  }}
                  title={`Foreground: ${entry.config.foreground}, Background: ${entry.config.background}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {entry.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {entry.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-mono">
                    {entry.payload}
                  </p>
                </div>
              </div>

              {/* Actions: Reuse & Delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onReuse(entry.config)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Restore this configuration"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reuse</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  aria-label="Delete saved QR code"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
