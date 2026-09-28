import React from 'react';
import { Globe, FileText, Mail, Phone, Wifi } from 'lucide-react';
import type { QRType } from '../types/qr';

interface QRTypeSelectorProps {
  currentType: QRType;
  onChange: (type: QRType) => void;
}

const QR_TYPES: { id: QRType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'url', label: 'URL', icon: Globe },
  { id: 'text', label: 'Plain Text', icon: FileText },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
];

export const QRTypeSelector: React.FC<QRTypeSelectorProps> = ({ currentType, onChange }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Select QR Content Type
        </label>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          5 standard formats
        </span>
      </div>

      <div
        role="tablist"
        aria-label="QR Code Type"
        className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800"
      >
        {QR_TYPES.map(({ id, label, icon: Icon }) => {
          const isActive = currentType === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
