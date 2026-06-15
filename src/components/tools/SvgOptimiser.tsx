"use client";

import { useState, useRef } from "react";

export default function SvgOptimiser() {
  const [input, setInput] = useState("");
  const [optimized, setOptimized] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInput(text);
      setOptimized(null);
    };
    reader.readAsText(file);
  };

  const optimizeSvg = () => {
    if (!input.trim()) return;

    let svg = input;

    // Remove XML declaration
    svg = svg.replace(/<\?xml[^?]*\?>\s*/gi, "");

    // Remove DOCTYPE
    svg = svg.replace(/<!DOCTYPE[^>]*>\s*/gi, "");

    // Remove comments
    svg = svg.replace(/<!--[\s\S]*?-->/g, "");

    // Remove metadata elements
    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    svg = svg.replace(/<title[\s\S]*?<\/title>/gi, "");
    svg = svg.replace(/<desc[\s\S]*?<\/desc>/gi, "");

    // Remove empty groups
    svg = svg.replace(/<g[^>]*>\s*<\/g>/g, "");

    // Remove editor namespaces
    svg = svg.replace(/\s*xmlns:(?:inkscape|sodipodi|sketch|dc|cc|rdf)="[^"]*"/gi, "");

    // Remove Inkscape/Sodipodi attributes
    svg = svg.replace(/\s*(?:inkscape|sodipodi):[a-z-]+="[^"]*"/gi, "");

    // Remove data-name attributes
    svg = svg.replace(/\s*data-name="[^"]*"/gi, "");

    // Remove empty attributes
    svg = svg.replace(/\s+[a-z-]+=""\s*/gi, " ");

    // Shorten decimal precision
    svg = svg.replace(/(\d+\.\d{3})\d+/g, "$1");

    // Remove default attribute values
    svg = svg.replace(/\s*fill-opacity="1"/gi, "");
    svg = svg.replace(/\s*stroke-opacity="1"/gi, "");
    svg = svg.replace(/\s*opacity="1"/gi, "");
    svg = svg.replace(/\s*fill-rule="nonzero"/gi, "");
    svg = svg.replace(/\s*clip-rule="nonzero"/gi, "");
    svg = svg.replace(/\s*font-style="normal"/gi, "");
    svg = svg.replace(/\s*font-weight="normal"/gi, "");
    svg = svg.replace(/\s*stroke-linecap="butt"/gi, "");
    svg = svg.replace(/\s*stroke-linejoin="miter"/gi, "");
    svg = svg.replace(/\s*stroke-miterlimit="4"/gi, "");

    // Remove empty style blocks
    svg = svg.replace(/\s*style=""/gi, "");

    // Remove px units (not needed in SVG)
    svg = svg.replace(/(\d+)px/g, "$1");

    // Collapse whitespace
    svg = svg.replace(/\s+/g, " ");
    svg = svg.replace(/>\s+</g, "><");
    svg = svg.trim();

    // Ensure xmlns is present
    if (!svg.includes("xmlns=")) {
      svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    setOriginalSize(new Blob([input as unknown as BlobPart]).size);
    setOptimizedSize(new Blob([svg as unknown as BlobPart]).size);
    setOptimized(svg);
  };

  const downloadOptimized = () => {
    if (!optimized) return;
    const blob = new Blob([optimized as unknown as BlobPart], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "optimized.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const savings = originalSize > 0
    ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <input
          type="file"
          accept=".svg,image/svg+xml"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
          >
            Upload SVG File
          </button>
        </div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          SVG Code
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOptimized(null);
          }}
          placeholder="Paste your SVG code here..."
          className="input-field w-full h-48 font-mono text-sm"
        />
      </div>

      <button
        onClick={optimizeSvg}
        disabled={!input.trim()}
        className="btn-primary"
      >
        Optimize SVG
      </button>

      {optimized && (
        <>
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
              Size Comparison
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{originalSize.toLocaleString()}</p>
                <p className="text-xs text-surface-500">Original (bytes)</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{optimizedSize.toLocaleString()}</p>
                <p className="text-xs text-surface-500">Optimized (bytes)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{savings}%</p>
                <p className="text-xs text-surface-500">Saved</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Optimized SVG
              </h3>
              <button
                onClick={() => navigator.clipboard.writeText(optimized)}
                className="btn-secondary text-sm"
              >
                Copy
              </button>
            </div>
            <pre className="bg-surface-100 dark:bg-surface-800 p-4 rounded overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto">
              {optimized}
            </pre>
          </div>

          <button onClick={downloadOptimized} className="btn-primary">
            Download Optimized SVG
          </button>
        </>
      )}
    </div>
  );
}
