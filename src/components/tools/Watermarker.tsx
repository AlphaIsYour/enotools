"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Position = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";

const positions: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "center-left", label: "Center Left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

export default function Watermarker() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<Position>("center");
  const [rotation, setRotation] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageUrl(img.src);
      setResultUrl(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const getPositionCoords = useCallback((canvasW: number, canvasH: number): { x: number; y: number; align: CanvasTextAlign; baseline: CanvasTextBaseline } => {
    const padding = Math.min(canvasW, canvasH) * 0.05;
    switch (position) {
      case "top-left": return { x: padding, y: padding + fontSize, align: "left", baseline: "top" };
      case "top-center": return { x: canvasW / 2, y: padding + fontSize, align: "center", baseline: "top" };
      case "top-right": return { x: canvasW - padding, y: padding + fontSize, align: "right", baseline: "top" };
      case "center-left": return { x: padding, y: canvasH / 2, align: "left", baseline: "middle" };
      case "center": return { x: canvasW / 2, y: canvasH / 2, align: "center", baseline: "middle" };
      case "center-right": return { x: canvasW - padding, y: canvasH / 2, align: "right", baseline: "middle" };
      case "bottom-left": return { x: padding, y: canvasH - padding, align: "left", baseline: "bottom" };
      case "bottom-center": return { x: canvasW / 2, y: canvasH - padding, align: "center", baseline: "bottom" };
      case "bottom-right": return { x: canvasW - padding, y: canvasH - padding, align: "right", baseline: "bottom" };
    }
  }, [position, fontSize]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    // Watermark
    ctx.save();
    const coords = getPositionCoords(image.width, image.height);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = coords.align;
    ctx.textBaseline = coords.baseline as CanvasTextBaseline;

    if (rotation !== 0) {
      ctx.translate(coords.x, coords.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
    } else {
      ctx.fillText(text, coords.x, coords.y);
    }
    ctx.restore();
  }, [image, text, fontSize, color, opacity, position, rotation, getPositionCoords]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const applyWatermark = () => {
    renderCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setResultUrl(canvas.toDataURL("image/png"));
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "watermarked.png";
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
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Watermark Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="input-field"
                min={8}
                max={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Opacity: {opacity.toFixed(2)}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Position grid */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Position</label>
            <div className="grid grid-cols-3 gap-2 max-w-xs">
              {positions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setPosition(pos.value)}
                  className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                    position === pos.value
                      ? "bg-primary-500 text-white border-primary-500"
                      : "border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:border-primary-400"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={applyWatermark} className="btn-primary">Apply Watermark</button>
            {resultUrl && (
              <button onClick={download} className="btn-secondary">Download</button>
            )}
          </div>
        </div>
      )}

      {image && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Preview</h3>
          <canvas
            ref={canvasRef}
            className="max-w-full rounded border border-surface-200 dark:border-surface-700"
            style={{ maxHeight: 500 }}
          />
        </div>
      )}
    </div>
  );
}
