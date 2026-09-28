import QRCode from 'qrcode';
import type { QRConfig } from '../types/qr';
import { generateQRPayload } from './qrPayload';

/**
 * Triggers a browser file download from a Blob or URL.
 */
function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an offscreen canvas with full QR code and optional logo at exact configured dimensions.
 */
export async function renderQRToCanvas(config: QRConfig): Promise<HTMLCanvasElement> {
  const payload = generateQRPayload(config.type, config.data);
  if (!payload) {
    throw new Error('No QR payload to render');
  }

  const canvas = document.createElement('canvas');
  canvas.width = config.size;
  canvas.height = config.size;

  await QRCode.toCanvas(canvas, payload, {
    width: config.size,
    margin: config.margin,
    errorCorrectionLevel: config.errorCorrection,
    color: {
      dark: config.foreground,
      light: config.background,
    },
  });

  // If a logo is present, draw it in the center with a backing badge
  if (config.logo) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Logo size based on user preference (10% to 25%, default 20%)
          const logoRatio = (config.logoSize || 20) / 100;
          const logoSize = Math.round(config.size * logoRatio);
          const x = (config.size - logoSize) / 2;
          const y = (config.size - logoSize) / 2;
          const padding = Math.max(4, Math.round(logoSize * 0.12));

          // Draw rounded backing circle/box in background color for clean separation
          ctx.save();
          ctx.fillStyle = config.background;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = Math.round(logoSize * 0.1);
          ctx.shadowOffsetY = 2;

          const radius = Math.round(logoSize * 0.18);
          const bgX = x - padding;
          const bgY = y - padding;
          const bgW = logoSize + padding * 2;
          const bgH = logoSize + padding * 2;

          ctx.beginPath();
          ctx.roundRect(bgX, bgY, bgW, bgH, radius);
          ctx.fill();
          ctx.restore();

          // Clip logo inside rounded rectangle
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, logoSize, logoSize, Math.round(logoSize * 0.14));
          ctx.clip();
          ctx.drawImage(img, x, y, logoSize, logoSize);
          ctx.restore();

          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load logo image'));
        img.src = config.logo!;
      });
    }
  }

  return canvas;
}

/**
 * Downloads the QR code as a high-resolution PNG.
 */
export async function downloadPNG(config: QRConfig, filename = 'qr-code.png'): Promise<void> {
  const canvas = await renderQRToCanvas(config);
  const dataUrl = canvas.toDataURL('image/png');
  triggerDownload(dataUrl, filename);
}

/**
 * Downloads the QR code as an SVG vector file, including logo and protective backing if enabled.
 */
export async function downloadSVG(config: QRConfig, filename = 'qr-code.svg'): Promise<void> {
  const payload = generateQRPayload(config.type, config.data);
  if (!payload) {
    throw new Error('No QR payload to render');
  }

  let svgString = await QRCode.toString(payload, {
    type: 'svg',
    width: config.size,
    margin: config.margin,
    errorCorrectionLevel: config.errorCorrection,
    color: {
      dark: config.foreground,
      light: config.background,
    },
  });

  // If a logo is present, embed it cleanly into the SVG vector graphics
  if (config.logo) {
    const viewBoxMatch = svgString.match(/viewBox="0 0 (\d+(\.\d+)?) (\d+(\.\d+)?)"/);
    if (viewBoxMatch) {
      const vbW = parseFloat(viewBoxMatch[1]);
      const vbH = parseFloat(viewBoxMatch[3]);
      const logoRatio = (config.logoSize || 20) / 100;
      const logoSize = Math.round(vbW * logoRatio * 10) / 10;
      const padding = Math.max(0.4, Math.round(logoSize * 0.12 * 10) / 10);
      const bgW = Math.round((logoSize + padding * 2) * 10) / 10;
      const bgH = Math.round((logoSize + padding * 2) * 10) / 10;
      const x = Math.round(((vbW - logoSize) / 2) * 10) / 10;
      const y = Math.round(((vbH - logoSize) / 2) * 10) / 10;
      const bgX = Math.round(((vbW - bgW) / 2) * 10) / 10;
      const bgY = Math.round(((vbH - bgH) / 2) * 10) / 10;
      const radius = Math.round(logoSize * 0.18 * 10) / 10;

      const logoSvgGroup = `  <rect x="${bgX}" y="${bgY}" width="${bgW}" height="${bgH}" rx="${radius}" fill="${config.background}" />\n  <image href="${config.logo}" x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />\n</svg>`;
      svgString = svgString.replace(/<\/svg>\s*$/, logoSvgGroup);
    }
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies the QR code image directly to the system clipboard.
 */
export async function copyQRToClipboard(config: QRConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      return { success: false, message: 'Clipboard image copying is not supported in this browser' };
    }

    const canvas = await renderQRToCanvas(config);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (!blob) {
      return { success: false, message: 'Could not generate image blob for clipboard' };
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);

    return { success: true, message: 'QR code copied to clipboard!' };
  } catch (err) {
    console.error('Clipboard copy error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to copy QR code to clipboard',
    };
  }
}
