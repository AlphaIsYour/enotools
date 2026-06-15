"use client";

import { useState, useEffect } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  Moon,
  Github,
} from "lucide-react";
import { SearchModal } from "./SearchModal";

interface PanelHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function PanelHeader({
  sidebarCollapsed,
  onToggleSidebar,
}: PanelHeaderProps) {
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const iconBtnClass =
    "flex items-center justify-center h-8 w-8 rounded-lg transition-colors";

  return (
    <>
      <header
        className="absolute left-0 right-0 top-0 z-30 flex h-12 items-center justify-between px-4 border-b"
        style={{
          background: "var(--panel-header-bg)",
          borderColor: "var(--border-soft)",
        }}
      >
        {/* Left: collapse + search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={iconBtnClass}
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--hover-bg)";
              e.currentTarget.style.color = "var(--text-main)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Search bar */}
          <button
            onClick={() => setSearchOpen(true)}
            className="h-8 rounded-lg border px-2.5 flex items-center gap-2 transition-colors"
            style={{
              width: 320,
              background: "var(--input-bg)",
              borderColor: "var(--border-soft)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(207,207,207,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-soft)";
            }}
          >
            <Search
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
            <span
              className="flex-1 text-[13px] text-left"
              style={{ color: "var(--text-muted)" }}
            >
              Search tools...
            </span>
            <kbd
              className="rounded border px-1 py-0.5 text-[10px] font-medium"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--text-muted)",
              }}
            >
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
          </button>
        </div>

        {/* Right: GitHub + theme toggle */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/AlphaIsYour/enotools"
            target="_blank"
            rel="noopener noreferrer"
            className={iconBtnClass}
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--hover-bg)";
              e.currentTarget.style.color = "var(--text-main)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
            title="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <button
            onClick={toggleDark}
            className={iconBtnClass}
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--hover-bg)";
              e.currentTarget.style.color = "var(--text-main)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
