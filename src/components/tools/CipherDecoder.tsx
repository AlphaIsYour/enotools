"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";

type CipherTab = "rot13" | "caesar" | "vigenere" | "atbash" | "base64";

function rot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function caesarCipher(str: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
  });
}

function vigenereCipher(str: string, key: string, encode: boolean): string {
  if (!key) return str;
  let keyIndex = 0;
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    const keyChar = key[keyIndex % key.length].toLowerCase();
    const keyShift = keyChar.charCodeAt(0) - 97;
    const shift = encode ? keyShift : 26 - keyShift;
    keyIndex++;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

function atbash(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    if (c <= "Z") {
      return String.fromCharCode(90 - (c.charCodeAt(0) - 65));
    }
    return String.fromCharCode(122 - (c.charCodeAt(0) - 97));
  });
}

function base64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return "Error encoding";
  }
}

function base64Decode(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "Error decoding";
  }
}

const tabs: { key: CipherTab; label: string }[] = [
  { key: "rot13", label: "ROT13" },
  { key: "caesar", label: "Caesar" },
  { key: "vigenere", label: "Vigenere" },
  { key: "atbash", label: "Atbash" },
  { key: "base64", label: "Base64" },
];

export default function CipherDecoder() {
  const [activeTab, setActiveTab] = useState<CipherTab>("rot13");
  const [input, setInput] = useState("");
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState("key");
  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");

  const output = useMemo((): string => {
    if (!input) return "";
    switch (activeTab) {
      case "rot13":
        return rot13(input);
      case "caesar":
        return caesarCipher(input, caesarShift);
      case "vigenere":
        return vigenereCipher(input, vigenereKey, true);
      case "atbash":
        return atbash(input);
      case "base64":
        return base64Mode === "encode" ? base64Encode(input) : base64Decode(input);
      default:
        return "";
    }
  }, [input, activeTab, caesarShift, vigenereKey, base64Mode]);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "caesar" && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Shift Value
          </label>
          <input
            type="number"
            className="input-field w-32"
            value={caesarShift}
            onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
          />
        </div>
      )}

      {activeTab === "vigenere" && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Key
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter key"
            value={vigenereKey}
            onChange={(e) => setVigenereKey(e.target.value.replace(/[^a-zA-Z]/g, ""))}
          />
        </div>
      )}

      {activeTab === "base64" && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Mode
          </label>
          <select
            className="input-field w-40"
            value={base64Mode}
            onChange={(e) => setBase64Mode(e.target.value as "encode" | "decode")}
          >
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Input
          </label>
          <textarea
            className="input-field min-h-[200px] font-mono"
            placeholder="Enter text to process..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Output
            </label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            className="input-field min-h-[200px] font-mono"
            readOnly
            value={output}
            placeholder="Result will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
