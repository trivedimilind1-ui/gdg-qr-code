import React from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import type { EmailData, ValidationErrors } from '../../types/qr';

interface EmailFormProps {
  data: EmailData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  onChange: (field: keyof EmailData, value: string) => void;
  onBlur: (field: string) => void;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  data,
  errors,
  touched,
  onChange,
  onBlur,
}) => {
  const hasEmailError = touched.email && !!errors.email;

  return (
    <div className="space-y-4">
      {/* Recipient Email */}
      <div>
        <label
          htmlFor="email-input"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Recipient Email Address <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email-input"
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => onBlur('email')}
            placeholder="recipient@example.com"
            aria-invalid={hasEmailError}
            aria-describedby={hasEmailError ? 'email-error' : undefined}
            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
              hasEmailError
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100'
            }`}
          />
        </div>
        {hasEmailError && (
          <p id="email-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.email}</span>
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="subject-input"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Subject Line <span className="text-xs font-normal text-slate-400">(Optional)</span>
        </label>
        <input
          id="subject-input"
          type="text"
          value={data.subject}
          onChange={(e) => onChange('subject', e.target.value)}
          placeholder="e.g. Project Inquiry or Feedback"
          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Body / Message */}
      <div>
        <label
          htmlFor="body-input"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Default Body Content <span className="text-xs font-normal text-slate-400">(Optional)</span>
        </label>
        <textarea
          id="body-input"
          rows={3}
          value={data.body}
          onChange={(e) => onChange('body', e.target.value)}
          placeholder="Pre-filled email message template..."
          className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 resize-y"
        />
      </div>
    </div>
  );
};
