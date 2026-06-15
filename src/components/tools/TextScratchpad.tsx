"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const STORAGE_KEY = "enotools-text-scratchpad";

export default function TextScratchpad() {
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setText(saved);
    } catch {
      // localStorage not available
    }
  }, []);

  const handleChange = useCallback((value: string) => {
    setText(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage not available
    }
  }, []);

  const handleClear = useCallback(() => {
    setText("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }, []);

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split("\n").length : 0;
    return { chars, words, lines };
  }, [text]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">Scratchpad</h3>
          <button className="btn-secondary text-sm" onClick={handleClear}>
            Clear
          </button>
        </div>
        <textarea
          className="input-field min-h-[400px] font-mono text-sm"
          placeholder="Start typing... Your text is automatically saved to local storage."
          value={text}
          onChange={(e) => handleChange(e.target.value)}
        />
        <div className="flex gap-4 mt-3 text-sm text-surface-500">
          <span>{stats.chars} characters</span>
          <span>{stats.words} words</span>
          <span>{stats.lines} lines</span>
        </div>
      </div>
    </div>
  );
}
