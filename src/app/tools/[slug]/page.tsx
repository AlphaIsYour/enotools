import { notFound } from "next/navigation";
import { tools, getToolBySlug } from "@/lib/tools";
import { ToolPageWrapper } from "@/components/ToolPageWrapper";
import { ToolRenderer } from "@/components/ToolRenderer";
import { UsageTracker } from "@/components/UsageTracker";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return {
    title: tool.name,
    description: tool.description,
    openGraph: {
      title: `${tool.name} | EnoTools`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <ToolPageWrapper tool={tool}>
      <UsageTracker slug={slug} />
      <ToolRenderer slug={slug} />
    </ToolPageWrapper>
  );
}
