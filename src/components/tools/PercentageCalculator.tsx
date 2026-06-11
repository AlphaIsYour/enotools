"use client";

import { useState, useMemo } from "react";

type Mode =
  | "what-is-x-of-y"
  | "x-is-what-pct-of-y"
  | "pct-change"
  | "increase"
  | "decrease"
  | "x-is-y-pct-of-what";

interface HistoryEntry {
  id: number;
  mode: Mode;
  inputs: Record<string, number>;
  result: string;
  formula: string;
  timestamp: Date;
}

const modes: { key: Mode; label: string }[] = [
  { key: "what-is-x-of-y", label: "What is X% of Y?" },
  { key: "x-is-what-pct-of-y", label: "X is what % of Y?" },
  { key: "pct-change", label: "Percentage change" },
  { key: "increase", label: "Increase X by Y%" },
  { key: "decrease", label: "Decrease X by Y%" },
  { key: "x-is-y-pct-of-what", label: "X is Y% of what?" },
];

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("what-is-x-of-y");
  const [inputs, setInputs] = useState<Record<string, string>>({ x: "", y: "" });
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const updateInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    const x = parseFloat(inputs.x);
    const y = parseFloat(inputs.y);
    if (isNaN(x) || isNaN(y)) return null;

    switch (mode) {
      case "what-is-x-of-y": {
        const r = (x / 100) * y;
        return {
          value: r,
          display: r.toLocaleString("en-US", { maximumFractionDigits: 6 }),
          formula: `${x}% of ${y} = (${x} / 100) * ${y} = ${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}`,
        };
      }
      case "x-is-what-pct-of-y": {
        if (y === 0) return null;
        const r = (x / y) * 100;
        return {
          value: r,
          display: `${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}%`,
          formula: `(${x} / ${y}) * 100 = ${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}%`,
        };
      }
      case "pct-change": {
        if (x === 0) return null;
        const r = ((y - x) / Math.abs(x)) * 100;
        return {
          value: r,
          display: `${r >= 0 ? "+" : ""}${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}%`,
          formula: `((${y} - ${x}) / |${x}|) * 100 = ${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}%`,
        };
      }
      case "increase": {
        const r = x * (1 + y / 100);
        return {
          value: r,
          display: r.toLocaleString("en-US", { maximumFractionDigits: 6 }),
          formula: `${x} * (1 + ${y}/100) = ${x} * ${1 + y / 100} = ${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}`,
        };
      }
      case "decrease": {
        const r = x * (1 - y / 100);
        return {
          value: r,
          display: r.toLocaleString("en-US", { maximumFractionDigits: 6 }),
          formula: `${x} * (1 - ${y}/100) = ${x} * ${1 - y / 100} = ${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}`,
        };
      }
      case "x-is-y-pct-of-what": {
        if (y === 0) return null;
        const r = (x / y) * 100;
        return {
          value: r,
          display: r.toLocaleString("en-US", { maximumFractionDigits: 6 }),
          formula: `${x} / (${y} / 100) = ${x} / ${y / 100} = ${r.toLocaleString("en-US", { maximumFractionDigits: 6 })}`,
        };
      }
    }
  }, [mode, inputs]);

  const addToHistory = () => {
    if (!result) return;
    const entry: HistoryEntry = {
      id: Date.now(),
      mode,
      inputs: { x: parseFloat(inputs.x), y: parseFloat(inputs.y) },
      result: result.display,
      formula: result.formula,
      timestamp: new Date(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 20));
  };

  const getLabels = () => {
    switch (mode) {
      case "what-is-x-of-y":
        return { x: "Percentage (%)", y: "Of value" };
      case "x-is-what-pct-of-y":
        return { x: "Value", y: "Of total" };
      case "pct-change":
        return { x: "From value", y: "To value" };
      case "increase":
        return { x: "Original value", y: "Increase by (%)" };
      case "decrease":
        return { x: "Original value", y: "Decrease by (%)" };
      case "x-is-y-pct-of-what":
        return { x: "Value", y: "Percentage (%)" };
    }
  };

  const labels = getLabels();

  const getModeLabel = (m: Mode) => modes.find((mo) => mo.key === m)?.label ?? m;

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMode(m.key);
              setInputs({ x: "", y: "" });
            }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              mode === m.key
                ? "bg-blue-600 text-white"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Inputs */}
        <div className="flex-1 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">
                {labels.x}
              </label>
              <input
                type="number"
                value={inputs.x}
                onChange={(e) => updateInput("x", e.target.value)}
                placeholder="Enter value"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">
                {labels.y}
              </label>
              <input
                type="number"
                value={inputs.y}
                onChange={(e) => updateInput("y", e.target.value)}
                placeholder="Enter value"
                className="input-field"
              />
            </div>
          </div>

          {result && (
            <button onClick={addToHistory} className="btn-secondary text-sm w-full">
              Save to History
            </button>
          )}
        </div>

        {/* Right: Result */}
        <div className="flex-1 space-y-4">
          {result ? (
            <>
              <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Result</div>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 font-mono">
                  {result.display}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                <div className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Formula</div>
                <div className="font-mono text-sm text-surface-700 dark:text-surface-200">{result.formula}</div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-surface-400 dark:text-surface-500 border border-dashed border-surface-300 dark:border-surface-600 rounded-xl">
              Enter values to see the result
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-200">History</h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-surface-500 dark:text-surface-400 text-xs">{getModeLabel(entry.mode)}</div>
                  <div className="font-mono text-surface-700 dark:text-surface-200 truncate">{entry.formula}</div>
                </div>
                <div className="font-mono font-semibold text-blue-600 dark:text-blue-400 ml-3 flex-shrink-0">
                  {entry.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
