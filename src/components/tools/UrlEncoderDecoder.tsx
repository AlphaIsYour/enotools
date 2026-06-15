"use client";

import { useState, useCallback, useEffect } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ArrowLeftRight } from "lucide-react";

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"component" | "uri">("component");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");

  const process = useCallback(() => {
    if (!input) {
      setOutput("");
      return;
    }

    try {
      if (direction === "encode") {
        setOutput(
          mode === "component"
            ? encodeURIComponent(input)
            : encodeURI(input)
        );
      } else {
        setOutput(
          mode === "component"
            ? decodeURIComponent(input)
            : decodeURI(input)
        );
      }
    } catch {
      setOutput("Error: Invalid input for decoding");
    }
  }, [input, mode, direction]);

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
      {/* Mode selector */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Encoding:
            </span>
            <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
              <button
                onClick={() => setMode("component")}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  mode === "component"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                }`}
              >
                Component
              </button>
              <button
                onClick={() => setMode("uri")}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  mode === "uri"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                }`}
              >
                Full URI
              </button>
            </div>
          </div>

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
        </div>

        <p className="mt-3 text-xs text-surface-500 dark:text-surface-400">
          {mode === "component"
            ? "encodeURIComponent - Encodes all special characters except A-Z a-z 0-9 - _ . ! ~ * ' ( )"
            : "encodeURI - Encodes special characters but preserves URI-valid characters like : / ? # [ ] @ ! $ & ' ( ) * + , ; ="}
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
                ? "Enter text to encode..."
                : "Enter URL-encoded text to decode..."
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

      {/* Quick examples */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Quick Examples
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Hello World!",
            "https://example.com/path?key=value&foo=bar",
            "user@email.com",
            "name=John Doe&age=30",
            "100% complete",
          ].map((example) => (
            <button
              key={example}
              onClick={() => {
                setInput(example);
                setDirection("encode");
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-mono bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              {example.length > 30 ? example.slice(0, 30) + "..." : example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
