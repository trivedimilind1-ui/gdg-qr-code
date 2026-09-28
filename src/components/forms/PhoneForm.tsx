import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';
import type { PhoneData, ValidationErrors } from '../../types/qr';

interface PhoneFormProps {
  data: PhoneData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  onChange: (field: keyof PhoneData, value: string) => void;
  onBlur: (field: string) => void;
}

export const PhoneForm: React.FC<PhoneFormProps> = ({
  data,
  errors,
  touched,
  onChange,
  onBlur,
}) => {
  const hasError = touched.phone && !!errors.phone;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="phone-input"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Phone Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            id="phone-input"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            placeholder="+1 (555) 000-0000"
            aria-invalid={hasError}
            aria-describedby={hasError ? 'phone-error' : undefined}
            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
              hasError
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100'
            }`}
          />
        </div>
        {hasError && (
          <p id="phone-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.phone}</span>
          </p>
        )}
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <p className="font-medium text-slate-700 dark:text-slate-300 mb-0.5">International Format Tip:</p>
        Include country code (e.g. <span className="font-mono text-slate-700 dark:text-slate-300">+1</span> for USA/Canada, <span className="font-mono text-slate-700 dark:text-slate-300">+91</span> for India, <span className="font-mono text-slate-700 dark:text-slate-300">+44</span> for UK) so any phone can dial automatically.
      </div>
    </div>
  );
};
