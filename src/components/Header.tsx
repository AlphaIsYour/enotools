"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Moon, Sun, Menu, X, Wrench } from "lucide-react";
import { SearchModal } from "./SearchModal";

export function Header() {
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
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

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-surface-200 dark:border-surface-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="gradient-text">Eno</span>
                <span className="text-surface-700 dark:text-surface-200">
                  Tools
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800"
                }`}
              >
                Home
              </Link>
              <Link
                href="/tools"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/tools" || pathname.startsWith("/tools/")
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800"
                }`}
              >
                All Tools
              </Link>
              <Link
                href="/categories"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/categories" || pathname.startsWith("/category/")
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800"
                }`}
              >
                Categories
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 px-3 py-2 text-sm text-surface-500 hover:border-surface-300 dark:hover:border-surface-600 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search tools...</span>
                <kbd className="hidden sm:inline-flex items-center rounded-md border border-surface-200 dark:border-surface-600 px-1.5 py-0.5 text-[10px] font-medium text-surface-400">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={toggleDark}
                className="rounded-xl p-2.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {dark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-xl p-2.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-surface-200 dark:border-surface-800 py-3 animate-fade-in">
              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                >
                  Home
                </Link>
                <Link
                  href="/tools"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                >
                  All Tools
                </Link>
                <Link
                  href="/categories"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                >
                  Categories
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
