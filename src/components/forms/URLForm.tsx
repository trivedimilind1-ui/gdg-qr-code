import React from 'react';
import { Globe, AlertCircle, ExternalLink } from 'lucide-react';
import type { URLData, ValidationErrors } from '../../types/qr';
import { normalizeUrl } from '../../utils/qrPayload';

interface URLFormProps {
  data: URLData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  onChange: (field: keyof URLData, value: string) => void;
  onBlur: (field: string) => void;
}

export const URLForm: React.FC<URLFormProps> = ({
  data,
  errors,
  touched,
  onChange,
  onBlur,
}) => {
  const hasError = touched.url && !!errors.url;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="url-input"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Target Website URL <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Globe className="w-4 h-4" />
          </div>
          <input
            id="url-input"
            type="url"
            value={data.url}
            onChange={(e) => onChange('url', e.target.value)}
            onBlur={() => onBlur('url')}
            placeholder="https://example.com"
            aria-invalid={hasError}
            aria-describedby={hasError ? 'url-error' : undefined}
            className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
              hasError
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100'
            }`}
          />
          {data.url && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <a
                href={normalizeUrl(data.url)}
                target="_blank"
                rel="noopener noreferrer"
                title="Test URL link"
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {hasError && (
          <p id="url-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.url}</span>
          </p>
        )}
      </div>

      {/* Suggested URL helper pills */}
      <div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Quick examples:</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {['https://google.com', 'https://github.com', 'https://linkedin.com'].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                onChange('url', sample);
                onBlur('url');
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
