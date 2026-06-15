"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Download, Copy, Loader2, FileText } from "lucide-react";

export default function ExtractPdfPages() {
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [extractInput, setExtractInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data);
      setFileData(data);
      setFileName(file.name);
      setPageCount(pdf.getPageCount());
      setExtractInput("");
      setError("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const parsePages = (input: string, max: number): number[] | null => {
    const pages = new Set<number>();
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > max) return null;
        for (let i = start; i <= end; i++) pages.add(i);
      } else {
        const page = parseInt(part, 10);
        if (isNaN(page) || page < 1 || page > max) return null;
        pages.add(page);
      }
    }

    return pages.size > 0 ? Array.from(pages).sort((a, b) => a - b) : null;
  };

  const extractPages = async () => {
    if (!fileData) {
      setError("Please upload a PDF file.");
      return;
    }

    if (!extractInput.trim()) {
      setError("Please enter page numbers to extract.");
      return;
    }

    const pages = parsePages(extractInput, pageCount);
    if (!pages) {
      setError(`Invalid page numbers. Use numbers 1-${pageCount}, e.g., "1-3,5,7-9".`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const srcPdf = await PDFDocument.load(fileData);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(
        srcPdf,
        pages.map((p) => p - 1)
      );
      copiedPages.forEach((page) => newPdf.addPage(page));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName.replace(/\.pdf$/i, "_extracted.pdf");
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to extract pages: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    setFileName("");
    setPageCount(0);
    setExtractInput("");
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
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {fileName}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {pageCount} pages
                </p>
              </div>
            </div>
            <button onClick={clearFile} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400">
              Remove
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Pages to Extract
            </label>
            <input
              type="text"
              value={extractInput}
              onChange={(e) => setExtractInput(e.target.value)}
              placeholder={`e.g., 1-3,5,7-${pageCount}`}
              className="input-field w-full"
            />
            <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
              Enter comma-separated page numbers or ranges to extract (1-{pageCount}).
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={extractPages}
        disabled={!fileData || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Extract Pages & Download
          </>
        )}
      </button>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload a PDF and specify which pages to extract. Only the selected pages will be included
          in the new PDF. Use commas and hyphens to define page ranges.
        </p>
      </div>
    </div>
  );
}
