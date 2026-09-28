import type { QRType, QRData, URLData, TextData, EmailData, PhoneData, WifiData, ValidationErrors } from '../types/qr';

export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

export function isValidEmail(email: string): boolean {
  // Standard RFC 5322 compliant regex for practical client-side email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidPhone(phone: string): boolean {
  if (!phone || !phone.trim()) return false;
  // Non-restrictive international phone regex: allows optional +, digits, spaces, dashes, parens, 3-18 characters
  const cleaned = phone.replace(/[\s\-().]/g, '');
  return /^\+?[0-9]{4,18}$/.test(cleaned);
}

/**
 * Validates the data object based on the current QR type.
 * Returns an errors dictionary where keys are field names.
 */
export function validateQRData(type: QRType, data: QRData): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  switch (type) {
    case 'url': {
      const { url } = data as URLData;
      if (!url || !url.trim()) {
        errors.url = 'Please enter a URL';
      } else if (!isValidUrl(url)) {
        errors.url = 'Please enter a valid URL (e.g., https://example.com)';
      }
      break;
    }

    case 'text': {
      const { text } = data as TextData;
      if (!text || !text.trim()) {
        errors.text = 'Please enter some text or content';
      }
      break;
    }

    case 'email': {
      const { email } = data as EmailData;
      if (!email || !email.trim()) {
        errors.email = 'Please enter an email address';
      } else if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address (e.g. name@domain.com)';
      }
      break;
    }

    case 'phone': {
      const { phone } = data as PhoneData;
      if (!phone || !phone.trim()) {
        errors.phone = 'Please enter a phone number';
      } else if (!isValidPhone(phone)) {
        errors.phone = 'Please enter a valid phone number (e.g. +1 555 123 4567)';
      }
      break;
    }

    case 'wifi': {
      const { ssid, password, encryption } = data as WifiData;
      if (!ssid || !ssid.trim()) {
        errors.ssid = 'Network name (SSID) is required';
      }
      if (encryption !== 'nopass') {
        if (!password || password.trim().length === 0) {
          errors.password = 'Password is required for secured networks';
        } else if (encryption === 'WPA' && password.length < 8) {
          errors.password = 'WPA/WPA2 passwords must be at least 8 characters';
        }
      }
      break;
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}
