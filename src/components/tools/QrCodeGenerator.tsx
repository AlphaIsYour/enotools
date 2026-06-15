"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { CopyButton } from "@/components/CopyButton";
import { Download, ImageIcon } from "lucide-react";

export default function QrCodeGenerator() {
  const [text, setText] = useState("https://example.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = useState("");
  const [svgString, setSvgString] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQr = useCallback(async () => {
    if (!text.trim()) return;

    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      setDataUrl(url);

      const svg = await QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      setSvgString(svg);

      if (logoDataUrl) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const img = new window.Image();
            img.onload = () => {
              canvas.width = size;
              canvas.height = size;
              const qrImg = new window.Image();
              qrImg.onload = () => {
                ctx.drawImage(qrImg, 0, 0, size, size);
                const logoW = (size * logoSize) / 100;
                const logoH = logoW;
                const logoX = (size - logoW) / 2;
                const logoY = (size - logoH) / 2;
                ctx.fillStyle = bgColor;
                const padding = logoW * 0.1;
                ctx.beginPath();
                ctx.roundRect(
                  logoX - padding,
                  logoY - padding,
                  logoW + padding * 2,
                  logoH + padding * 2,
                  8
                );
                ctx.fill();
                ctx.drawImage(img, logoX, logoY, logoW, logoH);
                const newUrl = canvas.toDataURL("image/png");
                setDataUrl(newUrl);
              };
              qrImg.src = url;
            };
            img.src = logoDataUrl;
          }
        }
      }
    } catch {
      // QR generation failed
    }
  }, [text, fgColor, bgColor, size, errorLevel, logoDataUrl, logoSize]);

  useEffect(() => {
    const timer = setTimeout(generateQr, 300);
    return () => clearTimeout(timer);
  }, [generateQr]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = dataUrl;
    link.click();
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString as unknown as BlobPart], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "qrcode.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="space-y-5">
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Content
          </h2>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Text or URL
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              className="input-field"
            />
          </div>
        </div>

        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Appearance
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Foreground
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-10 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-800"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-10 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-800"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Size: {size}px
            </label>
            <input
              type="range"
              min={128}
              max={512}
              step={16}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>128px</span>
              <span>512px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Error Correction
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["L", "M", "Q", "H"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setErrorLevel(level)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    errorLevel === level
                      ? "bg-brand-600 text-white"
                      : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                  }`}
                >
                  {level}
                  <span className="block text-xs opacity-70">
                    {level === "L"
                      ? "~7%"
                      : level === "M"
                      ? "~15%"
                      : level === "Q"
                      ? "~25%"
                      : "~30%"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Logo Overlay
          </h2>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full"
            >
              <ImageIcon className="h-4 w-4" />
              {logoDataUrl ? "Change Logo" : "Upload Logo"}
            </button>
          </div>
          {logoDataUrl && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Logo Size: {logoSize}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={40}
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
              <button onClick={removeLogo} className="btn-secondary w-full text-red-600">
                Remove Logo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-5">
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Preview
          </h2>
          <div className="flex items-center justify-center p-8 rounded-lg bg-surface-50 dark:bg-surface-800 min-h-[300px]">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="QR Code Preview"
                className="max-w-full h-auto rounded-lg"
                style={{ width: Math.min(size, 400) }}
              />
            ) : (
              <p className="text-surface-400 dark:text-surface-500 text-sm">
                Enter text to generate QR code
              </p>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Export
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={downloadPng} className="btn-primary" disabled={!dataUrl}>
              <Download className="h-4 w-4" />
              PNG
            </button>
            <button onClick={downloadSvg} className="btn-primary" disabled={!svgString}>
              <Download className="h-4 w-4" />
              SVG
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-500 dark:text-surface-400">
              Copy SVG code
            </span>
            <CopyButton text={svgString} />
          </div>
        </div>
      </div>
    </div>
  );
}
