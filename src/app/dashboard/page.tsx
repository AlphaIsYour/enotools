"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Clock,
  TrendingUp,
  Grid3X3,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import {
  tools,
  categories,
  categoryOrder,
  getFeaturedTools,
  getToolsByCategory,
  getToolBySlug,
  type ToolCategory,
} from "@/lib/tools";
import { getTopSlugs, hasUsageData } from "@/lib/usage-tracker";

// Dummy user avatars for visual flair
const dummyUsers = [
  { name: "A", color: "#3B82F6" },
  { name: "M", color: "#10B981" },
  { name: "K", color: "#F59E0B" },
  { name: "R", color: "#EF4444" },
  { name: "S", color: "#8B5CF6" },
  { name: "D", color: "#06B6D4" },
];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategory | "all"
  >("all");
  const [recentTools, setRecentTools] = useState<typeof tools>([]);

  useEffect(() => {
    if (hasUsageData()) {
      const slugs = getTopSlugs(6);
      setRecentTools(
        slugs.map((s) => getToolBySlug(s)).filter(Boolean) as typeof tools,
      );
    }
  }, []);

  // Debounce search with loading animation
  useEffect(() => {
    if (query) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setDebouncedQuery(query);
        setIsSearching(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setDebouncedQuery("");
      setIsSearching(false);
    }
  }, [query]);

  const filtered = useMemo(() => {
    let result = tools;
    if (selectedCategory !== "all")
      result = result.filter((t) => t.category === selectedCategory);
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [debouncedQuery, selectedCategory]);

  const featured = getFeaturedTools();

  return (
    <div className="space-y-8">
      {/* Welcome header with user avatars */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-main)" }}
          >
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
                ? "afternoon"
                : "evening"}{" "}
            👋
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
            {tools.length} tools ready to use. Pick one and get started.
          </p>
          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-3">
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Zap className="h-3.5 w-3.5 text-accent-blue" />
              <span>Instant</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Shield className="h-3.5 w-3.5 text-accent-green" />
              <span>Private</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Free</span>
            </div>
          </div>
        </div>

        {/* Dummy user avatars */}
        <div className="hidden sm:flex items-center -space-x-2">
          {dummyUsers.map((user, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2"
              style={{
                background: user.color,
                ringColor: "var(--panel-bg)",
                zIndex: dummyUsers.length - i,
              }}
            >
              {user.name}
            </div>
          ))}
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-medium ring-2"
            style={{
              background: "var(--card-bg)",
              color: "var(--text-muted)",
              ringColor: "var(--panel-bg)",
            }}
          >
            +2k
          </div>
        </div>
      </div>

      {/* Recent Tools */}
      {recentTools.length > 0 &&
        !debouncedQuery &&
        selectedCategory === "all" && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock
                className="h-4 w-4"
                style={{ color: "var(--text-muted)" }}
              />
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--text-main)" }}
              >
                Recently Used
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        )}

      {/* Featured */}
      {!debouncedQuery && selectedCategory === "all" && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp
              className="h-4 w-4"
              style={{ color: "var(--text-muted)" }}
            />
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--text-main)" }}
            >
              Popular
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Categories quick access */}
      {!debouncedQuery && selectedCategory === "all" && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Grid3X3
              className="h-4 w-4"
              style={{ color: "var(--text-muted)" }}
            />
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--text-main)" }}
            >
              Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {categoryOrder.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              if (!cat) return null;
              const catTools = getToolsByCategory(catId);
              if (catTools.length === 0) return null;
              return (
                <Link
                  key={catId}
                  href={`/category/${catId}`}
                  className="flex items-center justify-between p-3 rounded-lg transition-all text-sm"
                  style={{
                    border: "1px solid var(--border-soft)",
                    background: "var(--card-bg)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(207,207,207,0.18)";
                    e.currentTarget.style.background = "var(--hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-soft)";
                    e.currentTarget.style.background = "var(--card-bg)";
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{cat.name}</span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {catTools.length}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Tools */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--text-main)" }}
          >
            {debouncedQuery || selectedCategory !== "all"
              ? `Results (${filtered.length})`
              : "All Tools"}
          </h2>
        </div>

        {/* Search loading skeleton */}
        {isSearching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl p-5 animate-pulse"
                style={{
                  border: "1px solid var(--border-soft)",
                  background: "var(--card-bg)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="h-9 w-9 rounded-lg"
                    style={{ background: "var(--hover-bg)" }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-4 w-24 rounded"
                      style={{ background: "var(--hover-bg)" }}
                    />
                    <div
                      className="h-3 w-full rounded"
                      style={{ background: "var(--hover-bg)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!isSearching && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isSearching &&
          filtered.length === 0 &&
          (debouncedQuery || selectedCategory !== "all") && (
            <div className="text-center py-16">
              <Search
                className="h-8 w-8 mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No tools found
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Try a different search term
              </p>
            </div>
          )}
      </section>
    </div>
  );
}
