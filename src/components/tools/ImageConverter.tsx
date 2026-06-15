"use client";

import { useState, useRef } from "react";

export default function ImageConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [originalInfo, setOriginalInfo] = useState<{ width: number; height: number; size: number; type: string } | null>(null);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState(0.92);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setConvertedUrl(null);

    const img = new Image();
    img.onload = () => {
      setOriginalInfo({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
      });
    };
    img.src = url;
  };

  const convert = () => {
    if (!originalUrl) return;
    setLoading(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setConvertedUrl(URL.createObjectURL(blob));
          }
          setLoading(false);
        },
        outputFormat,
        outputFormat === "image/png" ? undefined : quality
      );
    };
    img.src = originalUrl;
  };

  const download = () => {
    if (!convertedUrl) return;
    const a = document.createElement("a");
    a.href = convertedUrl;
    const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/jpeg" ? "jpg" : "webp";
    a.download = `converted.${ext}`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMimeTypeLabel = (type: string) => {
    if (type === "image/png") return "PNG";
    if (type === "image/jpeg") return "JPEG";
    if (type === "image/webp") return "WebP";
    if (type === "image/gif") return "GIF";
    if (type === "image/svg+xml") return "SVG";
    return type;
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

        {originalInfo && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded border border-surface-200 dark:border-surface-700 p-3 text-center">
              <p className="text-xs text-surface-500 dark:text-surface-400">Dimensions</p>
              <p className="font-medium text-surface-900 dark:text-surface-100">{originalInfo.width} x {originalInfo.height}</p>
            </div>
            <div className="rounded border border-surface-200 dark:border-surface-700 p-3 text-center">
              <p className="text-xs text-surface-500 dark:text-surface-400">File Size</p>
              <p className="font-medium text-surface-900 dark:text-surface-100">{formatSize(originalInfo.size)}</p>
            </div>
            <div className="rounded border border-surface-200 dark:border-surface-700 p-3 text-center">
              <p className="text-xs text-surface-500 dark:text-surface-400">Type</p>
              <p className="font-medium text-surface-900 dark:text-surface-100">{getMimeTypeLabel(originalInfo.type)}</p>
            </div>
          </div>
        )}
      </div>

      {originalUrl && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Conversion Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as "image/png" | "image/jpeg" | "image/webp")}
                className="input-field"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            {outputFormat !== "image/png" && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Quality: {quality.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={convert} className="btn-primary" disabled={loading}>
              {loading ? "Converting..." : "Convert"}
            </button>
            {convertedUrl && (
              <button onClick={download} className="btn-secondary">Download</button>
            )}
          </div>
        </div>
      )}

      {originalUrl && convertedUrl && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Original</p>
              <img src={originalUrl} alt="Original" className="w-full rounded border border-surface-200 dark:border-surface-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Converted</p>
              <img src={convertedUrl} alt="Converted" className="w-full rounded border border-surface-200 dark:border-surface-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
