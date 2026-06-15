"use client";

import { useState, useMemo } from "react";

export default function PxToRem() {
  const [pxValue, setPxValue] = useState("");
  const [baseFontSize, setBaseFontSize] = useState("16");

  const converted = useMemo(() => {
    const px = parseFloat(pxValue);
    const base = parseFloat(baseFontSize);
    if (isNaN(px) || isNaN(base) || base === 0) return null;
    return px / base;
  }, [pxValue, baseFontSize]);

  const commonConversions = [12, 14, 16, 18, 20, 24, 32, 48];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            PX Value
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="Enter px value"
            value={pxValue}
            onChange={(e) => setPxValue(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Base Font Size (px)
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="16"
            value={baseFontSize}
            onChange={(e) => setBaseFontSize(e.target.value)}
          />
        </div>
      </div>

      {converted !== null && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Result</h3>
          <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            {converted.toFixed(4)} <span className="text-lg font-normal text-surface-500">rem</span>
          </p>
          <p className="text-sm text-surface-500 mt-1">
            {pxValue}px / {baseFontSize}px = {converted.toFixed(4)}rem
          </p>
        </div>
      )}

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Common Conversions (base {baseFontSize}px)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="text-left py-2 pr-4 font-medium text-surface-700 dark:text-surface-300">PX</th>
                <th className="text-left py-2 font-medium text-surface-700 dark:text-surface-300">REM</th>
              </tr>
            </thead>
            <tbody>
              {commonConversions.map((px) => {
                const base = parseFloat(baseFontSize) || 16;
                return (
                  <tr key={px} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <td className="py-2 pr-4 text-surface-600 dark:text-surface-400">{px}px</td>
                    <td className="py-2 text-surface-900 dark:text-surface-100">{(px / base).toFixed(4)}rem</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
