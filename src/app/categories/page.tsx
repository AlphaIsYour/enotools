import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories, categoryOrder, getToolsByCategory } from "@/lib/tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all tool categories in EnoTools",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-main)" }}>Categories</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Tools organized by purpose.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categoryOrder.map((catId) => {
          const cat = categories.find((c) => c.id === catId);
          if (!cat) return null;
          const catTools = getToolsByCategory(catId);
          if (catTools.length === 0) return null;

          return (
            <Link key={catId} href={`/category/${catId}`}
              className="group p-5 rounded-xl transition-all"
              style={{ border: "1px solid var(--border-soft)", background: "var(--card-bg)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>{cat.name}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{cat.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--text-muted)" }} />
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-soft)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="font-medium" style={{ color: "var(--text-main)" }}>{catTools.length}</span> tool{catTools.length !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
