"use client";

import { DashboardShell } from "@/components/DashboardShell";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
