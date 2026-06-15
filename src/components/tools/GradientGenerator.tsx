"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

interface ColorStop {
  color: string;
  position: number;
}

type GradientType = "linear" | "radial" | "conic";

export default function GradientGenerator() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#3b82f6", position: 0 },
    { color: "#8b5cf6", position: 50 },
    { color: "#ec4899", position: 100 },
  ]);

  const updateStop = useCallback(
    (index: number, field: keyof ColorStop, value: string | number) => {
      setStops((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const addStop = () => {
    if (stops.length >= 10) return;
    const lastPos = stops[stops.length - 1].position;
    const secondLastPos =
      stops.length >= 2 ? stops[stops.length - 2].position : 0;
    const newPos = Math.min(100, Math.round((lastPos + secondLastPos) / 2 + 25));
    setStops((prev) => [
      ...prev,
      { color: "#6366f1", position: newPos },
    ]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  const stopsString = sortedStops
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  let cssValue = "";
  switch (type) {
    case "linear":
      cssValue = `linear-gradient(${angle}deg, ${stopsString})`;
      break;
    case "radial":
      cssValue = `radial-gradient(circle, ${stopsString})`;
      break;
    case "conic":
      cssValue = `conic-gradient(from ${angle}deg, ${stopsString})`;
      break;
  }

  const cssCode = `background: ${cssValue};`;

  const randomColor = () =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  const randomize = () => {
    const count = stops.length;
    const newStops: ColorStop[] = [];
    for (let i = 0; i < count; i++) {
      newStops.push({
        color: randomColor(),
        position: Math.round((i / (count - 1)) * 100),
      });
    }
    setStops(newStops);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Gradient Type
              </label>
              <div className="flex gap-2">
                {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                      type === t
                        ? "bg-blue-500 text-white"
                        : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {type !== "radial" && (
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-surface-700 dark:text-surface-300 font-medium">
                    {type === "linear" ? "Angle" : "Start Angle"}
                  </span>
                  <span className="font-mono text-surface-600 dark:text-surface-400">
                    {angle}deg
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Color Stops ({stops.length}/10)
                </label>
                <button
                  onClick={randomize}
                  className="btn-secondary text-xs"
                >
                  Randomize
                </button>
              </div>

              <div className="space-y-3">
                {stops.map((stop, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800"
                  >
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) =>
                        updateStop(idx, "color", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer border border-surface-200 dark:border-surface-600 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-500 dark:text-surface-400">
                          Position
                        </span>
                        <span className="font-mono text-surface-600 dark:text-surface-300">
                          {stop.position}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) =>
                          updateStop(
                            idx,
                            "position",
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <span className="font-mono text-xs text-surface-500 dark:text-surface-400 w-16 flex-shrink-0">
                      {stop.color.toUpperCase()}
                    </span>
                    {stops.length > 2 && (
                      <button
                        onClick={() => removeStop(idx)}
                        className="text-red-500 hover:text-red-600 text-sm flex-shrink-0"
                        title="Remove stop"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {stops.length < 10 && (
                <button
                  onClick={addStop}
                  className="btn-secondary w-full text-sm mt-3"
                >
                  + Add Color Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview & Output */}
        <div className="flex-1 space-y-4">
          <div
            className="rounded-lg border border-surface-200 dark:border-surface-800 h-64 lg:h-80"
            style={{ background: cssValue }}
          />

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                Generated CSS
              </span>
              <CopyButton text={cssCode} />
            </div>
            <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
