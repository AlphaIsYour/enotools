"use client";

import { useState, useRef, useCallback } from "react";

export default function BackgroundRemover() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(30);
  const [targetColor, setTargetColor] = useState("#ffffff");
  const [edgeSmoothing, setEdgeSmoothing] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        const dataUrl = ev.target?.result as string;
        setOriginal(dataUrl);
        setResult(null);

        const canvas = originalCanvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0);
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processImage = useCallback(() => {
    const img = imageRef.current;
    const srcCanvas = originalCanvasRef.current;
    const dstCanvas = resultCanvasRef.current;
    if (!img || !srcCanvas || !dstCanvas) return;

    setLoading(true);
    requestAnimationFrame(() => {
      dstCanvas.width = img.width;
      dstCanvas.height = img.height;
      const ctx = srcCanvas.getContext("2d")!;
      const dstCtx = dstCanvas.getContext("2d")!;

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      const target = hexToRgb(targetColor);
      const thresh = threshold * 2.55;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - target.r;
        const dg = data[i + 1] - target.g;
        const db = data[i + 2] - target.b;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);

        if (distance < thresh) {
          data[i + 3] = 0;
        } else if (edgeSmoothing && distance < thresh * 1.5) {
          const alpha = Math.round(
            ((distance - thresh) / (thresh * 0.5)) * 255
          );
          data[i + 3] = Math.min(data[i + 3], alpha);
        }
      }

      dstCtx.putImageData(imageData, 0, 0);
      setResult(dstCanvas.toDataURL("image/png"));
      setLoading(false);
    });
  }, [threshold, targetColor, edgeSmoothing]);

  const downloadResult = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "background-removed.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary w-full"
        >
          Upload Image
        </button>
      </div>

      {original && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Threshold: {threshold}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Target Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={targetColor}
                onChange={(e) => setTargetColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-surface-500">{targetColor}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edgeSmoothing"
              checked={edgeSmoothing}
              onChange={(e) => setEdgeSmoothing(e.target.checked)}
              className="rounded"
            />
            <label
              htmlFor="edgeSmoothing"
              className="text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Edge Smoothing
            </label>
          </div>

          <button
            onClick={processImage}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Processing..." : "Remove Background"}
          </button>
        </div>
      )}

      {original && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Original
              </h3>
              <div
                className="rounded overflow-hidden"
                style={{
                  background:
                    "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 20px 20px",
                }}
              >
                <img src={original} alt="Original" className="w-full block" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Result
              </h3>
              <div
                className="rounded overflow-hidden"
                style={{
                  background:
                    "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 20px 20px",
                }}
              >
                {result ? (
                  <img src={result} alt="Result" className="w-full block" />
                ) : (
                  <div className="flex items-center justify-center h-48 text-surface-400">
                    Click &quot;Remove Background&quot; to see result
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <button onClick={downloadResult} className="btn-primary">
          Download PNG with Transparency
        </button>
      )}

      <canvas ref={originalCanvasRef} className="hidden" />
      <canvas ref={resultCanvasRef} className="hidden" />
    </div>
  );
}
