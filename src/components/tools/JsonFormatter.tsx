"use client";

import { useState, useMemo, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

type Tab = "formatted" | "minified" | "tree" | "validate";

const SAMPLE_JSON = `{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "Portland",
    "state": "OR",
    "zip": "97201"
  },
  "hobbies": ["reading", "hiking", "coding"],
  "spouse": null,
  "children": [],
  "education": [
    {
      "degree": "BS",
      "field": "Computer Science",
      "year": 2015
    },
    {
      "degree": "MS",
      "field": "Data Science",
      "year": 2018
    }
  ]
}`;

interface TreeNodeProps {
  keyName: string | null;
  value: unknown;
  isLast: boolean;
  depth: number;
}

function JsonTreeNode({ keyName, value, isLast, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);

  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const renderValue = (val: unknown): React.ReactNode => {
    if (val === null) return <span className="text-surface-400 italic">null</span>;
    if (typeof val === "boolean")
      return <span className="text-purple-600 dark:text-purple-400">{String(val)}</span>;
    if (typeof val === "number")
      return <span className="text-blue-600 dark:text-blue-400">{val}</span>;
    if (typeof val === "string")
      return <span className="text-green-600 dark:text-green-400">&quot;{val}&quot;</span>;
    return <span>{String(val)}</span>;
  };

  if (!isExpandable) {
    return (
      <div className="flex items-start gap-1 py-0.5" style={{ paddingLeft: depth * 20 }}>
        {keyName !== null && (
          <>
            <span className="text-red-600 dark:text-red-400 font-mono text-sm">&quot;{keyName}&quot;</span>
            <span className="text-surface-500 font-mono text-sm">: </span>
          </>
        )}
        <span className="font-mono text-sm">{renderValue(value)}</span>
        {!isLast && <span className="text-surface-500 font-mono text-sm">,</span>}
      </div>
    );
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i) => ({ key: String(i), val: v }))
    : Object.entries(value as Record<string, unknown>).map(([k, v]) => ({ key: k, val: v }));
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded"
        style={{ paddingLeft: depth * 20 }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-surface-400 font-mono text-xs w-4 select-none">
          {expanded ? "▼" : "▶"}
        </span>
        {keyName !== null && (
          <>
            <span className="text-red-600 dark:text-red-400 font-mono text-sm">
              &quot;{keyName}&quot;
            </span>
            <span className="text-surface-500 font-mono text-sm">: </span>
          </>
        )}
        <span className="text-surface-500 font-mono text-sm">{openBracket}</span>
        {!expanded && (
          <>
            <span className="text-surface-400 font-mono text-xs">
              {entries.length} {isArray ? "items" : "keys"}
            </span>
            <span className="text-surface-500 font-mono text-sm">{closeBracket}</span>
            {!isLast && <span className="text-surface-500 font-mono text-sm">,</span>}
          </>
        )}
      </div>
      {expanded && (
        <>
          {entries.map((entry, i) => (
            <JsonTreeNode
              key={entry.key}
              keyName={isArray ? null : entry.key}
              value={entry.val}
              isLast={i === entries.length - 1}
              depth={depth + 1}
            />
          ))}
          <div className="flex items-center gap-1" style={{ paddingLeft: depth * 20 }}>
            <span className="text-surface-400 font-mono text-xs w-4" />
            <span className="text-surface-500 font-mono text-sm">{closeBracket}</span>
            {!isLast && <span className="text-surface-500 font-mono text-sm">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

function validateJson(input: string): { valid: boolean; error?: string; line?: number; col?: number } {
  if (!input.trim()) return { valid: false, error: "Input is empty" };
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const msg = (e as Error).message;
    const match = msg.match(/position\s+(\d+)/);
    let line: number | undefined;
    let col: number | undefined;
    if (match) {
      const pos = parseInt(match[1]);
      const before = input.substring(0, pos);
      line = (before.match(/\n/g) || []).length + 1;
      col = pos - before.lastIndexOf("\n");
    }
    return { valid: false, error: msg, line, col };
  }
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<Tab>("formatted");
  const [indent, setIndent] = useState<2 | 4>(2);

  const charCountInput = input.length;

  const parsed = useMemo(() => {
    if (!input.trim()) return { data: null, error: null as string | null };
    try {
      return { data: JSON.parse(input), error: null };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [input]);

  const formatted = useMemo(() => {
    if (parsed.data === null) return "";
    return JSON.stringify(parsed.data, null, indent);
  }, [parsed.data, indent]);

  const minified = useMemo(() => {
    if (parsed.data === null) return "";
    return JSON.stringify(parsed.data);
  }, [parsed.data]);

  const validation = useMemo(() => validateJson(input), [input]);

  const charCountOutput = tab === "formatted" ? formatted.length : tab === "minified" ? minified.length : 0;

  const loadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "formatted", label: "Formatted" },
    { key: "minified", label: "Minified" },
    { key: "tree", label: "Tree View" },
    { key: "validate", label: "Validate" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={loadSample} className="btn-secondary text-sm">
          Load Sample JSON
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm text-surface-700 dark:text-surface-300">Indent:</label>
          <select
            className="input-field text-sm py-1 px-2"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value) as 2 | 4)}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Input JSON
          </label>
          <span className="text-xs text-surface-500 dark:text-surface-400">{charCountInput} chars</span>
        </div>
        <textarea
          className="input-field w-full h-48 text-sm font-mono resize-y"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JSON here..."
          spellCheck={false}
        />
      </div>

      <div className="flex items-center gap-1 border-b border-surface-200 dark:border-surface-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-brand-600 text-brand-600 dark:text-brand-400"
                : "border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-4 min-h-[12rem]">
        {!input.trim() ? (
          <p className="text-surface-400 dark:text-surface-500 italic text-sm">
            Enter JSON above to see output...
          </p>
        ) : parsed.error ? (
          <div className="text-red-600 dark:text-red-400">
            <p className="font-medium text-sm mb-1">Invalid JSON</p>
            <p className="text-sm font-mono">{parsed.error}</p>
          </div>
        ) : (
          <>
            {tab === "formatted" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    {charCountOutput} chars
                  </span>
                  <CopyButton text={formatted} />
                </div>
                <pre className="text-sm font-mono text-surface-900 dark:text-surface-100 whitespace-pre-wrap break-all overflow-auto max-h-96">
                  {formatted}
                </pre>
              </div>
            )}

            {tab === "minified" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    {charCountOutput} chars
                  </span>
                  <CopyButton text={minified} />
                </div>
                <pre className="text-sm font-mono text-surface-900 dark:text-surface-100 whitespace-pre-wrap break-all overflow-auto max-h-96">
                  {minified}
                </pre>
              </div>
            )}

            {tab === "tree" && (
              <div className="overflow-auto max-h-96">
                <JsonTreeNode keyName={null} value={parsed.data} isLast={true} depth={0} />
              </div>
            )}

            {tab === "validate" && (
              <div className="space-y-3">
                {validation.valid ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <span className="text-lg">&#10003;</span>
                    <span className="font-medium">Valid JSON</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <span className="text-lg">&#10007;</span>
                      <span className="font-medium">Invalid JSON</span>
                    </div>
                    {validation.line && (
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        Error at line {validation.line}, column {validation.col}
                      </p>
                    )}
                    <p className="text-sm font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-2">
                      {validation.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
