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
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setIsSearching(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (query.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setResults(searchTools(query));
        setSelectedIndex(0);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto mt-[12vh] max-w-lg px-4">
        <div className="overflow-hidden rounded-xl shadow-2xl animate-scale-in"
          style={{ background: "var(--panel-bg)", border: "1px solid var(--border-soft)" }}>
          <div className="flex items-center gap-2.5 border-b px-4 py-3"
            style={{ borderColor: "var(--border-soft)" }}>
            <Search className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-main)" }}
            />
            <button onClick={onClose} className="rounded-md p-1 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5">
            {query.length === 0 && (
              <p className="px-3 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Type to search for tools...
              </p>
            )}
            {isSearching && query.length > 0 && (
              <div className="space-y-1 p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse">
                    <div className="h-4 w-4 rounded" style={{ background: "var(--hover-bg)" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-20 rounded" style={{ background: "var(--hover-bg)" }} />
                      <div className="h-2.5 w-32 rounded" style={{ background: "var(--hover-bg)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isSearching && query.length > 0 && results.length === 0 && (
              <p className="px-3 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                No tools found for &quot;{query}&quot;
              </p>
            )}
            {!isSearching && results.map((tool, i) => (
              <button
                key={tool.slug}
                onClick={() => handleSelect(tool)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all duration-150"
                style={{
                  background: i === selectedIndex ? "var(--active-bg)" : "transparent",
                  color: "var(--text-main)",
                }}
                onMouseEnter={(e) => {
                  if (i !== selectedIndex) e.currentTarget.style.background = "var(--hover-bg)";
                }}
                onMouseLeave={(e) => {
                  if (i !== selectedIndex) e.currentTarget.style.background = "transparent";
                }}
              >
                <div>
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
              </button>
            ))}
          </div>

          <div className="border-t px-4 py-2.5 flex items-center gap-4 text-[11px]"
            style={{ borderColor: "var(--border-soft)", color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--border-soft)" }}>&uarr;&darr;</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--border-soft)" }}>&crarr;</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--border-soft)" }}>esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
