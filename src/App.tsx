import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  QRType,
  QRConfig,
  QRDataMap,
  QRPreset,
  RecentQREntry,
  ToastMessage,
} from './types/qr';
import { Header } from './components/Header';
import { QRTypeSelector } from './components/QRTypeSelector';
import { QRForm } from './components/forms/QRForm';
import { PresetSelector } from './components/PresetSelector';
import { CustomizationPanel } from './components/CustomizationPanel';
import { QRPreview } from './components/QRPreview';
import { RecentQRs } from './components/RecentQRs';
import { ToastContainer } from './components/Toast';
import { generateQRPayload, getQRSummaryTitle } from './utils/qrPayload';
import { validateQRData } from './utils/validation';
import { evaluateScanReliability } from './utils/reliability';
import { useQRCode } from './hooks/useQRCode';
import { useLocalStorage } from './hooks/useLocalStorage';

const INITIAL_DATA_MAP: QRDataMap = {
  url: { url: 'https://example.com' },
  text: { text: 'Hello, world! Welcome to QR Studio.' },
  email: { email: 'hello@example.com', subject: 'Inquiry', body: 'Hi, I would like to learn more.' },
  phone: { phone: '+1 234 567 8900' },
  wifi: { ssid: 'Office-WiFi', password: 'StrongPassword123', encryption: 'WPA', hidden: false },
};

