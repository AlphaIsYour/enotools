"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Upload, Download, ArrowUp, ArrowDown, RotateCw, Loader2, FileText } from "lucide-react";

interface PageItem {
  originalIndex: number;
  rotation: number;
}

export default function OrganizePdfPages() {
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data);
      const count = pdf.getPageCount();
      setFileData(data);
      setFileName(file.name);
      setPageCount(count);
      setPages(Array.from({ length: count }, (_, i) => ({ originalIndex: i, rotation: 0 })));
      setError("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const movePage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;
    const updated = [...pages];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setPages(updated);
  };

  const rotatePage = (index: number) => {
    const updated = [...pages];
    updated[index] = {
      ...updated[index],
      rotation: (updated[index].rotation + 90) % 360,
    };
    setPages(updated);
  };

  const organizePdf = async () => {
    if (!fileData || pages.length === 0) {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const srcPdf = await PDFDocument.load(fileData);
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(
        srcPdf,
        pages.map((p) => p.originalIndex)
      );

      for (let i = 0; i < copiedPages.length; i++) {
        const page = copiedPages[i];
        if (pages[i].rotation !== 0) {
          page.setRotation(degrees(pages[i].rotation));
        }
        newPdf.addPage(page);
      }

      const bytes = await newPdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName.replace(/\.pdf$/i, "_organized.pdf");
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to organize PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    setFileName("");
    setPageCount(0);
    setPages([]);
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

          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            Page Order
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pages.map((page, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800 p-3"
              >
                <span className="text-xs font-mono text-surface-500 dark:text-surface-400 w-6 text-center">
                  {index + 1}
                </span>
                <div className="flex items-center gap-1.5 flex-1">
                  <FileText className="h-4 w-4 text-brand-600" />
                  <span className="text-sm text-surface-900 dark:text-surface-100">
                    Page {page.originalIndex + 1}
                    {page.rotation !== 0 && (
                      <span className="text-xs text-surface-500 ml-1">
                        ({page.rotation}&deg;)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => movePage(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4 text-surface-600 dark:text-surface-400" />
                  </button>
                  <button
                    onClick={() => movePage(index, "down")}
                    disabled={index === pages.length - 1}
                    className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4 text-surface-600 dark:text-surface-400" />
                  </button>
                  <button
                    onClick={() => rotatePage(index)}
                    className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="h-4 w-4 text-surface-600 dark:text-surface-400" />
                  </button>
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
        onClick={organizePdf}
        disabled={!fileData || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Organized PDF
          </>
        )}
      </button>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload a PDF to reorder and rotate its pages. Use the arrow buttons to change page order
          and the rotate button to rotate individual pages by 90 degrees.
        </p>
      </div>
    </div>
  );
}
