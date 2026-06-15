"use client";

import { useState, useMemo, useCallback } from "react";

function hexToHsl(
  hex: string
): { h: number; s: number; l: number } {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hue = ((b - r) / d + 2) / 6;
        break;
      case b:
        hue = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(sat * 100),
    l: Math.round(light * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return (
      "#" +
      [v, v, v].map((c) => c.toString(16).padStart(2, "0")).join("")
    );
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const r = Math.round(hue2rgb(p, q, hn + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hn) * 255);
  const b = Math.round(hue2rgb(p, q, hn - 1 / 3) * 255);

  return (
    "#" +
    [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

interface Harmony {
  name: string;
  description: string;
  getColors: (h: number, s: number, l: number) => string[];
}

const harmonies: Harmony[] = [
  {
    name: "Complementary",
    description: "Colors opposite on the color wheel",
    getColors: (h, s, l) => [
      hslToHex(h, s, l),
      hslToHex(h + 180, s, l),
    ],
  },
  {
    name: "Analogous",
    description: "Colors adjacent on the color wheel",
    getColors: (h, s, l) => [
      hslToHex(h - 30, s, l),
      hslToHex(h, s, l),
      hslToHex(h + 30, s, l),
    ],
  },
  {
    name: "Triadic",
    description: "Three colors equally spaced (120deg apart)",
    getColors: (h, s, l) => [
      hslToHex(h, s, l),
      hslToHex(h + 120, s, l),
      hslToHex(h + 240, s, l),
    ],
  },
  {
    name: "Split-Complementary",
    description: "Base + two colors adjacent to its complement",
    getColors: (h, s, l) => [
      hslToHex(h, s, l),
      hslToHex(h + 150, s, l),
      hslToHex(h + 210, s, l),
    ],
  },
  {
    name: "Tetradic",
    description: "Four colors forming a rectangle on the wheel",
    getColors: (h, s, l) => [
      hslToHex(h, s, l),
      hslToHex(h + 90, s, l),
      hslToHex(h + 180, s, l),
      hslToHex(h + 270, s, l),
    ],
  },
  {
    name: "Monochromatic",
    description: "Different shades of the same hue",
    getColors: (h, s, l) => [
      hslToHex(h, s, Math.min(95, l + 30)),
      hslToHex(h, s, Math.min(85, l + 15)),
      hslToHex(h, s, l),
      hslToHex(h, s, Math.max(15, l - 15)),
      hslToHex(h, s, Math.max(5, l - 30)),
    ],
  },
];

export default function HarmonyGenerator() {
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const hsl = useMemo(() => hexToHsl(baseColor), [baseColor]);

  const copyHex = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }, []);

  const handleColorPicker = (hex: string) => {
    setBaseColor(hex);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Input */}
        <div className="lg:w-72 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Base Color
              </label>
              <input
                type="color"
                value={baseColor}
                onChange={(e) => handleColorPicker(e.target.value)}
                className="w-full h-16 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                HEX Value
              </label>
              <input
                type="text"
                value={baseColor}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    setBaseColor(e.target.value);
                  }
                }}
                className="input-field font-mono"
              />
            </div>
            <div className="text-xs text-surface-500 dark:text-surface-400 space-y-1">
              <p>HSL({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
            </div>
          </div>
        </div>

        {/* Right: Harmonies */}
        <div className="flex-1 space-y-4">
          {harmonies.map((harmony) => {
            const colors = harmony.getColors(hsl.h, hsl.s, hsl.l);
            return (
              <div
                key={harmony.name}
                className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6"
              >
                <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-1">
                  {harmony.name}
                </h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
                  {harmony.description}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => copyHex(hex)}
                      className="group flex flex-col items-center gap-2 cursor-pointer"
                      title={`Click to copy ${hex}`}
                    >
                      <div
                        className="w-16 h-16 rounded-lg border border-surface-200 dark:border-surface-700 transition-transform group-hover:scale-105 relative"
                        style={{ backgroundColor: hex }}
                      >
                        {copiedHex === hex && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold bg-black/50 text-white rounded-lg">
                            Copied
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-surface-600 dark:text-surface-400">
                        {hex.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
