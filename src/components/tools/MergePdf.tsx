"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Trash2, ArrowUp, ArrowDown, Download, FileText, Loader2 } from "lucide-react";

interface PdfFile {
  name: string;
  data: ArrayBuffer;
}

export default function MergePdf() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles: PdfFile[] = [];
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      const data = await file.arrayBuffer();
      newFiles.push({ name: file.name, data });
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= files.length) return;
    const updated = [...files];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFiles(updated);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError("Please upload at least 2 PDF files to merge.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const pdf = await PDFDocument.load(file.data);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "merged.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to merge PDFs: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Upload PDF Files
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full"
        >
          <Upload className="h-4 w-4" />
          Select PDF Files
        </button>
        <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
          Select multiple PDF files to merge into one document.
        </p>
      </div>

      {files.length > 0 && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Files ({files.length})
            </h2>
            <button onClick={clearAll} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400">
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800 p-3"
              >
                <FileText className="h-5 w-5 text-brand-600 shrink-0" />
                <span className="text-sm text-surface-900 dark:text-surface-100 truncate flex-1">
                  {file.name}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveFile(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="h-4 w-4 text-surface-600 dark:text-surface-400" />
                  </button>
                  <button
                    onClick={() => moveFile(index, "down")}
                    disabled={index === files.length - 1}
                    className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="h-4 w-4 text-surface-600 dark:text-surface-400" />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
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
        onClick={mergePdfs}
        disabled={files.length < 2 || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Merging...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Merge PDFs
          </>
        )}
      </button>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload multiple PDF files, reorder them using the arrow buttons, then click Merge to
          combine all pages into a single PDF document. The merged file will download automatically.
        </p>
      </div>
    </div>
  );
}
