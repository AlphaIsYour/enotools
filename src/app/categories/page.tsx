import Link from "next/link";
import { categories, categoryOrder, getToolsByCategory } from "@/lib/tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all tool categories in EnoTools",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="section-title">Tool Categories</h1>
        <p className="mt-3 text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
          Browse tools organized by purpose. Find exactly what you need.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryOrder.map((catId) => {
          const cat = categories.find((c) => c.id === catId);
          if (!cat) return null;
          const catTools = getToolsByCategory(catId);
          if (catTools.length === 0) return null;

          return (
            <Link
              key={catId}
              href={`/category/${catId}`}
              className="group rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-6 transition-all hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5"
            >
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {cat.name}
              </h2>
              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                {cat.description}
              </p>
              <p className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400">
                {catTools.length} tool{catTools.length !== 1 ? "s" : ""} →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
