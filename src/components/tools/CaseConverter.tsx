"use client";

import { useState, useMemo } from "react";

type CaseType =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "dot"
  | "path"
  | "html";

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

function toSentenceCase(str: string): string {
  return str
    .split(/([.!?]\s*)/)
    .map((sentence, i) => {
      if (i % 2 === 1) return sentence;
      return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    })
    .join("");
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

function toDotCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")
    .toLowerCase();
}

function toPathCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, "/")
    .replace(/^\/|\/$/g, "")
    .toLowerCase();
}

function toHtmlTags(str: string): string {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `<span>${word}</span>`)
    .join("\n");
}

function convertCase(input: string, type: CaseType): string {
  switch (type) {
    case "upper":
      return input.toUpperCase();
    case "lower":
      return input.toLowerCase();
    case "title":
      return toTitleCase(input);
    case "sentence":
      return toSentenceCase(input);
    case "camel":
      return toCamelCase(input);
    case "pascal":
      return toPascalCase(input);
    case "snake":
      return toSnakeCase(input);
    case "kebab":
      return toKebabCase(input);
    case "constant":
      return toConstantCase(input);
    case "dot":
      return toDotCase(input);
    case "path":
      return toPathCase(input);
    case "html":
      return toHtmlTags(input);
    default:
      return input;
  }
}

const CASE_OPTIONS: { type: CaseType; label: string }[] = [
  { type: "upper", label: "UPPERCASE" },
  { type: "lower", label: "lowercase" },
  { type: "title", label: "Title Case" },
  { type: "sentence", label: "Sentence case" },
  { type: "camel", label: "camelCase" },
  { type: "pascal", label: "PascalCase" },
  { type: "snake", label: "snake_case" },
  { type: "kebab", label: "kebab-case" },
  { type: "constant", label: "CONSTANT_CASE" },
  { type: "dot", label: "dot.case" },
  { type: "path", label: "path/case" },
  { type: "html", label: "HTML Tags" },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseType>("upper");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return convertCase(input, selectedCase);
  }, [input, selectedCase]);

  const wordCount = useMemo(() => {
    const trimmed = input.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [input]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Input Text
        </label>
        <textarea
          className="input-field w-full h-32 text-sm resize-y"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
        />
        <div className="mt-1 text-xs text-surface-500 dark:text-surface-400">
          {input.length} characters | {wordCount} words
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Select Case
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {CASE_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedCase(option.type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selectedCase === option.type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Output ({CASE_OPTIONS.find((o) => o.type === selectedCase)?.label})
          </label>
          <button onClick={handleCopy} className="btn-secondary text-xs" disabled={!output}>
            Copy
          </button>
        </div>
        <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-4 min-h-[8rem]">
          <pre className="font-mono text-sm whitespace-pre-wrap break-words text-surface-900 dark:text-surface-100">
            {output || (
              <span className="text-surface-400 dark:text-surface-500 italic">
                Output will appear here...
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
