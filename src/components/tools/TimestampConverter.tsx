"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CopyButton } from "@/components/CopyButton";

const TIMEZONES = [
  { label: "UTC", offset: 0 },
  { label: "US/Eastern (EST/EDT)", offset: -5 },
  { label: "US/Central (CST/CDT)", offset: -6 },
  { label: "US/Mountain (MST/MDT)", offset: -7 },
  { label: "US/Pacific (PST/PDT)", offset: -8 },
  { label: "Europe/London (GMT/BST)", offset: 0 },
  { label: "Europe/Paris (CET/CEST)", offset: 1 },
  { label: "Europe/Berlin (CET/CEST)", offset: 1 },
  { label: "Europe/Moscow (MSK)", offset: 3 },
  { label: "Asia/Dubai (GST)", offset: 4 },
  { label: "Asia/Kolkata (IST)", offset: 5.5 },
  { label: "Asia/Bangkok (ICT)", offset: 7 },
  { label: "Asia/Shanghai (CST)", offset: 8 },
  { label: "Asia/Tokyo (JST)", offset: 9 },
  { label: "Australia/Sydney (AEST/AEDT)", offset: 10 },
  { label: "Pacific/Auckland (NZST/NZDT)", offset: 12 },
];

function relativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let text: string;
  if (seconds < 5) {
    text = "just now";
    return text;
  } else if (seconds < 60) {
    text = `${seconds} seconds`;
  } else if (minutes < 60) {
    text = minutes === 1 ? "1 minute" : `${minutes} minutes`;
  } else if (hours < 24) {
    text = hours === 1 ? "1 hour" : `${hours} hours`;
  } else if (days < 30) {
    text = days === 1 ? "1 day" : `${days} days`;
  } else if (months < 12) {
    text = months === 1 ? "1 month" : `${months} months`;
  } else {
    text = years === 1 ? "1 year" : `${years} years`;
  }

  return isPast ? `${text} ago` : `in ${text}`;
}

function formatWithTimezone(date: Date, tzOffset: number): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const local = new Date(utc + tzOffset * 3600000);
  return local.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

interface FormatRow {
  label: string;
  value: string;
  copyValue: string;
}

export default function TimestampConverter() {
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [mode, setMode] = useState<"timestampToDate" | "dateToTimestamp">("timestampToDate");
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [timezoneIdx, setTimezoneIdx] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentNow, setCurrentNow] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        setCurrentNow(new Date());
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  const tz = TIMEZONES[timezoneIdx];

  const parsedDate = useCallback((): Date | null => {
    if (mode === "timestampToDate") {
      const num = Number(timestampInput);
      if (isNaN(num) || timestampInput.trim() === "") return null;
      const ms = unit === "seconds" ? num * 1000 : num;
      return new Date(ms);
    } else {
      if (!dateInput) return null;
      const d = new Date(dateInput);
      return isNaN(d.getTime()) ? null : d;
    }
  }, [mode, timestampInput, dateInput, unit])();

  const formats: FormatRow[] = parsedDate
    ? [
        {
          label: "Unix Timestamp (seconds)",
          value: String(Math.floor(parsedDate.getTime() / 1000)),
          copyValue: String(Math.floor(parsedDate.getTime() / 1000)),
        },
        {
          label: "Unix Timestamp (milliseconds)",
          value: String(parsedDate.getTime()),
          copyValue: String(parsedDate.getTime()),
        },
        {
          label: "ISO 8601",
          value: parsedDate.toISOString(),
          copyValue: parsedDate.toISOString(),
        },
        {
          label: "UTC String",
          value: parsedDate.toUTCString(),
          copyValue: parsedDate.toUTCString(),
        },
        {
          label: `Local String (${tz.label})`,
          value: formatWithTimezone(parsedDate, tz.offset),
          copyValue: formatWithTimezone(parsedDate, tz.offset),
        },
        {
          label: "Relative Time",
          value: relativeTime(parsedDate),
          copyValue: relativeTime(parsedDate),
        },
      ]
    : [];

  const setCurrentTime = () => {
    const now = new Date();
    if (mode === "timestampToDate") {
      setTimestampInput(
        unit === "seconds"
          ? String(Math.floor(now.getTime() / 1000))
          : String(now.getTime())
      );
    } else {
      // Format for datetime-local input
      const pad = (n: number) => String(n).padStart(2, "0");
      const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setDateInput(local);
    }
  };

  // Sync bidirectional conversion
  useEffect(() => {
    if (mode === "timestampToDate" && parsedDate && dateInput === "") {
      // Don't auto-fill date input to avoid circular updates
    }
  }, [mode, parsedDate, dateInput]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden">
          <button
            onClick={() => setMode("timestampToDate")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "timestampToDate"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
            }`}
          >
            Timestamp &rarr; Date
          </button>
          <button
            onClick={() => setMode("dateToTimestamp")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "dateToTimestamp"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
            }`}
          >
            Date &rarr; Timestamp
          </button>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">Auto-refresh</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mode === "timestampToDate" ? (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Unix Timestamp
              </label>
              <input
                type="text"
                className="input-field w-full font-mono"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder="e.g. 1700000000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Unit
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUnit("seconds")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    unit === "seconds"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                  }`}
                >
                  Seconds
                </button>
                <button
                  onClick={() => setUnit("milliseconds")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    unit === "milliseconds"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                  }`}
                >
                  Milliseconds
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              className="input-field w-full font-mono"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              step={1}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Timezone
          </label>
          <select
            className="input-field w-full text-sm"
            value={timezoneIdx}
            onChange={(e) => setTimezoneIdx(Number(e.target.value))}
          >
            {TIMEZONES.map((tz, i) => (
              <option key={tz.label} value={i}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={setCurrentTime} className="btn-primary">
          Current Time
        </button>
      </div>

      {autoRefresh && (
        <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
            Now: {currentNow.toISOString()}
          </p>
        </div>
      )}

      {formats.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Converted Formats
          </h3>
          <div className="rounded-lg border border-surface-300 dark:border-surface-600 divide-y divide-surface-200 dark:divide-surface-700 overflow-hidden">
            {formats.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs text-surface-500 dark:text-surface-400 mb-0.5">{f.label}</div>
                  <div className="text-sm font-mono text-surface-900 dark:text-surface-100 break-all">
                    {f.value}
                  </div>
                </div>
                <CopyButton text={f.copyValue} className="shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-8 text-center">
          <p className="text-surface-400 dark:text-surface-500 text-sm">
            {mode === "timestampToDate"
              ? "Enter a Unix timestamp above to convert"
              : "Select a date and time above to convert"}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800/50 p-4">
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          About Unix Epoch
        </h3>
        <p className="text-sm text-surface-600 dark:text-surface-400">
          The Unix epoch is the time 00:00:00 UTC on 1 January 1970. Unix timestamps represent the
          number of seconds (or milliseconds) that have elapsed since this point. This system is
          widely used in computing for representing dates and times in a standardized, timezone-independent format.
        </p>
      </div>
    </div>
  );
}
