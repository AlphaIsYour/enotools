"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Upload, Download, Type, ImageIcon, Loader2, Trash2 } from "lucide-react";

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  pageIndex: number;
}

interface ImageOverlay {
  data: Uint8Array;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

export default function EditPdf() {
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [text, setText] = useState("Sample Text");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#000000");
  const [textX, setTextX] = useState(100);
  const [textY, setTextY] = useState(100);

  const [imageX, setImageX] = useState(100);
  const [imageY, setImageY] = useState(100);
  const [imageWidth, setImageWidth] = useState(200);
  const [imageHeight, setImageHeight] = useState(200);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data);
      setFileData(data);
      setFileName(file.name);
      setPageCount(pdf.getPageCount());
      setCurrentPage(0);
      setTextOverlays([]);
      setImageOverlays([]);
      setError("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fileData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pageOverlays = textOverlays.filter((o) => o.pageIndex === currentPage);
    const pageImages = imageOverlays.filter((o) => o.pageIndex === currentPage);

    canvas.width = 595;
    canvas.height = 842;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 595, 842);

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 595, 842);

    ctx.fillStyle = "#6b7280";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Page ${currentPage + 1} of ${pageCount}`, 297, 420);

    for (const overlay of pageOverlays) {
      ctx.fillStyle = overlay.color;
      ctx.font = `${overlay.size}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(overlay.text, overlay.x, 842 - overlay.y);
    }

    for (const img of pageImages) {
      const blob = new Blob([img.data as unknown as BlobPart]);
      const url = URL.createObjectURL(blob);
      const image = new window.Image();
      image.onload = () => {
        ctx.drawImage(image, img.x, 842 - img.y - img.height, img.width, img.height);
        URL.revokeObjectURL(url);
      };
      image.src = url;
    }
  }, [fileData, currentPage, pageCount, textOverlays, imageOverlays]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  };

  const addText = () => {
    setTextOverlays((prev) => [
      ...prev,
      { text, x: textX, y: textY, size: fontSize, color: fontColor, pageIndex: currentPage },
    ]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new Uint8Array(await file.arrayBuffer());
    setImageOverlays((prev) => [
      ...prev,
      { data, name: file.name, x: imageX, y: imageY, width: imageWidth, height: imageHeight, pageIndex: currentPage },
    ]);

    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeTextOverlay = (index: number) => {
    setTextOverlays((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImageOverlay = (index: number) => {
    setImageOverlays((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadPdf = async () => {
    if (!fileData) {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pdf = await PDFDocument.load(fileData);
      const font = await pdf.embedFont(StandardFonts.Helvetica);

      for (const overlay of textOverlays) {
        const page = pdf.getPage(overlay.pageIndex);
        const color = hexToRgb(overlay.color);
        page.drawText(overlay.text, {
          x: overlay.x,
          y: overlay.y,
          size: overlay.size,
          font,
          color: rgb(color.r, color.g, color.b),
        });
      }

      for (const img of imageOverlays) {
        const page = pdf.getPage(img.pageIndex);
        let embedded;
        if (img.name.toLowerCase().endsWith(".png")) {
          embedded = await pdf.embedPng(img.data);
        } else {
          embedded = await pdf.embedJpg(img.data);
        }
        page.drawImage(embedded, {
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName.replace(/\.pdf$/i, "_edited.pdf");
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to save PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    setFileName("");
    setPageCount(0);
    setCurrentPage(0);
    setTextOverlays([]);
    setImageOverlays([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Upload PDF File
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full"
        >
          <Upload className="h-4 w-4" />
          Select PDF File
        </button>
      </div>

      {fileData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                Page {currentPage + 1} of {pageCount}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="btn-secondary text-xs py-1 px-2"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
                  disabled={currentPage === pageCount - 1}
                  className="btn-secondary text-xs py-1 px-2"
                >
                  Next
                </button>
              </div>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full border border-surface-200 dark:border-surface-800 rounded"
              style={{ maxHeight: 500 }}
            />
            <button onClick={clearFile} className="mt-3 text-sm text-red-600 hover:text-red-700 dark:text-red-400">
              Remove PDF
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Add Text */}
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Add Text
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text..."
                  className="input-field w-full"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">Font Size</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min={8}
                      max={120}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="h-10 w-full rounded-lg cursor-pointer border border-surface-200 dark:border-surface-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">X Position</label>
                    <input
                      type="number"
                      value={textX}
                      onChange={(e) => setTextX(Number(e.target.value))}
                      min={0}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">Y Position</label>
                    <input
                      type="number"
                      value={textY}
                      onChange={(e) => setTextY(Number(e.target.value))}
                      min={0}
                      className="input-field w-full"
                    />
                  </div>
                </div>
                <button onClick={addText} className="btn-primary w-full">
                  <Type className="h-4 w-4" />
                  Add Text to Page
                </button>
              </div>
            </div>

            {/* Add Image */}
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Add Image
              </h2>
              <div className="space-y-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="btn-secondary w-full"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">X</label>
                    <input
                      type="number"
                      value={imageX}
                      onChange={(e) => setImageX(Number(e.target.value))}
                      min={0}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">Y</label>
                    <input
                      type="number"
                      value={imageY}
                      onChange={(e) => setImageY(Number(e.target.value))}
                      min={0}
                      className="input-field w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">Width</label>
                    <input
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number(e.target.value))}
                      min={1}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-600 dark:text-surface-400 mb-1">Height</label>
                    <input
                      type="number"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(Number(e.target.value))}
                      min={1}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Overlays List */}
            {(textOverlays.length > 0 || imageOverlays.length > 0) && (
              <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  Added Elements
                </h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {textOverlays.map((o, i) => (
                    <div
                      key={`t-${i}`}
                      className="flex items-center justify-between p-2 rounded bg-surface-50 dark:bg-surface-800"
                    >
                      <span className="text-xs text-surface-700 dark:text-surface-300 truncate">
                        Text: &quot;{o.text}&quot; (p{o.pageIndex + 1})
                      </span>
                      <button onClick={() => removeTextOverlay(i)} className="p-1">
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                  {imageOverlays.map((o, i) => (
                    <div
                      key={`i-${i}`}
                      className="flex items-center justify-between p-2 rounded bg-surface-50 dark:bg-surface-800"
                    >
                      <span className="text-xs text-surface-700 dark:text-surface-300 truncate">
                        Image: {o.name} (p{o.pageIndex + 1})
                      </span>
                      <button onClick={() => removeImageOverlay(i)} className="p-1">
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {fileData && (
        <button
          onClick={downloadPdf}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Edited PDF
            </>
          )}
        </button>
      )}

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload a PDF, then add text and images to any page. Set position, font size, and color for
          text overlays. Place images with custom dimensions. Download the edited PDF when done.
        </p>
      </div>
    </div>
  );
}
