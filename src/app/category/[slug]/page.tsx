import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import { categories, categoryOrder, getToolsByCategory } from "@/lib/tools";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categoryOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);
  if (!category) notFound();

  const catTools = getToolsByCategory(slug as typeof categoryOrder[number]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Link>
        <h1 className="section-title">{category.name}</h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400 max-w-2xl">
          {category.description}
        </p>
        <p className="mt-1 text-sm text-surface-400">
          {catTools.length} tool{catTools.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
