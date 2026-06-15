"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

interface Palette {
  name: string;
  category: string;
  colors: [string, string, string, string, string];
}

const PALETTES: Palette[] = [
  // Warm
  { name: "Sunset Blaze", category: "Warm", colors: ["#ff6b35", "#f7c59f", "#efefd0", "#004e89", "#1a659e"] },
  { name: "Autumn Harvest", category: "Warm", colors: ["#d4a373", "#e9c46a", "#f4a261", "#e76f51", "#6b3a2a"] },
  { name: "Desert Dusk", category: "Warm", colors: ["#ffb5a7", "#fcd5ce", "#f8edeb", "#d63384", "#780000"] },
  { name: "Campfire", category: "Warm", colors: ["#ffba08", "#faa307", "#f48c06", "#e85d04", "#dc2f02"] },
  { name: "Terracotta", category: "Warm", colors: ["#cb997e", "#ddbea9", "#ffe8d6", "#b7b7a4", "#6b705c"] },

  // Cool
  { name: "Arctic Blue", category: "Cool", colors: ["#caf0f8", "#ade8f4", "#90e0ef", "#00b4d8", "#023e8a"] },
  { name: "Frost", category: "Cool", colors: ["#d8f3dc", "#b7e4c7", "#95d5b2", "#52b788", "#1b4332"] },
  { name: "Twilight", category: "Cool", colors: ["#22223b", "#4a4e69", "#9a8c98", "#c9ada7", "#f2e9e4"] },
  { name: "Steel", category: "Cool", colors: ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c", "#d90429"] },

  // Pastel
  { name: "Cotton Candy", category: "Pastel", colors: ["#ffafcc", "#ffc8dd", "#bde0fe", "#a2d2ff", "#cdb4db"] },
  { name: "Spring Garden", category: "Pastel", colors: ["#ffecd2", "#fcb69f", "#ff9a9e", "#fad0c4", "#a1c4fd"] },
  { name: "Dreamy", category: "Pastel", colors: ["#e8d5b7", "#f1e4c3", "#b5e2d5", "#89c9c4", "#7386a0"] },
  { name: "Macaroon", category: "Pastel", colors: ["#f6d6ad", "#f6b191", "#f2977d", "#ee7f86", "#e8608c"] },
  { name: "Soft Meadow", category: "Pastel", colors: ["#d4e09b", "#f6f0b3", "#f2d0a4", "#f19677", "#e8608c"] },

  // Dark
  { name: "Midnight", category: "Dark", colors: ["#0d1b2a", "#1b2838", "#2c3e50", "#415a77", "#778da9"] },
  { name: "Obsidian", category: "Dark", colors: ["#000000", "#14213d", "#1a1a2e", "#16213e", "#0f3460"] },
  { name: "Deep Forest", category: "Dark", colors: ["#1a1a1a", "#2d2d2d", "#404040", "#52796f", "#84a98c"] },
  { name: "Charcoal", category: "Dark", colors: ["#212529", "#343a40", "#495057", "#6c757d", "#adb5bd"] },
  { name: "Abyss", category: "Dark", colors: ["#0b0c10", "#1f2833", "#c5c6c7", "#66fcf1", "#45a29e"] },

  // Nature
  { name: "Forest Trail", category: "Nature", colors: ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"] },
  { name: "Wildflower", category: "Nature", colors: ["#6b705c", "#a5a58d", "#ffe8d6", "#ddbea9", "#cb997e"] },
  { name: "Moss", category: "Nature", colors: ["#3a5a40", "#588157", "#a3b18a", "#dad7cd", "#344e41"] },
  { name: "Mountain Lake", category: "Nature", colors: ["#003049", "#d62828", "#f77f00", "#fcbf49", "#eae2b7"] },
  { name: "Prairie", category: "Nature", colors: ["#6b4226", "#d4a373", "#e9c46a", "#2a9d8f", "#264653"] },

  // Sunset
  { name: "Golden Hour", category: "Sunset", colors: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"] },
  { name: "Dusk", category: "Sunset", colors: ["#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d"] },
  { name: "Afterglow", category: "Sunset", colors: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"] },
  { name: "Horizon", category: "Sunset", colors: ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"] },

  // Ocean
  { name: "Deep Sea", category: "Ocean", colors: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"] },
  { name: "Coral Reef", category: "Ocean", colors: ["#003f5c", "#58508d", "#bc5090", "#ff6361", "#ffa600"] },
  { name: "Tide", category: "Ocean", colors: ["#023e8a", "#0077b6", "#0096c7", "#48cae4", "#ade8f4"] },
  { name: "Seaside", category: "Ocean", colors: ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6"] },

  // Forest
  { name: "Redwood", category: "Forest", colors: ["#6b3a2a", "#8b5e3c", "#a47148", "#d4a373", "#e8d5b7"] },
  { name: "Fern", category: "Forest", colors: ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#b7e4c7"] },
  { name: "Canopy", category: "Forest", colors: ["#1b4332", "#2d6a4f", "#52b788", "#95d5b2", "#d8f3dc"] },
  { name: "Birch", category: "Forest", colors: ["#463f3a", "#8a817c", "#bcb8b1", "#f4f3ee", "#e0afa0"] },
];

const CATEGORIES = [
  "All",
  ...Array.from(new Set(PALETTES.map((p) => p.category))),
];

export default function PaletteCollection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedPalette, setExpandedPalette] = useState<string | null>(null);
  const [copiedPalette, setCopiedPalette] = useState<string | null>(null);

  const filteredPalettes =
    activeCategory === "All"
      ? PALETTES
      : PALETTES.filter((p) => p.category === activeCategory);

  const copyAllColors = useCallback(async (palette: Palette) => {
    const text = palette.colors.join(", ");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedPalette(palette.name);
    setTimeout(() => setCopiedPalette(null), 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-500 text-white"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Palettes */}
      <div className="space-y-3">
        {filteredPalettes.map((palette) => {
          const isExpanded = expandedPalette === palette.name;
          const isCopied = copiedPalette === palette.name;

          return (
            <div
              key={palette.name}
              className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedPalette(isExpanded ? null : palette.name)
                }
                className="w-full text-left p-4 flex items-center gap-4 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <div className="flex flex-1 rounded-lg overflow-hidden h-12">
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-medium text-surface-800 dark:text-surface-200 block">
                    {palette.name}
                  </span>
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    {palette.category}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-surface-200 dark:border-surface-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      Color Values
                    </span>
                    <button
                      onClick={() => copyAllColors(palette)}
                      className="btn-secondary text-xs"
                    >
                      {isCopied ? "Copied!" : "Copy All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {palette.colors.map((color, i) => (
                      <div key={i} className="text-center">
                        <div
                          className="h-16 rounded-lg border border-surface-200 dark:border-surface-700 mb-2"
                          style={{ backgroundColor: color }}
                        />
                        <CopyButton text={color} className="w-full justify-center" />
                        <span className="block font-mono text-xs text-surface-600 dark:text-surface-400 mt-1">
                          {color.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
        {filteredPalettes.length} palettes
      </p>
    </div>
  );
}
