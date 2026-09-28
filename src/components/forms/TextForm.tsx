import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { TextData, ValidationErrors } from '../../types/qr';

interface TextFormProps {
  data: TextData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  onChange: (field: keyof TextData, value: string) => void;
  onBlur: (field: string) => void;
}

export const TextForm: React.FC<TextFormProps> = ({
  data,
  errors,
  touched,
  onChange,
  onBlur,
}) => {
  const hasError = touched.text && !!errors.text;
  const charCount = data.text ? data.text.length : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="text-input"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Message / Plain Text <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {charCount} characters
          </span>
        </div>

        <textarea
          id="text-input"
          rows={5}
          value={data.text}
          onChange={(e) => onChange('text', e.target.value)}
          onBlur={() => onBlur('text')}
          placeholder="Enter notes, greetings, instructions, or any unicode text..."
          aria-invalid={hasError}
          aria-describedby={hasError ? 'text-error' : undefined}
          className={`w-full p-3.5 bg-white dark:bg-slate-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 resize-y ${
            hasError
              ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100'
          }`}
        />

        {hasError && (
          <p id="text-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.text}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>Supports multi-line, symbols, and emoji (e.g. ✨ 🚀)</span>
        {charCount > 500 && (
          <span className="text-amber-500 font-medium">
            Long text creates denser QR codes
          </span>
        )}
      </div>
    </div>
  );
};
