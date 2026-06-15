"use client";

import { useState, useCallback, useEffect } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ArrowLeftRight } from "lucide-react";

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  " ": "&nbsp;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "€": "&euro;",
  "£": "&pound;",
  "°": "&deg;",
  "±": "&plusmn;",
  "×": "&times;",
  "÷": "&divide;",
  "≠": "&ne;",
  "≤": "&le;",
  "≥": "&ge;",
  "←": "&larr;",
  "→": "&rarr;",
  "↑": "&uarr;",
  "↓": "&darr;",
  "•": "&bull;",
  "…": "&hellip;",
  "«": "&laquo;",
  "»": "&raquo;",
  "“": "&ldquo;",
  "”": "&rdquo;",
  "‘": "&lsquo;",
  "’": "&rsquo;",
  "–": "&ndash;",
  "—": "&mdash;",
};

const NAMED_ENTITIES_REVERSE: Record<string, string> = {};
for (const [char, entity] of Object.entries(NAMED_ENTITIES)) {
  NAMED_ENTITIES_REVERSE[entity] = char;
}

function encodeNamed(str: string): string {
  let result = "";
  for (const char of str) {
    if (NAMED_ENTITIES[char]) {
      result += NAMED_ENTITIES[char];
    } else {
      const code = char.codePointAt(0)!;
      if (code > 127) {
        result += `&#${code};`;
      } else {
        result += char;
      }
    }
  }
  return result;
}

function encodeNumeric(str: string): string {
  let result = "";
  for (const char of str) {
    const code = char.codePointAt(0)!;
    if (code > 127 || "&<>\"'".includes(char)) {
      result += `&#${code};`;
    } else {
      result += char;
    }
  }
  return result;
}

function decodeEntities(str: string): string {
  // Decode named entities
  let result = str;
  for (const [entity, char] of Object.entries(NAMED_ENTITIES_REVERSE)) {
    result = result.split(entity).join(char);
  }

  // Decode numeric entities (decimal)
  result = result.replace(/&#(\d+);/g, (_, num) => {
    return String.fromCodePoint(parseInt(num, 10));
  });

  // Decode numeric entities (hex)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });

  return result;
}

export default function HtmlEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [entityType, setEntityType] = useState<"named" | "numeric">("named");

  const process = useCallback(() => {
    if (!input) {
      setOutput("");
      return;
    }

    try {
      if (direction === "encode") {
        setOutput(entityType === "named" ? encodeNamed(input) : encodeNumeric(input));
      } else {
        setOutput(decodeEntities(input));
      }
    } catch {
      setOutput("Error processing input");
    }
  }, [input, direction, entityType]);

  useEffect(() => {
    const timer = setTimeout(process, 150);
    return () => clearTimeout(timer);
  }, [process]);

  const swap = () => {
    setInput(output);
    setOutput("");
    setDirection(direction === "encode" ? "decode" : "encode");
  };

  const clear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Direction:
            </span>
            <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
              <button
                onClick={() => setDirection("encode")}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  direction === "encode"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => setDirection("decode")}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  direction === "decode"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                }`}
              >
                Decode
              </button>
            </div>
          </div>

          {direction === "encode" && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Type:
              </span>
              <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
                <button
                  onClick={() => setEntityType("named")}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    entityType === "named"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                  }`}
                >
                  Named
                </button>
                <button
                  onClick={() => setEntityType("numeric")}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    entityType === "numeric"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                  }`}
                >
                  Numeric
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-surface-500 dark:text-surface-400">
          {direction === "encode"
            ? entityType === "named"
              ? "Named entities use readable names like &amp; &lt; &gt; &quot; &#39; and common symbols."
              : "Numeric entities use Unicode code points like &#38; &#60; &#62; for all special characters."
            : "Decodes both named (&amp;amp;) and numeric (&#38;) HTML entities back to characters."}
        </p>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Input
            </h2>
            <button
              onClick={clear}
              className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "encode"
                ? "Enter HTML or text to encode..."
                : "Enter HTML entities to decode..."
            }
            className="input-field min-h-[240px] resize-y"
            spellCheck={false}
          />
          <div className="mt-2 text-xs text-surface-500 dark:text-surface-400">
            {input.length} characters
          </div>
        </div>

        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Output
            </h2>
            <CopyButton text={output} />
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="input-field min-h-[240px] resize-y bg-surface-50 dark:bg-surface-800"
            spellCheck={false}
          />
          <div className="mt-2 text-xs text-surface-500 dark:text-surface-400">
            {output.length} characters
          </div>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center">
        <button onClick={swap} className="btn-secondary">
          <ArrowLeftRight className="h-4 w-4" />
          Swap Input & Output
        </button>
      </div>

      {/* Common entities reference */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Common HTML Entities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {[
            { entity: "&amp;", char: "&", name: "Ampersand" },
            { entity: "&lt;", char: "<", name: "Less than" },
            { entity: "&gt;", char: ">", name: "Greater than" },
            { entity: "&quot;", char: '"', name: "Double quote" },
            { entity: "&#39;", char: "'", name: "Single quote" },
            { entity: "&nbsp;", char: " ", name: "Non-breaking space" },
            { entity: "&copy;", char: "©", name: "Copyright" },
            { entity: "&reg;", char: "®", name: "Registered" },
            { entity: "&trade;", char: "™", name: "Trademark" },
            { entity: "&euro;", char: "€", name: "Euro" },
          ].map((item) => (
            <button
              key={item.entity}
              onClick={() => {
                setInput(item.char);
                setDirection("encode");
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-left"
            >
              <span className="font-mono text-brand-600 dark:text-brand-400">
                {item.entity}
              </span>
              <span className="text-surface-500 truncate">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
