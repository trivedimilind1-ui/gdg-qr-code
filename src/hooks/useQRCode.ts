import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { QRConfig } from '../types/qr';

interface UseQRCodeReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isGenerating: boolean;
  error: string | null;
  dataUrl: string | null;
}

export function useQRCode(config: QRConfig, payload: string): UseQRCodeReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!payload || !payload.trim()) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    // Debounce generation by 100ms for smooth editing experience
    const timer = setTimeout(async () => {
      try {
        setIsGenerating(true);
        setError(null);
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Render at standard preview scale (e.g. 512px for crisp rendering regardless of export size)
        const renderSize = 512;
        canvas.width = renderSize;
        canvas.height = renderSize;

        await QRCode.toCanvas(canvas, payload, {
          width: renderSize,
          margin: config.margin,
          errorCorrectionLevel: config.errorCorrection,
          color: {
            dark: config.foreground,
            light: config.background,
          },
        });

        // Draw logo if present
        if (config.logo) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                if (isCancelled) return resolve();
                const logoRatio = (config.logoSize || 20) / 100;
                const logoSize = Math.round(renderSize * logoRatio);
                const x = (renderSize - logoSize) / 2;
                const y = (renderSize - logoSize) / 2;
                const padding = Math.max(4, Math.round(logoSize * 0.12));

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

                ctx.save();
                ctx.beginPath();
                ctx.roundRect(x, y, logoSize, logoSize, Math.round(logoSize * 0.14));
                ctx.clip();
                ctx.drawImage(img, x, y, logoSize, logoSize);
                ctx.restore();

                resolve();
              };
              img.onerror = () => reject(new Error('Failed to load logo'));
              img.src = config.logo!;
            });
          }
        }

        if (!isCancelled) {
          setDataUrl(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('QR rendering error:', err);
          setError(err instanceof Error ? err.message : 'Failed to generate QR code');
          setIsGenerating(false);
        }
      }
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    payload,
    config.size,
    config.foreground,
    config.background,
    config.errorCorrection,
    config.margin,
    config.logo,
    config.logoSize,
  ]);

  const activeDataUrl = payload && payload.trim() ? dataUrl : null;
  const activeError = payload && payload.trim() ? error : null;

  return { canvasRef, isGenerating: payload ? isGenerating : false, error: activeError, dataUrl: activeDataUrl };
}
