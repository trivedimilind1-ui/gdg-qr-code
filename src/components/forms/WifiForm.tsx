import React, { useState } from 'react';
import { Wifi, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { WifiData, WifiEncryption, ValidationErrors } from '../../types/qr';

interface WifiFormProps {
  data: WifiData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  onChange: (field: keyof WifiData, value: string | boolean) => void;
  onBlur: (field: string) => void;
}

export const WifiForm: React.FC<WifiFormProps> = ({
  data,
  errors,
  touched,
  onChange,
  onBlur,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const hasSsidError = touched.ssid && !!errors.ssid;
  const hasPasswordError = touched.password && !!errors.password;
  const isSecure = data.encryption !== 'nopass';

  return (
    <div className="space-y-4">
      {/* Network Name / SSID */}
      <div>
        <label
          htmlFor="wifi-ssid-input"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Network Name (SSID) <span className="text-rose-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Wifi className="w-4 h-4" />
          </div>
          <input
            id="wifi-ssid-input"
            type="text"
            value={data.ssid}
            onChange={(e) => onChange('ssid', e.target.value)}
            onBlur={() => onBlur('ssid')}
            placeholder="MyHomeWiFi"
            aria-invalid={hasSsidError}
            aria-describedby={hasSsidError ? 'wifi-ssid-error' : undefined}
            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
              hasSsidError
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100'
            }`}
          />
        </div>
        {hasSsidError && (
          <p id="wifi-ssid-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.ssid}</span>
          </p>
        )}
      </div>

      {/* Security Type */}
      <div>
        <label
          htmlFor="wifi-security-select"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
        >
          Encryption / Security Type
        </label>
        <select
          id="wifi-security-select"
          value={data.encryption}
          onChange={(e) => onChange('encryption', e.target.value as WifiEncryption)}
          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 cursor-pointer"
        >
          <option value="WPA">WPA / WPA2 (Standard)</option>
          <option value="WEP">WEP (Legacy)</option>
          <option value="nopass">None (Open Network)</option>
        </select>
      </div>

      {/* Password (if secured) */}
      {isSecure && (
        <div>
          <label
            htmlFor="wifi-pass-input"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
          >
            Wi-Fi Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="wifi-pass-input"
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => onChange('password', e.target.value)}
              onBlur={() => onBlur('password')}
              placeholder="Enter wireless password"
              aria-invalid={hasPasswordError}
              aria-describedby={hasPasswordError ? 'wifi-pass-error' : undefined}
              className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                hasPasswordError
                  ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {hasPasswordError && (
            <p id="wifi-pass-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>
      )}

      {/* Hidden Network Checkbox */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.hidden}
            onChange={(e) => onChange('hidden', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:ring-offset-0 bg-white dark:bg-slate-900"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Hidden network (SSID not broadcast)
          </span>
        </label>
      </div>
    </div>
  );
};
