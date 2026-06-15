"use client";

import { useState } from "react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

// Brettel, Vienot, and Mollon (1997) simulation matrices
// Protanopia (no red cones)
function simulateProtanopia(
  r: number,
  g: number,
  b: number
): { r: number; g: number; b: number } {
  return {
    r: 0.56667 * r + 0.43333 * g + 0.0 * b,
    g: 0.55833 * r + 0.44167 * g + 0.0 * b,
    b: 0.0 * r + 0.24167 * g + 0.75833 * b,
  };
}

// Deuteranopia (no green cones)
function simulateDeuteranopia(
  r: number,
  g: number,
  b: number
): { r: number; g: number; b: number } {
  return {
    r: 0.625 * r + 0.375 * g + 0.0 * b,
    g: 0.7 * r + 0.3 * g + 0.0 * b,
    b: 0.0 * r + 0.3 * g + 0.7 * b,
  };
}

// Tritanopia (no blue cones)
function simulateTritanopia(
  r: number,
  g: number,
  b: number
): { r: number; g: number; b: number } {
  return {
    r: 0.95 * r + 0.05 * g + 0.0 * b,
    g: 0.0 * r + 0.43333 * g + 0.56667 * b,
    b: 0.0 * r + 0.475 * g + 0.525 * b,
  };
}

// Achromatopsia (total color blindness)
function simulateAchromatopsia(
  r: number,
  g: number,
  b: number
): { r: number; g: number; b: number } {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  return { r: gray, g: gray, b: gray };
}

interface Simulation {
  name: string;
  description: string;
  fn: (r: number, g: number, b: number) => { r: number; g: number; b: number };
}

const simulations: Simulation[] = [
  {
    name: "Protanopia",
    description: "Red-blind (~1% of males)",
    fn: simulateProtanopia,
  },
  {
    name: "Deuteranopia",
    description: "Green-blind (~1% of males)",
    fn: simulateDeuteranopia,
  },
  {
    name: "Tritanopia",
    description: "Blue-blind (~0.003%)",
    fn: simulateTritanopia,
  },
  {
    name: "Achromatopsia",
    description: "Total color blindness (~0.003%)",
    fn: simulateAchromatopsia,
  },
];

export default function ColourBlindnessSimulator() {
  const [color, setColor] = useState("#3b82f6");
  const [inputValue, setInputValue] = useState("#3b82f6");

  const rgb = hexToRgb(color);

  const handleColorPicker = (hex: string) => {
    setColor(hex);
    setInputValue(hex);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setColor(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Input */}
        <div className="lg:w-80 space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Color Picker
              </label>
              <input
                type="color"
                value={color}
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
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="input-field font-mono"
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </div>

        {/* Right: Simulations */}
        <div className="flex-1 space-y-4">
          {/* Original */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
              Original Color
            </h3>
            <div
              className="h-24 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <span
                className="font-mono text-lg font-bold drop-shadow-lg"
                style={{
                  color:
                    rgb &&
                    (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) > 128
                      ? "#000000"
                      : "#ffffff",
                }}
              >
                {color.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Simulated colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {simulations.map((sim) => {
              if (!rgb) return null;
              const simulated = sim.fn(rgb.r, rgb.g, rgb.b);
              const simHex = rgbToHex(
                simulated.r,
                simulated.g,
                simulated.b
              );
              const simLum =
                0.299 * simulated.r +
                0.587 * simulated.g +
                0.114 * simulated.b;

              return (
                <div
                  key={sim.name}
                  className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 space-y-3"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                      {sim.name}
                    </h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {sim.description}
                    </p>
                  </div>
                  <div
                    className="h-20 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center"
                    style={{ backgroundColor: simHex }}
                  >
                    <span
                      className="font-mono text-sm font-bold drop-shadow-lg"
                      style={{
                        color: simLum > 128 ? "#000000" : "#ffffff",
                      }}
                    >
                      {simHex.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
