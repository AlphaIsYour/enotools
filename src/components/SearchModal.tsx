"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { searchTools, type Tool } from "@/lib/tools";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchTools(query));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (tool: Tool) => {
    router.push(`/tools/${tool.slug}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      <div
        className="absolute inset-0 bg-surface-900/50 dark:bg-surface-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-[15vh] max-w-lg px-4">
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-surface-900 shadow-2xl border border-surface-200 dark:border-surface-700 animate-scale-in">
          <div className="flex items-center gap-3 border-b border-surface-200 dark:border-surface-700 px-4 py-3">
            <Search className="h-5 w-5 text-surface-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-surface-400"
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <X className="h-4 w-4 text-surface-400" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {query.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-surface-400">
                Type to search for tools...
              </p>
            )}
            {query.length > 0 && results.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-surface-400">
                No tools found for &quot;{query}&quot;
              </p>
            )}
            {results.map((tool, i) => (
              <button
                key={tool.slug}
                onClick={() => handleSelect(tool)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === selectedIndex
                    ? "bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300"
                    : "hover:bg-surface-50 dark:hover:bg-surface-800"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight
                  className={`h-4 w-4 ${
                    i === selectedIndex ? "text-brand-500" : "text-surface-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="border-t border-surface-200 dark:border-surface-700 px-4 py-2.5 flex items-center gap-4 text-[11px] text-surface-400">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-surface-200 dark:border-surface-600 px-1 py-0.5">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-surface-200 dark:border-surface-600 px-1 py-0.5">
                ↵
              </kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-surface-200 dark:border-surface-600 px-1 py-0.5">
                esc
              </kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
