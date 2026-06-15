"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Unlock, Download, FileText, Loader2, AlertTriangle } from "lucide-react";

export default function UnlockPdf() {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [password, setPassword] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile({ name: file.name, data: await file.arrayBuffer() });
    setPageCount(null);
    setError("");
    setSuccess("");
    setPassword("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const unlockPdf = async () => {
    if (!pdfFile) return;

    if (!password.trim()) {
      setError("Please enter the PDF password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const pdf = await PDFDocument.load(pdfFile.data, {
        password: password,
      });

      setPageCount(pdf.getPageCount());

      const unlockedBytes = await pdf.save();
      const blob = new Blob([unlockedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `unlocked-${pdfFile.name}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess("PDF unlocked and downloaded successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("encrypt")) {
        setError(
          "Failed to unlock PDF. The password may be incorrect, or the encryption method is not supported by pdf-lib. pdf-lib has limited password support and may not work with all encrypted PDFs."
        );
      } else {
        setError(`Failed to unlock PDF: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    setPageCount(null);
    setPassword("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Upload Protected PDF
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
                  {pageCount !== null && (
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {pageCount} page{pageCount !== 1 ? "s" : ""}
                    </p>
                  )}
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

          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-medium">Limited Password Support</p>
                <p>
                  pdf-lib has limited support for password-protected PDFs. It works with some
                  encrypted PDFs but not all. If this tool fails, consider using dedicated tools
                  like QPDF, Smallpdf, or Adobe Acrobat for unlocking.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Password
            </h2>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Enter PDF Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PDF password"
                className="input-field w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") unlockPdf();
                }}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <button
            onClick={unlockPdf}
            disabled={loading || !password.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Unlock PDF
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
          Upload a password-protected PDF and enter the password to unlock it. If successful, the
          unlocked PDF will download without password protection. Note that pdf-lib has limited
          support for encrypted PDFs. All processing happens in your browser.
        </p>
      </div>
    </div>
  );
}
