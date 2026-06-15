"use client";

import { useState, useRef, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";
import { parse as parseFont } from "opentype.js/dist/opentype.mjs";

interface GlyphInfo {
  index: number;
  unicode: number | undefined;
  name: string;
  character: string;
}

const PAGE_SIZE = 50;

export default function GlyphBrowser() {
  const [glyphs, setGlyphs] = useState<GlyphInfo[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphInfo | null>(null);
  const [fontFamily, setFontFamily] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontIdRef = useRef(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setGlyphs([]);
    setSelectedGlyph(null);
    setPage(0);
    setSearch("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const buffer = ev.target?.result as ArrayBuffer;
        const font = parseFont(buffer);

        // Load font for rendering
        fontIdRef.current += 1;
        const fontId = `glyph-browser-${fontIdRef.current}`;
        const blob = new Blob([buffer as unknown as BlobPart]);
        const fontUrl = URL.createObjectURL(blob);

        const existingStyle = document.getElementById(`font-face-${fontId}`);
        if (existingStyle) existingStyle.remove();
        const styleEl = document.createElement("style");
        styleEl.id = `font-face-${fontId}`;
        const ext = file.name.split(".").pop()?.toLowerCase();
        let format = "truetype";
        if (ext === "otf") format = "opentype";
        else if (ext === "woff") format = "woff";
        else if (ext === "woff2") format = "woff2";
        styleEl.textContent = `
          @font-face {
            font-family: '${fontId}';
            src: url('${fontUrl}') format('${format}');
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(styleEl);
        setFontFamily(fontId);

        const result: GlyphInfo[] = [];
        for (let i = 0; i < font.glyphs.length; i++) {
          const glyph = font.glyphs.get(i);
          result.push({
            index: i,
            unicode: glyph.unicode,
            name: glyph.name || `glyph_${i}`,
            character:
              glyph.unicode !== undefined
                ? String.fromCodePoint(glyph.unicode)
                : "",
          });
        }
        setGlyphs(result);
      } catch {
        setError("Failed to parse font file.");
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

  const filtered = useMemo(() => {
    if (!search.trim()) return glyphs;
    const q = search.trim().toLowerCase();
    return glyphs.filter((g) => {
      if (g.name.toLowerCase().includes(q)) return true;
      if (g.unicode !== undefined) {
        const hex = g.unicode.toString(16).toUpperCase().padStart(4, "0");
        if (hex.toLowerCase().includes(q)) return true;
        if (`U+${hex}`.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [glyphs, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageGlyphs = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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

      {glyphs.length > 0 && (
        <>
          {/* Search & Stats */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Search by name or Unicode value
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="e.g. 'space', 'U+0041', 'latin'"
                  className="input-field w-full"
                />
              </div>
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {filtered.length} of {glyphs.length} glyphs
              </span>
            </div>
          </div>

          {/* Glyph Grid */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {pageGlyphs.map((g) => (
                <button
                  key={g.index}
                  onClick={() => setSelectedGlyph(g)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-colors ${
                    selectedGlyph?.index === g.index
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 bg-surface-50 dark:bg-surface-800"
                  }`}
                  title={g.name}
                >
                  <span
                    className="text-2xl leading-none"
                    style={{ fontFamily: `'${fontFamily}'` }}
                  >
                    {g.character || " "}
                  </span>
                  <span className="text-[10px] font-mono text-surface-500 dark:text-surface-400 mt-1 truncate w-full text-center">
                    {g.unicode !== undefined
                      ? `U+${g.unicode.toString(16).toUpperCase().padStart(4, "0")}`
                      : "---"}
                  </span>
                </button>
              ))}
            </div>

            {pageGlyphs.length === 0 && (
              <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-8">
                No glyphs match your search.
              </p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Selected Glyph Details */}
          {selectedGlyph && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Glyph Details
              </h3>
              <div className="flex items-start gap-6">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-5xl"
                  style={{ fontFamily: `'${fontFamily}'` }}
                >
                  {selectedGlyph.character || " "}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <DetailRow label="Name" value={selectedGlyph.name} />
                  <DetailRow
                    label="Unicode"
                    value={
                      selectedGlyph.unicode !== undefined
                        ? `U+${selectedGlyph.unicode.toString(16).toUpperCase().padStart(4, "0")}`
                        : "N/A"
                    }
                  />
                  <DetailRow
                    label="Character"
                    value={selectedGlyph.character || "N/A"}
                  />
                  <DetailRow label="Glyph Index" value={String(selectedGlyph.index)} />
                  {selectedGlyph.character && (
                    <div className="pt-2">
                      <CopyButton text={selectedGlyph.character} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium text-surface-500 dark:text-surface-400 w-24 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-mono text-surface-900 dark:text-surface-100 break-all">
        {value}
      </span>
    </div>
  );
}
