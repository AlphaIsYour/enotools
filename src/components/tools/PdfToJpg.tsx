"use client";

import { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Upload, Download, FileText, Loader2, Image as ImageIcon } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
}

export default function PdfToJpg() {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.92);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      setPdfFile({ name: file.name, data });
      setPageCount(pdf.numPages);
      setThumbnails([]);
      setError("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const renderPages = useCallback(async () => {
    if (!pdfFile) return;

    setRendering(true);
    setError("");

    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfFile.data }).promise;
      const results: PageThumbnail[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        results.push({ pageNumber: i, dataUrl });
        setThumbnails([...results]);
      }
    } catch (err) {
      setError(`Failed to render pages: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setRendering(false);
    }
  }, [pdfFile, scale, quality]);

  const downloadPage = (pageNumber: number, dataUrl: string) => {
    const link = document.createElement("a");
    link.download = `${pdfFile?.name.replace(/\.pdf$/i, "") || "page"}-${pageNumber}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const downloadAll = () => {
    thumbnails.forEach((thumb) => {
      setTimeout(() => {
        downloadPage(thumb.pageNumber, thumb.dataUrl);
      }, thumb.pageNumber * 200);
    });
  };

  const clearFile = () => {
    setPdfFile(null);
    setPageCount(0);
    setThumbnails([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Upload PDF
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

      {pdfFile && (
        <>
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                    {pdfFile.name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {pageCount} page{pageCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Export Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Resolution Scale: {scale}x
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        scale === s
                          ? "bg-brand-600 text-white"
                          : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  Higher scale = larger image with better quality.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  JPEG Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(quality * 100)}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={renderPages}
            disabled={rendering}
            className="btn-primary w-full"
          >
            {rendering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rendering pages...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Convert to JPG
              </>
            )}
          </button>

          {thumbnails.length > 0 && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Pages ({thumbnails.length})
                </h2>
                <button onClick={downloadAll} className="btn-secondary text-sm">
                  <Download className="h-3 w-3" />
                  Download All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {thumbnails.map((thumb) => (
                  <div key={thumb.pageNumber} className="space-y-2">
                    <div className="relative group rounded-lg overflow-hidden border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${thumb.pageNumber}`}
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => downloadPage(thumb.pageNumber, thumb.dataUrl)}
                          className="bg-white text-surface-900 rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-center text-surface-500 dark:text-surface-400">
                      Page {thumb.pageNumber}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload a PDF file and convert each page to a JPEG image. Choose the resolution scale
          (1x, 2x, or 3x) and JPEG quality. Preview all pages as thumbnails and download
          individual pages or all at once. All processing happens in your browser using pdf.js.
        </p>
      </div>
    </div>
  );
}
