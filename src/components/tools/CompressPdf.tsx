"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Download, Minimize2, Loader2, FileText, Info } from "lucide-react";

export default function CompressPdf() {
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileData(await file.arrayBuffer());
    setFileName(file.name);
    setOriginalSize(file.size);
    setCompressedSize(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const compressPdf = async () => {
    if (!fileData) {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pdf = await PDFDocument.load(fileData);
      const bytes = await pdf.save();
      setCompressedSize(bytes.length);

      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName.replace(/\.pdf$/i, "_compressed.pdf");
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to compress PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    setFileName("");
    setOriginalSize(0);
    setCompressedSize(null);
    setError("");
  };

  const savings = compressedSize !== null
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : null;

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
                  Original size: {formatBytes(originalSize)}
                </p>
              </div>
            </div>
            <button onClick={clearFile} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400">
              Remove
            </button>
          </div>

          {compressedSize !== null && (
            <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-4 space-y-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Original</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {formatBytes(originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Compressed</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {formatBytes(compressedSize)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">Difference</p>
                  <p className={`text-sm font-medium ${
                    Number(savings) > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {Number(savings) > 0 ? `-${savings}%` : `+${Math.abs(Number(savings)).toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={compressPdf}
        disabled={!fileData || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Compressing...
          </>
        ) : (
          <>
            <Minimize2 className="h-4 w-4" />
            Compress PDF
          </>
        )}
      </button>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-surface-500 dark:text-surface-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-1">
              About PDF Compression
            </h2>
            <p className="text-xs text-surface-600 dark:text-surface-400">
              This tool re-serializes the PDF, which can reduce file size by removing redundant data
              and optimizing object streams. Compression results vary depending on PDF content.
              Text-heavy PDFs may see minimal reduction. PDFs with embedded images typically benefit
              less from this approach since image recompression requires specialized processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
