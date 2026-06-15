"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

type ZinePreset = "8-page-half-fold" | "16-page-booklet" | "quarter-fold" | "custom";

interface PresetInfo {
  label: string;
  pages: number;
  description: string;
}

const PRESETS: Record<ZinePreset, PresetInfo> = {
  "8-page-half-fold": {
    label: "8-Page Half-Fold",
    pages: 8,
    description: "Single sheet folded in half. Cut or fold to create 8 pages.",
  },
  "16-page-booklet": {
    label: "16-Page Booklet",
    pages: 16,
    description: "Two sheets nested together. Classic zine booklet format.",
  },
  "quarter-fold": {
    label: "Quarter-Fold",
    pages: 8,
    description: "Single sheet folded twice (quarter). Creates 8 small pages.",
  },
  custom: {
    label: "Custom",
    pages: 8,
    description: "Specify your own page count (must be multiple of 4).",
  },
};

function calculateHalfFold(totalPages: number): number[][] {
  // 8-page half-fold on a single sheet (2 sides)
  // Front side (reading left to right when unfolded): 8, 1, 4, 5
  // Back side: 2, 7, 6, 3
  const padded = Math.ceil(totalPages / 8) * 8;
  const arrangements: number[][] = [];

  for (let sheet = 0; sheet < padded / 8; sheet++) {
    const base = sheet * 8;
    // Front: page 8, 1, 4, 5 (relative)
    arrangements.push([
      base + 8, base + 1, base + 4, base + 5,
      base + 2, base + 7, base + 6, base + 3,
    ]);
  }

  return arrangements;
}

function calculateBooklet(totalPages: number): number[][] {
  // 16-page booklet: 2 sheets nested
  // Sheet 1 front: 16, 1, 8, 9
  // Sheet 1 back: 2, 15, 10, 7
  // Sheet 2 front: 14, 3, 6, 11
  // Sheet 2 back: 4, 13, 12, 5
  const padded = Math.ceil(totalPages / 16) * 16;
  const arrangements: number[][] = [];

  for (let group = 0; group < padded / 16; group++) {
    const b = group * 16;
    // Sheet 1: front [16,1,8,9], back [2,15,10,7]
    arrangements.push([b + 16, b + 1, b + 8, b + 9, b + 2, b + 15, b + 10, b + 7]);
    // Sheet 2: front [14,3,6,11], back [4,13,12,5]
    arrangements.push([b + 14, b + 3, b + 6, b + 11, b + 4, b + 13, b + 12, b + 5]);
  }

  return arrangements;
}

function calculateQuarterFold(totalPages: number): number[][] {
  // Quarter-fold: single sheet, folded twice
  // Front (unfolded): 8, 1, 4, 5
  // Inside left: 2, 7
  // Inside right: 6, 3
  const padded = Math.ceil(totalPages / 8) * 8;
  const arrangements: number[][] = [];

  for (let sheet = 0; sheet < padded / 8; sheet++) {
    const b = sheet * 8;
    // Surface 1 (outside): 8, 1
    // Surface 2 (fold 1 inside left): 2, 7
    // Surface 3 (fold 1 inside right): 6, 3
    // Surface 4 (center spread): 4, 5
    arrangements.push([
      b + 8, b + 1,
      b + 2, b + 7,
      b + 6, b + 3,
      b + 4, b + 5,
    ]);
  }

  return arrangements;
}

