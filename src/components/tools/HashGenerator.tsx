"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

// Compact MD5 implementation
function md5(input: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

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

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  function rhex(n: number) {
    const hexChars = "0123456789abcdef";
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += hexChars.charAt((n >> (j * 8 + 4)) & 0x0f) + hexChars.charAt((n >> (j * 8)) & 0x0f);
    }
    return s;
  }

  function hex(x: number[]) {
    return rhex(x[0]) + rhex(x[1]) + rhex(x[2]) + rhex(x[3]);
  }

  // Encode string to UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  let s = "";
  for (let i = 0; i < data.length; i++) {
    s += String.fromCharCode(data[i]);
  }

  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;

  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }

  s = s.substring(i - 64);
  const tail = new Array(16).fill(0);
  for (i = 0; i < s.length; i++) {
    tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
  }
  tail[i >> 2] |= 0x80 << (i % 4 << 3);

  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }

  tail[14] = n * 8;
  md5cycle(state, tail);

  return hex(state);
}

async function shaDigest(algorithm: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(key);
  const dataBuffer = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [upperCase, setUpperCase] = useState(false);
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [hmacMode, setHmacMode] = useState(false);
  const [hmacKey, setHmacKey] = useState("");
  const [hmacHash, setHmacHash] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes([]);
      setHmacHash("");
      return;
    }

    try {
      const [sha1, sha256, sha512] = await Promise.all([
        shaDigest("SHA-1", text),
        shaDigest("SHA-256", text),
        shaDigest("SHA-512", text),
      ]);

      setHashes([
        { algorithm: "MD5", hash: md5(text), length: 32 },
        { algorithm: "SHA-1", hash: sha1, length: 40 },
        { algorithm: "SHA-256", hash: sha256, length: 64 },
        { algorithm: "SHA-512", hash: sha512, length: 128 },
      ]);
    } catch {
      // Fallback for environments without crypto.subtle
      setHashes([
        { algorithm: "MD5", hash: md5(text), length: 32 },
      ]);
    }
  }, []);

  const generateHmac = useCallback(async (text: string, key: string) => {
    if (!text || !key) {
      setHmacHash("");
      return;
    }
    try {
      const result = await hmacSha256(key, text);
      setHmacHash(result);
    } catch {
      setHmacHash("");
    }
  }, []);

  useEffect(() => {
    generateHashes(input);
  }, [input, generateHashes]);

  useEffect(() => {
    if (hmacMode) {
      generateHmac(input, hmacKey);
    }
  }, [input, hmacKey, hmacMode, generateHmac]);

  const formatHash = (hash: string) => (upperCase ? hash.toUpperCase() : hash.toLowerCase());

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={upperCase}
            onChange={(e) => setUpperCase(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">Uppercase output</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hmacMode}
            onChange={(e) => setHmacMode(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600"
          />
          <span className="text-sm text-surface-700 dark:text-surface-300">HMAC mode</span>
        </label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary text-sm"
        >
          Hash a File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        {fileName && (
          <span className="text-xs text-surface-500 dark:text-surface-400">
            File: {fileName}
          </span>
        )}
      </div>

      {hmacMode && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            HMAC Key (SHA-256)
          </label>
          <input
            type="text"
            className="input-field w-full font-mono"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="Enter HMAC key..."
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Input Text
          </label>
          <span className="text-xs text-surface-500 dark:text-surface-400">
            UTF-8 encoded &middot; {input.length} chars
          </span>
        </div>
        <textarea
          className="input-field w-full h-32 text-sm font-mono resize-y"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          spellCheck={false}
        />
      </div>

      {hmacMode && hmacHash && (
        <div className="rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              HMAC-SHA256
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-600 dark:text-purple-400">
                {hmacHash.length * 4} bits
              </span>
              <CopyButton text={formatHash(hmacHash)} />
            </div>
          </div>
          <p className="text-sm font-mono break-all text-purple-900 dark:text-purple-100">
            {formatHash(hmacHash)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hashes.map((h) => (
          <div
            key={h.algorithm}
            className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {h.algorithm}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  {h.length * 4} bits
                </span>
                <CopyButton text={formatHash(h.hash)} />
              </div>
            </div>
            <p className="text-sm font-mono break-all text-surface-900 dark:text-surface-100">
              {formatHash(h.hash)}
            </p>
          </div>
        ))}
      </div>

      {hashes.length === 0 && (
        <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-8 text-center">
          <p className="text-surface-400 dark:text-surface-500 text-sm">
            Enter text above to generate hashes
          </p>
        </div>
      )}
    </div>
  );
}
