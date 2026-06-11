"use client";

import { useState, useMemo } from "react";

type Separator = "-" | "_" | ".";

interface SlugOptions {
  separator: Separator;
  lowercase: boolean;
  removeSpecial: boolean;
  removeNumbers: boolean;
  trimWhitespace: boolean;
  maxLength: number;
}

const EXAMPLES = [
  { input: "Hello World! This is a Test", expected: "hello-world-this-is-a-test" },
  { input: "My Blog Post Title (2024)", expected: "my-blog-post-title-2024" },
  { input: "Special Characters: @#$%^&*", expected: "special-characters" },
  { input: "  Leading and Trailing Spaces  ", expected: "leading-and-trailing-spaces" },
];

function generateSlug(text: string, options: SlugOptions): string {
  let slug = text;

  if (options.trimWhitespace) {
    slug = slug.trim();
  }

  if (options.lowercase) {
    slug = slug.toLowerCase();
  }

  if (options.removeSpecial) {
    slug = slug.replace(/[^\w\s-]/g, "");
  }

  if (options.removeNumbers) {
    slug = slug.replace(/\d+/g, "");
  }

  slug = slug
    .replace(/\s+/g, options.separator)
    .replace(new RegExp(`[${options.separator}]+`, "g"), options.separator)
    .replace(new RegExp(`^${options.separator}|${options.separator}$`, "g"), "");

  if (options.maxLength > 0) {
    slug = slug.substring(0, options.maxLength);
    slug = slug.replace(new RegExp(`${options.separator}$`), "");
  }

  return slug;
}

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<SlugOptions>({
    separator: "-",
    lowercase: true,
    removeSpecial: true,
    removeNumbers: false,
    trimWhitespace: true,
    maxLength: 0,
  });
  const [batchMode, setBatchMode] = useState(false);

  const slugs = useMemo(() => {
    if (!input.trim()) return batchMode ? [] : [""];

    if (batchMode) {
      return input
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => generateSlug(line, options));
    }

    return [generateSlug(input, options)];
  }, [input, options, batchMode]);

  const handleCopy = async (slug: string) => {
    await navigator.clipboard.writeText(slug);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(slugs.join("\n"));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(e) => setBatchMode(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">Batch mode</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {batchMode ? "Input (one per line)" : "Input Text"}
        </label>
        <textarea
          className="input-field w-full h-32 text-sm resize-y"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            batchMode
              ? "Enter multiple lines, one per line..."
              : "Enter text to generate a slug..."
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Separator
          </label>
          <div className="flex gap-2">
            {(["-", "_", "."] as Separator[]).map((sep) => (
              <button
                key={sep}
                onClick={() => setOptions({ ...options, separator: sep })}
                className={`px-4 py-2 rounded-lg text-sm font-mono font-medium border transition-colors ${
                  options.separator === sep
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                }`}
              >
                {sep}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Max Length (0 = unlimited)
          </label>
          <input
            type="number"
            className="input-field w-full"
            value={options.maxLength}
            onChange={(e) =>
              setOptions({ ...options, maxLength: Math.max(0, parseInt(e.target.value) || 0) })
            }
            min={0}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Options
          </label>
          <div className="space-y-1">
            {[
              { key: "lowercase" as const, label: "Lowercase" },
              { key: "removeSpecial" as const, label: "Remove special characters" },
              { key: "removeNumbers" as const, label: "Remove numbers" },
              { key: "trimWhitespace" as const, label: "Trim whitespace" },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options[opt.key]}
                  onChange={(e) =>
                    setOptions({ ...options, [opt.key]: e.target.checked })
                  }
                  className="rounded border-surface-300 dark:border-surface-600"
                />
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Generated Slug{batchMode ? "s" : ""}
          </label>
          {slugs.length > 0 && (
            <button onClick={handleCopyAll} className="btn-secondary text-xs">
              Copy {batchMode ? "All" : ""}
            </button>
          )}
        </div>
        <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-4 min-h-[4rem]">
          {slugs.length > 0 && slugs[0] ? (
            <div className="space-y-2">
              {slugs.map((slug, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 py-1 px-2 rounded bg-surface-50 dark:bg-surface-800"
                >
                  <code className="font-mono text-sm text-surface-900 dark:text-surface-100 break-all">
                    {slug}
                  </code>
                  <button
                    onClick={() => handleCopy(slug)}
                    className="btn-secondary text-xs shrink-0"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-surface-400 dark:text-surface-500 italic text-sm">
              Slug will appear here...
            </span>
          )}
        </div>
      </div>

      {slugs.length > 0 && slugs[0] && !batchMode && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            URL Preview
          </label>
          <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 p-3">
            <code className="font-mono text-sm text-blue-600 dark:text-blue-400 break-all">
              https://example.com/blog/{slugs[0]}
            </code>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Examples
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLES.map((example, index) => (
            <button
              key={index}
              onClick={() => setInput(example.input)}
              className="text-left rounded-lg border border-surface-300 dark:border-surface-600 p-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              <div className="text-sm text-surface-700 dark:text-surface-300 font-medium">
                {example.input}
              </div>
              <div className="text-xs text-surface-500 dark:text-surface-400 font-mono mt-1">
                → {example.expected}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
