"use client";

import { useState, useRef } from "react";

interface FaviconSize {
  size: number;
  label: string;
  url: string | null;
}

export default function FaviconGenerator() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [favicons, setFavicons] = useState<FaviconSize[]>([]);
  const [loading, setLoading] = useState(false);

  const sizes = [
    { size: 16, label: "16x16 (Standard)" },
    { size: 32, label: "32x32 (Standard)" },
    { size: 48, label: "48x48 (Windows)" },
    { size: 64, label: "64x64" },
    { size: 128, label: "128x128 (Chrome)" },
    { size: 180, label: "180x180 (Apple)" },
    { size: 192, label: "192x192 (Android)" },
    { size: 512, label: "512x512 (PWA)" },
  ];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setSourceImage(img);
      setPreviewUrl(img.src);
      generateFavicons(img);
    };
    img.src = URL.createObjectURL(file);
  };

  const generateFavicons = (img: HTMLImageElement) => {
    setLoading(true);
    const results: FaviconSize[] = sizes.map(({ size, label }) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return { size, label, url: null };
      ctx.drawImage(img, 0, 0, size, size);
      return { size, label, url: canvas.toDataURL("image/png") };
    });
    setFavicons(results);
    setLoading(false);
  };

  const downloadFavicon = (favicon: FaviconSize) => {
    if (!favicon.url) return;
    const a = document.createElement("a");
    a.href = favicon.url;
    a.download = `favicon-${favicon.size}x${favicon.size}.png`;
    a.click();
  };

  const downloadAll = () => {
    favicons.forEach((f) => {
      if (f.url) downloadFavicon(f);
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Upload Image</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
          Upload Image
        </button>
        {previewUrl && (
          <div className="mt-4">
            <img src={previewUrl} alt="Source" className="max-w-xs rounded border border-surface-200 dark:border-surface-700" />
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8 text-surface-500 dark:text-surface-400">
          Generating favicons...
        </div>
      )}

      {favicons.length > 0 && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Generated Favicons</h3>
            <button onClick={downloadAll} className="btn-primary">Download All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favicons.map((favicon) => (
              <div key={favicon.size} className="text-center rounded-lg border border-surface-200 dark:border-surface-700 p-4">
                <div className="flex items-center justify-center mb-2" style={{ minHeight: 64 }}>
                  {favicon.url && (
                    <img
                      src={favicon.url}
                      alt={favicon.label}
                      className="border border-surface-200 dark:border-surface-700"
                      style={{ width: Math.min(favicon.size, 64), height: Math.min(favicon.size, 64) }}
                    />
                  )}
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">{favicon.label}</p>
                <button onClick={() => downloadFavicon(favicon)} className="btn-secondary text-xs">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
