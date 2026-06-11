"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { marked } from "marked";

type ViewMode = "split" | "editor" | "preview";

const TOOLBAR_ITEMS = [
  { label: "B", title: "Bold", before: "**", after: "**" },
  { label: "I", title: "Italic", before: "_", after: "_" },
  { label: "H1", title: "Heading 1", before: "# ", after: "" },
  { label: "H2", title: "Heading 2", before: "## ", after: "" },
  { label: "H3", title: "Heading 3", before: "### ", after: "" },
  { label: "Link", title: "Link", before: "[", after: "](url)" },
  { label: "Code", title: "Inline Code", before: "`", after: "`" },
  { label: "```", title: "Code Block", before: "```\n", after: "\n```" },
  { label: "- ", title: "Unordered List", before: "- ", after: "" },
  { label: "1.", title: "Ordered List", before: "1. ", after: "" },
  { label: ">", title: "Blockquote", before: "> ", after: "" },
  { label: "---", title: "Horizontal Rule", before: "\n---\n", after: "" },
];

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>(
    "# Hello World\n\nStart writing your **markdown** here!\n\n## Features\n\n- Live preview\n- Toolbar shortcuts\n- Export options\n"
  );
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    try {
      return marked.parse(markdown, { async: false }) as string;
    } catch {
      return "<p>Error parsing markdown</p>";
    }
  }, [markdown]);

  const wordCount = useMemo(() => {
    const trimmed = markdown.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [markdown]);

  const charCount = markdown.length;

  const lineCount = useMemo(() => {
    return markdown.split("\n").length;
  }, [markdown]);

  const handleToolbarClick = (before: string, after: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const newText =
      markdown.substring(0, start) +
      before +
      selected +
      after +
      markdown.substring(end);

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + selected.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const handleExportHTML = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Markdown</title>
  <style>body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }</style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) return;
    textarea.addEventListener("scroll", handleScroll);
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden">
          {(["split", "editor", "preview"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                viewMode === mode
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap rounded-lg border border-surface-300 dark:border-surface-600 p-1 bg-surface-50 dark:bg-surface-800">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.title}
              onClick={() => handleToolbarClick(item.before, item.after)}
              title={item.title}
              className="px-2 py-1 text-xs font-mono font-medium rounded hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
        <button onClick={handleExportHTML} className="btn-secondary text-sm">
          Export HTML
        </button>
        <button onClick={handleExportMarkdown} className="btn-secondary text-sm">
          Export MD
        </button>
      </div>

      <div
        className={`grid gap-4 ${
          viewMode === "split" ? "md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {(viewMode === "split" || viewMode === "editor") && (
          <div className="rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden bg-white dark:bg-surface-900 flex">
            <div
              ref={lineNumbersRef}
              className="py-3 px-2 text-right bg-surface-50 dark:bg-surface-800 border-r border-surface-300 dark:border-surface-600 select-none overflow-hidden"
              style={{ minWidth: "3rem" }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className="text-xs text-surface-400 dark:text-surface-500 leading-6 font-mono"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={editorRef}
              className="flex-1 p-3 font-mono text-sm leading-6 bg-transparent resize-none outline-none w-full h-[500px] text-surface-900 dark:text-surface-100"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your markdown here..."
              spellCheck={false}
            />
          </div>
        )}

        {(viewMode === "split" || viewMode === "preview") && (
          <div className="rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden bg-white dark:bg-surface-900">
            <div className="px-4 py-2 border-b border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Preview
              </span>
            </div>
            <div
              className="p-6 prose prose-sm dark:prose-invert max-w-none h-[500px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-surface-600 dark:text-surface-400">
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
        <span>Lines: {lineCount}</span>
      </div>
    </div>
  );
}
