"use client";

import { DashboardShell } from "@/components/DashboardShell";

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
