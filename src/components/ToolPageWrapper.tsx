"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type Tool, categories } from "@/lib/tools";

interface ToolPageWrapperProps {
  tool: Tool;
  children: React.ReactNode;
}

export function ToolPageWrapper({ tool, children }: ToolPageWrapperProps) {
  const category = categories.find((c) => c.id === tool.category);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb & Header */}
      <div className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 mb-4">
            <Link
              href="/"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/category/${tool.category}`}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-surface-900 dark:text-surface-100 font-medium">
              {tool.name}
            </span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 sm:text-3xl">
                {tool.name}
              </h1>
              <p className="mt-2 text-surface-600 dark:text-surface-400 max-w-2xl">
                {tool.description}
              </p>
            </div>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tools
            </Link>
          </div>
        </div>
      </div>

      {/* Tool Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
