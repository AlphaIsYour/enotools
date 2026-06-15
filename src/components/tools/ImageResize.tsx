"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Maximize2, Loader2, Lock, Unlock } from "lucide-react";

export default function ImageResize() {
  const [image, setImage] = useState<string | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [percentage, setPercentage] = useState(100);
  const [usePercentage, setUsePercentage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError("");
    setResizedImage(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImage(dataUrl);

      const img = new window.Image();
      img.onload = () => {
        setOriginalDims({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
        setPercentage(100);
        originalImgRef.current = img;
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleWidthChange = useCallback(
    (val: number) => {
      setWidth(val);
      if (lockAspect && originalDims.width > 0) {
        setHeight(Math.round((val / originalDims.width) * originalDims.height));
      }
    },
    [lockAspect, originalDims]
  );

  const handleHeightChange = useCallback(
    (val: number) => {
      setHeight(val);
      if (lockAspect && originalDims.height > 0) {
        setWidth(Math.round((val / originalDims.height) * originalDims.width));
      }
    },
    [lockAspect, originalDims]
  );

  const handlePercentageChange = useCallback(
    (val: number) => {
      setPercentage(val);
      setWidth(Math.round((val / 100) * originalDims.width));
      setHeight(Math.round((val / 100) * originalDims.height));
    },
    [originalDims]
  );

  const resize = useCallback(() => {
    if (!originalImgRef.current || width <= 0 || height <= 0) return;
    setIsProcessing(true);
    setError("");

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(originalImgRef.current, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Failed to resize image.");
            setIsProcessing(false);
            return;
          }
          if (resizedImage) URL.revokeObjectURL(resizedImage);
          const url = URL.createObjectURL(blob);
          setResizedImage(url);
          setIsProcessing(false);
        },
        "image/png"
      );
    } catch {
      setError("An error occurred during resizing.");
      setIsProcessing(false);
    }
  }, [width, height, resizedImage]);

  const downloadResized = () => {
    if (!resizedImage) return;
    const link = document.createElement("a");
    link.download = `resized-${width}x${height}.png`;
    link.href = resizedImage;
    link.click();
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Upload */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Upload Image
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full"
        >
          <Upload className="h-4 w-4" />
          {image ? "Change Image" : "Select Image"}
        </button>
        {image && (
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Original: {originalDims.width} x {originalDims.height}px
          </p>
        )}
      </div>

      {/* Controls */}
      {image && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Resize Settings
          </h2>

          {/* Percentage toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={usePercentage}
              onChange={(e) => {
                setUsePercentage(e.target.checked);
                if (e.target.checked) {
                  handlePercentageChange(percentage);
                }
              }}
              className="rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Resize by percentage
            </span>
          </label>

          {usePercentage && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Scale: {percentage}%
              </label>
              <input
                type="range"
                min={10}
                max={200}
                value={percentage}
                onChange={(e) => handlePercentageChange(Number(e.target.value))}
                className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-surface-500 mt-1">
                <span>10%</span>
                <span>200%</span>
              </div>
            </div>
          )}

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Width (px)
              </label>
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Height (px)
              </label>
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          {/* Lock aspect ratio */}
          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              lockAspect
                ? "bg-brand-600 text-white"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
            }`}
          >
            {lockAspect ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
            {lockAspect ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}
          </button>

          <button
            onClick={resize}
            disabled={isProcessing || width <= 0 || height <= 0}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resizing...
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Resize Image
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {resizedImage && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Result
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            New size: {width} x {height}px
          </p>
          <div className="rounded-lg overflow-hidden bg-surface-50 dark:bg-surface-800 p-2">
            <img
              src={resizedImage}
              alt="Resized"
              className="max-w-full h-auto rounded mx-auto"
              style={{ maxHeight: 400 }}
            />
          </div>
          <button onClick={downloadResized} className="btn-primary w-full">
            <Download className="h-4 w-4" />
            Download Resized Image
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
