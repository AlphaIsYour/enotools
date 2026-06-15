"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";

function hexToHsl(
  hex: string
): { h: number; s: number; l: number } | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
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

function generateShades(
  h: number,
  s: number,
  l: number
): { shade: number; hex: string; lightness: number }[] {
  const shadeTargets: { shade: number; targetL: number; satScale: number }[] = [
    { shade: 50, targetL: 97, satScale: 0.3 },
    { shade: 100, targetL: 93, satScale: 0.4 },
    { shade: 200, targetL: 86, satScale: 0.55 },
    { shade: 300, targetL: 76, satScale: 0.7 },
    { shade: 400, targetL: 64, satScale: 0.85 },
    { shade: 500, targetL: l, satScale: 1.0 },
    { shade: 600, targetL: 42, satScale: 0.95 },
    { shade: 700, targetL: 34, satScale: 0.9 },
    { shade: 800, targetL: 26, satScale: 0.85 },
    { shade: 900, targetL: 20, satScale: 0.8 },
    { shade: 950, targetL: 10, satScale: 0.7 },
  ];

  return shadeTargets.map((t) => {
    const targetL = t.shade === 500 ? l : t.targetL;
    const targetS = Math.max(0, Math.min(100, Math.round(s * t.satScale)));
    return {
      shade: t.shade,
      hex: hslToHex(h, targetS, targetL),
      lightness: targetL,
    };
  });
}

export default function TailwindShadeGenerator() {
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const [colorName, setColorName] = useState("primary");
  const [copiedAll, setCopiedAll] = useState(false);

  const hsl = useMemo(() => hexToHsl(baseColor), [baseColor]);

  const shades = useMemo(() => {
    if (!hsl) return [];
    return generateShades(hsl.h, hsl.s, hsl.l);
  }, [hsl]);

  const tailwindConfig = useMemo(() => {
    if (!hsl) return "";
    const lines = shades.map(
      (s) => `        '${s.shade}': '${s.hex}',`
    );
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${colorName}': {\n${lines.join("\n")}\n        }\n      }\n    }\n  }\n}`;
  }, [shades, colorName, hsl]);

  const cssVars = useMemo(() => {
    if (!hsl) return "";
    const lines = shades.map(
      (s) => `  --color-${colorName}-${s.shade}: ${s.hex};`
    );
    return `:root {\n${lines.join("\n")}\n}`;
  }, [shades, colorName, hsl]);

  const handleColorPicker = (hex: string) => {
    setBaseColor(hex);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(tailwindConfig);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = tailwindConfig;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <div className="lg:w-80 space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Color Name
              </label>
              <input
                type="text"
                value={colorName}
                onChange={(e) =>
                  setColorName(
                    e.target.value.replace(/[^a-zA-Z0-9-]/g, "")
                  )
                }
                className="input-field font-mono"
                placeholder="primary"
              />
            </div>
            {hsl && (
              <div className="text-xs text-surface-500 dark:text-surface-400 space-y-1">
                <p>
                  HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
                </p>
                <p>Generated 11 shades (50-950)</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Shades */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              Shade Scale
            </h3>
            <div className="flex rounded-lg overflow-hidden h-16">
              {shades.map((s) => (
                <div
                  key={s.shade}
                  className="flex-1 relative group cursor-pointer"
                  style={{ backgroundColor: s.hex }}
                  title={`${s.shade}: ${s.hex}`}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                    style={{
                      color: s.lightness > 55 ? "#000000" : "#ffffff",
                    }}
                  >
                    {s.shade}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {shades.map((s) => (
                <div key={s.shade} className="text-center">
                  <div
                    className="h-12 rounded-lg border border-surface-200 dark:border-surface-700 mb-2"
                    style={{ backgroundColor: s.hex }}
                  />
                  <span className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                    {s.shade}
                  </span>
                  <CopyButton
                    text={s.hex}
                    className="mt-1 w-full justify-center"
                  />
                  <span className="block font-mono text-xs text-surface-500 dark:text-surface-400 mt-1">
                    {s.hex.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                Tailwind Config
              </h3>
              <button
                onClick={copyAll}
                className="btn-secondary text-xs"
              >
                {copiedAll ? "Copied!" : "Copy Config"}
              </button>
            </div>
            <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
              {tailwindConfig}
            </pre>
          </div>

          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                CSS Variables
              </h3>
              <CopyButton text={cssVars} />
            </div>
            <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
              {cssVars}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
