"use client";

import { useState, useCallback, useEffect } from "react";
import { CopyButton } from "@/components/CopyButton";

type Tab = "base64" | "url" | "hash";
type Direction = "encode" | "decode";

const TABS: { key: Tab; label: string }[] = [
  { key: "base64", label: "Base64" },
  { key: "url", label: "URL Encoding" },
  { key: "hash", label: "Hash Generation" },
];

const HASH_ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;
type HashAlgo = (typeof HASH_ALGORITHMS)[number];

// Simple MD5 implementation (for browser compatibility since Web Crypto doesn't support MD5)
function md5(input: string): string {
  function rotateLeft(val: number, shift: number): number {
    return (val << shift) | (val >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function md5cycle(x: number[], k: number[]): void {
    let a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = addUnsigned(a, x[0]);
    x[1] = addUnsigned(b, x[1]);
    x[2] = addUnsigned(c, x[2]);
    x[3] = addUnsigned(d, x[3]);
  }

  function cmn(
    q: number,
    a: number,
    b: number,
    x: number,
    s: number,
    t: number
  ): number {
    a = addUnsigned(addUnsigned(a, q), addUnsigned(x, t));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function convertToWordArray(str: string): number[] {
    const msgLength = str.length;
    const numberOfWords = (((msgLength + 8) >>> 6) + 1) * 16;
    const wordArray = new Array(numberOfWords).fill(0);
    for (let i = 0; i < msgLength; i++) {
      wordArray[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
    }
    wordArray[msgLength >> 2] |= 0x80 << ((msgLength % 4) * 8);
    wordArray[numberOfWords - 2] = msgLength * 8;
    return wordArray;
  }

  function wordToHex(value: number): string {
    let hex = "";
    for (let i = 0; i < 4; i++) {
      const byte = (value >>> (i * 8)) & 0xff;
      hex += ("0" + byte.toString(16)).slice(-2);
    }
    return hex;
  }

  const wordArray = convertToWordArray(input);
  const state = [1732584193, -271733879, -1732584194, 271733878];

  for (let i = 0; i < wordArray.length; i += 16) {
    md5cycle(state, wordArray.slice(i, i + 16));
  }

  return state.map(wordToHex).join("");
}

export default function EncodingTools() {
  const [tab, setTab] = useState<Tab>("base64");

  // Base64 state
  const [b64Input, setB64Input] = useState("");
  const [b64Direction, setB64Direction] = useState<Direction>("encode");
  const [b64Output, setB64Output] = useState("");
  const [b64Error, setB64Error] = useState("");

  // URL state
  const [urlInput, setUrlInput] = useState("");
  const [urlDirection, setUrlDirection] = useState<Direction>("encode");
  const [urlOutput, setUrlOutput] = useState("");
  const [urlError, setUrlError] = useState("");

  // Hash state
  const [hashInput, setHashInput] = useState("");
  const [hashAlgo, setHashAlgo] = useState<HashAlgo>("SHA-256");
  const [hashOutput, setHashOutput] = useState("");
  const [hashError, setHashError] = useState("");

  // Base64 processing
  const processBase64 = useCallback(() => {
    if (!b64Input) {
      setB64Output("");
      setB64Error("");
      return;
    }
    try {
      if (b64Direction === "encode") {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(b64Input);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        setB64Output(btoa(binary));
      } else {
        const binary = atob(b64Input);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        setB64Output(new TextDecoder().decode(bytes));
      }
      setB64Error("");
    } catch {
      setB64Error("Invalid input for the selected operation.");
      setB64Output("");
    }
  }, [b64Input, b64Direction]);

  useEffect(() => {
    const timer = setTimeout(processBase64, 200);
    return () => clearTimeout(timer);
  }, [processBase64]);

  // URL processing
  const processUrl = useCallback(() => {
    if (!urlInput) {
      setUrlOutput("");
      setUrlError("");
      return;
    }
    try {
      if (urlDirection === "encode") {
        setUrlOutput(encodeURIComponent(urlInput));
      } else {
        setUrlOutput(decodeURIComponent(urlInput));
      }
      setUrlError("");
    } catch {
      setUrlError("Invalid input for URL decoding.");
      setUrlOutput("");
    }
  }, [urlInput, urlDirection]);

  useEffect(() => {
    const timer = setTimeout(processUrl, 200);
    return () => clearTimeout(timer);
  }, [processUrl]);

  // Hash processing
  const processHash = useCallback(async () => {
    if (!hashInput) {
      setHashOutput("");
      setHashError("");
      return;
    }

    try {
      if (hashAlgo === "MD5") {
        setHashOutput(md5(hashInput));
      } else {
        const encoder = new TextEncoder();
        const data = encoder.encode(hashInput);
        const algoMap: Record<string, string> = {
          "SHA-1": "SHA-1",
          "SHA-256": "SHA-256",
          "SHA-512": "SHA-512",
        };
        const hashBuffer = await crypto.subtle.digest(
          algoMap[hashAlgo],
          data
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        setHashOutput(hashHex);
      }
      setHashError("");
    } catch {
      setHashError("Failed to compute hash.");
      setHashOutput("");
    }
  }, [hashInput, hashAlgo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      processHash();
    }, 200);
    return () => clearTimeout(timer);
  }, [processHash]);

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 border-b border-surface-200 dark:border-surface-800">
        {TABS.map((t) => (
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

      {/* Base64 Tab */}
      {tab === "base64" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Direction:
              </span>
              <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
                <button
                  onClick={() => setB64Direction("encode")}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    b64Direction === "encode"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setB64Direction("decode")}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    b64Direction === "decode"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Input
                </label>
                <textarea
                  value={b64Input}
                  onChange={(e) => setB64Input(e.target.value)}
                  placeholder={
                    b64Direction === "encode"
                      ? "Enter text to encode..."
                      : "Enter Base64 to decode..."
                  }
                  className="input-field min-h-[200px] resize-y font-mono text-sm"
                  spellCheck={false}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Output
                  </label>
                  <CopyButton text={b64Output} />
                </div>
                <textarea
                  value={b64Output}
                  readOnly
                  placeholder="Result..."
                  className="input-field min-h-[200px] resize-y font-mono text-sm bg-surface-50 dark:bg-surface-800"
                  spellCheck={false}
                />
              </div>
            </div>
            {b64Error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {b64Error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* URL Tab */}
      {tab === "url" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Direction:
              </span>
              <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
                <button
                  onClick={() => setUrlDirection("encode")}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    urlDirection === "encode"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setUrlDirection("decode")}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    urlDirection === "decode"
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Input
                </label>
                <textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={
                    urlDirection === "encode"
                      ? "Enter text to URL encode..."
                      : "Enter URL-encoded text to decode..."
                  }
                  className="input-field min-h-[200px] resize-y font-mono text-sm"
                  spellCheck={false}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Output
                  </label>
                  <CopyButton text={urlOutput} />
                </div>
                <textarea
                  value={urlOutput}
                  readOnly
                  placeholder="Result..."
                  className="input-field min-h-[200px] resize-y font-mono text-sm bg-surface-50 dark:bg-surface-800"
                  spellCheck={false}
                />
              </div>
            </div>
            {urlError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {urlError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hash Tab */}
      {tab === "hash" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Algorithm:
              </label>
              <select
                value={hashAlgo}
                onChange={(e) => setHashAlgo(e.target.value as HashAlgo)}
                className="input-field text-sm"
              >
                {HASH_ALGORITHMS.map((algo) => (
                  <option key={algo} value={algo}>
                    {algo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Input Text
                </label>
                <textarea
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter text to hash..."
                  className="input-field min-h-[120px] resize-y font-mono text-sm"
                  spellCheck={false}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                    {hashAlgo} Hash
                  </label>
                  <CopyButton text={hashOutput} />
                </div>
                <input
                  type="text"
                  value={hashOutput}
                  readOnly
                  placeholder="Hash will appear here..."
                  className="input-field w-full font-mono text-sm bg-surface-50 dark:bg-surface-800"
                />
              </div>
            </div>
            {hashError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {hashError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
