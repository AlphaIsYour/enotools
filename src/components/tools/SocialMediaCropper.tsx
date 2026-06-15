"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Preset {
  name: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { name: "Instagram Square", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "Twitter Post", width: 1200, height: 675 },
  { name: "Twitter Header", width: 1500, height: 500 },
  { name: "Facebook Cover", width: 820, height: 312 },
  { name: "LinkedIn Post", width: 1200, height: 627 },
];

export default function SocialMediaCropper() {
  const [original, setOriginal] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
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
        setImageSize({ w: img.width, h: img.height });
        setOriginal(ev.target?.result as string);

        const canvas = sourceCanvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0);
        }

        // Initialize crop area centered
        const aspect = selectedPreset.width / selectedPreset.height;
        let cropW = img.width;
        let cropH = Math.round(cropW / aspect);
        if (cropH > img.height) {
          cropH = img.height;
          cropW = Math.round(cropH * aspect);
        }
        setCropArea({
          x: Math.round((img.width - cropW) / 2),
          y: Math.round((img.height - cropH) / 2),
          w: cropW,
          h: cropH,
        });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    if (!imageRef.current) return;
    const img = imageRef.current;
    const aspect = preset.width / preset.height;
    let cropW = img.width;
    let cropH = Math.round(cropW / aspect);
    if (cropH > img.height) {
      cropH = img.height;
      cropW = Math.round(cropH * aspect);
    }
    setCropArea({
      x: Math.round((img.width - cropW) / 2),
      y: Math.round((img.height - cropH) / 2),
      w: cropW,
      h: cropH,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!displayRef.current) return;
    const rect = displayRef.current.getBoundingClientRect();
    const scaleX = imageSize.w / rect.width;
    const scaleY = imageSize.h / rect.height;
    setDragStart({
      x: (e.clientX - rect.left) * scaleX - cropArea.x,
      y: (e.clientY - rect.top) * scaleY - cropArea.y,
    });
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !displayRef.current) return;
      const rect = displayRef.current.getBoundingClientRect();
      const scaleX = imageSize.w / rect.width;
      const scaleY = imageSize.h / rect.height;

      let newX = (e.clientX - rect.left) * scaleX - dragStart.x;
      let newY = (e.clientY - rect.top) * scaleY - dragStart.y;

      newX = Math.max(0, Math.min(newX, imageSize.w - cropArea.w));
      newY = Math.max(0, Math.min(newY, imageSize.h - cropArea.h));

      setCropArea((prev) => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
    },
    [isDragging, dragStart, imageSize, cropArea.w, cropArea.h]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const cropImage = useCallback(() => {
    const img = imageRef.current;
    const srcCanvas = sourceCanvasRef.current;
    const outCanvas = outputCanvasRef.current;
    if (!img || !srcCanvas || !outCanvas) return;

    setLoading(true);
    requestAnimationFrame(() => {
      outCanvas.width = selectedPreset.width;
      outCanvas.height = selectedPreset.height;
      const ctx = outCanvas.getContext("2d")!;
      ctx.drawImage(
        srcCanvas,
        cropArea.x,
        cropArea.y,
        cropArea.w,
        cropArea.h,
        0,
        0,
        selectedPreset.width,
        selectedPreset.height
      );
      setLoading(false);
    });
  }, [cropArea, selectedPreset]);

  const downloadResult = () => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;
    cropImage();
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `${selectedPreset.name.toLowerCase().replace(/\s+/g, "-")}.png`;
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
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Social Media Preset
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => selectPreset(preset)}
                className={
                  selectedPreset.name === preset.name
                    ? "btn-primary text-sm"
                    : "btn-secondary text-sm"
                }
              >
                {preset.name}
                <span className="block text-xs opacity-70">
                  {preset.width}x{preset.height}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {original && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Crop Area (drag to reposition)
          </h3>
          <div
            ref={displayRef}
            className="relative w-full overflow-hidden rounded border cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <img
              src={original}
              alt="Original"
              className="w-full block"
              draggable={false}
            />
            {/* Dark overlay outside crop area */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top */}
              <div
                className="absolute left-0 right-0 top-0 bg-black/50"
                style={{
                  height: `${(cropArea.y / imageSize.h) * 100}%`,
                }}
              />
              {/* Bottom */}
              <div
                className="absolute left-0 right-0 bottom-0 bg-black/50"
                style={{
                  height: `${((imageSize.h - cropArea.y - cropArea.h) / imageSize.h) * 100}%`,
                }}
              />
              {/* Left */}
              <div
                className="absolute left-0 bg-black/50"
                style={{
                  top: `${(cropArea.y / imageSize.h) * 100}%`,
                  height: `${(cropArea.h / imageSize.h) * 100}%`,
                  width: `${(cropArea.x / imageSize.w) * 100}%`,
                }}
              />
              {/* Right */}
              <div
                className="absolute right-0 bg-black/50"
                style={{
                  top: `${(cropArea.y / imageSize.h) * 100}%`,
                  height: `${(cropArea.h / imageSize.h) * 100}%`,
                  width: `${((imageSize.w - cropArea.x - cropArea.w) / imageSize.w) * 100}%`,
                }}
              />
              {/* Crop border */}
              <div
                className="absolute border-2 border-white"
                style={{
                  left: `${(cropArea.x / imageSize.w) * 100}%`,
                  top: `${(cropArea.y / imageSize.h) * 100}%`,
                  width: `${(cropArea.w / imageSize.w) * 100}%`,
                  height: `${(cropArea.h / imageSize.h) * 100}%`,
                }}
              />
            </div>
          </div>
          <p className="text-xs text-surface-500 mt-2">
            Crop: {cropArea.x}, {cropArea.y} - {cropArea.w}x{cropArea.h}px
          </p>
        </div>
      )}

      {original && (
        <button onClick={downloadResult} disabled={loading} className="btn-primary">
          {loading ? "Processing..." : `Download ${selectedPreset.name} Crop`}
        </button>
      )}

      <canvas ref={sourceCanvasRef} className="hidden" />
      <canvas ref={outputCanvasRef} className="hidden" />
    </div>
  );
}
