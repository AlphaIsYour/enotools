"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import { tools, categories, categoryOrder, type ToolCategory } from "@/lib/tools";

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  const filtered = useMemo(() => {
    let result = tools;
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [query, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="section-title">All Tools</h1>
        <p className="mt-3 text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
          Browse our complete collection of {tools.length} free online utilities.
          Everything runs locally in your browser.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-surface-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ToolCategory | "all")}
            className="input-field max-w-xs"
          >
            <option value="all">All Categories</option>
            {categoryOrder.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              return cat ? (
                <option key={catId} value={catId}>
                  {cat.name}
                </option>
              ) : null;
            })}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
        Showing {filtered.length} of {tools.length} tools
      </p>

      {/* Tools Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-surface-500 dark:text-surface-400">
            No tools found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