export default function ZineImposer() {
  const [preset, setPreset] = useState<ZinePreset>("8-page-half-fold");
  const [customPages, setCustomPages] = useState(8);

  const totalPages =
    preset === "custom"
      ? Math.ceil(customPages / 4) * 4
      : PRESETS[preset].pages;

  const getArrangements = useCallback((): number[][] => {
    switch (preset) {
      case "8-page-half-fold":
        return calculateHalfFold(totalPages);
      case "16-page-booklet":
        return calculateBooklet(totalPages);
      case "quarter-fold":
        return calculateQuarterFold(totalPages);
      case "custom":
        return calculateHalfFold(totalPages);
      default:
        return [];
    }
  }, [preset, totalPages]);

  const arrangements = getArrangements();

  const getInstructions = useCallback((): string[] => {
    switch (preset) {
      case "8-page-half-fold":
        return [
          "1. Print both sides of a single sheet.",
          "2. Fold the sheet in half horizontally (hot dog fold).",
          "3. The cover is the first panel on the front (page 1 in top-right when unfolded).",
          "4. Read by flipping pages from right to left.",
        ];
      case "16-page-booklet":
        return [
          "1. Print 2 sheets, double-sided.",
          "2. Stack sheet 2 on top of sheet 1.",
          "3. Fold both sheets together in half.",
          "4. The cover is page 1 (front of sheet 1, right panel).",
          "5. Staple along the fold (saddle stitch).",
        ];
      case "quarter-fold":
        return [
          "1. Print both sides of a single sheet.",
          "2. Fold the sheet in half one way.",
          "3. Fold in half again perpendicular to the first fold.",
          "4. Cut along the top fold to create 8 separate pages.",
          "5. Stack pages in order to form the zine.",
        ];
      case "custom":
        return [
          "1. Print all sheets, double-sided.",
          "2. Fold each sheet in half.",
          "3. Nest sheets together.",
          "4. Staple or bind along the fold.",
        ];
      default:
        return [];
    }
  }, [preset]);

  const exportAsText = useCallback(() => {
    let text = `Zine Imposition Plan\n`;
    text += `====================\n`;
    text += `Preset: ${PRESETS[preset].label}\n`;
    text += `Total Pages: ${totalPages}\n`;
    text += `Sheets: ${arrangements.length}\n\n`;

    text += `Page Order:\n`;
    arrangements.forEach((arr, i) => {
      text += `  Sheet ${i + 1}: `;
      // Split into front/back (first half = front, second half = back)
      const half = arr.length / 2;
      const front = arr.slice(0, half).join(", ");
      const back = arr.slice(half).join(", ");
      text += `Front [${front}] | Back [${back}]\n`;
    });

    text += `\nInstructions:\n`;
    getInstructions().forEach((inst) => {
      text += `  ${inst}\n`;
    });

    const blob = new Blob([text as unknown as BlobPart], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zine-imposition.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [preset, totalPages, arrangements, getInstructions]);

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Zine Format
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.entries(PRESETS) as [ZinePreset, PresetInfo][]).map(
            ([key, info]) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  preset === key
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                }`}
              >
                <span className="block text-sm font-medium text-surface-900 dark:text-surface-100">
                  {info.label}
                </span>
                <span className="block text-xs text-surface-500 dark:text-surface-400 mt-1">
                  {info.pages} pages
                </span>
              </button>
            )
          )}
        </div>

        {preset === "custom" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Total Pages (will be rounded up to nearest multiple of 4)
            </label>
            <input
              type="number"
              min={4}
              step={4}
              value={customPages}
              onChange={(e) =>
                setCustomPages(Math.max(4, parseInt(e.target.value) || 4))
              }
              className="input-field w-full max-w-xs"
            />
          </div>
        )}

        <p className="mt-3 text-xs text-surface-500 dark:text-surface-400">
          {PRESETS[preset].description}
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Summary
          </h3>
          <button onClick={exportAsText} className="btn-secondary text-sm">
            Export as Text
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-3">
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {totalPages}
            </div>
            <div className="text-xs text-surface-500 dark:text-surface-400">
              Total Pages
            </div>
          </div>
          <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-3">
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {arrangements.length}
            </div>
            <div className="text-xs text-surface-500 dark:text-surface-400">
              Sheets
            </div>
          </div>
          <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-3">
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {totalPages !== Math.ceil(totalPages / 4) * 4 ? "Padded" : "Exact"}
            </div>
            <div className="text-xs text-surface-500 dark:text-surface-400">
              Page Fit
            </div>
          </div>
        </div>
      </div>

      {/* Visual Diagram */}
      {arrangements.map((arr, sheetIdx) => {
        const half = arr.length / 2;
        const front = arr.slice(0, half);
        const back = arr.slice(half);

        return (
          <div
            key={sheetIdx}
            className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6"
          >
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Sheet {sheetIdx + 1}
            </h4>

            {/* Front side */}
            <div className="mb-4">
              <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
                Front Side
              </span>
              <div
                className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(front.length, 4)}, 1fr)`,
                  gap: "0.5rem",
                }}
              >
                {front.map((page, i) => (
                  <ZinePageCell key={i} page={page} totalPages={totalPages} />
                ))}
              </div>
              {/* Fold line indicator */}
              {preset !== "quarter-fold" && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 border-t-2 border-dashed border-red-300 dark:border-red-600" />
                  <span className="text-[10px] text-red-500 dark:text-red-400 flex-shrink-0">
                    fold line
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-red-300 dark:border-red-600" />
                </div>
              )}
            </div>

            {/* Back side */}
            <div>
              <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
                Back Side
              </span>
              <div
                className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(back.length, 4)}, 1fr)`,
                  gap: "0.5rem",
                }}
              >
                {back.map((page, i) => (
                  <ZinePageCell key={i} page={page} totalPages={totalPages} />
                ))}
              </div>
              {preset !== "quarter-fold" && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 border-t-2 border-dashed border-red-300 dark:border-red-600" />
                  <span className="text-[10px] text-red-500 dark:text-red-400 flex-shrink-0">
                    fold line
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-red-300 dark:border-red-600" />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Instructions */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Cutting &amp; Folding Instructions
        </h3>
        <ol className="space-y-2">
          {getInstructions().map((inst, i) => (
            <li
              key={i}
              className="text-sm text-surface-700 dark:text-surface-300"
            >
              {inst}
            </li>
          ))}
        </ol>
      </div>

      {/* Page Order */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Page Print Order
          </h3>
          <CopyButton
            text={arrangements
              .map((arr, i) => {
                const half = arr.length / 2;
                return `Sheet ${i + 1}: Front [${arr.slice(0, half).join(", ")}] | Back [${arr.slice(half).join(", ")}]`;
              })
              .join("\n")}
          />
        </div>
        <div className="space-y-2">
          {arrangements.map((arr, i) => {
            const half = arr.length / 2;
            return (
              <div
                key={i}
                className="text-sm font-mono text-surface-700 dark:text-surface-300"
              >
                <span className="text-surface-500 dark:text-surface-400">
                  Sheet {i + 1}:{" "}
                </span>
                Front [{arr.slice(0, half).join(", ")}] | Back [
                {arr.slice(half).join(", ")}]
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ZinePageCell({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const isValid = page <= totalPages;
  return (
    <div
      className={`flex items-center justify-center h-14 rounded border text-sm font-mono ${
        isValid
          ? "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300"
          : "bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-400 dark:text-surface-500"
      }`}
    >
      {isValid ? page : "---"}
    </div>
  );
}
