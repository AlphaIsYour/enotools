"use client";

import { DashboardShell } from "@/components/DashboardShell";

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
