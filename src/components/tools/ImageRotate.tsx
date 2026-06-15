"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, RotateCw, FlipHorizontal, FlipVertical, Loader2 } from "lucide-react";

export default function ImageRotate() {
  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
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
    setResultImage(null);
    setAngle(0);
    setFlipH(false);
    setFlipV(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImage(dataUrl);

      const img = new window.Image();
      img.onload = () => {
        originalImgRef.current = img;
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const applyTransform = useCallback(() => {
    if (!originalImgRef.current) return;
    setIsProcessing(true);
    setError("");

    try {
      const img = originalImgRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rad = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const newW = Math.round(img.width * cos + img.height * sin);
      const newH = Math.round(img.width * sin + img.height * cos);

      canvas.width = newW;
      canvas.height = newH;

      ctx.clearRect(0, 0, newW, newH);
      ctx.save();
      ctx.translate(newW / 2, newH / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Failed to process image.");
            setIsProcessing(false);
            return;
          }
          if (resultImage) URL.revokeObjectURL(resultImage);
          const url = URL.createObjectURL(blob);
          setResultImage(url);
          setIsProcessing(false);
        },
        "image/png"
      );
    } catch {
      setError("An error occurred during processing.");
      setIsProcessing(false);
    }
  }, [angle, flipH, flipV, resultImage]);

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.download = `rotated-${angle}deg.png`;
    link.href = resultImage;
    link.click();
  };

  const presetAngles = [90, 180, 270];

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
      </div>

      {/* Controls */}
      {image && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Rotation & Flip
          </h2>

          {/* Preset angles */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Quick Rotate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetAngles.map((a) => (
                <button
                  key={a}
                  onClick={() => setAngle(a)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    angle === a
                      ? "bg-brand-600 text-white"
                      : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                  }`}
                >
                  {a}&deg;
                </button>
              ))}
            </div>
          </div>

          {/* Custom angle slider */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Custom Angle: {angle}&deg;
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>0&deg;</span>
              <span>360&deg;</span>
            </div>
          </div>

          {/* Flip buttons */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Flip
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  flipH
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                <FlipHorizontal className="h-4 w-4" />
                Horizontal
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  flipV
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                <FlipVertical className="h-4 w-4" />
                Vertical
              </button>
            </div>
          </div>

          <button
            onClick={applyTransform}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4" />
                Apply Transform
              </>
            )}
          </button>
        </div>
      )}

      {/* Preview */}
      {image && (
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
                  src={image}
                  alt="Original"
                  className="max-w-full h-auto rounded mx-auto"
                  style={{ maxHeight: 300 }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Result
              </p>
              <div className="rounded-lg overflow-hidden bg-surface-50 dark:bg-surface-800 p-2">
                {resultImage ? (
                  <img
                    src={resultImage}
                    alt="Rotated"
                    className="max-w-full h-auto rounded mx-auto"
                    style={{ maxHeight: 300 }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-surface-400 dark:text-surface-500 text-sm">
                    Apply transform to see preview
                  </div>
                )}
              </div>
            </div>
          </div>
          {resultImage && (
            <button onClick={downloadResult} className="btn-primary w-full">
              <Download className="h-4 w-4" />
              Download Result
            </button>
          )}
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
