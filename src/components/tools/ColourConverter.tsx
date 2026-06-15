"use client";

import { useState, useCallback, useEffect } from "react";
import { CopyButton } from "@/components/CopyButton";

interface ColorFormats {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  tailwind: string;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        clamp(Math.round(v), 0, 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToHsv(
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function rgbToCmyk(
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } {
  if (r === 0 && g === 0 && b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

const TAILWIND_COLORS: { name: string; hex: string }[] = [
  { name: "slate-50", hex: "#f8fafc" },
  { name: "slate-100", hex: "#f1f5f9" },
  { name: "slate-200", hex: "#e2e8f0" },
  { name: "slate-300", hex: "#cbd5e1" },
  { name: "slate-400", hex: "#94a3b8" },
  { name: "slate-500", hex: "#64748b" },
  { name: "slate-600", hex: "#475569" },
  { name: "slate-700", hex: "#334155" },
  { name: "slate-800", hex: "#1e293b" },
  { name: "slate-900", hex: "#0f172a" },
  { name: "gray-50", hex: "#f9fafb" },
  { name: "gray-100", hex: "#f3f4f6" },
  { name: "gray-200", hex: "#e5e7eb" },
  { name: "gray-300", hex: "#d1d5db" },
  { name: "gray-400", hex: "#9ca3af" },
  { name: "gray-500", hex: "#6b7280" },
  { name: "gray-600", hex: "#4b5563" },
  { name: "gray-700", hex: "#374151" },
  { name: "gray-800", hex: "#1f2937" },
  { name: "gray-900", hex: "#111827" },
  { name: "red-50", hex: "#fef2f2" },
  { name: "red-100", hex: "#fee2e2" },
  { name: "red-200", hex: "#fecaca" },
  { name: "red-300", hex: "#fca5a5" },
  { name: "red-400", hex: "#f87171" },
  { name: "red-500", hex: "#ef4444" },
  { name: "red-600", hex: "#dc2626" },
  { name: "red-700", hex: "#b91c1c" },
  { name: "red-800", hex: "#991b1b" },
  { name: "red-900", hex: "#7f1d1d" },
  { name: "orange-50", hex: "#fff7ed" },
  { name: "orange-100", hex: "#ffedd5" },
  { name: "orange-200", hex: "#fed7aa" },
  { name: "orange-300", hex: "#fdba74" },
  { name: "orange-400", hex: "#fb923c" },
  { name: "orange-500", hex: "#f97316" },
  { name: "orange-600", hex: "#ea580c" },
  { name: "orange-700", hex: "#c2410c" },
  { name: "orange-800", hex: "#9a3412" },
  { name: "orange-900", hex: "#7c2d12" },
  { name: "amber-50", hex: "#fffbeb" },
  { name: "amber-100", hex: "#fef3c7" },
  { name: "amber-200", hex: "#fde68a" },
  { name: "amber-300", hex: "#fcd34d" },
  { name: "amber-400", hex: "#fbbf24" },
  { name: "amber-500", hex: "#f59e0b" },
  { name: "amber-600", hex: "#d97706" },
  { name: "amber-700", hex: "#b45309" },
  { name: "amber-800", hex: "#92400e" },
  { name: "amber-900", hex: "#78350f" },
  { name: "yellow-50", hex: "#fefce8" },
  { name: "yellow-100", hex: "#fef9c3" },
  { name: "yellow-200", hex: "#fef08a" },
  { name: "yellow-300", hex: "#fde047" },
  { name: "yellow-400", hex: "#facc15" },
  { name: "yellow-500", hex: "#eab308" },
  { name: "yellow-600", hex: "#ca8a04" },
  { name: "yellow-700", hex: "#a16207" },
  { name: "yellow-800", hex: "#854d0e" },
  { name: "yellow-900", hex: "#713f12" },
  { name: "lime-50", hex: "#f7fee7" },
  { name: "lime-100", hex: "#ecfccb" },
  { name: "lime-200", hex: "#d9f99d" },
  { name: "lime-300", hex: "#bef264" },
  { name: "lime-400", hex: "#a3e635" },
  { name: "lime-500", hex: "#84cc16" },
  { name: "lime-600", hex: "#65a30d" },
  { name: "lime-700", hex: "#4d7c0f" },
  { name: "lime-800", hex: "#3f6212" },
  { name: "lime-900", hex: "#365314" },
  { name: "green-50", hex: "#f0fdf4" },
  { name: "green-100", hex: "#dcfce7" },
  { name: "green-200", hex: "#bbf7d0" },
  { name: "green-300", hex: "#86efac" },
  { name: "green-400", hex: "#4ade80" },
  { name: "green-500", hex: "#22c55e" },
  { name: "green-600", hex: "#16a34a" },
  { name: "green-700", hex: "#15803d" },
  { name: "green-800", hex: "#166534" },
  { name: "green-900", hex: "#14532d" },
  { name: "emerald-50", hex: "#ecfdf5" },
  { name: "emerald-100", hex: "#d1fae5" },
  { name: "emerald-200", hex: "#a7f3d0" },
  { name: "emerald-300", hex: "#6ee7b7" },
  { name: "emerald-400", hex: "#34d399" },
  { name: "emerald-500", hex: "#10b981" },
  { name: "emerald-600", hex: "#059669" },
  { name: "emerald-700", hex: "#047857" },
  { name: "emerald-800", hex: "#065f46" },
  { name: "emerald-900", hex: "#064e3b" },
  { name: "teal-50", hex: "#f0fdfa" },
  { name: "teal-100", hex: "#ccfbf1" },
  { name: "teal-200", hex: "#99f6e4" },
  { name: "teal-300", hex: "#5eead4" },
  { name: "teal-400", hex: "#2dd4bf" },
  { name: "teal-500", hex: "#14b8a6" },
  { name: "teal-600", hex: "#0d9488" },
  { name: "teal-700", hex: "#0f766e" },
  { name: "teal-800", hex: "#115e59" },
  { name: "teal-900", hex: "#134e4a" },
  { name: "cyan-50", hex: "#ecfeff" },
  { name: "cyan-100", hex: "#cffafe" },
  { name: "cyan-200", hex: "#a5f3fc" },
  { name: "cyan-300", hex: "#67e8f9" },
  { name: "cyan-400", hex: "#22d3ee" },
  { name: "cyan-500", hex: "#06b6d4" },
  { name: "cyan-600", hex: "#0891b2" },
  { name: "cyan-700", hex: "#0e7490" },
  { name: "cyan-800", hex: "#155e75" },
  { name: "cyan-900", hex: "#164e63" },
  { name: "sky-50", hex: "#f0f9ff" },
  { name: "sky-100", hex: "#e0f2fe" },
  { name: "sky-200", hex: "#bae6fd" },
  { name: "sky-300", hex: "#7dd3fc" },
  { name: "sky-400", hex: "#38bdf8" },
  { name: "sky-500", hex: "#0ea5e9" },
  { name: "sky-600", hex: "#0284c7" },
  { name: "sky-700", hex: "#0369a1" },
  { name: "sky-800", hex: "#075985" },
  { name: "sky-900", hex: "#0c4a6e" },
  { name: "blue-50", hex: "#eff6ff" },
  { name: "blue-100", hex: "#dbeafe" },
  { name: "blue-200", hex: "#bfdbfe" },
  { name: "blue-300", hex: "#93c5fd" },
  { name: "blue-400", hex: "#60a5fa" },
  { name: "blue-500", hex: "#3b82f6" },
  { name: "blue-600", hex: "#2563eb" },
  { name: "blue-700", hex: "#1d4ed8" },
  { name: "blue-800", hex: "#1e40af" },
  { name: "blue-900", hex: "#1e3a8a" },
  { name: "indigo-50", hex: "#eef2ff" },
  { name: "indigo-100", hex: "#e0e7ff" },
  { name: "indigo-200", hex: "#c7d2fe" },
  { name: "indigo-300", hex: "#a5b4fc" },
  { name: "indigo-400", hex: "#818cf8" },
  { name: "indigo-500", hex: "#6366f1" },
  { name: "indigo-600", hex: "#4f46e5" },
  { name: "indigo-700", hex: "#4338ca" },
  { name: "indigo-800", hex: "#3730a3" },
  { name: "indigo-900", hex: "#312e81" },
  { name: "violet-50", hex: "#f5f3ff" },
  { name: "violet-100", hex: "#ede9fe" },
  { name: "violet-200", hex: "#ddd6fe" },
  { name: "violet-300", hex: "#c4b5fd" },
  { name: "violet-400", hex: "#a78bfa" },
  { name: "violet-500", hex: "#8b5cf6" },
  { name: "violet-600", hex: "#7c3aed" },
  { name: "violet-700", hex: "#6d28d9" },
  { name: "violet-800", hex: "#5b21b6" },
  { name: "violet-900", hex: "#4c1d95" },
  { name: "purple-50", hex: "#faf5ff" },
  { name: "purple-100", hex: "#f3e8ff" },
  { name: "purple-200", hex: "#e9d5ff" },
  { name: "purple-300", hex: "#d8b4fe" },
  { name: "purple-400", hex: "#c084fc" },
  { name: "purple-500", hex: "#a855f7" },
  { name: "purple-600", hex: "#9333ea" },
  { name: "purple-700", hex: "#7e22ce" },
  { name: "purple-800", hex: "#6b21a8" },
  { name: "purple-900", hex: "#581c87" },
  { name: "fuchsia-50", hex: "#fdf4ff" },
  { name: "fuchsia-100", hex: "#fae8ff" },
  { name: "fuchsia-200", hex: "#f5d0fe" },
  { name: "fuchsia-300", hex: "#f0abfc" },
  { name: "fuchsia-400", hex: "#e879f9" },
  { name: "fuchsia-500", hex: "#d946ef" },
  { name: "fuchsia-600", hex: "#c026d3" },
  { name: "fuchsia-700", hex: "#a21caf" },
  { name: "fuchsia-800", hex: "#86198f" },
  { name: "fuchsia-900", hex: "#701a75" },
  { name: "pink-50", hex: "#fdf2f8" },
  { name: "pink-100", hex: "#fce7f3" },
  { name: "pink-200", hex: "#fbcfe8" },
  { name: "pink-300", hex: "#f9a8d4" },
  { name: "pink-400", hex: "#f472b6" },
  { name: "pink-500", hex: "#ec4899" },
  { name: "pink-600", hex: "#db2777" },
  { name: "pink-700", hex: "#be185d" },
  { name: "pink-800", hex: "#9d174d" },
  { name: "pink-900", hex: "#831843" },
  { name: "rose-50", hex: "#fff1f2" },
  { name: "rose-100", hex: "#ffe4e6" },
  { name: "rose-200", hex: "#fecdd3" },
  { name: "rose-300", hex: "#fda4af" },
  { name: "rose-400", hex: "#fb7185" },
  { name: "rose-500", hex: "#f43f5e" },
  { name: "rose-600", hex: "#e11d48" },
  { name: "rose-700", hex: "#be123c" },
  { name: "rose-800", hex: "#9f1239" },
  { name: "rose-900", hex: "#881337" },
  { name: "white", hex: "#ffffff" },
  { name: "black", hex: "#000000" },
];

function findClosestTailwind(
  r: number,
  g: number,
  b: number
): string {
  let minDist = Infinity;
  let closest = "unknown";
  for (const tc of TAILWIND_COLORS) {
    const tr = hexToRgb(tc.hex);
    if (!tr) continue;
    const dist = Math.sqrt(
      (r - tr.r) ** 2 + (g - tr.g) ** 2 + (b - tr.b) ** 2
    );
    if (dist < minDist) {
      minDist = dist;
      closest = tc.name;
    }
  }
  return closest;
}

function parseColor(input: string): { r: number; g: number; b: number } | null {
  const trimmed = input.trim();

  // HEX
  if (trimmed.startsWith("#")) {
    return hexToRgb(trimmed);
  }

  // RGB
  const rgbMatch = trimmed.match(
    /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      return { r, g, b };
    }
  }

  // HSL
  const hslMatch = trimmed.match(
    /^hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)$/i
  );
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);
    if (h <= 360 && s <= 100 && l <= 100) {
      return hslToRgb(h, s, l);
    }
  }

  return null;
}

function convertAll(
  r: number,
  g: number,
  b: number
): ColorFormats {
  return {
    hex: rgbToHex(r, g, b),
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
    hsv: rgbToHsv(r, g, b),
    cmyk: rgbToCmyk(r, g, b),
    tailwind: findClosestTailwind(r, g, b),
  };
}

export default function ColourConverter() {
  const [input, setInput] = useState("#3b82f6");
  const [color, setColor] = useState("#3b82f6");
  const [formats, setFormats] = useState<ColorFormats>(() =>
    convertAll(59, 130, 246)
  );
  const [error, setError] = useState("");

  const handleInput = useCallback((value: string) => {
    setInput(value);
    const parsed = parseColor(value);
    if (parsed) {
      setFormats(convertAll(parsed.r, parsed.g, parsed.b));
      setColor(rgbToHex(parsed.r, parsed.g, parsed.b));
      setError("");
    } else if (value.trim().length > 2) {
      setError("Could not parse color. Try #RRGGBB, rgb(r,g,b), or hsl(h,s%,l%)");
    } else {
      setError("");
    }
  }, []);

  const handleColorPicker = useCallback((hex: string) => {
    setColor(hex);
    setInput(hex);
    const parsed = hexToRgb(hex);
    if (parsed) {
      setFormats(convertAll(parsed.r, parsed.g, parsed.b));
    }
    setError("");
  }, []);

  useEffect(() => {
    handleInput(input);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Input */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Color Picker
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorPicker(e.target.value)}
                className="w-full h-16 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Color Value
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="#3b82f6, rgb(59,130,246), hsl(217,91%,60%)"
                className="input-field font-mono"
              />
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>

          <div
            className="rounded-lg h-32 border border-surface-200 dark:border-surface-800 flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span
              className="text-lg font-bold font-mono drop-shadow-lg"
              style={{
                color: formats.hsl.l > 50 ? "#000000" : "#ffffff",
              }}
            >
              {color.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right: Output Formats */}
        <div className="flex-1 space-y-3">
          {[
            {
              label: "HEX",
              value: formats.hex.toUpperCase(),
            },
            {
              label: "RGB",
              value: `rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`,
            },
            {
              label: "HSL",
              value: `hsl(${formats.hsl.h}, ${formats.hsl.s}%, ${formats.hsl.l}%)`,
            },
            {
              label: "HSV",
              value: `hsv(${formats.hsv.h}, ${formats.hsv.s}%, ${formats.hsv.v}%)`,
            },
            {
              label: "CMYK",
              value: `cmyk(${formats.cmyk.c}%, ${formats.cmyk.m}%, ${formats.cmyk.y}%, ${formats.cmyk.k}%)`,
            },
            {
              label: "Tailwind",
              value: formats.tailwind,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 flex items-center justify-between"
            >
              <div>
                <span className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  {item.label}
                </span>
                <span className="font-mono text-sm text-surface-900 dark:text-surface-100">
                  {item.value}
                </span>
              </div>
              <CopyButton text={item.value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
