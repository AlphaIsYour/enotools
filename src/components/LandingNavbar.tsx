"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export function LandingNavbar() {
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (!mounted) return null;

  const links = [
    { href: "/dashboard", label: "Tools" },
    { href: "/categories", label: "Categories" },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? "var(--app-bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border-soft)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo size={28} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>EnoTools</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleDark}
              className="flex items-center justify-center h-8 w-8 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--hover-bg)";
                e.currentTarget.style.color = "var(--text-main)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/dashboard" className="hidden sm:inline-flex btn-primary text-sm py-2">
              Open Dashboard
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t py-3 animate-fade-in" style={{ borderColor: "var(--border-soft)" }}>
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  {link.label}
                </Link>
              ))}
              <Link href="/dashboard" className="btn-primary text-sm mt-2 text-center">
                Open Dashboard
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
