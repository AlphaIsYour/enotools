"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";

interface ShadowLayer {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

const defaultShadow: ShadowLayer = {
  offsetX: 4,
  offsetY: 4,
  blur: 12,
  spread: 0,
  color: "#000000",
  opacity: 25,
  inset: false,
};

const presets: { name: string; shadows: ShadowLayer[] }[] = [
  {
    name: "Subtle",
    shadows: [
      { offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: "#000000", opacity: 12, inset: false },
    ],
  },
  {
    name: "Soft",
    shadows: [
      { offsetX: 0, offsetY: 4, blur: 14, spread: 0, color: "#000000", opacity: 15, inset: false },
    ],
  },
  {
    name: "Hard",
    shadows: [
      { offsetX: 6, offsetY: 6, blur: 0, spread: 0, color: "#000000", opacity: 30, inset: false },
    ],
  },
  {
    name: "Layered",
    shadows: [
      { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: "#000000", opacity: 10, inset: false },
      { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: "#000000", opacity: 10, inset: false },
      { offsetX: 0, offsetY: 12, blur: 24, spread: 0, color: "#000000", opacity: 12, inset: false },
    ],
  },
  {
    name: "Neumorphism",
    shadows: [
      { offsetX: 8, offsetY: 8, blur: 16, spread: 0, color: "#000000", opacity: 15, inset: false },
      { offsetX: -8, offsetY: -8, blur: 16, spread: 0, color: "#ffffff", opacity: 70, inset: false },
    ],
  },
];

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

function shadowToCss(shadows: ShadowLayer[]): string {
  return shadows
    .map(
      (s) =>
        `${s.inset ? "inset " : ""}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`
    )
    .join(",\n    ");
}

export default function CssBoxShadow() {
  const [shadows, setShadows] = useState<ShadowLayer[]>([{ ...defaultShadow }]);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#3b82f6");

  const updateShadow = (index: number, field: keyof ShadowLayer, value: number | string | boolean) => {
    setShadows((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const addShadow = () => {
    setShadows((prev) => [...prev, { ...defaultShadow }]);
  };

  const removeShadow = (index: number) => {
    if (shadows.length <= 1) return;
    setShadows((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: (typeof presets)[number]) => {
    setShadows(preset.shadows.map((s) => ({ ...s })));
  };

  const cssCode = `box-shadow: ${shadowToCss(shadows)};`;

  const SliderInput = ({
    label,
    value,
    min,
    max,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-surface-600 dark:text-surface-300">{label}</span>
        <span className="font-mono text-surface-800 dark:text-surface-100">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <div className="flex-1 space-y-4">
          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
              Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="btn-secondary text-xs"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow Layers */}
          {shadows.map((shadow, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                  Shadow {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-300">
                    <input
                      type="checkbox"
                      checked={shadow.inset}
                      onChange={(e) => updateShadow(idx, "inset", e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    Inset
                  </label>
                  {shadows.length > 1 && (
                    <button
                      onClick={() => removeShadow(idx)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <SliderInput
                label="Horizontal Offset"
                value={shadow.offsetX}
                min={-50}
                max={50}
                onChange={(v) => updateShadow(idx, "offsetX", v)}
              />
              <SliderInput
                label="Vertical Offset"
                value={shadow.offsetY}
                min={-50}
                max={50}
                onChange={(v) => updateShadow(idx, "offsetY", v)}
              />
              <SliderInput
                label="Blur Radius"
                value={shadow.blur}
                min={0}
                max={100}
                onChange={(v) => updateShadow(idx, "blur", v)}
              />
              <SliderInput
                label="Spread Radius"
                value={shadow.spread}
                min={-50}
                max={50}
                onChange={(v) => updateShadow(idx, "spread", v)}
              />

              <div className="flex items-center gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-sm text-surface-600 dark:text-surface-300">Color</span>
                  <input
                    type="color"
                    value={shadow.color}
                    onChange={(e) => updateShadow(idx, "color", e.target.value)}
                    className="w-full h-9 rounded cursor-pointer border border-surface-200 dark:border-surface-600"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600 dark:text-surface-300">Opacity</span>
                    <span className="font-mono text-surface-800 dark:text-surface-100">{shadow.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={shadow.opacity}
                    onChange={(e) => updateShadow(idx, "opacity", Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addShadow} className="btn-secondary w-full text-sm">
            + Add Shadow Layer
          </button>

          {/* Box colors */}
          <div className="flex gap-3">
            <div className="space-y-1 flex-1">
              <label className="text-sm text-surface-600 dark:text-surface-300">Preview Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-9 rounded cursor-pointer border border-surface-200 dark:border-surface-600"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-sm text-surface-600 dark:text-surface-300">Box Color</label>
              <input
                type="color"
                value={boxColor}
                onChange={(e) => setBoxColor(e.target.value)}
                className="w-full h-9 rounded cursor-pointer border border-surface-200 dark:border-surface-600"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview & Output */}
        <div className="flex-1 space-y-4">
          <div
            className="rounded-lg flex items-center justify-center min-h-[300px] p-8"
            style={{ backgroundColor: bgColor }}
          >
            <div
              className="w-40 h-40 rounded-lg transition-all duration-150"
              style={{
                backgroundColor: boxColor,
                boxShadow: shadows
                  .map(
                    (s) =>
                      `${s.inset ? "inset " : ""}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`
                  )
                  .join(", "),
              }}
            />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">Generated CSS</span>
              <CopyButton text={cssCode} />
            </div>
            <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
