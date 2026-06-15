"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Download, Loader2, ArrowUp, ArrowDown, X } from "lucide-react";

interface ImageFile {
  name: string;
  type: string;
  data: ArrayBuffer;
  preview: string;
}

export default function JpgToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [fitToA4, setFitToA4] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newImages: ImageFile[] = [];
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) continue;
      const data = await file.arrayBuffer();
      const preview = URL.createObjectURL(file);
      newImages.push({ name: file.name, type: file.type, data, preview });
    }

    setImages((prev) => [...prev, ...newImages]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setImages(updated);
  };

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  const getImageDimensions = (data: ArrayBuffer, type: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: A4_WIDTH, height: A4_HEIGHT });
      };
      img.src = url;
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pdf = await PDFDocument.create();

      for (const img of images) {
        let embedded;
        if (img.type === "image/png") {
          embedded = await pdf.embedPng(new Uint8Array(img.data));
        } else {
          embedded = await pdf.embedJpg(new Uint8Array(img.data));
        }

        let pageWidth: number;
        let pageHeight: number;

        if (fitToA4) {
          pageWidth = A4_WIDTH;
          pageHeight = A4_HEIGHT;
        } else {
          const dims = await getImageDimensions(img.data, img.type);
          pageWidth = dims.width;
          pageHeight = dims.height;
        }

        const page = pdf.addPage([pageWidth, pageHeight]);

        if (fitToA4) {
          const maxW = pageWidth - 40;
          const maxH = pageHeight - 40;
          const ratio = Math.min(maxW / embedded.width, maxH / embedded.height);
          const scaledW = embedded.width * ratio;
          const scaledH = embedded.height * ratio;
          const x = (pageWidth - scaledW) / 2;
          const y = (pageHeight - scaledH) / 2;
          page.drawImage(embedded, { x, y, width: scaledW, height: scaledH });
        } else {
          page.drawImage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight });
        }
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "images.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to create PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Upload Images
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full"
        >
          <Upload className="h-4 w-4" />
          Select Images (JPG, PNG, WebP)
        </button>
        <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
          Select multiple images to convert into a PDF document.
        </p>
      </div>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Options
        </h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fitToA4}
            onChange={(e) => setFitToA4(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">
            Fit images to A4 page size
          </span>
        </label>
        <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
          {fitToA4
            ? "Images will be centered on A4 pages (595 x 842 pts) with margins."
            : "Each page will match the image dimensions."}
        </p>
      </div>

      {images.length > 0 && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Images ({images.length})
            </h2>
            <button onClick={clearAll} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden group"
              >
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 bg-surface-50 dark:bg-surface-800">
                  <p className="text-xs text-surface-600 dark:text-surface-400 truncate">
                    {img.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                      className="p-0.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 ml-auto"
                    >
                      <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={convertToPdf}
        disabled={images.length === 0 || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Convert to PDF
          </>
        )}
      </button>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload JPG, PNG, or WebP images. Each image becomes a page in the resulting PDF. By
          default, page dimensions match the image. Enable A4 mode to fit images on standard A4
          pages with centered placement.
        </p>
      </div>
    </div>
  );
}
