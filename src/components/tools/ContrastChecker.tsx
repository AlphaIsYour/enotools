"use client";

import { useState, useMemo } from "react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function WcagBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        pass
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      }`}
    >
      {pass ? "PASS" : "FAIL"} {label}
    </span>
  );
}

export default function ContrastChecker() {
  const [foreground, setForeground] = useState("#1e293b");
  const [background, setBackground] = useState("#ffffff");

  const results = useMemo(() => {
    const fgRgb = hexToRgb(foreground);
    const bgRgb = hexToRgb(background);
    if (!fgRgb || !bgRgb) return null;

    const fgLum = relativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLum = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const ratio = contrastRatio(fgLum, bgLum);

    return {
      ratio: Math.round(ratio * 100) / 100,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [foreground, background]);

  const swapColors = () => {
    setForeground(background);
    setBackground(foreground);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Foreground (Text) Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-surface-200 dark:border-surface-600"
                />
                <input
                  type="text"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="input-field font-mono flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={swapColors}
                className="btn-secondary text-sm"
                title="Swap colors"
              >
                Swap
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Background Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-surface-200 dark:border-surface-600"
                />
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="input-field font-mono flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          {/* WCAG Results */}
          {results && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                WCAG Compliance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-surface-500 dark:text-surface-400 mb-2 block">
                    Level AA
                  </span>
                  <div className="space-y-2">
                    <WcagBadge
                      pass={results.aaNormal}
                      label="Normal text"
                    />
                    <div className="text-xs text-surface-500 dark:text-surface-400">
                      Requires 4.5:1
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    <WcagBadge
                      pass={results.aaLarge}
                      label="Large text"
                    />
                    <div className="text-xs text-surface-500 dark:text-surface-400">
                      Requires 3:1
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-surface-500 dark:text-surface-400 mb-2 block">
                    Level AAA
                  </span>
                  <div className="space-y-2">
                    <WcagBadge
                      pass={results.aaaNormal}
                      label="Normal text"
                    />
                    <div className="text-xs text-surface-500 dark:text-surface-400">
                      Requires 7:1
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    <WcagBadge
                      pass={results.aaaLarge}
                      label="Large text"
                    />
                    <div className="text-xs text-surface-500 dark:text-surface-400">
                      Requires 4.5:1
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 space-y-4">
          {results && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Contrast Ratio
                </h3>
                <span className="text-3xl font-bold font-mono text-surface-900 dark:text-surface-100">
                  {results.ratio}:1
                </span>
              </div>
            </div>
          )}

          <div
            className="rounded-lg border border-surface-200 dark:border-surface-800 p-8 space-y-4 min-h-[280px] flex flex-col justify-center"
            style={{ backgroundColor: background }}
          >
            <p
              className="text-3xl font-bold"
              style={{ color: foreground }}
            >
              Large Text (24px)
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: foreground }}
            >
              Normal body text at 16px. The quick brown fox jumps over the lazy
              dog. This sentence demonstrates how your color combination looks
              with regular paragraph content.
            </p>
            <p
              className="text-sm"
              style={{ color: foreground }}
            >
              Small text at 14px - harder to read with low contrast ratios.
            </p>
          </div>

          <div
            className="rounded-lg border border-surface-200 dark:border-surface-800 p-6 text-center"
            style={{ backgroundColor: foreground }}
          >
            <p
              className="text-2xl font-bold mb-2"
              style={{ color: background }}
            >
              Reversed
            </p>
            <p
              className="text-sm"
              style={{ color: background }}
            >
              Text on foreground-colored background
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
