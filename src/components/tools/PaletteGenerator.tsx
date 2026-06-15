"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

type HarmonyType = "random" | "analogous" | "complementary" | "triadic";

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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePalette(
  harmony: HarmonyType,
  satMin: number,
  satMax: number,
  lightMin: number,
  lightMax: number
): string[] {
  const baseHue = randomInt(0, 359);
  const baseSat = randomInt(satMin, satMax);
  const baseLight = randomInt(lightMin, lightMax);

  const hues: number[] = [];
  switch (harmony) {
    case "random":
      for (let i = 0; i < 5; i++) hues.push(randomInt(0, 359));
      break;
    case "analogous": {
      const offsets = [-40, -20, 0, 20, 40];
      for (const o of offsets) hues.push((baseHue + o + 360) % 360);
      break;
    }
    case "complementary": {
      hues.push(baseHue);
      hues.push(baseHue);
      hues.push((baseHue + 180) % 360);
      hues.push((baseHue + 180) % 360);
      hues.push((baseHue + 90) % 360);
      break;
    }
    case "triadic": {
      hues.push(baseHue);
      hues.push(baseHue);
      hues.push((baseHue + 120) % 360);
      hues.push((baseHue + 120) % 360);
      hues.push((baseHue + 240) % 360);
      break;
    }
  }

  return hues.map((h, i) => {
    const s = clamp(
      baseSat + randomInt(-15, 15),
      satMin,
      satMax
    );
    let l: number;
    switch (i) {
      case 0:
        l = clamp(baseLight + 30, lightMin, lightMax);
        break;
      case 1:
        l = clamp(baseLight + 10, lightMin, lightMax);
        break;
      case 2:
        l = baseLight;
        break;
      case 3:
        l = clamp(baseLight - 15, lightMin, lightMax);
        break;
      default:
        l = clamp(baseLight - 30, lightMin, lightMax);
    }
    return hslToHex(h, s, l);
  });
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export default function PaletteGenerator() {
  const [harmony, setHarmony] = useState<HarmonyType>("random");
  const [satMin, setSatMin] = useState(40);
  const [satMax, setSatMax] = useState(90);
  const [lightMin, setLightMin] = useState(25);
  const [lightMax, setLightMax] = useState(75);
  const [colors, setColors] = useState<string[]>(() =>
    generatePalette("random", 40, 90, 25, 75)
  );
  const [locked, setLocked] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [exportFormat, setExportFormat] = useState<"css" | "tailwind">("css");

  const regenerate = useCallback(() => {
    const newColors = generatePalette(
      harmony,
      satMin,
      satMax,
      lightMin,
      lightMax
    );
    setColors((prev) =>
      prev.map((c, i) => (locked[i] ? c : newColors[i]))
    );
  }, [harmony, satMin, satMax, lightMin, lightMax, locked]);

  const toggleLock = (index: number) => {
    setLocked((prev) => prev.map((l, i) => (i === index ? !l : l)));
  };

  const cssOutput = `:root {\n${colors
    .map((c, i) => `  --color-${i + 1}: ${c};`)
    .join("\n")}\n}`;

  const tailwindOutput = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${colors
    .map((c, i) => `          '${(i + 1) * 100}': '${c}',`)
    .join("\n")}\n        }\n      }\n    }\n  }\n}`;

  const exportOutput =
    exportFormat === "css" ? cssOutput : tailwindOutput;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Harmony Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    "random",
                    "analogous",
                    "complementary",
                    "triadic",
                  ] as HarmonyType[]
                ).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHarmony(h)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                      harmony === h
                        ? "bg-blue-500 text-white"
                        : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-surface-700 dark:text-surface-300 font-medium">
                  Saturation Range
                </span>
                <span className="font-mono text-surface-600 dark:text-surface-400 text-xs">
                  {satMin}% - {satMax}%
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={satMin}
                  onChange={(e) =>
                    setSatMin(Math.min(Number(e.target.value), satMax))
                  }
                  className="flex-1 accent-blue-500"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={satMax}
                  onChange={(e) =>
                    setSatMax(Math.max(Number(e.target.value), satMin))
                  }
                  className="flex-1 accent-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-surface-700 dark:text-surface-300 font-medium">
                  Lightness Range
                </span>
                <span className="font-mono text-surface-600 dark:text-surface-400 text-xs">
                  {lightMin}% - {lightMax}%
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={lightMin}
                  onChange={(e) =>
                    setLightMin(
                      Math.min(Number(e.target.value), lightMax)
                    )
                  }
                  className="flex-1 accent-blue-500"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={lightMax}
                  onChange={(e) =>
                    setLightMax(
                      Math.max(Number(e.target.value), lightMin)
                    )
                  }
                  className="flex-1 accent-blue-500"
                />
              </div>
            </div>

            <button onClick={regenerate} className="btn-primary w-full">
              Generate Palette
            </button>
          </div>

          {/* Export */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat("css")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    exportFormat === "css"
                      ? "bg-blue-500 text-white"
                      : "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300"
                  }`}
                >
                  CSS Variables
                </button>
                <button
                  onClick={() => setExportFormat("tailwind")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    exportFormat === "tailwind"
                      ? "bg-blue-500 text-white"
                      : "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300"
                  }`}
                >
                  Tailwind Config
                </button>
              </div>
              <CopyButton text={exportOutput} />
            </div>
            <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
              {exportOutput}
            </pre>
          </div>
        </div>

        {/* Right: Color Swatches */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div className="flex rounded-lg overflow-hidden h-24">
              {colors.map((color, i) => (
                <div
                  key={i}
                  className="flex-1 cursor-pointer relative group"
                  style={{ backgroundColor: color }}
                  onClick={() => toggleLock(i)}
                  title={locked[i] ? "Click to unlock" : "Click to lock"}
                >
                  {locked[i] && (
                    <span className="absolute inset-0 flex items-center justify-center text-2xl bg-black/30">
                      Lock
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-3">
              {colors.map((color, i) => (
                <div key={i} className="text-center space-y-2">
                  <div
                    className="h-20 rounded-lg border border-surface-200 dark:border-surface-700"
                    style={{ backgroundColor: color }}
                  />
                  <CopyButton text={color} className="w-full justify-center" />
                  <span className="block font-mono text-xs text-surface-600 dark:text-surface-400">
                    {color.toUpperCase()}
                  </span>
                  <button
                    onClick={() => toggleLock(i)}
                    className={`text-xs px-2 py-0.5 rounded ${
                      locked[i]
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                        : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"
                    }`}
                  >
                    {locked[i] ? "Locked" : "Lock"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={regenerate} className="btn-primary w-full">
            Regenerate Unlocked
          </button>
        </div>
      </div>
    </div>
  );
}
