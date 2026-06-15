"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Moon, Sun, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SearchModal } from "./SearchModal";

export function Header() {
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Read the current state from the DOM (set by the theme script in layout)
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
    setMounted(true);
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home", match: (p: string) => p === "/" },
    { href: "/tools", label: "Tools", match: (p: string) => p === "/tools" || p.startsWith("/tools/") },
    { href: "/categories", label: "Categories", match: (p: string) => p === "/categories" || p.startsWith("/category/") },
  ];

  if (!mounted) return null;

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-dashboard-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <BrandLogo size={28} />
              <span className="text-sm font-semibold tracking-tight text-dashboard-text-primary">
                EnoTools
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = link.match(pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-dashboard-card text-dashboard-text-primary border border-dashboard-border"
                        : "text-dashboard-text-secondary hover:text-dashboard-text-primary hover:bg-dashboard-card/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-dashboard-border bg-dashboard-card/50 px-3 py-1.5 text-sm text-dashboard-text-muted hover:border-dashboard-border-hover hover:text-dashboard-text-secondary transition-all duration-200"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Search...</span>
                <kbd className="hidden sm:inline-flex items-center rounded border border-dashboard-border px-1 py-0.5 text-[10px] font-medium text-dashboard-text-muted">
                  {isMac ? "⌘K" : "Ctrl+K"}
                </kbd>
              </button>

              <button
                onClick={toggleDark}
                className="rounded-lg p-2 text-dashboard-text-muted hover:text-dashboard-text-secondary hover:bg-dashboard-card/50 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-lg p-2 text-dashboard-text-muted hover:text-dashboard-text-secondary hover:bg-dashboard-card/50 transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-dashboard-border py-3 animate-fade-in">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      link.match(pathname)
                        ? "bg-dashboard-card text-dashboard-text-primary border border-dashboard-border"
                        : "text-dashboard-text-secondary hover:text-dashboard-text-primary hover:bg-dashboard-card/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
