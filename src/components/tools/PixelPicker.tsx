"use client";

import { useState, useRef, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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

export default function PixelPicker() {
  const [pickerColor, setPickerColor] = useState("#3b82f6");
  const [image, setImage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<{
    hex: string;
    r: number;
    g: number;
    b: number;
    hsl: { h: number; s: number; l: number };
  } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [zoomData, setZoomData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickerRgb = (() => {
    const h = pickerColor.replace("#", "");
    if (h.length !== 6) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  })();

  const pickerHsl = pickerRgb
    ? rgbToHsl(pickerRgb.r, pickerRgb.g, pickerRgb.b)
    : null;

  const processImage = useCallback((file: File) => {
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
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const pickColor = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);

      setPickedColor({
        hex,
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        hsl,
      });
      setPickerColor(hex);

      // Generate zoom view
      const zoomSize = 11;
      const half = Math.floor(zoomSize / 2);
      const zoomCanvas = document.createElement("canvas");
      zoomCanvas.width = zoomSize;
      zoomCanvas.height = zoomSize;
      const zoomCtx = zoomCanvas.getContext("2d");
      if (!zoomCtx) return;

      const srcX = Math.max(0, x - half);
      const srcY = Math.max(0, y - half);
      const sw = Math.min(zoomSize, canvas.width - srcX);
      const sh = Math.min(zoomSize, canvas.height - srcY);

      zoomCtx.drawImage(canvas, srcX, srcY, sw, sh, 0, 0, sw, sh);

      // Scale up for display
      const displayCanvas = document.createElement("canvas");
      displayCanvas.width = zoomSize * 12;
      displayCanvas.height = zoomSize * 12;
      const displayCtx = displayCanvas.getContext("2d");
      if (!displayCtx) return;
      displayCtx.imageSmoothingEnabled = false;
      displayCtx.drawImage(zoomCanvas, 0, 0, zoomSize * 12, zoomSize * 12);

      // Draw crosshair
      const cx = half * 12 + 6;
      const cy = half * 12 + 6;
      displayCtx.strokeStyle = "white";
      displayCtx.lineWidth = 1;
      displayCtx.shadowColor = "black";
      displayCtx.shadowBlur = 2;
      displayCtx.beginPath();
      displayCtx.moveTo(cx - 8, cy);
      displayCtx.lineTo(cx + 8, cy);
      displayCtx.moveTo(cx, cy - 8);
      displayCtx.lineTo(cx, cy + 8);
      displayCtx.stroke();

      setZoomData(displayCanvas.toDataURL());
    },
    []
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      setCursorPos({ x, y });
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Color Picker */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Color Picker
              </label>
              <input
                type="color"
                value={pickerColor}
                onChange={(e) => setPickerColor(e.target.value)}
                className="w-full h-16 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-600"
              />
            </div>

            <div
              className="h-20 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center"
              style={{ backgroundColor: pickerColor }}
            >
              <span
                className="font-mono text-lg font-bold drop-shadow-lg"
                style={{
                  color:
                    pickerRgb &&
                    (0.299 * pickerRgb.r + 0.587 * pickerRgb.g + 0.114 * pickerRgb.b) > 128
                      ? "#000"
                      : "#fff",
                }}
              >
                {pickerColor.toUpperCase()}
              </span>
            </div>

            {pickerRgb && pickerHsl && (
              <div className="space-y-2">
                {[
                  { label: "HEX", value: pickerColor.toUpperCase() },
                  {
                    label: "RGB",
                    value: `rgb(${pickerRgb.r}, ${pickerRgb.g}, ${pickerRgb.b})`,
                  },
                  {
                    label: "HSL",
                    value: `hsl(${pickerHsl.h}, ${pickerHsl.s}%, ${pickerHsl.l}%)`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800"
                  >
                    <div>
                      <span className="text-xs font-medium text-surface-500 dark:text-surface-400 block">
                        {item.label}
                      </span>
                      <span className="font-mono text-sm text-surface-800 dark:text-surface-200">
                        {item.value}
                      </span>
                    </div>
                    <CopyButton text={item.value} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Eyedropper */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              Eyedropper - Pick from Image
            </h3>

            {!image ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500 transition-colors"
              >
                <p className="text-surface-600 dark:text-surface-300 font-medium">
                  Drop an image here or click to upload
                </p>
                <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                  PNG, JPG, WEBP, GIF
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg border border-surface-200 dark:border-surface-700 cursor-crosshair"
                  style={{ maxHeight: 300, objectFit: "contain" }}
                  onClick={pickColor}
                  onMouseMove={handleCanvasMouseMove}
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setImage(null);
                      setPickedColor(null);
                      setZoomData(null);
                      setCursorPos(null);
                      if (fileInputRef.current)
                        fileInputRef.current.value = "";
                    }}
                    className="btn-secondary text-sm"
                  >
                    Clear Image
                  </button>
                  {cursorPos && (
                    <span className="text-xs font-mono text-surface-500 dark:text-surface-400">
                      Position: ({cursorPos.x}, {cursorPos.y})
                    </span>
                  )}
                </div>
              </div>
            )}

            {!image && <canvas ref={canvasRef} className="hidden" />}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {zoomData && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                Zoomed View
              </h3>
              <img
                src={zoomData}
                alt="Zoomed pixel view"
                className="rounded-lg border border-surface-200 dark:border-surface-700 mx-auto"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}

          {pickedColor && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                Picked Color from Image
              </h3>
              <div
                className="h-16 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center"
                style={{ backgroundColor: pickedColor.hex }}
              >
                <span
                  className="font-mono text-sm font-bold drop-shadow-lg"
                  style={{
                    color:
                      0.299 * pickedColor.r +
                        0.587 * pickedColor.g +
                        0.114 * pickedColor.b >
                      128
                        ? "#000"
                        : "#fff",
                  }}
                >
                  {pickedColor.hex.toUpperCase()}
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "HEX", value: pickedColor.hex.toUpperCase() },
                  {
                    label: "RGB",
                    value: `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})`,
                  },
                  {
                    label: "HSL",
                    value: `hsl(${pickedColor.hsl.h}, ${pickedColor.hsl.s}%, ${pickedColor.hsl.l}%)`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-2 rounded border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800"
                  >
                    <div>
                      <span className="text-xs text-surface-500 dark:text-surface-400 mr-2">
                        {item.label}:
                      </span>
                      <span className="font-mono text-sm text-surface-800 dark:text-surface-200">
                        {item.value}
                      </span>
                    </div>
                    <CopyButton text={item.value} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
