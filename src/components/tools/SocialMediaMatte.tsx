"use client";

import { useState, useRef, useCallback } from "react";

interface AspectOption {
  label: string;
  ratio: number;
}

const ASPECT_RATIOS: AspectOption[] = [
  { label: "1:1", ratio: 1 },
  { label: "4:5", ratio: 4 / 5 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
];

export default function SocialMediaMatte() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [matteColor, setMatteColor] = useState("#f5f5f5");
  const [padding, setPadding] = useState(50);
  const [selectedAspect, setSelectedAspect] = useState<AspectOption>(ASPECT_RATIOS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
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

  const applyMatte = useCallback(() => {
    const img = imageRef.current;
    const srcCanvas = sourceCanvasRef.current;
    const outCanvas = outputCanvasRef.current;
    if (!img || !srcCanvas || !outCanvas) return;

    setLoading(true);
    requestAnimationFrame(() => {
      const aspect = selectedAspect.ratio;
      const p = padding * 2;

      // Determine output dimensions based on aspect ratio
      // We'll scale so the image + padding fits the aspect ratio
      const imgW = img.width;
      const imgH = img.height;
      const contentW = imgW + p;
      const contentH = imgH + p;

      let outW: number;
      let outH: number;

      if (contentW / contentH > aspect) {
        // Content is wider than aspect - height determines
        outH = contentH;
        outW = Math.round(outH * aspect);
      } else {
        // Content is taller than aspect - width determines
        outW = contentW;
        outH = Math.round(outW / aspect);
      }

      outCanvas.width = outW;
      outCanvas.height = outH;
      const ctx = outCanvas.getContext("2d")!;

      // Fill with matte color
      ctx.fillStyle = matteColor;
      ctx.fillRect(0, 0, outW, outH);

      // Center the image
      const drawX = Math.round((outW - imgW) / 2);
      const drawY = Math.round((outH - imgH) / 2);
      ctx.drawImage(srcCanvas, drawX, drawY);

      setResult(outCanvas.toDataURL("image/png"));
      setLoading(false);
    });
  }, [matteColor, padding, selectedAspect]);

  const downloadResult = () => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;
    applyMatte();
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `matted-${selectedAspect.label.replace(":", "x")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, 100);
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
              Matte Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={matteColor}
                onChange={(e) => setMatteColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-surface-500">{matteColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Padding: {padding}px
            </label>
            <input
              type="range"
              min={0}
              max={200}
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setSelectedAspect(option)}
                  className={
                    selectedAspect.label === option.label
                      ? "btn-primary text-sm"
                      : "btn-secondary text-sm"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={applyMatte}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Processing..." : "Apply Matte"}
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
                Preview
              </h3>
              {result ? (
                <img src={result} alt="Result" className="w-full rounded border" />
              ) : (
                <div className="flex items-center justify-center h-48 text-surface-400 rounded border border-dashed">
                  Click &quot;Apply Matte&quot; to see preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <button onClick={downloadResult} className="btn-primary">
          Download Matted Image
        </button>
      )}

      <canvas ref={sourceCanvasRef} className="hidden" />
      <canvas ref={outputCanvasRef} className="hidden" />
    </div>
  );
}
