"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ArrowLeftRight, Upload, FileText } from "lucide-react";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const encodeBase64 = (str: string, safe: boolean): string => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let result = btoa(binary);
    if (safe) {
      result = result.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    return result;
  };

  const decodeBase64 = (str: string, safe: boolean): string => {
    let b64 = str;
    if (safe) {
      b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
      const pad = b64.length % 4;
      if (pad) b64 += "=".repeat(4 - pad);
    }
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  };

  const process = useCallback(() => {
    if (!input) {
      setOutput("");
      setError("");
      return;
    }

    try {
      if (direction === "encode") {
        setOutput(encodeBase64(input, urlSafe));
        setError("");
      } else {
        setOutput(decodeBase64(input, urlSafe));
        setError("");
      }
    } catch {
      setError("Invalid input for decoding. Make sure the input is valid Base64.");
      setOutput("");
    }
  }, [input, direction, urlSafe]);

  useEffect(() => {
    const timer = setTimeout(process, 200);
    return () => clearTimeout(timer);
  }, [process]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1] || result;
      setDirection("encode");
      setInput(file.name);
      setOutput(urlSafe ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base64);
    };
    reader.readAsDataURL(file);
  };

  const swap = () => {
    setInput(output);
    setOutput("");
    setDirection(direction === "encode" ? "decode" : "encode");
    setError("");
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Direction:
            </span>
            <div className="flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
              <button
                onClick={() => {
                  setDirection("encode");
                  setError("");
                }}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  direction === "encode"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => {
                  setDirection("decode");
                  setError("");
                }}
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

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              URL-safe Base64
            </span>
          </label>

          <div className="ml-auto flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              <Upload className="h-4 w-4" />
              File to Base64
            </button>
          </div>
        </div>

        {urlSafe && (
          <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
            URL-safe: Uses - instead of + and _ instead of /, with no padding.
          </p>
        )}
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-6">
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
                : "Enter Base64 to decode..."
            }
            className="input-field min-h-[240px] resize-y"
            spellCheck={false}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
            <span>
              <FileText className="inline h-3 w-3 mr-1" />
              {input.length} characters
            </span>
            <span>{new TextEncoder().encode(input).length} bytes</span>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-6">
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
          <div className="mt-2 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
            <span>
              <FileText className="inline h-3 w-3 mr-1" />
              {output.length} characters
            </span>
            <span>{new TextEncoder().encode(output).length} bytes</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Swap button */}
      <div className="flex justify-center">
        <button onClick={swap} className="btn-secondary">
          <ArrowLeftRight className="h-4 w-4" />
          Swap Input & Output
        </button>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          About Base64
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-surface-600 dark:text-surface-400">
          <div>
            <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-1">
              Standard Base64
            </h3>
            <p>
              Uses A-Z, a-z, 0-9, +, / characters with = padding. Common in MIME
              encoding and data transfer.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-1">
              URL-safe Base64
            </h3>
            <p>
              Replaces + with - and / with _. Removes padding. Used in URLs and
              filenames where standard chars are problematic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
