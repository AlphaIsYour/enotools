"use client";

import { useState, useMemo } from "react";

export default function LineHeightCalculator() {
  const [fontSize, setFontSize] = useState("16");
  const [measure, setMeasure] = useState("65");

  const result = useMemo(() => {
    const fs = parseFloat(fontSize);
    const m = parseFloat(measure);
    if (isNaN(fs) || isNaN(m) || fs === 0) return null;

    // Optimal line height based on measure (characters per line)
    // Narrow measure (<45ch): 1.4-1.5, normal (45-75ch): 1.5-1.6, wide (>75ch): 1.6-1.8
    let lhUnitless: number;
    if (m < 45) {
      lhUnitless = 1.4;
    } else if (m <= 75) {
      lhUnitless = 1.5 + ((m - 45) / 30) * 0.1;
    } else {
      lhUnitless = 1.6 + Math.min((m - 75) / 50, 1) * 0.2;
    }

    lhUnitless = Math.round(lhUnitless * 100) / 100;
    const lhPx = Math.round(fs * lhUnitless * 100) / 100;
    const lhEm = lhUnitless;

    return { lhUnitless, lhPx, lhEm };
  }, [fontSize, measure]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Font Size (px)
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="16"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Measure / Width (characters)
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="65"
            value={measure}
            onChange={(e) => setMeasure(e.target.value)}
          />
        </div>
      </div>

      {result && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-4">Optimal Line Height</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{result.lhPx}px</p>
              <p className="text-sm text-surface-500 mt-1">Pixels</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{result.lhEm}em</p>
              <p className="text-sm text-surface-500 mt-1">Em</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{result.lhUnitless}</p>
              <p className="text-sm text-surface-500 mt-1">Unitless</p>
            </div>
          </div>
          <p className="text-sm text-surface-500 mt-4">
            Based on a measure of {measure} characters, the recommended line-height range is 1.4-1.8.
            At {fontSize}px font size, use <code className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200">line-height: {result.lhUnitless}</code> (unitless).
          </p>
        </div>
      )}
    </div>
  );
}
