"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe, Sparkles } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import {
  tools,
  categories,
  categoryOrder,
  getFeaturedTools,
  getToolsByCategory,
} from "@/lib/tools";

export default function HomePage() {
  const featured = getFeaturedTools();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-surface-200 dark:border-surface-800">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-brand-100/60 via-brand-50/30 to-transparent dark:from-brand-950/60 dark:via-brand-950/30 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 px-4 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-300 mb-6">
              <Sparkles className="h-4 w-4" />
              {tools.length}+ free tools, no signup required
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              All the tools you need,
              <br />
              <span className="gradient-text">in one place</span>
            </h1>

            <p className="mt-6 text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
              A modern collection of free, fast, and beautiful online utilities
              for developers, designers, students, and office workers. Everything
              runs locally in your browser — your data never leaves your device.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tools"
                className="btn-primary text-base px-8 py-3"
              >
                Browse All Tools
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/categories"
                className="btn-secondary text-base px-8 py-3"
              >
                View Categories
              </Link>
            </div>
          </div>

          {/* Features strip */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-surface-100">
                  Lightning Fast
                </p>
                <p className="text-xs">No server roundtrips</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-surface-100">
                  Privacy First
                </p>
                <p className="text-xs">Data stays in your browser</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-surface-100">
                  Free Forever
                </p>
                <p className="text-xs">No signup, no limits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Tools</h2>
            <p className="mt-2 text-surface-500 dark:text-surface-400">
              Most popular utilities used by developers and creators
            </p>
          </div>
          <Link
            href="/tools"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Category Sections */}
      {categoryOrder.map((catId) => {
        const cat = categories.find((c) => c.id === catId);
        const catTools = getToolsByCategory(catId);
        if (!cat || catTools.length === 0) return null;

        return (
          <section
            key={catId}
            className="border-t border-surface-100 dark:border-surface-800"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    {cat.description}
                  </p>
                </div>
                <Link
                  href={`/category/${catId}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  See all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="border-t border-surface-200 dark:border-surface-800 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="section-title">Ready to be productive?</h2>
          <p className="mt-4 text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
            All tools are free, run entirely in your browser, and require no
            signup. Start using them now.
          </p>
          <div className="mt-8">
            <Link href="/tools" className="btn-primary text-base px-8 py-3">
              Explore All Tools
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
