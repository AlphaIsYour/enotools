"use client";

import { useState, useMemo } from "react";

type Category = "Length" | "Weight" | "Temperature" | "Area" | "Volume" | "Speed" | "Time" | "Data";

interface UnitDef {
  name: string;
  abbr: string;
  // factor to convert FROM this unit TO the base unit
  factor: number;
  // optional custom conversion (for temperature)
  custom?: {
    toBase: (v: number) => number;
    fromBase: (v: number) => number;
  };
}

interface CategoryDef {
  name: Category;
  baseUnit: string;
  units: UnitDef[];
  popular: [string, string][];
}

const categories: CategoryDef[] = [
  {
    name: "Length",
    baseUnit: "m",
    units: [
      { name: "Millimeter", abbr: "mm", factor: 0.001 },
      { name: "Centimeter", abbr: "cm", factor: 0.01 },
      { name: "Meter", abbr: "m", factor: 1 },
      { name: "Kilometer", abbr: "km", factor: 1000 },
      { name: "Inch", abbr: "in", factor: 0.0254 },
      { name: "Foot", abbr: "ft", factor: 0.3048 },
      { name: "Yard", abbr: "yd", factor: 0.9144 },
      { name: "Mile", abbr: "mi", factor: 1609.344 },
    ],
    popular: [["km", "mi"], ["cm", "in"], ["m", "ft"]],
  },
  {
    name: "Weight",
    baseUnit: "kg",
    units: [
      { name: "Milligram", abbr: "mg", factor: 0.000001 },
      { name: "Gram", abbr: "g", factor: 0.001 },
      { name: "Kilogram", abbr: "kg", factor: 1 },
      { name: "Pound", abbr: "lb", factor: 0.453592 },
      { name: "Ounce", abbr: "oz", factor: 0.0283495 },
      { name: "Metric Ton", abbr: "ton", factor: 1000 },
    ],
    popular: [["kg", "lb"], ["g", "oz"], ["kg", "ton"]],
  },
  {
    name: "Temperature",
    baseUnit: "C",
    units: [
      {
        name: "Celsius",
        abbr: "C",
        factor: 1,
        custom: {
          toBase: (v) => v,
          fromBase: (v) => v,
        },
      },
      {
        name: "Fahrenheit",
        abbr: "F",
        factor: 1,
        custom: {
          toBase: (v) => (v - 32) * (5 / 9),
          fromBase: (v) => v * (9 / 5) + 32,
        },
      },
      {
        name: "Kelvin",
        abbr: "K",
        factor: 1,
        custom: {
          toBase: (v) => v - 273.15,
          fromBase: (v) => v + 273.15,
        },
      },
    ],
    popular: [["C", "F"], ["C", "K"], ["F", "K"]],
  },
  {
    name: "Area",
    baseUnit: "sqm",
    units: [
      { name: "Square Meter", abbr: "sqm", factor: 1 },
      { name: "Square Foot", abbr: "sqft", factor: 0.092903 },
      { name: "Square Kilometer", abbr: "sqkm", factor: 1e6 },
      { name: "Square Mile", abbr: "sqmi", factor: 2.59e6 },
      { name: "Acre", abbr: "acre", factor: 4046.86 },
      { name: "Hectare", abbr: "ha", factor: 10000 },
    ],
    popular: [["sqm", "sqft"], ["ha", "acre"], ["sqkm", "sqmi"]],
  },
  {
    name: "Volume",
    baseUnit: "l",
    units: [
      { name: "Milliliter", abbr: "ml", factor: 0.001 },
      { name: "Liter", abbr: "l", factor: 1 },
      { name: "Gallon (US)", abbr: "gal", factor: 3.78541 },
      { name: "Quart", abbr: "qt", factor: 0.946353 },
      { name: "Pint", abbr: "pt", factor: 0.473176 },
      { name: "Cup", abbr: "cup", factor: 0.236588 },
      { name: "Fluid Ounce", abbr: "fl oz", factor: 0.0295735 },
    ],
    popular: [["l", "gal"], ["ml", "fl oz"], ["cup", "ml"]],
  },
  {
    name: "Speed",
    baseUnit: "m/s",
    units: [
      { name: "Meters per Second", abbr: "m/s", factor: 1 },
      { name: "Kilometers per Hour", abbr: "km/h", factor: 1 / 3.6 },
      { name: "Miles per Hour", abbr: "mph", factor: 0.44704 },
      { name: "Knots", abbr: "kn", factor: 0.514444 },
    ],
    popular: [["km/h", "mph"], ["m/s", "km/h"], ["kn", "km/h"]],
  },
  {
    name: "Time",
    baseUnit: "s",
    units: [
      { name: "Millisecond", abbr: "ms", factor: 0.001 },
      { name: "Second", abbr: "s", factor: 1 },
      { name: "Minute", abbr: "min", factor: 60 },
      { name: "Hour", abbr: "hr", factor: 3600 },
      { name: "Day", abbr: "day", factor: 86400 },
      { name: "Week", abbr: "wk", factor: 604800 },
      { name: "Month", abbr: "mo", factor: 2629800 },
      { name: "Year", abbr: "yr", factor: 31557600 },
    ],
    popular: [["hr", "min"], ["day", "hr"], ["wk", "day"]],
  },
  {
    name: "Data",
    baseUnit: "B",
    units: [
      { name: "Byte", abbr: "B", factor: 1 },
      { name: "Kilobyte", abbr: "KB", factor: 1024 },
      { name: "Megabyte", abbr: "MB", factor: 1048576 },
      { name: "Gigabyte", abbr: "GB", factor: 1073741824 },
      { name: "Terabyte", abbr: "TB", factor: 1099511627776 },
    ],
    popular: [["GB", "MB"], ["TB", "GB"], ["MB", "KB"]],
  },
];

