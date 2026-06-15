"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, RotateCw, Download, FileText, Loader2 } from "lucide-react";

export default function RotatePdf() {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [applyTo, setApplyTo] = useState<"all" | "specific">("all");
  const [specificPages, setSpecificPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data);
      setPdfFile({ name: file.name, data });
      setPageCount(pdf.getPageCount());
      setError("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const parsePageNumbers = (input: string, max: number): number[] => {
    const pages: number[] = [];
    const parts = input.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((s) => parseInt(s.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= max && start <= end) {
          for (let i = start; i <= end; i++) pages.push(i - 1);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= max) pages.push(num - 1);
      }
    }
    return [...new Set(pages)];
  };

  const rotatePdf = async () => {
    if (!pdfFile) return;

    setLoading(true);
    setError("");

    try {
      const pdf = await PDFDocument.load(pdfFile.data);
      const pages = pdf.getPages();
      const targetIndices =
        applyTo === "all"
          ? pages.map((_, i) => i)
          : parsePageNumbers(specificPages, pageCount);

      if (targetIndices.length === 0) {
        setError("No valid pages specified. Use page numbers like 1, 3, 5 or ranges like 1-5.");
        setLoading(false);
        return;
      }

      for (const index of targetIndices) {
        const page = pages[index];
        const currentRotation = page.getRotation().angle;
        page.setRotation(currentRotation + rotationAngle);
      }

      const rotatedBytes = await pdf.save();
      const blob = new Blob([rotatedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `rotated-${pdfFile.name}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to rotate PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    setPageCount(0);
    setSpecificPages("");
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
            <div className="flex items-center justify-between mb-4">
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
              Rotation Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Rotation Angle
                </label>
                <div className="flex gap-2">
                  {([90, 180, 270] as const).map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setRotationAngle(angle)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        rotationAngle === angle
                          ? "bg-brand-600 text-white"
                          : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                      }`}
                    >
                      {angle}&deg;
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Apply To
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setApplyTo("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      applyTo === "all"
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                    }`}
                  >
                    All Pages
                  </button>
                  <button
                    onClick={() => setApplyTo("specific")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      applyTo === "specific"
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                    }`}
                  >
                    Specific Pages
                  </button>
                </div>
              </div>

              {applyTo === "specific" && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Page Numbers
                  </label>
                  <input
                    type="text"
                    value={specificPages}
                    onChange={(e) => setSpecificPages(e.target.value)}
                    placeholder="e.g. 1, 3, 5-8"
                    className="input-field w-full"
                  />
                  <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                    Enter page numbers separated by commas. Use ranges like 1-5 for consecutive pages.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={rotatePdf}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rotating...
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4" />
                Rotate PDF
              </>
            )}
          </button>
        </>
      )}

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload a PDF file, choose a rotation angle (90, 180, or 270 degrees), and select whether
          to apply the rotation to all pages or specific pages. The rotated PDF will download
          automatically. All processing happens in your browser.
        </p>
      </div>
    </div>
  );
}
