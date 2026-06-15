"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PanelHeader } from "@/components/PanelHeader";

const SIDEBAR_COLLAPSED_KEY = "enotools-sidebar-collapsed";
let cachedSidebarCollapsed = false;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(cachedSidebarCollapsed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    cachedSidebarCollapsed = stored;
    setSidebarCollapsed(stored);
    setHydrated(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      cachedSidebarCollapsed = next;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "var(--sidebar-bg)",
        visibility: hydrated ? "visible" : "hidden",
      }}
    >
      {/* Sidebar — plain, merges with background */}
      <DashboardSidebar collapsed={sidebarCollapsed} />

      {/* Main content — panel directly attached to sidebar */}
      <main className="flex-1 pt-4 overflow-hidden" style={{ background: "var(--sidebar-bg)" }}>
        <section
          className="relative h-[calc(100vh-16px)] overflow-hidden rounded-tl-[14px] rounded-tr-none rounded-br-none rounded-bl-none border-l border-t border-r-0 border-b-0"
          style={{
            borderColor: "var(--border-soft)",
            background: "var(--panel-bg)",
          }}
        >
          {/* Panel header — solid, blocks content behind */}
          <PanelHeader
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />

          {/* Scrollable content with dotted background */}
          <div className="h-full overflow-y-auto px-6 pb-6 pt-16 dark-dotted-panel">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
