"use client";

import Link from "next/link";
import {
  ArrowRight, Zap, Shield, Sparkles, FileText, Image, Type,
  Calculator, Code, Palette, Printer, Binary, Shapes,
  MoreHorizontal, Grid3X3,
} from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { tools, categories, categoryOrder, getFeaturedTools, getToolsByCategory } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";
import { BrandLogo } from "@/components/BrandLogo";

const categoryIcons: Record<string, React.ElementType> = {
  encoding: Binary, text: Type, developer: Code, math: Calculator,
  css: Shapes, colour: Palette, images: Image, typography: Type,
  print: Printer, calculators: Calculator, other: MoreHorizontal, pdf: FileText,
};

export default function LandingPage() {
  const featured = getFeaturedTools();

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg)" }}>
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6"
              style={{ border: "1px solid var(--border-soft)", background: "var(--card-bg)" }}>
              <Sparkles className="h-3 w-3 text-accent-blue" />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{tools.length} free tools</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: "var(--text-main)" }}>
              One workspace for{" "}
              <span style={{ color: "var(--text-muted)" }}>{tools.length}+</span>{" "}
              powerful tools
            </h1>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              PDF, image, converter, generator, and productivity tools — fast, clean, and runs entirely in your browser.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/dashboard" className="btn-primary">
                Explore Tools
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/categories" className="btn-secondary">
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Dashboard preview mockup */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-soft)" }}>
              <div className="p-6 sm:p-8 dark-dotted-panel" style={{ background: "var(--panel-bg)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 w-6 rounded" style={{ background: "var(--hover-bg)" }} />
                  <div className="h-4 w-24 rounded" style={{ background: "var(--hover-bg)" }} />
                  <div className="flex-1" />
                  <div className="h-6 w-32 rounded" style={{ background: "var(--hover-bg)", border: "1px solid var(--border-soft)" }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {featured.slice(0, 6).map((tool) => (
                    <div key={tool.slug} className="rounded-lg p-4"
                      style={{ border: "1px solid var(--border-soft)", background: "var(--card-bg)" }}>
                      <div className="h-8 w-8 rounded-lg mb-3" style={{ background: "var(--hover-bg)" }} />
                      <div className="h-3 w-20 rounded mb-2" style={{ background: "var(--hover-bg)" }} />
                      <div className="h-2 w-full rounded" style={{ background: "var(--hover-bg)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y" style={{ borderColor: "var(--border-soft)", background: "var(--card-bg)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-accent-blue" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-accent-green" />
              <span>Runs locally in browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              <span>No signup required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Tools for every workflow</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{categories.length} categories, {tools.length} tools</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoryOrder.map((catId) => {
            const cat = categories.find((c) => c.id === catId);
            if (!cat) return null;
            const catTools = getToolsByCategory(catId);
            if (catTools.length === 0) return null;
            const Icon = categoryIcons[catId] || Grid3X3;
            return (
              <Link key={catId} href={`/category/${catId}`}
                className="group p-5 rounded-xl transition-all"
                style={{ border: "1px solid var(--border-soft)", background: "var(--card-bg-soft)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(207,207,207,0.18)";
                  e.currentTarget.style.background = "var(--hover-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-soft)";
                  e.currentTarget.style.background = "var(--card-bg-soft)";
                }}>
                <Icon className="h-5 w-5 mb-3" style={{ color: "var(--text-muted)" }} />
                <h3 className="text-sm font-medium" style={{ color: "var(--text-main)" }}>{cat.name}</h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{catTools.length} tools</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured tools */}
      <section className="border-t" style={{ borderColor: "var(--border-soft)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>Popular tools</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Most used by our community</p>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t" style={{ borderColor: "var(--border-soft)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Ready to be productive?</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>All tools are free and run entirely in your browser.</p>
          <Link href="/dashboard" className="btn-primary mt-6 inline-flex">
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--border-soft)", background: "var(--card-bg)" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandLogo size={20} />
              <span className="text-sm font-medium" style={{ color: "var(--text-main)" }}>EnoTools</span>
            </div>
            <div className="flex items-center gap-6 text-xs" style={{ color: "var(--text-muted)" }}>
              <Link href="/dashboard" className="transition-colors hover:opacity-80">Tools</Link>
              <Link href="/categories" className="transition-colors hover:opacity-80">Categories</Link>
              <span>© {new Date().getFullYear()} EnoTools</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