function formatNumber(n: number): string {
  if (Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(6);
  if (Math.abs(n) >= 1e12) return n.toExponential(6);
  // remove trailing zeros
  const s = n.toLocaleString("en-US", { maximumFractionDigits: 10 });
  return s;
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState("km");
  const [toUnit, setToUnit] = useState("mi");
  const [inputValue, setInputValue] = useState("1");

  const cat = categories.find((c) => c.name === category)!;

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    const def = categories.find((c) => c.name === newCat)!;
    setFromUnit(def.popular[0][0]);
    setToUnit(def.popular[0][1]);
    setInputValue("1");
  };

  const convertedValue = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return null;

    const from = cat.units.find((u) => u.abbr === fromUnit);
    const to = cat.units.find((u) => u.abbr === toUnit);
    if (!from || !to) return null;

    let baseVal: number;
    if (from.custom) {
      baseVal = from.custom.toBase(val);
    } else {
      baseVal = val * from.factor;
    }

    let result: number;
    if (to.custom) {
      result = to.custom.fromBase(baseVal);
    } else {
      result = baseVal / to.factor;
    }

    return result;
  }, [inputValue, fromUnit, toUnit, cat]);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const fromDef = cat.units.find((u) => u.abbr === fromUnit);
  const toDef = cat.units.find((u) => u.abbr === toUnit);

  const formula = useMemo(() => {
    if (!fromDef || !toDef) return "";
    if (fromDef.custom || toDef.custom) {
      return `Convert ${fromDef.name} to ${toDef.name} using conversion formula`;
    }
    const factor = fromDef.factor / toDef.factor;
    return `1 ${fromDef.abbr} = ${formatNumber(factor)} ${toDef.abbr}`;
  }, [fromDef, toDef]);

  const applyQuickConversion = (pair: [string, string]) => {
    setFromUnit(pair[0]);
    setToUnit(pair[1]);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => handleCategoryChange(c.name)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              category === c.name
                ? "bg-blue-600 text-white"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <div className="flex-1 space-y-4">
          {/* From */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200">From</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="input-field flex-1"
                placeholder="Enter value"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="input-field !w-auto"
              >
                {cat.units.map((u) => (
                  <option key={u.abbr} value={u.abbr}>
                    {u.name} ({u.abbr})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <button
              onClick={swap}
              className="p-2 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-surface-600 dark:text-surface-300"
              title="Swap units"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200">To</label>
            <div className="flex gap-2">
              <div className="input-field flex-1 flex items-center font-mono min-h-[42px]">
                {convertedValue !== null ? formatNumber(convertedValue) : "—"}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="input-field !w-auto"
              >
                {cat.units.map((u) => (
                  <option key={u.abbr} value={u.abbr}>
                    {u.name} ({u.abbr})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Formula */}
          <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            <div className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Formula</div>
            <div className="font-mono text-sm text-surface-700 dark:text-surface-200">{formula}</div>
          </div>

          {/* Popular Conversions */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
              Popular Conversions
            </label>
            <div className="flex flex-wrap gap-2">
              {cat.popular.map(([f, t]) => {
                const fDef = cat.units.find((u) => u.abbr === f);
                const tDef = cat.units.find((u) => u.abbr === t);
                return (
                  <button
                    key={`${f}-${t}`}
                    onClick={() => applyQuickConversion([f, t])}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      fromUnit === f && toUnit === t
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                    }`}
                  >
                    {fDef?.abbr} → {tDef?.abbr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Result Display */}
        <div className="flex-1 space-y-4">
          {convertedValue !== null && (
            <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                {parseFloat(inputValue).toLocaleString("en-US")} {fromDef?.name}
              </div>
              <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 font-mono mb-1">
                {formatNumber(convertedValue)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">{toDef?.name}</div>
            </div>
          )}

          {/* Conversion Table */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="bg-surface-50 dark:bg-surface-800 px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-200">
              {fromDef?.abbr} to other {category.toLowerCase()} units
            </div>
            <div className="divide-y divide-surface-200 dark:divide-surface-700 max-h-64 overflow-y-auto">
              {cat.units
                .filter((u) => u.abbr !== fromUnit)
                .map((u) => {
                  const val = parseFloat(inputValue);
                  let result: number | null = null;
                  if (!isNaN(val) && fromDef) {
                    let baseVal: number;
                    if (fromDef.custom) {
                      baseVal = fromDef.custom.toBase(val);
                    } else {
                      baseVal = val * fromDef.factor;
                    }
                    if (u.custom) {
                      result = u.custom.fromBase(baseVal);
                    } else {
                      result = baseVal / u.factor;
                    }
                  }
                  return (
                    <div
                      key={u.abbr}
                      className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50"
                      onClick={() => setToUnit(u.abbr)}
                    >
                      <span className="text-surface-600 dark:text-surface-300">
                        {u.name} ({u.abbr})
                      </span>
                      <span className="font-mono text-surface-800 dark:text-surface-100">
                        {result !== null ? formatNumber(result) : "—"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
