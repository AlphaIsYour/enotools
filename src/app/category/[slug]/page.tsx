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
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categories.find((c) => c.id === slug);
  if (!category) notFound();
  const catTools = getToolsByCategory(slug as typeof categoryOrder[number]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/categories"
          className="inline-flex items-center gap-1.5 text-xs transition-colors hover:opacity-80 mb-3"
          style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="h-3 w-3" /> All Categories
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-main)" }}>{category.name}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{category.description}</p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="font-medium" style={{ color: "var(--text-main)" }}>{catTools.length}</span> tool{catTools.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {catTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
      </div>
    </div>
  );
}
