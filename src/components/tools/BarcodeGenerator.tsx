"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import JsBarcode from "jsbarcode";
import { CopyButton } from "@/components/CopyButton";
import { Download } from "lucide-react";

type BarcodeFormat =
  | "CODE128"
  | "CODE128A"
  | "CODE128B"
  | "CODE128C"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "CODE39"
  | "ITF14"
  | "MSI"
  | "pharmacode";

interface FormatInfo {
  value: BarcodeFormat;
  label: string;
  hint: string;
}

const formats: FormatInfo[] = [
  { value: "CODE128", label: "CODE128", hint: "Any ASCII character" },
  { value: "CODE128A", label: "CODE128A", hint: "Uppercase + control chars" },
  { value: "CODE128B", label: "CODE128B", hint: "Upper + lower case" },
  { value: "CODE128C", label: "CODE128C", hint: "Numeric pairs (even length)" },
  { value: "EAN13", label: "EAN-13", hint: "12-13 digits" },
  { value: "EAN8", label: "EAN-8", hint: "7-8 digits" },
  { value: "UPC", label: "UPC-A", hint: "11-12 digits" },
  { value: "CODE39", label: "CODE39", hint: "Uppercase + digits + special" },
  { value: "ITF14", label: "ITF-14", hint: "13-14 digits" },
  { value: "MSI", label: "MSI", hint: "Numeric only" },
  { value: "pharmacode", label: "Pharmacode", hint: "Number 3-131070" },
];

export default function BarcodeGenerator() {
  const [value, setValue] = useState("123456789012");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [textMargin, setTextMargin] = useState(2);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [lineColor, setLineColor] = useState("#000000");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const generateBarcode = useCallback(() => {
    if (!value.trim()) {
      setError("Please enter a value.");
      return;
    }

    setError(null);

    try {
      const options = {
        format,
        width,
        height,
        displayValue,
        fontSize,
        textMargin,
        background: bgColor,
        lineColor,
        margin: 10,
      };

      // Generate to canvas
      if (canvasRef.current) {
        JsBarcode(canvasRef.current, value, options);
      }

      // Generate to SVG
      if (svgRef.current) {
        JsBarcode(svgRef.current, value, { ...options, xmlDocument: document });
      }
    } catch (err) {
      setError((err as Error).message || "Failed to generate barcode. Check your input and format.");
    }
  }, [value, format, width, height, displayValue, fontSize, textMargin, bgColor, lineColor]);

  useEffect(() => {
    const timer = setTimeout(generateBarcode, 200);
    return () => clearTimeout(timer);
  }, [generateBarcode]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "barcode.png";
    link.href = url;
    link.click();
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr as unknown as BlobPart], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "barcode.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSvgString = (): string => {
    if (!svgRef.current) return "";
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgRef.current);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Content
            </h3>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Value
              </label>
              <input
                type="text"
                className="input-field w-full font-mono"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter barcode value..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Format
              </label>
              <select
                className="input-field w-full"
                value={format}
                onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label} - {f.hint}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-5">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Bar Width: {width}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Height: {height}
                </label>
                <input
                  type="range"
                  min={30}
                  max={200}
                  step={5}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Font Size: {fontSize}
                </label>
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Text Margin: {textMargin}
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={textMargin}
                  onChange={(e) => setTextMargin(Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Line Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="h-10 w-10 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-800"
                  />
                  <input
                    type="text"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="input-field font-mono text-sm flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-10 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-800"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="input-field font-mono text-sm flex-1"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-surface-700 dark:text-surface-300">
                Show text below barcode
              </span>
            </label>
          </div>
        </div>

        {/* Preview & Export */}
        <div className="space-y-5">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Preview
            </h3>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-center p-6 rounded-lg bg-surface-50 dark:bg-surface-800 min-h-[200px] overflow-auto">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>

            {/* Hidden SVG for export */}
            <svg ref={svgRef} className="hidden" />
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Export
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={downloadPng} className="btn-primary" disabled={!!error}>
                <Download className="h-4 w-4" />
                PNG
              </button>
              <button onClick={downloadSvg} className="btn-primary" disabled={!!error}>
                <Download className="h-4 w-4" />
                SVG
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                Copy SVG code
              </span>
              <CopyButton text={getSvgString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
