"use client";

import { useState, useRef, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  count: number;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function colorDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
  );
}

function extractColors(imageData: ImageData, k: number = 8): ExtractedColor[] {
  const pixels: { r: number; g: number; b: number }[] = [];
  const data = imageData.data;
  const step = Math.max(1, Math.floor(data.length / 4 / 10000));

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    pixels.push({ r, g, b });
  }

  if (pixels.length === 0) return [];

  // Initialize centroids by sampling evenly spaced pixels
  const centroids: { r: number; g: number; b: number }[] = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i / k) * pixels.length);
    centroids.push({ ...pixels[idx] });
  }

  // K-means iterations
  const maxIter = 15;
  const assignments = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign each pixel to nearest centroid
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let j = 0; j < k; j++) {
        const dist = colorDistance(pixels[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      if (assignments[i] !== minIdx) {
        changed = true;
        assignments[i] = minIdx;
      }
    }

    if (!changed) break;

    // Recompute centroids
    const sums = Array.from({ length: k }, () => ({
      r: 0,
      g: 0,
      b: 0,
      count: 0,
    }));
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      sums[c].r += pixels[i].r;
      sums[c].g += pixels[i].g;
      sums[c].b += pixels[i].b;
      sums[c].count++;
    }
    for (let j = 0; j < k; j++) {
      if (sums[j].count > 0) {
        centroids[j] = {
          r: Math.round(sums[j].r / sums[j].count),
          g: Math.round(sums[j].g / sums[j].count),
          b: Math.round(sums[j].b / sums[j].count),
        };
      }
    }
  }

  // Count assignments per centroid
  const counts = new Array(k).fill(0);
  for (const a of assignments) counts[a]++;

  const colors: ExtractedColor[] = centroids
    .map((c, i) => ({
      hex: rgbToHex(c.r, c.g, c.b),
      rgb: c,
      hsl: rgbToHsl(c.r, c.g, c.b),
      count: counts[i],
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return colors.slice(0, k);
}

export default function ColorPaletteExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [numColors, setNumColors] = useState(6);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImage(dataUrl);

        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const maxSize = 200;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const extracted = extractColors(imageData, numColors);
          setColors(extracted);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [numColors]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const downloadCss = () => {
    const css =
      ":root {\n" +
      colors
        .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
        .join("\n") +
      "\n}\n";
    const blob = new Blob([css as unknown as BlobPart], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTailwind = () => {
    const config =
      `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n` +
      colors
        .map((c, i) => `          '${i + 1}': '${c.hex}',`)
        .join("\n") +
      `\n        }\n      }\n    }\n  }\n}\n`;
    const blob = new Blob([config as unknown as BlobPart], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailwind-palette.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setImage(null);
    setColors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Image Upload / Preview */}
        <div className="flex-1 space-y-4">
          {!image ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500"
              }`}
            >
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-surface-600 dark:text-surface-300 font-medium">
                Drop an image here or click to upload
              </p>
              <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                PNG, JPG, WEBP, GIF
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={image}
                alt="Uploaded"
                className="w-full rounded-lg border border-surface-200 dark:border-surface-800 object-contain max-h-80"
              />
              <button
                onClick={clear}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                title="Clear and re-upload"
              >
                ✕
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <label className="text-sm text-surface-600 dark:text-surface-300">
              Colors to extract:
            </label>
            <select
              value={numColors}
              onChange={(e) => setNumColors(Number(e.target.value))}
              className="input-field !w-auto"
            >
              {[4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {image && (
              <button
                onClick={() => {
                  const img = new Image();
                  img.onload = () => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    const maxSize = 200;
                    const scale = Math.min(
                      maxSize / img.width,
                      maxSize / img.height,
                      1
                    );
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );
                    setColors(extractColors(imageData, numColors));
                  };
                  img.src = image;
                }}
                className="btn-secondary text-sm"
              >
                Re-extract
              </button>
            )}
          </div>
        </div>

        {/* Right: Palette Display */}
        <div className="flex-1 space-y-4">
          {colors.length > 0 ? (
            <>
              {/* Palette Strip */}
              <div className="flex rounded-lg overflow-hidden h-20 border border-surface-200 dark:border-surface-800">
                {colors.map((c) => (
                  <div
                    key={c.hex}
                    style={{ backgroundColor: c.hex, flex: c.count }}
                    className="relative group cursor-pointer transition-all hover:flex-[2]"
                    onClick={() => copyHex(c.hex)}
                    title={`Click to copy ${c.hex}`}
                  >
                    {copiedHex === c.hex && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold bg-black/50 text-white">
                        Copied!
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Color Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colors.map((c) => (
                  <div
                    key={c.hex}
                    className="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 cursor-pointer hover:border-surface-300 dark:hover:border-surface-600 transition-colors"
                    onClick={() => copyHex(c.hex)}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex-shrink-0 border border-surface-200 dark:border-surface-600"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-surface-800 dark:text-surface-100">
                          {c.hex.toUpperCase()}
                        </span>
                        <CopyButton text={c.hex} />
                      </div>
                      <div className="text-xs text-surface-500 dark:text-surface-400 font-mono mt-0.5">
                        RGB({c.rgb.r}, {c.rgb.g}, {c.rgb.b})
                      </div>
                      <div className="text-xs text-surface-500 dark:text-surface-400 font-mono">
                        HSL({c.hsl.h}, {c.hsl.s}%, {c.hsl.l}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <button onClick={downloadCss} className="btn-primary text-sm">
                  Download CSS Variables
                </button>
                <button
                  onClick={downloadTailwind}
                  className="btn-secondary text-sm"
                >
                  Download Tailwind Config
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-surface-400 dark:text-surface-500 border border-dashed border-surface-300 dark:border-surface-600 rounded-lg">
              <p>Upload an image to extract its color palette</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
