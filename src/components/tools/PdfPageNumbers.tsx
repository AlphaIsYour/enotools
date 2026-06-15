"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Upload, Download, Hash, Loader2, FileText } from "lucide-react";

type Position = "bottom-center" | "bottom-right" | "top-center" | "top-right";
type Format = "1" | "Page 1" | "1/N" | "Page 1 of N";

export default function PdfPageNumbers() {
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [format, setFormat] = useState<Format>("1");
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
      setError("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const formatNumber = (num: number, total: number, fmt: Format): string => {
    switch (fmt) {
      case "1":
        return String(num);
      case "Page 1":
        return `Page ${num}`;
      case "1/N":
        return `${num}/${total}`;
      case "Page 1 of N":
        return `Page ${num} of ${total}`;
    }
  };

  const getPosition = (pos: Position, pageWidth: number, pageHeight: number, textWidth: number) => {
    const margin = 40;
    switch (pos) {
      case "bottom-center":
        return { x: (pageWidth - textWidth) / 2, y: margin };
      case "bottom-right":
        return { x: pageWidth - textWidth - margin, y: margin };
      case "top-center":
        return { x: (pageWidth - textWidth) / 2, y: pageHeight - margin - 12 };
      case "top-right":
        return { x: pageWidth - textWidth - margin, y: pageHeight - margin - 12 };
    }
  };

  const addPageNumbers = async () => {
    if (!fileData) {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pdf = await PDFDocument.load(fileData);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const total = pages.length;

      for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const num = startNumber + i;
        const text = formatNumber(num, total, format);
        const textWidth = font.widthOfTextAtSize(text, 12);
        const pos = getPosition(position, width, height, textWidth);

        page.drawText(text, {
          x: pos.x,
          y: pos.y,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName.replace(/\.pdf$/i, "_numbered.pdf");
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to add page numbers: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    setFileName("");
    setPageCount(0);
    setError("");
  };

  const positions: { value: Position; label: string }[] = [
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
  ];

  const formats: { value: Format; label: string; example: string }[] = [
    { value: "1", label: "Number only", example: "1, 2, 3" },
    { value: "Page 1", label: "Page prefix", example: "Page 1, Page 2" },
    { value: "1/N", label: "Number/Total", example: "1/10, 2/10" },
    { value: "Page 1 of N", label: "Full format", example: "Page 1 of 10" },
  ];

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
        <>
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
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Page Number Settings
            </h2>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {positions.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPosition(p.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      position === p.value
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Format
              </label>
              <div className="space-y-2">
                {formats.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      format === f.value
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-xs opacity-70">{f.example}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Start Number
              </label>
              <input
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value)))}
                min={1}
                className="input-field w-full"
              />
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={addPageNumbers}
        disabled={!fileData || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding page numbers...
          </>
        ) : (
          <>
            <Hash className="h-4 w-4" />
            Add Page Numbers & Download
          </>
        )}
      </button>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload a PDF and configure page number settings. Choose position, format, and starting
          number. Page numbers will be added to every page in the document using Helvetica 12pt.
        </p>
      </div>
    </div>
  );
}
