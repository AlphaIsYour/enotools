import Link from "next/link";
import { type Tool } from "@/lib/tools";
import {
  QrCode, Link as LinkIcon, FileCode, Code, KeyRound, GitCompare,
  FileText, Hash, CaseSensitive, Minus, AlignLeft, Braces, Regex,
  Fingerprint, Clock, Pipette, Square, Circle, Percent, Ruler,
  Palette, Eye, Layers, CircleDot, Bookmark, Paintbrush, Image,
  Globe, RefreshCw, Scissors, LayoutGrid, Stamp, Sparkles,
  ClipboardPaste, Eraser, Spline, Repeat, Crop, Frame, Type,
  ArrowRightLeft, AlignVerticalSpaceAround, RectangleHorizontal,
  Calculator, FolderOpen, ALargeSmall, BookOpen, Book, Binary,
  Sigma, LineChart, Lock, Barcode, Key, Tags, BookMarked,
  NotepadText, Languages, Laugh, Camera, Minimize2, Maximize2,
  RotateCw, PenTool, PenLine, FileCheck, GripVertical, Trash2,
  Copy, FileImage, ImageIcon, Unlock, CheckCheck, SwatchBook,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  QrCode, Link: LinkIcon, FileCode, Code, KeyRound, GitCompare,
  FileText, Hash, CaseSensitive, Minus, AlignLeft, Braces, Regex,
  Fingerprint, Clock, Pipette, Square, Circle, Percent, Ruler,
  Palette, Eye, Layers, CircleDot, Bookmark, Paintbrush, Image,
  Globe, RefreshCw, Scissors, LayoutGrid, Stamp, Sparkles,
  ClipboardPaste, Eraser, Spline, Repeat, Crop, Frame, Type,
  ArrowRightLeft, AlignVerticalSpaceAround, RectangleHorizontal,
  Calculator, FolderOpen, ALargeSmall, BookOpen, Book, Binary,
  Sigma, LineChart, Lock, Barcode, Key, Tags, BookMarked,
  NotepadText, Languages, Laugh, Camera, Minimize2, Maximize2,
  RotateCw, PenTool, PenLine, FileCheck, GripVertical, Trash2,
  Copy, FileImage, ImageIcon, Unlock, CheckCheck, SwatchBook,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.icon] || Code;

  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card block group">
      <div className="flex items-start gap-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--hover-bg)",
            color: "var(--text-muted)",
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate" style={{ color: "var(--text-main)" }}>
              {tool.name}
            </h3>
            {tool.featured && (
              <span className="badge" style={{ background: "var(--hover-bg)", color: "var(--text-muted)" }}>
                Popular
              </span>
            )}
            {tool.new && (
              <span className="badge" style={{ background: "rgba(16,185,129,0.10)", color: "#10B981", borderColor: "rgba(16,185,129,0.20)" }}>
                New
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {tool.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
