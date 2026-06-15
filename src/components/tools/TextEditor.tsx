"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Download, Trash2 } from "lucide-react";

const STORAGE_KEY = "enotools-text-editor";

export default function TextEditor() {
  const [text, setText] = useState("");
  const [wordWrap, setWordWrap] = useState(true);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setText(saved);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, text);
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  const lines = text.split("\n");
  const lineCount = lines.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleReplace = useCallback(() => {
    if (!findText) return;
    setText((prev) => prev.split(findText).join(replaceText));
  }, [findText, replaceText]);

  const handleClear = () => {
    setText("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleExport = () => {
    const blob = new Blob([text as unknown as BlobPart], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-editor-export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Word Wrap
            </span>
          </label>

          <div className="ml-auto flex gap-2">
            <button onClick={handleExport} className="btn-secondary text-sm">
              <Download className="h-4 w-4" />
              Export .txt
            </button>
            <button onClick={handleClear} className="btn-secondary text-sm">
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Find & Replace */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Find &amp; Replace
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Find
            </label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Text to find..."
              className="input-field w-full"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Replace
            </label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
              className="input-field w-full"
            />
          </div>
          <button onClick={handleReplace} className="btn-primary text-sm">
            Replace All
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            Editor
          </h3>
          <CopyButton text={text} />
        </div>
        <div className="flex gap-0">
          {/* Line numbers */}
          <div
            className="flex-shrink-0 select-none text-right pr-3 pt-0 pb-0 font-mono text-xs text-surface-400 dark:text-surface-500 leading-[1.5rem] border-r border-surface-200 dark:border-surface-700 overflow-hidden"
            style={{ minWidth: "3rem" }}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing..."
            className="input-field min-h-[400px] resize-y font-mono text-sm leading-6 flex-1 border-0 focus:ring-0"
            style={{ whiteSpace: wordWrap ? "pre-wrap" : "pre" }}
            spellCheck={false}
          />
        </div>

        {/* Stats bar */}
        <div className="mt-3 flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400 border-t border-surface-200 dark:border-surface-800 pt-3">
          <span>Characters: {charCount}</span>
          <span>Words: {wordCount}</span>
          <span>Lines: {lineCount}</span>
        </div>
      </div>
    </div>
  );
}
