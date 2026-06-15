"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Type, Loader2 } from "lucide-react";

export default function MemeGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [memeImage, setMemeImage] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg">("image/png");
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
    setMemeImage(null);

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

  const generateMeme = useCallback(() => {
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

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Configure text style
      const scaledFontSize = fontSize * (img.width / 600);
      const padding = scaledFontSize * 0.3;
      ctx.font = `bold ${scaledFontSize}px Impact, 'Arial Black', sans-serif`;
      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * (img.width / 600);
      ctx.lineJoin = "round";
      ctx.textAlign = "center";

      // Draw top text
      if (topText.trim()) {
        ctx.textBaseline = "top";
        const x = img.width / 2;
        const y = padding;
        ctx.strokeText(topText.toUpperCase(), x, y);
        ctx.fillText(topText.toUpperCase(), x, y);
      }

      // Draw bottom text
      if (bottomText.trim()) {
        ctx.textBaseline = "bottom";
        const x = img.width / 2;
        const y = img.height - padding;
        ctx.strokeText(bottomText.toUpperCase(), x, y);
        ctx.fillText(bottomText.toUpperCase(), x, y);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Failed to generate meme.");
            setIsProcessing(false);
            return;
          }
          if (memeImage) URL.revokeObjectURL(memeImage);
          const url = URL.createObjectURL(blob);
          setMemeImage(url);
          setIsProcessing(false);
        },
        outputFormat,
        0.95
      );
    } catch {
      setError("An error occurred while generating the meme.");
      setIsProcessing(false);
    }
  }, [topText, bottomText, fontSize, textColor, strokeColor, strokeWidth, outputFormat, memeImage]);

  const downloadMeme = () => {
    if (!memeImage) return;
    const ext = outputFormat === "image/png" ? "png" : "jpg";
    const link = document.createElement("a");
    link.download = `meme.${ext}`;
    link.href = memeImage;
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
      </div>

      {/* Controls */}
      {image && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Meme Settings
          </h2>

          {/* Text inputs */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Top Text
            </label>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="TOP TEXT"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Bottom Text
            </label>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="BOTTOM TEXT"
              className="input-field"
            />
          </div>

          {/* Font size */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Font Size: {fontSize}
            </label>
            <input
              type="range"
              min={20}
              max={80}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>20</span>
              <span>80</span>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-10 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-800"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Stroke Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="h-10 w-10 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-800"
                />
                <input
                  type="text"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Stroke width */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Stroke Width: {strokeWidth}
            </label>
            <input
              type="range"
              min={2}
              max={6}
              step={0.5}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>2</span>
              <span>6</span>
            </div>
          </div>

          {/* Output format */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Output Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setOutputFormat("image/png")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  outputFormat === "image/png"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setOutputFormat("image/jpeg")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  outputFormat === "image/jpeg"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                JPEG
              </button>
            </div>
          </div>

          <button
            onClick={generateMeme}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Type className="h-4 w-4" />
                Generate Meme
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
          <div className="rounded-lg overflow-hidden bg-surface-50 dark:bg-surface-800 p-2">
            {memeImage ? (
              <img
                src={memeImage}
                alt="Generated meme"
                className="max-w-full h-auto rounded mx-auto"
                style={{ maxHeight: 500 }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-surface-400 dark:text-surface-500 text-sm">
                <p>Click &quot;Generate Meme&quot; to see preview</p>
              </div>
            )}
          </div>
          {memeImage && (
            <button onClick={downloadMeme} className="btn-primary w-full">
              <Download className="h-4 w-4" />
              Download Meme
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
