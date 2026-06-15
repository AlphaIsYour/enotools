const STORAGE_KEY = "enotools_usage";

interface UsageData {
  [slug: string]: number;
}

function getData(): UsageData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData(data: UsageData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function trackVisit(slug: string) {
  const data = getData();
  data[slug] = (data[slug] || 0) + 1;
  saveData(data);
}

export function getVisitCount(slug: string): number {
  const data = getData();
  return data[slug] || 0;
}

export function getTopSlugs(limit: number = 6): string[] {
  const data = getData();
  return Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([slug]) => slug);
}

export function getTotalVisits(): number {
  const data = getData();
  return Object.values(data).reduce((sum, count) => sum + count, 0);
}

export function hasUsageData(): boolean {
  const data = getData();
  return Object.keys(data).length > 0;
}
