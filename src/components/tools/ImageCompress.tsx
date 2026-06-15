"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Image as ImageIcon, Loader2 } from "lucide-react";

export default function ImageCompress() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError("");
    setOriginalSize(file.size);
    setCompressedImage(null);
    setCompressedSize(0);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setOriginalImage(dataUrl);

      const img = new window.Image();
      img.onload = () => {
        setOriginalDims({ width: img.width, height: img.height });
        originalImgRef.current = img;
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const compress = useCallback(() => {
    if (!originalImgRef.current) return;
    setIsProcessing(true);
    setError("");

    try {
      const img = originalImgRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Compression failed. Try a different format or quality.");
            setIsProcessing(false);
            return;
          }
          setCompressedSize(blob.size);
          const url = URL.createObjectURL(blob);
          setCompressedImage(url);
          setIsProcessing(false);
        },
        format,
        quality
      );
    } catch {
      setError("An error occurred during compression.");
      setIsProcessing(false);
    }
  }, [quality, format]);

  const downloadCompressed = () => {
    if (!compressedImage) return;
    const ext = format === "image/jpeg" ? "jpg" : "webp";
    const link = document.createElement("a");
    link.download = `compressed.${ext}`;
    link.href = compressedImage;
    link.click();
  };

  const reduction = originalSize > 0 && compressedSize > 0
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

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
          {originalImage ? "Change Image" : "Select Image"}
        </button>
        {originalImage && (
          <div className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
            <p>
              Dimensions: {originalDims.width} x {originalDims.height}px
            </p>
            <p>Original size: {formatSize(originalSize)}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {originalImage && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Compression Settings
          </h2>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Quality: {quality.toFixed(1)}
            </label>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>0.1 (Smallest)</span>
              <span>1.0 (Best quality)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Output Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat("image/jpeg")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  format === "image/jpeg"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                JPEG
              </button>
              <button
                onClick={() => setFormat("image/webp")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  format === "image/webp"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                WebP
              </button>
            </div>
          </div>
          <button
            onClick={compress}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Compress Image
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {compressedImage && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Result
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-xs text-surface-500 dark:text-surface-400">Original</p>
              <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {formatSize(originalSize)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-xs text-surface-500 dark:text-surface-400">Compressed</p>
              <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {formatSize(compressedSize)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-xs text-surface-500 dark:text-surface-400">Reduction</p>
              <p className={`text-lg font-semibold ${reduction >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {reduction}%
              </p>
            </div>
          </div>
          <button onClick={downloadCompressed} className="btn-primary w-full">
            <Download className="h-4 w-4" />
            Download Compressed Image
          </button>
        </div>
      )}

      {/* Before/After Preview */}
      {originalImage && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Preview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Original
              </p>
              <div className="rounded-lg overflow-hidden bg-surface-50 dark:bg-surface-800 p-2">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Compressed
              </p>
              <div className="rounded-lg overflow-hidden bg-surface-50 dark:bg-surface-800 p-2">
                {compressedImage ? (
                  <img
                    src={compressedImage}
                    alt="Compressed"
                    className="w-full h-auto rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-surface-400 dark:text-surface-500 text-sm">
                    Click &quot;Compress Image&quot; to see preview
                  </div>
                )}
              </div>
            </div>
          </div>
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
