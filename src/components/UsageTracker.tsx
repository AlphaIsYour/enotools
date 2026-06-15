"use client";

import { useEffect } from "react";
import { trackVisit } from "@/lib/usage-tracker";

export function UsageTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackVisit(slug);
  }, [slug]);

  return null;
}
