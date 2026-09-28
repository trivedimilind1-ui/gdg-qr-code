import type { ErrorCorrectionLevel, ReliabilityAssessment } from '../types/qr';

/**
 * Converts a 3 or 6-digit hex string to RGB components [0-255].
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const cleanHex = hex.trim().replace(/^#/, '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

/**
 * Calculates linearized relative luminance according to WCAG 2.1 specifications.
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes contrast ratio between two colors (ranging from 1:1 to 21:1).
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fgRgb = hexToRgb(fgHex) || [0, 0, 0];
  const bgRgb = hexToRgb(bgHex) || [255, 255, 255];

  const l1 = getLuminance(...fgRgb);
  const l2 = getLuminance(...bgRgb);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 10) / 10;
}

/**
 * Evaluates scan reliability based on contrast, margin, error correction, and logo.
 */
export function evaluateScanReliability(params: {
  foreground: string;
  background: string;
  margin: number;
  errorCorrection: ErrorCorrectionLevel;
  hasLogo?: boolean;
  payloadLength?: number;
}): ReliabilityAssessment {
  const { foreground, background, margin, errorCorrection, hasLogo, payloadLength = 0 } = params;

  const contrastRatio = calculateContrastRatio(foreground, background);
  const warnings: string[] = [];
  const tips: string[] = [];
  let score = 100;

  // Contrast check
  let contrastStatus: 'excellent' | 'good' | 'warning' = 'excellent';
  let contrastLabel = 'Excellent contrast';

  if (contrastRatio >= 7) {
    contrastStatus = 'excellent';
    contrastLabel = `Excellent contrast (${contrastRatio}:1)`;
  } else if (contrastRatio >= 3.5) {
    contrastStatus = 'good';
    contrastLabel = `Good contrast (${contrastRatio}:1)`;
    score -= 15;
  } else {
    contrastStatus = 'warning';
    contrastLabel = `Low contrast (${contrastRatio}:1)`;
    score -= 40;
    warnings.push('Low contrast may make this QR code difficult or impossible for cameras to scan.');
  }

  // Check inverted colors (light foreground on dark background)
  const fgRgb = hexToRgb(foreground) || [0, 0, 0];
  const bgRgb = hexToRgb(background) || [255, 255, 255];
  const fgLum = getLuminance(...fgRgb);
  const bgLum = getLuminance(...bgRgb);
  if (fgLum > bgLum) {
    tips.push('Inverted colors (light QR on dark background) are supported by most modern phones, but standard dark-on-light yields the highest scan rate across all devices.');
  }

  // Margin check
  if (margin < 1) {
    warnings.push('No quiet zone (margin = 0). Scanners need white space around the QR code to distinguish it from surrounding graphics.');
    score -= 25;
  } else if (margin < 2) {
    tips.push('Quiet zone is narrow. Increasing margin to at least 2 or 3 improves scan reliability.');
    score -= 10;
  }

  // Error correction and logo check
  if (hasLogo) {
    if (errorCorrection === 'L' || errorCorrection === 'M') {
      warnings.push(`Level ${errorCorrection} error correction with a center logo may obstruct reading. Quartile (Q ~25%) or High (H ~30%) is strongly recommended.`);
      score -= 25;
    } else {
      tips.push(`High error correction (${errorCorrection}) safely protects code data under the logo area.`);
    }
  }

  // High payload density
  if (payloadLength > 400 && errorCorrection === 'H') {
    tips.push('Large payload combined with High error correction creates dense modules. If scanning at a distance, consider Medium (M) or shortening text.');
  }

  score = Math.max(10, Math.min(100, score));

  let status: 'excellent' | 'good' | 'warning' = 'excellent';
  if (score >= 85 && warnings.length === 0) {
    status = 'excellent';
  } else if (score >= 60 && contrastStatus !== 'warning' && margin >= 1) {
    status = 'good';
  } else {
    status = 'warning';
  }

  return {
    status,
    score,
    contrastRatio,
    contrastLabel,
    contrastStatus,
    warnings,
    tips,
  };
}
