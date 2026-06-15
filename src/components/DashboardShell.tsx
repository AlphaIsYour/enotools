"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PanelHeader } from "@/components/PanelHeader";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--sidebar-bg)" }}>
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
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
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
