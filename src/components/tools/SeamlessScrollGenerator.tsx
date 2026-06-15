"use client";

import { useState, useRef, useCallback } from "react";

export default function SeamlessScrollGenerator() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tileMode, setTileMode] = useState<"horizontal" | "vertical" | "both">("both");
  const [offset, setOffset] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setOriginal(ev.target?.result as string);
        setResult(null);
        const canvas = sourceCanvasRef.current;
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

  const generateTile = useCallback(() => {
    const img = imageRef.current;
    const srcCanvas = sourceCanvasRef.current;
    const dstCanvas = resultCanvasRef.current;
    if (!img || !srcCanvas || !dstCanvas) return;

    setLoading(true);
    requestAnimationFrame(() => {
      const w = img.width;
      const h = img.height;
      const ctx = srcCanvas.getContext("2d")!;
      const dstCtx = dstCanvas.getContext("2d")!;

      // Create a canvas double the size for wrapping
      dstCanvas.width = w;
      dstCanvas.height = h;

      const srcData = ctx.getImageData(0, 0, w, h);
      const dstData = dstCtx.createImageData(w, h);
      const src = srcData.data;
      const dst = dstData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let sx = x;
          let sy = y;

          if (tileMode === "horizontal" || tileMode === "both") {
            sx = (x + offset) % w;
          }
          if (tileMode === "vertical" || tileMode === "both") {
            sy = (y + offset) % h;
          }

          const dstIdx = (y * w + x) * 4;
          const srcIdx = (sy * w + sx) * 4;

          dst[dstIdx] = src[srcIdx];
          dst[dstIdx + 1] = src[srcIdx + 1];
          dst[dstIdx + 2] = src[srcIdx + 2];
          dst[dstIdx + 3] = src[srcIdx + 3];
        }
      }

      // Blend edges for seamless transition
      const blendWidth = Math.max(1, Math.floor(Math.min(w, h) * 0.1));

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          let alphaX = 1;
          let alphaY = 1;

          if (tileMode === "horizontal" || tileMode === "both") {
            if (x < blendWidth) {
              alphaX = x / blendWidth;
            } else if (x >= w - blendWidth) {
              alphaX = (w - 1 - x) / blendWidth;
            }
          }

          if (tileMode === "vertical" || tileMode === "both") {
            if (y < blendWidth) {
              alphaY = y / blendWidth;
            } else if (y >= h - blendWidth) {
              alphaY = (h - 1 - y) / blendWidth;
            }
          }

          const alpha = Math.min(alphaX, alphaY);
          if (alpha < 1) {
            // Blend with the wrapped pixel
            let bx = (x + w - offset) % w;
            let by = (y + h - offset) % h;
            const blendIdx = (by * w + bx) * 4;

            dst[idx] = Math.round(dst[idx] * alpha + src[blendIdx] * (1 - alpha));
            dst[idx + 1] = Math.round(dst[idx + 1] * alpha + src[blendIdx + 1] * (1 - alpha));
            dst[idx + 2] = Math.round(dst[idx + 2] * alpha + src[blendIdx + 2] * (1 - alpha));
          }
        }
      }

      dstCtx.putImageData(dstData, 0, 0);
      setResult(dstCanvas.toDataURL("image/png"));
      setLoading(false);
    });
  }, [tileMode, offset]);

  const downloadResult = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "seamless-tile.png";
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
              Tile Mode
            </label>
            <div className="flex gap-2">
              {(["horizontal", "vertical", "both"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTileMode(mode)}
                  className={tileMode === mode ? "btn-primary" : "btn-secondary"}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Offset: {offset}px
            </label>
            <input
              type="range"
              min={0}
              max={200}
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={generateTile}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Generating..." : "Generate Seamless Tile"}
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
              <img src={original} alt="Original" className="w-full rounded border" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Tiled Preview
              </h3>
              {result ? (
                <div
                  className="w-full h-64 rounded border overflow-hidden"
                  style={{
                    backgroundImage: `url(${result})`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "128px 128px",
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-surface-400 rounded border border-dashed">
                  Click &quot;Generate Seamless Tile&quot; to see preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <button onClick={downloadResult} className="btn-primary">
          Download Tile Image
        </button>
      )}

      <canvas ref={sourceCanvasRef} className="hidden" />
      <canvas ref={resultCanvasRef} className="hidden" />
    </div>
  );
}
