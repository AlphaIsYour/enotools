"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home, Grid3X3, Clock, Settings,
  FileText, Image, Type, Calculator, Code,
  Palette, Printer, Binary, Shapes, MoreHorizontal,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { categories } from "@/lib/tools";
import { getTopSlugs, hasUsageData } from "@/lib/usage-tracker";

const categoryIcons: Record<string, React.ElementType> = {
  encoding: Binary, text: Type, developer: Code, math: Calculator,
  css: Shapes, colour: Palette, images: Image, typography: Type,
  print: Printer, calculators: Calculator, other: MoreHorizontal, pdf: FileText,
};

interface DashboardSidebarProps {
  collapsed: boolean;
}

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  useEffect(() => {
    if (hasUsageData()) setRecentSlugs(getTopSlugs(5));
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const showTooltip = (label: string, target: HTMLElement) => {
    if (!collapsed) return;
    const rect = target.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2 });
  };

  const hideTooltip = () => setTooltip(null);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "All Tools", icon: Grid3X3 },
  ];

  // Consistent item sizing
  const itemHeight = "h-9";        // 36px
  const iconSize = "h-4 w-4";      // 16px
  const collapsedBox = "h-9 w-9";  // 36x36px
  const textSize = "text-[13px]";

  return (
    <aside
      className="relative z-50 h-screen shrink-0 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ width: collapsed ? 64 : 240, background: "var(--sidebar-bg)" }}
    >
      <div className="flex flex-col h-full">
        {/* Logo — always left-aligned */}
        <div className="flex items-center h-12 px-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className={`${textSize} font-semibold whitespace-nowrap overflow-hidden transition-all duration-200 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`} style={{ color: "var(--text-main)" }}>
              EnoTools
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-2 py-1">
          {/* Main nav */}
          <div className="space-y-0.5 mb-4 mt-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg transition-colors duration-200 relative ${
                    collapsed ? `${collapsedBox} justify-center mx-auto` : `${itemHeight} px-2.5 gap-2.5 mx-2`
                  }`}
                  style={{
                    background: active ? "var(--active-bg)" : "transparent",
                    color: active ? "var(--text-main)" : "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "var(--hover-bg)";
                    showTooltip(item.label, e.currentTarget);
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                    hideTooltip();
                  }}
                >
                  <item.icon className={`${iconSize} shrink-0`} />
                  <span className={`${textSize} whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Recent */}
          {recentSlugs.length > 0 && (
            <div className="mb-4">
              <p className={`px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-200 ${
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`} style={{ color: "var(--text-muted)" }}>
                Recent
              </p>
              <div className="space-y-0.5">
                {recentSlugs.slice(0, collapsed ? 3 : 5).map((slug) => {
                  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  const active = isActive(`/tools/${slug}`);
                  return (
                    <Link
                      key={slug}
                      href={`/tools/${slug}`}
                      className={`flex items-center rounded-lg transition-colors duration-200 relative ${
                        collapsed ? `${collapsedBox} justify-center mx-auto` : `${itemHeight} px-2.5 gap-2.5 mx-2`
                      }`}
                      style={{
                        background: active ? "var(--active-bg)" : "transparent",
                        color: active ? "var(--text-main)" : "var(--text-muted)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = "var(--hover-bg)";
                        showTooltip(name, e.currentTarget);
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = "transparent";
                        hideTooltip();
                      }}
                    >
                      <Clock className={`${iconSize} shrink-0`} />
                      <span className={`${textSize} truncate whitespace-nowrap overflow-hidden transition-all duration-200 ${
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      }`}>
                        {name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="mb-4">
            <p className={`px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-200 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`} style={{ color: "var(--text-muted)" }}>
              Categories
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.id] || Grid3X3;
                const active = isActive(`/category/${cat.id}`);
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className={`flex items-center rounded-lg transition-colors duration-200 relative ${
                      collapsed ? `${collapsedBox} justify-center mx-auto` : `${itemHeight} px-2.5 gap-2.5 mx-2`
                    }`}
                    style={{
                      background: active ? "var(--active-bg)" : "transparent",
                      color: active ? "var(--text-main)" : "var(--text-muted)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = "var(--hover-bg)";
                      showTooltip(cat.name, e.currentTarget);
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                      hideTooltip();
                    }}
                  >
                    <Icon className={`${iconSize} shrink-0`} />
                    <span className={`${textSize} truncate whitespace-nowrap overflow-hidden transition-all duration-200 ${
                      collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    }`}>
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom — settings */}
        <div className="px-2 py-3">
          <Link
            href="/dashboard"
            className={`flex items-center rounded-lg transition-colors duration-200 relative ${
              collapsed ? `${collapsedBox} justify-center mx-auto` : `${itemHeight} px-2.5 gap-2.5 mx-2`
            }`}
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--hover-bg)";
              showTooltip("Settings", e.currentTarget);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              hideTooltip();
            }}
          >
            <Settings className={`${iconSize} shrink-0`} />
            <span className={`${textSize} whitespace-nowrap overflow-hidden transition-all duration-200 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}>
              Settings
            </span>
          </Link>
        </div>
      </div>

      {collapsed && tooltip && (
        <div
          className="fixed left-[76px] z-[9999] -translate-y-1/2 rounded-lg px-2 py-1 text-xs whitespace-nowrap pointer-events-none"
          style={{
            top: tooltip.top,
            background: "var(--card-bg)",
            color: "var(--text-main)",
            border: "1px solid var(--border-soft)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {tooltip.label}
        </div>
      )}
    </aside>
  );
}
