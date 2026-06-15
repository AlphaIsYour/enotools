"use client";

import { useState, useRef } from "react";

interface PdfReport {
  fileName: string;
  fileSize: string;
  metadata: {
    title: string;
    author: string;
    creator: string;
    producer: string;
    creationDate: string;
  };
  pageCount: number | null;
  hasEmbeddedFonts: boolean;
  fontNames: string[];
  hasImages: boolean;
  imageCount: number;
  colorSpaceRefs: string[];
}

function extractPdfString(text: string, key: string): string {
  // Look for /Key (value) pattern
  const regex = new RegExp(`\\/${key}\\s*\\(([^)]*)\\)`);
  const match = text.match(regex);
  if (match) return match[1].replace(/\\./g, (s) => {
    if (s === "\\n") return "\n";
    if (s === "\\r") return "\r";
    if (s === "\\t") return "\t";
    return s[1];
  });

  // Look for /Key <hex> pattern
  const hexRegex = new RegExp(`\\/${key}\\s*<([0-9A-Fa-f]+)>`);
  const hexMatch = text.match(hexRegex);
  if (hexMatch) {
    try {
      const hex = hexMatch[1];
      let str = "";
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    } catch {
      return "";
    }
  }

  return "";
}

function analyzePdf(buffer: ArrayBuffer): PdfReport {
  // Convert to string for basic parsing
  const bytes = new Uint8Array(buffer);
  let text = "";
  for (let i = 0; i < bytes.length; i++) {
    text += String.fromCharCode(bytes[i]);
  }

  // Metadata
  const title = extractPdfString(text, "Title");
  const author = extractPdfString(text, "Author");
  const creator = extractPdfString(text, "Creator");
  const producer = extractPdfString(text, "Producer");
  const creationDate = extractPdfString(text, "CreationDate");

  // Page count - look for /Type /Page entries (not /Type /Pages)
  const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : null;

  // Embedded fonts - look for /Type /Font
  const fontMatches = text.match(/\/Type\s*\/Font\b/g);
  const hasEmbeddedFonts = !!fontMatches && fontMatches.length > 0;

  // Extract font names
  const fontNames: string[] = [];
  const fontNameRegex = /\/BaseFont\s*\/([A-Za-z0-9+\-]+)/g;
  let fontNameMatch;
  while ((fontNameMatch = fontNameRegex.exec(text)) !== null) {
    const name = fontNameMatch[1];
    if (!fontNames.includes(name)) {
      fontNames.push(name);
    }
  }

  // Also look for /Name entries under Font descriptors
  const fontDescRegex = /\/FontName\s*\/([A-Za-z0-9+\-]+)/g;
  while ((fontNameMatch = fontDescRegex.exec(text)) !== null) {
    const name = fontNameMatch[1];
    if (!fontNames.includes(name)) {
      fontNames.push(name);
    }
  }

  // Images - look for /Subtype /Image
  const imageMatches = text.match(/\/Subtype\s*\/Image\b/g);
  const hasImages = !!imageMatches && imageMatches.length > 0;
  const imageCount = imageMatches ? imageMatches.length : 0;

  // Color spaces
  const colorSpaceRefs: string[] = [];
  const csRegex = /\/ColorSpace\s*\/(\w+)/g;
  let csMatch;
  while ((csMatch = csRegex.exec(text)) !== null) {
    const cs = csMatch[1];
    if (!colorSpaceRefs.includes(cs)) {
      colorSpaceRefs.push(cs);
    }
  }
  // Also check for common color space names
  const commonCsPatterns = ["/DeviceRGB", "/DeviceCMYK", "/DeviceGray", "/ICCBased"];
  for (const cs of commonCsPatterns) {
    if (text.includes(cs) && !colorSpaceRefs.includes(cs.substring(1))) {
      colorSpaceRefs.push(cs.substring(1));
    }
  }

  const fileSizeKB = (buffer.byteLength / 1024).toFixed(1);
  const fileSizeMB = (buffer.byteLength / (1024 * 1024)).toFixed(2);
  const fileSize =
    buffer.byteLength > 1024 * 1024
      ? `${fileSizeMB} MB`
      : `${fileSizeKB} KB`;

  return {
    fileName: "",
    fileSize,
    metadata: { title, author, creator, producer, creationDate },
    pageCount,
    hasEmbeddedFonts,
    fontNames,
    hasImages,
    imageCount,
    colorSpaceRefs,
  };
}

export default function PdfPreflight() {
  const [report, setReport] = useState<PdfReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setReport(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const buffer = ev.target?.result as ArrayBuffer;
        const result = analyzePdf(buffer);
        result.fileName = file.name;
        setReport(result);
      } catch {
        setError("Failed to analyze the PDF file.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Upload PDF File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="input-field w-full"
        />
        {loading && (
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Analyzing PDF...
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {report && (
        <>
          {/* File Info */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Preflight Report: {report.fileName}
            </h3>
            <div className="text-sm text-surface-600 dark:text-surface-400">
              File size: {report.fileSize}
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Checklist
            </h3>
            <div className="space-y-3">
              <ChecklistItem
                label="Page Count"
                value={
                  report.pageCount !== null
                    ? `${report.pageCount} page${report.pageCount !== 1 ? "s" : ""}`
                    : "Could not determine"
                }
                status={report.pageCount !== null ? "pass" : "warn"}
              />
              <ChecklistItem
                label="Embedded Fonts"
                value={
                  report.hasEmbeddedFonts
                    ? `${report.fontNames.length} font(s) found`
                    : "No embedded fonts detected"
                }
                status={report.hasEmbeddedFonts ? "pass" : "warn"}
              />
              <ChecklistItem
                label="Images"
                value={
                  report.hasImages
                    ? `${report.imageCount} image object(s) found`
                    : "No images detected"
                }
                status="info"
              />
              <ChecklistItem
                label="Color Spaces"
                value={
                  report.colorSpaceRefs.length > 0
                    ? report.colorSpaceRefs.join(", ")
                    : "No color space references found"
                }
                status="info"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetaRow label="Title" value={report.metadata.title} />
              <MetaRow label="Author" value={report.metadata.author} />
              <MetaRow label="Creator" value={report.metadata.creator} />
              <MetaRow label="Producer" value={report.metadata.producer} />
              <MetaRow
                label="Creation Date"
                value={report.metadata.creationDate}
              />
            </div>
          </div>

          {/* Fonts List */}
          {report.fontNames.length > 0 && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
                Detected Fonts
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.fontNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs font-mono px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChecklistItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "pass" | "warn" | "fail" | "info";
}) {
  const icons = {
    pass: { symbol: "✓", color: "text-emerald-600 dark:text-emerald-400" },
    warn: { symbol: "⚠", color: "text-amber-600 dark:text-amber-400" },
    fail: { symbol: "✗", color: "text-red-600 dark:text-red-400" },
    info: { symbol: "ℹ", color: "text-blue-600 dark:text-blue-400" },
  };
  const icon = icons[status];

  return (
    <div className="flex items-start gap-3">
      <span className={`text-lg flex-shrink-0 ${icon.color}`}>{icon.symbol}</span>
      <div>
        <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
          {label}
        </span>
        <p className="text-xs text-surface-500 dark:text-surface-400">{value}</p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-0.5">
        {label}
      </span>
      <span className="text-sm text-surface-900 dark:text-surface-100 break-all">
        {value || "Not specified"}
      </span>
    </div>
  );
}
