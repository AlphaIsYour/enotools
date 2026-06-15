"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function ImageClipper() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(100);
  const [cropH, setCropH] = useState(100);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    const maxDisplayW = 600;
    const scale = Math.min(1, maxDisplayW / image.width);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.dataset.scale = String(scale);
  }, [image]);

  const drawOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    const ctx = overlay?.getContext("2d");
    const scale = Number(canvasRef.current?.dataset.scale || 1);
    if (!overlay || !ctx || !image) return;

    overlay.width = image.width * scale;
    overlay.height = image.height * scale;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Darken outside crop area
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, overlay.width, overlay.height);

    // Clear crop area
    const x = cropX * scale;
    const y = cropY * scale;
    const w = cropW * scale;
    const h = cropH * scale;
    ctx.clearRect(x, y, w, h);

    // Crop border
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }, [image, cropX, cropY, cropW, cropH]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageUrl(img.src);
      setCropX(0);
      setCropY(0);
      setCropW(img.width);
      setCropH(img.height);
      setPreviewUrl(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = Number(canvas.dataset.scale || 1);
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDragging(true);
    setDragStart(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !image) return;
    const coords = getCanvasCoords(e);
    const x = Math.max(0, Math.min(dragStart.x, coords.x));
    const y = Math.max(0, Math.min(dragStart.y, coords.y));
    const w = Math.min(Math.abs(coords.x - dragStart.x), image.width - x);
    const h = Math.min(Math.abs(coords.y - dragStart.y), image.height - y);
    setCropX(Math.round(x));
    setCropY(Math.round(y));
    setCropW(Math.round(w));
    setCropH(Math.round(h));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const crop = () => {
    if (!image || cropW <= 0 || cropH <= 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    setPreviewUrl(canvas.toDataURL("image/png"));
  };

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `cropped-${cropW}x${cropH}.png`;
    a.click();
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
      </div>

      {image && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Crop Area</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">X</label>
              <input type="number" value={cropX} onChange={(e) => setCropX(Number(e.target.value))} className="input-field" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Y</label>
              <input type="number" value={cropY} onChange={(e) => setCropY(Number(e.target.value))} className="input-field" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Width</label>
              <input type="number" value={cropW} onChange={(e) => setCropW(Number(e.target.value))} className="input-field" min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Height</label>
              <input type="number" value={cropH} onChange={(e) => setCropH(Number(e.target.value))} className="input-field" min={1} />
            </div>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
            Drag on the image to select a crop area, or enter coordinates manually.
          </p>
          <div className="relative inline-block">
            <canvas ref={canvasRef} className="block" />
            <canvas
              ref={overlayCanvasRef}
              className="absolute top-0 left-0 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={crop} className="btn-primary">Crop</button>
            {previewUrl && (
              <button onClick={download} className="btn-secondary">Download</button>
            )}
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Cropped Result</h3>
          <img src={previewUrl} alt="Cropped" className="max-w-full rounded border border-surface-200 dark:border-surface-700" />
        </div>
      )}
    </div>
  );
}
