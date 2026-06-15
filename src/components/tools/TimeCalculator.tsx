"use client";

import { useState, useMemo } from "react";

function parseTime(str: string): number | null {
  const match = str.match(/^(\d+):(\d{1,2}):(\d{1,2})$/);
  if (!match) return null;
  const h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const s = parseInt(match[3]);
  if (m >= 60 || s >= 60) return null;
  return h * 3600 + m * 60 + s;
}

function formatTime(totalSeconds: number): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
  const abs = Math.abs(totalSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  return { hours, minutes, seconds, totalSeconds };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

type Operation = "add" | "subtract" | "multiply";

export default function TimeCalculator() {
  const [time1, setTime1] = useState("01:30:00");
  const [time2, setTime2] = useState("00:45:30");
  const [operation, setOperation] = useState<Operation>("add");
  const [factor, setFactor] = useState("2");

  const result = useMemo(() => {
    const t1 = parseTime(time1);
    if (t1 === null) return null;

    if (operation === "multiply") {
      const f = parseFloat(factor);
      if (isNaN(f)) return null;
      return formatTime(Math.round(t1 * f));
    }

    const t2 = parseTime(time2);
    if (t2 === null) return null;

    if (operation === "add") {
      return formatTime(t1 + t2);
    } else {
      return formatTime(t1 - t2);
    }
  }, [time1, time2, operation, factor]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Time 1 (HH:MM:SS)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="01:30:00"
            value={time1}
            onChange={(e) => setTime1(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Operation
          </label>
          <select
            className="input-field"
            value={operation}
            onChange={(e) => setOperation(e.target.value as Operation)}
          >
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (-)</option>
            <option value="multiply">Multiply (x)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {operation !== "multiply" ? (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Time 2 (HH:MM:SS)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="00:45:30"
              value={time2}
              onChange={(e) => setTime2(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Multiply Factor
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="2"
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
            />
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-4">Result</h3>
          <p className="text-3xl font-mono font-bold text-surface-900 dark:text-surface-100">
            {result.totalSeconds < 0 ? "-" : ""}
            {pad(result.hours)}:{pad(result.minutes)}:{pad(result.seconds)}
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-lg font-bold text-surface-900 dark:text-surface-100">{result.hours}</p>
              <p className="text-xs text-surface-500">Hours</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-lg font-bold text-surface-900 dark:text-surface-100">{result.minutes}</p>
              <p className="text-xs text-surface-500">Minutes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-lg font-bold text-surface-900 dark:text-surface-100">{result.seconds}</p>
              <p className="text-xs text-surface-500">Seconds</p>
            </div>
          </div>
          <p className="text-sm text-surface-500 mt-3">
            Total: {Math.abs(result.totalSeconds)} seconds
          </p>
        </div>
      )}
    </div>
  );
}
