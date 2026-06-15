"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  PenTool,
  Download,
  FileText,
  Loader2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

export default function SignPdf() {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureImageFile, setSignatureImageFile] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [targetPage, setTargetPage] = useState(1);
  const [position, setPosition] = useState<"bottom-left" | "bottom-center" | "bottom-right" | "center">("bottom-right");
  const [signatureSize, setSignatureSize] = useState(150);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data);
      setPdfFile({ name: file.name, data });
      setPageCount(pdf.getPageCount());
      setTargetPage(1);
      setError("");
      setSuccess("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSignatureImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSignatureImageFile(reader.result as string);
      setSignatureDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [signatureMode]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
    setSignatureImageFile(null);
  };

  const getPositionCoords = (pageWidth: number, pageHeight: number) => {
    const margin = 40;
    const scaledSize = signatureSize;

    switch (position) {
      case "bottom-left":
        return { x: margin, y: margin };
      case "bottom-center":
        return { x: (pageWidth - scaledSize) / 2, y: margin };
      case "bottom-right":
        return { x: pageWidth - scaledSize - margin, y: margin };
      case "center":
        return { x: (pageWidth - scaledSize) / 2, y: (pageHeight - scaledSize) / 2 };
    }
  };

  const signPdf = async () => {
    if (!pdfFile || !signatureDataUrl) {
      setError("Please upload a PDF and create or upload a signature.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const pdf = await PDFDocument.load(pdfFile.data);
      const pages = pdf.getPages();

      if (targetPage < 1 || targetPage > pages.length) {
        setError(`Invalid page number. The PDF has ${pages.length} page(s).`);
        setLoading(false);
        return;
      }

      const page = pages[targetPage - 1];
      const { width, height } = page.getSize();

      // Convert data URL to Uint8Array
      const base64 = signatureDataUrl.split(",")[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const signatureImage = await pdf.embedPng(bytes);
      const { x, y } = getPositionCoords(width, height);

      page.drawImage(signatureImage, {
        x,
        y,
        width: signatureSize,
        height: signatureSize * 0.5,
      });

      const signedBytes = await pdf.save();
      const blob = new Blob([signedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `signed-${pdfFile.name}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess("PDF signed and downloaded successfully.");
    } catch (err) {
      setError(`Failed to sign PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    setPageCount(0);
    setTargetPage(1);
    setSignatureDataUrl(null);
    setSignatureImageFile(null);
    clearSignature();
    setError("");
    setSuccess("");
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
              Create Signature
            </h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSignatureMode("draw")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  signatureMode === "draw"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                <PenTool className="h-4 w-4 inline mr-1" />
                Draw
              </button>
              <button
                onClick={() => setSignatureMode("upload")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  signatureMode === "upload"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                <ImageIcon className="h-4 w-4 inline mr-1" />
                Upload
              </button>
            </div>

            {signatureMode === "draw" ? (
              <div>
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 border border-surface-300 dark:border-surface-700 rounded-lg bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={clearSignature} className="btn-secondary text-sm">
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </div>
                <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                  Draw your signature using mouse or touch.
                </p>
              </div>
            ) : (
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleSignatureImage}
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="btn-secondary w-full"
                >
                  <ImageIcon className="h-4 w-4" />
                  Upload Signature Image
                </button>
                {signatureImageFile && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={signatureImageFile}
                      alt="Signature"
                      className="h-16 border border-surface-200 dark:border-surface-800 rounded bg-white p-1"
                    />
                    <button
                      onClick={() => {
                        setSignatureImageFile(null);
                        setSignatureDataUrl(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Placement Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Page Number
                </label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={targetPage}
                  onChange={(e) => setTargetPage(parseInt(e.target.value, 10) || 1)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "bottom-left", label: "Bottom Left" },
                      { value: "bottom-center", label: "Bottom Center" },
                      { value: "bottom-right", label: "Bottom Right" },
                      { value: "center", label: "Center" },
                    ] as const
                  ).map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setPosition(pos.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        position === pos.value
                          ? "bg-brand-600 text-white"
                          : "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Signature Width: {signatureSize}px
                </label>
                <input
                  type="range"
                  min={80}
                  max={300}
                  value={signatureSize}
                  onChange={(e) => setSignatureSize(parseInt(e.target.value, 10))}
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

          {success && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <button
            onClick={signPdf}
            disabled={loading || !signatureDataUrl}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Sign &amp; Download PDF
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
          Upload a PDF, then create a signature by drawing on the canvas or uploading an image.
          Choose the page and position for the signature, then click Sign &amp; Download. The
          signature is embedded as an image in the PDF. For legally binding digital signatures,
          use a certificate-based signing tool. All processing happens in your browser.
        </p>
      </div>
    </div>
  );
}
