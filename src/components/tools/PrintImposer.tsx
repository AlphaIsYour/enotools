"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

type Binding = "perfect" | "saddle";

interface SheetLayout {
  sheetNumber: number;
  front: (number | null)[];
  back: (number | null)[];
}

function calculateImposition(
  totalPages: number,
  pagesPerSheet: number,
  binding: Binding
): SheetLayout[] {
  // pagesPerSheet is total pages per sheet (front + back)
  const pagesPerSide = pagesPerSheet / 2;
  const sheetsNeeded = Math.ceil(totalPages / pagesPerSheet);
  const paddedTotal = sheetsNeeded * pagesPerSheet;
  const sheets: SheetLayout[] = [];

  if (binding === "saddle") {
    // Saddle stitch imposition
    for (let s = 0; s < sheetsNeeded; s++) {
      const front: (number | null)[] = [];
      const back: (number | null)[] = [];

      for (let i = 0; i < pagesPerSide; i++) {
        // Front side: outside page from front, inside page from back
        const frontPage = s * pagesPerSide + i + 1;
        const backPage = paddedTotal - s * pagesPerSide - i;
        front.push(frontPage <= totalPages ? frontPage : null);

        const frontPageBack = paddedTotal - s * pagesPerSide - (pagesPerSide - 1 - i);
        const backPageBack = s * pagesPerSide + (pagesPerSide - 1 - i) + 1 + pagesPerSide;
        back.push(frontPageBack <= totalPages && frontPageBack > 0 ? frontPageBack : null);
      }

      // For saddle stitch, the imposition pairs outer and inner pages
      // Sheet front: [outer, inner] positions
      // Simple 4-page saddle stitch: sheet front = [4, 1], sheet back = [2, 3]
      // Generalizing for N pages per sheet
      const frontPages: (number | null)[] = [];
      const backPages: (number | null)[] = [];

      for (let i = 0; i < pagesPerSide; i++) {
        const leftIdx = i;
        const rightIdx = pagesPerSheet - 1 - i;

        // Front of sheet: outermost pairs
        const p1 = s * pagesPerSheet + leftIdx + 1;
        const p2 = s * pagesPerSheet + rightIdx + 1;
        frontPages.push(p2 <= totalPages ? p2 : null);
        frontPages.push(p1 <= totalPages ? p1 : null);

        // Back of sheet: inner pairs
        const p3 = s * pagesPerSheet + pagesPerSide + leftIdx + 1;
        const p4 = s * pagesPerSheet + pagesPerSide + rightIdx + 1;
        backPages.push(p3 <= totalPages ? p3 : null);
        backPages.push(p4 <= totalPages ? p4 : null);
      }

      // Actually for saddle stitch, simplify:
      // For each sheet, front has [last, first] of the sheet's range, back has [second, second-to-last]
      const sheetStart = s * pagesPerSheet + 1;
      const sheetEnd = Math.min(s * pagesPerSheet + pagesPerSheet, totalPages);

      const f: (number | null)[] = [];
      const b: (number | null)[] = [];

      // Front side pairs
      for (let i = 0; i < pagesPerSide / 2; i++) {
        const leftPage = sheetEnd - i;
        const rightPage = sheetStart + i;
        f.push(leftPage <= totalPages ? leftPage : null);
        f.push(rightPage <= totalPages ? rightPage : null);
      }

      // Back side pairs
      for (let i = 0; i < pagesPerSide / 2; i++) {
        const leftPage = sheetStart + pagesPerSide / 2 + i;
        const rightPage = sheetEnd - pagesPerSide / 2 - i;
        b.push(leftPage <= totalPages ? leftPage : null);
        b.push(rightPage <= totalPages ? rightPage : null);
      }

      sheets.push({ sheetNumber: s + 1, front: f, back: b });
    }
  } else {
    // Perfect bound / cut & stack imposition
    for (let s = 0; s < sheetsNeeded; s++) {
      const front: (number | null)[] = [];
      const back: (number | null)[] = [];

      for (let i = 0; i < pagesPerSide; i++) {
        const pageFront = s + i * sheetsNeeded + 1;
        front.push(pageFront <= totalPages ? pageFront : null);
      }
      for (let i = 0; i < pagesPerSide; i++) {
        const pageBack = s + (pagesPerSide + i) * sheetsNeeded + 1;
        back.push(pageBack <= totalPages ? pageBack : null);
      }

      sheets.push({ sheetNumber: s + 1, front, back });
    }
  }

  return sheets;
}

