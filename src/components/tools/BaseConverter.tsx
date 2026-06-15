"use client";

import { useState, useMemo } from "react";

function convertBase(value: string, fromBase: number, toBase: number): string {
  try {
    // Parse the input in the source base using BigInt
    const bigintValue = BigInt(parseInt(value, fromBase));
    if (isNaN(Number(bigintValue))) return "Invalid input";

    // Convert to target base
    if (toBase === 10) return bigintValue.toString(10);
    return bigintValue.toString(toBase).toUpperCase();
  } catch {
    return "Invalid input";
  }
}

function toBaseSafe(value: string, fromBase: number, targetBase: number): string {
  try {
    const num = BigInt(parseInt(value, fromBase));
    if (isNaN(Number(num))) return "-";
    return num.toString(targetBase).toUpperCase();
  } catch {
    return "-";
  }
}

export default function BaseConverter() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);

  const converted = useMemo(() => {
    if (!input.trim()) return "";
    return convertBase(input.trim(), fromBase, toBase);
  }, [input, fromBase, toBase]);

  const allBases = useMemo(() => {
    if (!input.trim()) return null;
    return {
      binary: toBaseSafe(input.trim(), fromBase, 2),
      octal: toBaseSafe(input.trim(), fromBase, 8),
      decimal: toBaseSafe(input.trim(), fromBase, 10),
      hex: toBaseSafe(input.trim(), fromBase, 16),
    };
  }, [input, fromBase]);

  const baseOptions = Array.from({ length: 35 }, (_, i) => i + 2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            From Base
          </label>
          <select
            className="input-field"
            value={fromBase}
            onChange={(e) => setFromBase(parseInt(e.target.value))}
          >
            {baseOptions.map((b) => (
              <option key={b} value={b}>
                Base {b}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            To Base
          </label>
          <select
            className="input-field"
            value={toBase}
            onChange={(e) => setToBase(parseInt(e.target.value))}
          >
            {baseOptions.map((b) => (
              <option key={b} value={b}>
                Base {b}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Number
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      </div>

      {input.trim() && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Result (Base {toBase})
          </h3>
          <p className="text-2xl font-mono font-bold text-surface-900 dark:text-surface-100 break-all">
            {converted}
          </p>
        </div>
      )}

      {allBases && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            All Representations
          </h3>
          <div className="space-y-2">
            {[
              { label: "Binary (Base 2)", value: allBases.binary },
              { label: "Octal (Base 8)", value: allBases.octal },
              { label: "Decimal (Base 10)", value: allBases.decimal },
              { label: "Hexadecimal (Base 16)", value: allBases.hex },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-2 rounded bg-surface-50 dark:bg-surface-800"
              >
                <span className="text-sm text-surface-500 shrink-0 sm:w-44">{item.label}</span>
                <span className="font-mono text-sm text-surface-900 dark:text-surface-100 break-all">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
