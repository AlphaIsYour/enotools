"use client";

import { useState, useRef } from "react";
import opentype from "opentype.js";

interface FontInfo {
  family: string;
  style: string;
  version: string;
  designer: string;
  license: string;
  glyphCount: number;
  unitsPerEm: number;
  unicodeRanges: string[];
  fontUrl: string;
  fileName: string;
}

function formatUnicodeRange(ranges: [number, number][]): string[] {
  return ranges.map(([start, end]) => {
    const s = "U+" + start.toString(16).toUpperCase().padStart(4, "0");
    const e = "U+" + end.toString(16).toUpperCase().padStart(4, "0");
    return start === end ? s : `${s}-${e}`;
  });
}

export default function FontFileExplorer() {
  const [fontInfo, setFontInfo] = useState<FontInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontIdRef = useRef(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setFontInfo(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const buffer = ev.target?.result as ArrayBuffer;
        const font = opentype.parse(buffer);

        const names = font.names;
        const family =
          (names.fontFamily?.en as string) || "Unknown";
        const style =
          (names.fontSubfamily?.en as string) || "Regular";
        const version =
          (names.version?.en as string) || "Unknown";
        const designer =
          (names.designer?.en as string) || "Unknown";
        const license =
          (names.license?.en as string) || "Unknown";

        // Collect Unicode ranges from glyphs
        const codepoints: number[] = [];
        for (let i = 0; i < font.glyphs.length; i++) {
          const glyph = font.glyphs.get(i);
          if (glyph.unicode !== undefined) {
            codepoints.push(glyph.unicode);
          }
        }
        codepoints.sort((a, b) => a - b);

        // Build contiguous ranges
        const ranges: [number, number][] = [];
        if (codepoints.length > 0) {
          let start = codepoints[0];
          let end = codepoints[0];
          for (let i = 1; i < codepoints.length; i++) {
            if (codepoints[i] <= end + 1) {
              end = codepoints[i];
            } else {
              ranges.push([start, end]);
              start = codepoints[i];
              end = codepoints[i];
            }
          }
          ranges.push([start, end]);
        }

        // Revoke previous font URL if any
        if (fontInfo?.fontUrl) {
          URL.revokeObjectURL(fontInfo.fontUrl);
        }

        // Create a blob URL for @font-face usage
        const blob = new Blob([buffer as unknown as BlobPart]);
        const fontUrl = URL.createObjectURL(blob);
        fontIdRef.current += 1;
        const fontId = `uploaded-font-${fontIdRef.current}`;

        // Inject @font-face
        const existingStyle = document.getElementById(`font-face-${fontId}`);
        if (existingStyle) existingStyle.remove();
        const styleEl = document.createElement("style");
        styleEl.id = `font-face-${fontId}`;
        styleEl.textContent = `
          @font-face {
            font-family: '${fontId}';
            src: url('${fontUrl}') format('${getFormat(file.name)}');
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(styleEl);

        setFontInfo({
          family,
          style,
          version,
          designer,
          license,
          glyphCount: font.glyphs.length,
          unitsPerEm: font.unitsPerEm,
          unicodeRanges: formatUnicodeRange(ranges),
          fontUrl: fontId,
          fileName: file.name,
        });
      } catch {
        setError("Failed to parse font file. Make sure it is a valid .ttf, .otf, .woff, or .woff2 file.");
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

  const getFormat = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ttf":
        return "truetype";
      case "otf":
        return "opentype";
      case "woff":
        return "woff";
      case "woff2":
        return "woff2";
      default:
        return "truetype";
    }
  };

  const previewSizes = [16, 24, 32, 48, 64, 96];

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Upload Font File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFileUpload}
          className="input-field w-full"
        />
        {loading && (
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Parsing font...
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {fontInfo && (
        <>
          {/* Font Metadata */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Font Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="File Name" value={fontInfo.fileName} />
              <InfoRow label="Family" value={fontInfo.family} />
              <InfoRow label="Style" value={fontInfo.style} />
              <InfoRow label="Version" value={fontInfo.version} />
              <InfoRow label="Designer" value={fontInfo.designer} />
              <InfoRow label="License" value={fontInfo.license} />
              <InfoRow label="Glyph Count" value={fontInfo.glyphCount.toLocaleString()} />
              <InfoRow label="Units per Em" value={fontInfo.unitsPerEm.toLocaleString()} />
            </div>
          </div>

          {/* Unicode Ranges */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Supported Unicode Ranges
            </h3>
            <div className="max-h-48 overflow-y-auto">
              {fontInfo.unicodeRanges.length === 0 ? (
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  No Unicode ranges detected.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {fontInfo.unicodeRanges.map((range, i) => (
                    <span
                      key={i}
                      className="inline-block text-xs font-mono px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                    >
                      {range}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Preview
            </h3>
            <div className="space-y-4">
              {previewSizes.map((size) => (
                <div key={size} className="flex items-baseline gap-4">
                  <span className="text-xs text-surface-500 dark:text-surface-400 w-10 text-right flex-shrink-0">
                    {size}px
                  </span>
                  <p
                    style={{
                      fontFamily: `'${fontInfo.fontUrl}'`,
                      fontSize: `${size}px`,
                      lineHeight: 1.3,
                    }}
                    className="text-surface-900 dark:text-surface-100"
                  >
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-0.5">
        {label}
      </span>
      <span className="text-sm text-surface-900 dark:text-surface-100 break-all">
        {value}
      </span>
    </div>
  );
}
