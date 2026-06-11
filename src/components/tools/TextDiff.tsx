"use client";

import { useState } from "react";
import { diffLines, diffWords } from "diff";

type DiffMode = "lines" | "words";

interface DiffStat {
  added: number;
  removed: number;
  unchanged: number;
}

export default function TextDiff() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffResult, setDiffResult] = useState<
    { value: string; added?: boolean; removed?: boolean }[]
  >([]);
  const [mode, setMode] = useState<DiffMode>("lines");
  const [stats, setStats] = useState<DiffStat>({ added: 0, removed: 0, unchanged: 0 });
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = () => {
    const result = mode === "lines"
      ? diffLines(original, modified)
      : diffWords(original, modified);
    setDiffResult(result);

    let added = 0;
    let removed = 0;
    let unchanged = 0;

    for (const part of result) {
      const lineCount = part.value.split("\n").length - 1 || 1;
      if (part.added) added += lineCount;
      else if (part.removed) removed += lineCount;
      else unchanged += lineCount;
    }

    setStats({ added, removed, unchanged });
    setHasCompared(true);
  };

  const handleSwap = () => {
    setOriginal(modified);
    setModified(original);
    setHasCompared(false);
    setDiffResult([]);
  };

  const handleClear = () => {
    setOriginal("");
    setModified("");
    setDiffResult([]);
    setStats({ added: 0, removed: 0, unchanged: 0 });
    setHasCompared(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden">
          <button
            onClick={() => setMode("lines")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "lines"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
            }`}
          >
            Compare Lines
          </button>
          <button
            onClick={() => setMode("words")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "words"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
            }`}
          >
            Compare Words
          </button>
        </div>
        <button onClick={handleCompare} className="btn-primary">
          Compare
        </button>
        <button onClick={handleSwap} className="btn-secondary">
          Swap
        </button>
        <button onClick={handleClear} className="btn-secondary">
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Original
          </label>
          <textarea
            className="input-field w-full h-64 font-mono text-sm resize-y"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Modified
          </label>
          <textarea
            className="input-field w-full h-64 font-mono text-sm resize-y"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text here..."
          />
        </div>
      </div>

      {hasCompared && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 px-4 py-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Lines Added: {stats.added}
              </span>
            </div>
            <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-4 py-2">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Lines Removed: {stats.removed}
              </span>
            </div>
            <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 px-4 py-2">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Lines Unchanged: {stats.unchanged}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 overflow-hidden">
            <div className="px-4 py-2 border-b border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800">
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Diff Result
              </h3>
            </div>
            <pre className="p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
              {diffResult.map((part, index) => {
                const prefix = part.added ? "+" : part.removed ? "-" : " ";
                const lines = part.value.split("\n").filter(
                  (line, i, arr) => !(i === arr.length - 1 && line === "")
                );

                return lines.map((line, lineIndex) => (
                  <div
                    key={`${index}-${lineIndex}`}
                    className={`px-2 py-0.5 ${
                      part.added
                        ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                        : part.removed
                        ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                        : "text-surface-700 dark:text-surface-300"
                    }`}
                  >
                    <span className="select-none text-surface-400 dark:text-surface-500 mr-2">
                      {prefix}
                    </span>
                    {line}
                  </div>
                ));
              })}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
