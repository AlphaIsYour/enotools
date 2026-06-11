import Link from "next/link";
import { type Tool } from "@/lib/tools";
import {
  QrCode, Link as LinkIcon, FileCode, Code, KeyRound, GitCompare,
  FileText, Hash, CaseSensitive, Minus, AlignLeft, Braces, Regex,
  Fingerprint, Clock, Pipette, Square, Circle, Percent, Ruler,
  Sparkles, Paintbrush, Image, Type, Binary, Calculator,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  QrCode, Link: LinkIcon, FileCode, Code, KeyRound, GitCompare,
  FileText, Hash, CaseSensitive, Minus, AlignLeft, Braces, Regex,
  Fingerprint, Clock, Pipette, Square, Circle, Percent, Ruler,
  Sparkles, Paintbrush, Image, Type, Binary, Calculator,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.icon] || Code;

  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card block">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
              {tool.name}
            </h3>
            {tool.featured && (
              <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                Popular
              </span>
            )}
            {tool.new && (
              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                New
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400 line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
