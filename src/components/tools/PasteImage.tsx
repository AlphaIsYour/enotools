"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function PasteImage() {
  const [image, setImage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [estimatedSize, setEstimatedSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = useCallback((file: File | Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setEstimatedSize(Math.round(file.size / 1024));
        setImage(img.src);

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) handleImage(blob);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImage(file);
  };

  const downloadAs = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const link = document.createElement("a");
    link.download = `pasted-image.${format}`;
    link.href = canvas.toDataURL(mimeType, 0.92);
    link.click();
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch {
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith("image/")) handleImage(file);
        }}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        {!image ? (
          <div className="py-12">
            <p className="text-lg font-medium text-surface-700 dark:text-surface-300">
              Press Ctrl+V to paste an image
            </p>
            <p className="text-sm text-surface-500 mt-2">
              or click here / drag and drop to upload a file
            </p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[500px] mx-auto block"
          />
        )}
      </div>

      {!image && <canvas ref={canvasRef} className="hidden" />}

      {image && (
        <>
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
              Image Info
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{dimensions.width}px</p>
                <p className="text-xs text-surface-500">Width</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{dimensions.height}px</p>
                <p className="text-xs text-surface-500">Height</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{estimatedSize} KB</p>
                <p className="text-xs text-surface-500">Est. Size</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => downloadAs("png")} className="btn-primary">
              Download as PNG
            </button>
            <button onClick={() => downloadAs("jpeg")} className="btn-secondary">
              Download as JPEG
            </button>
            <button onClick={copyToClipboard} className="btn-secondary">
              Copy to Clipboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
