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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-dashboard-text-primary tracking-tight sm:text-3xl">
          All Tools
        </h1>
        <p className="mt-2 text-sm text-surface-500 dark:text-dashboard-text-secondary">
          {tools.length} free utilities. Everything runs locally in your browser.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="dashboard-card p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 dark:text-dashboard-text-muted" />
            <input
              type="text"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 dark:text-dashboard-text-muted pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ToolCategory | "all")}
              className="input-field pl-10 sm:w-[220px] appearance-none cursor-pointer"
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
      </div>

      {/* Results count */}
      <p className="text-xs text-surface-400 dark:text-dashboard-text-muted mb-5">
        Showing {filtered.length} of {tools.length} tools
      </p>

      {/* Tools Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 dark:bg-dashboard-card border border-surface-200 dark:border-dashboard-border mb-4">
            <Search className="h-5 w-5 text-surface-400 dark:text-dashboard-text-muted" />
          </div>
          <p className="text-sm text-surface-500 dark:text-dashboard-text-secondary">
            No tools found matching your search.
          </p>
          <p className="mt-1 text-xs text-surface-400 dark:text-dashboard-text-muted">
            Try a different keyword or category.
          </p>
        </div>
      )}
    </div>
  );
}
