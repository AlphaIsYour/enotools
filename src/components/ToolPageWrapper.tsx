"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { type Tool, categories } from "@/lib/tools";

interface ToolPageWrapperProps {
  tool: Tool;
  children: React.ReactNode;
}

export function ToolPageWrapper({ tool, children }: ToolPageWrapperProps) {
  const category = categories.find((c) => c.id === tool.category);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/dashboard" className="transition-colors hover:opacity-80">
          Tools
        </Link>
        <ChevronRight className="h-3 w-3 opacity-50" />
        {category && (
          <>
            <Link href={`/category/${tool.category}`} className="transition-colors hover:opacity-80">
              {category.name}
            </Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
          </>
        )}
        <span style={{ color: "var(--text-main)" }} className="font-medium">{tool.name}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl" style={{ color: "var(--text-main)" }}>
          {tool.name}
        </h1>
        <p className="mt-1.5 text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
          {tool.description}
        </p>
      </div>

      {/* Tool Content */}
      {children}
    </div>
  );
}
