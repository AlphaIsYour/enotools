"use client";

import { useState } from "react";

interface PaperSize {
  name: string;
  mm: { w: number; h: number };
  inches: { w: number; h: number };
}

function mmToInches(mm: number): number {
  return Math.round((mm / 25.4) * 1000) / 1000;
}

function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

const aSeries: PaperSize[] = [
  { name: "A0", mm: { w: 841, h: 1189 }, inches: { w: mmToInches(841), h: mmToInches(1189) } },
  { name: "A1", mm: { w: 594, h: 841 }, inches: { w: mmToInches(594), h: mmToInches(841) } },
  { name: "A2", mm: { w: 420, h: 594 }, inches: { w: mmToInches(420), h: mmToInches(594) } },
  { name: "A3", mm: { w: 297, h: 420 }, inches: { w: mmToInches(297), h: mmToInches(420) } },
  { name: "A4", mm: { w: 210, h: 297 }, inches: { w: mmToInches(210), h: mmToInches(297) } },
  { name: "A5", mm: { w: 148, h: 210 }, inches: { w: mmToInches(148), h: mmToInches(210) } },
  { name: "A6", mm: { w: 105, h: 148 }, inches: { w: mmToInches(105), h: mmToInches(148) } },
  { name: "A7", mm: { w: 74, h: 105 }, inches: { w: mmToInches(74), h: mmToInches(105) } },
  { name: "A8", mm: { w: 52, h: 74 }, inches: { w: mmToInches(52), h: mmToInches(74) } },
  { name: "A9", mm: { w: 37, h: 52 }, inches: { w: mmToInches(37), h: mmToInches(52) } },
  { name: "A10", mm: { w: 26, h: 37 }, inches: { w: mmToInches(26), h: mmToInches(37) } },
];

const bSeries: PaperSize[] = [
  { name: "B0", mm: { w: 1000, h: 1414 }, inches: { w: mmToInches(1000), h: mmToInches(1414) } },
  { name: "B1", mm: { w: 707, h: 1000 }, inches: { w: mmToInches(707), h: mmToInches(1000) } },
  { name: "B2", mm: { w: 500, h: 707 }, inches: { w: mmToInches(500), h: mmToInches(707) } },
  { name: "B3", mm: { w: 353, h: 500 }, inches: { w: mmToInches(353), h: mmToInches(500) } },
  { name: "B4", mm: { w: 250, h: 353 }, inches: { w: mmToInches(250), h: mmToInches(353) } },
  { name: "B5", mm: { w: 176, h: 250 }, inches: { w: mmToInches(176), h: mmToInches(250) } },
  { name: "B6", mm: { w: 125, h: 176 }, inches: { w: mmToInches(125), h: mmToInches(176) } },
  { name: "B7", mm: { w: 88, h: 125 }, inches: { w: mmToInches(88), h: mmToInches(125) } },
  { name: "B8", mm: { w: 62, h: 88 }, inches: { w: mmToInches(62), h: mmToInches(88) } },
  { name: "B9", mm: { w: 44, h: 62 }, inches: { w: mmToInches(44), h: mmToInches(62) } },
  { name: "B10", mm: { w: 31, h: 44 }, inches: { w: mmToInches(31), h: mmToInches(44) } },
];

const cSeries: PaperSize[] = [
  { name: "C0", mm: { w: 917, h: 1297 }, inches: { w: mmToInches(917), h: mmToInches(1297) } },
  { name: "C1", mm: { w: 648, h: 917 }, inches: { w: mmToInches(648), h: mmToInches(917) } },
  { name: "C2", mm: { w: 458, h: 648 }, inches: { w: mmToInches(458), h: mmToInches(648) } },
  { name: "C3", mm: { w: 324, h: 458 }, inches: { w: mmToInches(324), h: mmToInches(458) } },
  { name: "C4", mm: { w: 229, h: 324 }, inches: { w: mmToInches(229), h: mmToInches(324) } },
  { name: "C5", mm: { w: 162, h: 229 }, inches: { w: mmToInches(162), h: mmToInches(229) } },
  { name: "C6", mm: { w: 114, h: 162 }, inches: { w: mmToInches(114), h: mmToInches(162) } },
  { name: "C7", mm: { w: 81, h: 114 }, inches: { w: mmToInches(81), h: mmToInches(114) } },
  { name: "C8", mm: { w: 57, h: 81 }, inches: { w: mmToInches(57), h: mmToInches(81) } },
  { name: "C9", mm: { w: 40, h: 57 }, inches: { w: mmToInches(40), h: mmToInches(57) } },
  { name: "C10", mm: { w: 28, h: 40 }, inches: { w: mmToInches(28), h: mmToInches(40) } },
];

const usSeries: PaperSize[] = [
  { name: "Letter", mm: { w: 216, h: 279 }, inches: { w: 8.5, h: 11 } },
  { name: "Legal", mm: { w: 216, h: 356 }, inches: { w: 8.5, h: 14 } },
  { name: "Tabloid", mm: { w: 279, h: 432 }, inches: { w: 11, h: 17 } },
];

type TabKey = "A" | "B" | "C" | "US";

const tabs: { key: TabKey; label: string; data: PaperSize[] }[] = [
  { key: "A", label: "A Series", data: aSeries },
  { key: "B", label: "B Series", data: bSeries },
  { key: "C", label: "C Series", data: cSeries },
  { key: "US", label: "US Sizes", data: usSeries },
];

const dpis = [72, 150, 300];

function PaperTable({ data }: { data: PaperSize[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200 dark:border-surface-800">
            <th className="text-left py-2 pr-3 font-medium text-surface-700 dark:text-surface-300">Name</th>
            <th className="text-left py-2 pr-3 font-medium text-surface-700 dark:text-surface-300">mm (W x H)</th>
            <th className="text-left py-2 pr-3 font-medium text-surface-700 dark:text-surface-300">in (W x H)</th>
            {dpis.map((dpi) => (
              <th key={dpi} className="text-left py-2 pr-3 font-medium text-surface-700 dark:text-surface-300">
                px @{dpi}dpi
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((paper) => (
            <tr key={paper.name} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
              <td className="py-2 pr-3 font-medium text-surface-900 dark:text-surface-100">{paper.name}</td>
              <td className="py-2 pr-3 text-surface-600 dark:text-surface-400">
                {paper.mm.w} x {paper.mm.h}
              </td>
              <td className="py-2 pr-3 text-surface-600 dark:text-surface-400">
                {paper.inches.w} x {paper.inches.h}
              </td>
              {dpis.map((dpi) => (
                <td key={dpi} className="py-2 pr-3 text-surface-600 dark:text-surface-400">
                  {mmToPixels(paper.mm.w, dpi)} x {mmToPixels(paper.mm.h, dpi)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PaperSizes() {
  const [activeTab, setActiveTab] = useState<TabKey>("A");

  const currentTab = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <PaperTable data={currentTab.data} />
      </div>
    </div>
  );
}
