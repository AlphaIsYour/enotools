"use client";

import { useState, useRef } from "react";

export default function PlaceholderGenerator() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [textColor, setTextColor] = useState("#666666");
  const [customText, setCustomText] = useState("");
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Text
    const text = customText || `${width}x${height}`;
    const fontSize = Math.min(width, height) / 8;
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);

    const url = canvas.toDataURL(format);
    setPreviewUrl(url);
  };

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    a.download = `placeholder-${width}x${height}.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="input-field"
              min={1}
              max={2000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="input-field"
              min={1}
              max={2000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="input-field flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="input-field flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Custom Text (optional)</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="WIDTHxHEIGHT"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as "image/png" | "image/jpeg" | "image/webp")}
              className="input-field"
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={generate} className="btn-primary">Generate</button>
          {previewUrl && (
            <button onClick={download} className="btn-secondary">Download</button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {previewUrl && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Preview</h3>
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt="Placeholder preview"
              className="max-w-full border border-surface-200 dark:border-surface-700 rounded"
              style={{ maxWidth: Math.min(width, 600) }}
            />
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center mt-2">
            {width} x {height} px
          </p>
        </div>
      )}
    </div>
  );
}