export function App() {
  // Current active configuration
  const [config, setConfig] = useState<QRConfig>({
    type: 'url',
    data: INITIAL_DATA_MAP.url,
    size: 512,
    foreground: '#000000',
    background: '#FFFFFF',
    errorCorrection: 'M',
    margin: 3,
    logo: null,
  });

  // Track data for other types when switching tabs so user input isn't lost
  const [dataStore, setDataStore] = useState<QRDataMap>(INITIAL_DATA_MAP);

  // Field touched state for form validation
  const [touched, setTouched] = useState<Record<string, boolean>>({ url: true });

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent Recent QR History (max 20)
  const [recents, setRecents] = useLocalStorage<RecentQREntry[]>('qr_studio_recents', []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Validation
  const { isValid, errors } = useMemo(() => {
    return validateQRData(config.type, config.data);
  }, [config.type, config.data]);

  // Payload computation
  const payload = useMemo(() => {
    if (!isValid) return '';
    return generateQRPayload(config.type, config.data);
  }, [config.type, config.data, isValid]);

  // Reliability assessment
  const reliability = useMemo(() => {
    return evaluateScanReliability({
      foreground: config.foreground,
      background: config.background,
      margin: config.margin,
      errorCorrection: config.errorCorrection,
      hasLogo: Boolean(config.logo),
      logoSize: config.logoSize,
      payloadLength: payload.length,
    });
  }, [config.foreground, config.background, config.margin, config.errorCorrection, config.logo, config.logoSize, payload]);

  // Real-time QR renderer
  const { canvasRef, isGenerating, error } = useQRCode(config, payload);

  // Change QR Type
  const handleTypeChange = (newType: QRType) => {
    setConfig((prev) => ({
      ...prev,
      type: newType,
      data: dataStore[newType],
    }));
    setTouched({});
  };

  // Form field change
  const handleFormFieldChange = (field: string, value: unknown) => {
    setConfig((prev) => {
      const updatedData = { ...prev.data, [field]: value };
      setDataStore((ds) => ({ ...ds, [prev.type]: updatedData }));
      return { ...prev, data: updatedData };
    });
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Customization property change
  const handleConfigChange = <K extends keyof QRConfig>(key: K, value: QRConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Logo upload
  const handleLogoUpload = (dataUrl: string | null) => {
    setConfig((prev) => ({
      ...prev,
      logo: dataUrl,
    }));
    if (dataUrl) {
      showToast('Logo attached! Error correction elevated to High.', 'info');
    } else {
      showToast('Logo removed', 'info');
    }
  };

  // Apply Preset
  const handleSelectPreset = (preset: QRPreset) => {
    setConfig((prev) => ({
      ...prev,
      foreground: preset.foreground,
      background: preset.background,
      errorCorrection: preset.errorCorrection,
      margin: preset.margin,
    }));
    showToast(`Applied preset: ${preset.name}`, 'info');
  };

  // Helper to fingerprint a configuration for duplicate detection
  const getConfigFingerprint = useCallback((cfg: QRConfig, pld: string) => {
    return [
      cfg.type,
      pld,
      cfg.size,
      cfg.foreground,
      cfg.background,
      cfg.margin,
      cfg.errorCorrection,
      cfg.logo ? '1' : '0',
      cfg.logoSize ?? 20,
    ].join('::');
  }, []);

  // Save or update an entry in history without duplicate spam
  const saveToHistory = useCallback(
    (cfg: QRConfig, pld: string) => {
      if (!pld || !pld.trim()) return;
      const title = getQRSummaryTitle(cfg);
      const fingerprint = getConfigFingerprint(cfg, pld);

      setRecents((prev) => {
        const existingIndex = prev.findIndex(
          (item) => getConfigFingerprint(item.config, item.payload) === fingerprint
        );

        const newEntry: RecentQREntry = {
          id: existingIndex >= 0 ? prev[existingIndex].id : Date.now().toString(),
          timestamp: Date.now(),
          type: cfg.type,
          title,
          payload: pld,
          config: JSON.parse(JSON.stringify(cfg)),
        };

        if (existingIndex === 0) {
          const updated = [...prev];
          updated[0] = newEntry;
          return updated;
        }

        const filtered = existingIndex > 0 ? prev.filter((_, idx) => idx !== existingIndex) : prev;
        return [newEntry, ...filtered.slice(0, 19)];
      });
    },
    [getConfigFingerprint, setRecents]
  );

  // Auto-record to history when a valid QR settles for 2.5s
  useEffect(() => {
    if (!isValid || !payload || !payload.trim()) return;
    const timer = setTimeout(() => {
      saveToHistory(config, payload);
    }, 2500);

    return () => clearTimeout(timer);
  }, [config, payload, isValid, saveToHistory]);

  const handleRecordHistory = useCallback(() => {
    saveToHistory(config, payload);
  }, [config, payload, saveToHistory]);

  // Reuse history item
  const handleReuseHistory = (restoredConfig: QRConfig) => {
    setConfig(restoredConfig);
    setDataStore((ds) => ({
      ...ds,
      [restoredConfig.type]: restoredConfig.data,
    }));
    setTouched({ [restoredConfig.type]: true });
    showToast(`Restored "${getQRSummaryTitle(restoredConfig)}"`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete history item
  const handleDeleteHistory = (id: string) => {
    setRecents((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed from history', 'info');
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setRecents([]);
    showToast('History cleared', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Editor, Presets, Customization & Recents (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. QR Type Selection */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs space-y-5">
              <QRTypeSelector currentType={config.type} onChange={handleTypeChange} />

              {/* 2. Dynamic Input Form */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <QRForm
                  type={config.type}
                  data={config.data}
                  errors={errors}
                  touched={touched}
                  onChange={handleFormFieldChange}
                  onBlur={handleFieldBlur}
                />
              </div>
            </div>

            {/* 3. Design Presets */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
              <PresetSelector
                onSelectPreset={handleSelectPreset}
                currentForeground={config.foreground}
                currentBackground={config.background}
              />
            </div>

            {/* 4. Full Customization Panel */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
              <CustomizationPanel
                config={config}
                onChange={handleConfigChange}
                onLogoUpload={handleLogoUpload}
              />
            </div>

            {/* 5. Recent QR History */}
            <RecentQRs
              entries={recents}
              onReuse={handleReuseHistory}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
            />
          </div>

          {/* Right Column: Live Sticky Preview & Actions (5 cols) */}
          <div className="lg:col-span-5">
            <QRPreview
              canvasRef={canvasRef}
              config={config}
              payload={payload}
              isGenerating={isGenerating}
              error={error}
              isValid={isValid}
              reliability={reliability}
              onShowToast={showToast}
              onRecordHistory={handleRecordHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>QR Studio</strong> — All QR generation and customization runs 100% in your browser. No server storage or tracking.
          </p>
          <p className="flex items-center gap-3">
            <a
              href="https://github.com/trivedimilind1-ui/gdg-qr-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <span>MIT License</span>
          </p>
        </div>
      </footer>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
