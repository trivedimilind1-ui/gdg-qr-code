import type {
  QRConfig,
  QRType,
  URLData,
  TextData,
  EmailData,
  PhoneData,
  WifiData,
} from '../types/qr';

/**
 * Escapes characters for Wi-Fi QR strings (WIFI spec requires escaping \ , ; : ")
 */
function escapeWifi(str: string): string {
  return str.replace(/([\\;,:"\\])/g, '\\$1');
}

/**
 * Normalizes a URL input string consistently across the application:
 * - Trims whitespace
 * - Prepends https:// if no scheme is specified (e.g. "google.com" -> "https://google.com")
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Generates the QR code payload string based on type and input data.
 */
export function generateQRPayload(type: QRType, data: unknown): string {
  if (!data) return '';

  switch (type) {
    case 'url': {
      const { url } = data as URLData;
      if (!url || !url.trim()) return '';
      return normalizeUrl(url);
    }

    case 'text': {
      const { text } = data as TextData;
      return text || '';
    }

    case 'email': {
      const { email, subject, body } = data as EmailData;
      if (!email || !email.trim()) return '';
      const params = new URLSearchParams();
      if (subject && subject.trim()) params.append('subject', subject.trim());
      if (body && body.trim()) params.append('body', body.trim());

      const query = params.toString();
      return `mailto:${email.trim()}${query ? `?${query}` : ''}`;
    }

    case 'phone': {
      const { phone } = data as PhoneData;
      if (!phone || !phone.trim()) return '';
      const cleaned = phone.trim().replace(/\s+/g, '');
      return `tel:${cleaned}`;
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = data as WifiData;
      if (!ssid || !ssid.trim()) return '';

      const encType = encryption === 'nopass' ? 'nopass' : encryption;
      const escapedSSID = escapeWifi(ssid.trim());
      const escapedPass = encryption !== 'nopass' && password ? escapeWifi(password) : '';
      const isHidden = hidden ? 'true' : 'false';

      return `WIFI:T:${encType};S:${escapedSSID};P:${escapedPass};H:${isHidden};;`;
    }

    default:
      return '';
  }
}

/**
 * Generates a short, human-friendly summary title for the QR config.
 */
export function getQRSummaryTitle(config: QRConfig): string {
  const { type, data } = config;
  switch (type) {
    case 'url': {
      const d = data as URLData;
      try {
        const u = new URL(normalizeUrl(d.url));
        return u.hostname + (u.pathname !== '/' ? u.pathname : '');
      } catch {
        return d.url || 'Web link';
      }
    }
    case 'text': {
      const d = data as TextData;
      const snippet = d.text.trim().slice(0, 32);
      return snippet ? (d.text.length > 32 ? `${snippet}...` : snippet) : 'Plain text';
    }
    case 'email': {
      const d = data as EmailData;
      return d.email ? `Email: ${d.email}` : 'Email message';
    }
    case 'phone': {
      const d = data as PhoneData;
      return d.phone ? `Call: ${d.phone}` : 'Phone call';
    }
    case 'wifi': {
      const d = data as WifiData;
      return d.ssid ? `Wi-Fi: ${d.ssid}` : 'Wi-Fi Network';
    }
    default:
      return 'QR Code';
  }
}
