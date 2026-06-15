"use client";

import { useState, useMemo } from "react";

const scales = [
  { label: "Minor Second", value: 1.067 },
  { label: "Minor Third", value: 1.2 },
  { label: "Major Third", value: 1.25 },
  { label: "Perfect Fourth", value: 1.333 },
  { label: "Augmented Fourth", value: 1.414 },
  { label: "Perfect Fifth", value: 1.5 },
  { label: "Golden Ratio", value: 1.618 },
];

const steps = [
  { name: "xs", multiplier: -2 },
  { name: "sm", multiplier: -1 },
  { name: "base", multiplier: 0 },
  { name: "lg", multiplier: 1 },
  { name: "xl", multiplier: 2 },
  { name: "2xl", multiplier: 3 },
  { name: "3xl", multiplier: 4 },
];

export default function TypographyCalculator() {
  const [baseSize, setBaseSize] = useState("16");
  const [scaleIndex, setScaleIndex] = useState(3); // Perfect Fourth

  const computedSizes = useMemo(() => {
    const base = parseFloat(baseSize);
    if (isNaN(base) || base <= 0) return [];
    const ratio = scales[scaleIndex].value;

    return steps.map((step) => {
      const size = base * Math.pow(ratio, step.multiplier);
      return {
        name: step.name,
        size: Math.round(size * 100) / 100,
        rem: Math.round((size / 16) * 1000) / 1000,
      };
    });
  }, [baseSize, scaleIndex]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Base Font Size (px)
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="16"
            value={baseSize}
            onChange={(e) => setBaseSize(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Scale Ratio
          </label>
          <select
            className="input-field"
            value={scaleIndex}
            onChange={(e) => setScaleIndex(parseInt(e.target.value))}
          >
            {scales.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label} ({s.value})
              </option>
            ))}
          </select>
        </div>
      </div>

      {computedSizes.length > 0 && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-4">
            Type Scale ({scales[scaleIndex].label} - {scales[scaleIndex].value})
          </h3>
          <div className="space-y-3">
            {computedSizes.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-800"
              >
                <span className="w-12 text-sm font-medium text-surface-500 shrink-0">{item.name}</span>
                <div
                  className="flex-1 text-surface-900 dark:text-surface-100 truncate"
                  style={{ fontSize: `${Math.min(item.size, 48)}px` }}
                >
                  The quick brown fox
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-mono text-surface-700 dark:text-surface-300">
                    {item.size}px
                  </span>
                  <span className="text-xs text-surface-500 ml-2">{item.rem}rem</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