export default function PrintImposer() {
  const [totalPages, setTotalPages] = useState(16);
  const [pagesPerSheet, setPagesPerSheet] = useState(4);
  const [binding, setBinding] = useState<Binding>("saddle");

  const sheets = calculateImposition(totalPages, pagesPerSheet, binding);
  const sheetsNeeded = sheets.length;

  const exportAsText = useCallback(() => {
    let text = `Print Imposition Plan\n`;
    text += `=====================\n`;
    text += `Total Pages: ${totalPages}\n`;
    text += `Pages Per Sheet: ${pagesPerSheet}\n`;
    text += `Binding: ${binding === "saddle" ? "Saddle Stitch" : "Perfect Bound"}\n`;
    text += `Sheets Needed: ${sheetsNeeded}\n\n`;

    sheets.forEach((sheet) => {
      text += `Sheet ${sheet.sheetNumber}\n`;
      text += `  Front: ${sheet.front.map((p) => (p !== null ? String(p) : "---")).join(" | ")}\n`;
      text += `  Back:  ${sheet.back.map((p) => (p !== null ? String(p) : "---")).join(" | ")}\n`;
      text += `\n`;
    });

    const blob = new Blob([text as unknown as BlobPart], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imposition-plan.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [totalPages, pagesPerSheet, binding, sheets, sheetsNeeded]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Print Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Total Pages
            </label>
            <input
              type="number"
              min={1}
              value={totalPages}
              onChange={(e) => setTotalPages(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Pages Per Sheet
            </label>
            <select
              value={pagesPerSheet}
              onChange={(e) => setPagesPerSheet(parseInt(e.target.value))}
              className="input-field w-full"
            >
              <option value={2}>2 (1 per side)</option>
              <option value={4}>4 (2 per side)</option>
              <option value={8}>8 (4 per side)</option>
              <option value={16}>16 (8 per side)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Binding Type
            </label>
            <select
              value={binding}
              onChange={(e) => setBinding(e.target.value as Binding)}
              className="input-field w-full"
            >
              <option value="saddle">Saddle Stitch</option>
              <option value="perfect">Perfect Bound</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Summary
          </h3>
          <button onClick={exportAsText} className="btn-secondary text-sm">
            Export as Text
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <StatBox label="Total Pages" value={totalPages} />
          <StatBox label="Sheets Needed" value={sheetsNeeded} />
          <StatBox label="Pages/Sheet" value={pagesPerSheet} />
          <StatBox
            label="Blank Pages"
            value={sheetsNeeded * pagesPerSheet - totalPages}
          />
        </div>
      </div>

      {/* Sheet Layouts */}
      <div className="space-y-4">
        {sheets.map((sheet) => (
          <div
            key={sheet.sheetNumber}
            className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6"
          >
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Sheet {sheet.sheetNumber}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
                  Front
                </span>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${pagesPerSheet / 2}, 1fr)` }}>
                  {sheet.front.map((page, i) => (
                    <PageCell key={i} page={page} />
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
                  Back
                </span>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${pagesPerSheet / 2}, 1fr)` }}>
                  {sheet.back.map((page, i) => (
                    <PageCell key={i} page={page} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageCell({ page }: { page: number | null }) {
  return (
    <div
      className={`flex items-center justify-center h-12 rounded border text-sm font-mono ${
        page !== null
          ? "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300"
          : "bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-400 dark:text-surface-500"
      }`}
    >
      {page !== null ? page : "---"}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-3">
      <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        {value}
      </div>
      <div className="text-xs text-surface-500 dark:text-surface-400">{label}</div>
    </div>
  );
}
