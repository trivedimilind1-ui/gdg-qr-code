export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface URLData {
  url: string;
}

export interface TextData {
  text: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface PhoneData {
  phone: string;
}

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface QRDataMap {
  url: URLData;
  text: TextData;
  email: EmailData;
  phone: PhoneData;
  wifi: WifiData;
}

export type QRData = URLData | TextData | EmailData | PhoneData | WifiData;

export interface QRConfig {
  type: QRType;
  data: QRData;
  size: number;
  foreground: string;
  background: string;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
  logo?: string | null;
}

export interface QRPreset {
  id: string;
  name: string;
  description: string;
  foreground: string;
  background: string;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
  tag?: string;
}

export interface RecentQREntry {
  id: string;
  timestamp: number;
  type: QRType;
  title: string;
  payload: string;
  config: QRConfig;
}

export interface ReliabilityAssessment {
  status: 'excellent' | 'good' | 'warning';
  score: number;
  contrastRatio: number;
  contrastLabel: string;
  contrastStatus: 'excellent' | 'good' | 'warning';
  warnings: string[];
  tips: string[];
}

export type ValidationErrors = Record<string, string | undefined>;

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
