"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";

type Flag = "g" | "i" | "m" | "s" | "u";

const FLAG_LABELS: Record<Flag, string> = {
  g: "Global (g)",
  i: "Case Insensitive (i)",
  m: "Multiline (m)",
  s: "DotAll (s)",
  u: "Unicode (u)",
};

interface Preset {
  label: string;
  pattern: string;
  flags: Flag[];
  example: string;
}

const PRESETS: Preset[] = [
  {
    label: "Email",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: ["g"],
    example: "Contact us at hello@example.com or support@company.org",
  },
  {
    label: "URL",
    pattern: "https?://[\\w\\-._~:/?#[\\]@!$&'()*+,;=%]+",
    flags: ["g"],
    example: "Visit https://example.com or http://test.org/path?q=1",
  },
  {
    label: "Phone (US)",
    pattern: "\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}",
    flags: ["g"],
    example: "Call (555) 123-4567 or 555.987.6543 or 555-111-2222",
  },
  {
    label: "IPv4",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: ["g"],
    example: "Server at 192.168.1.1 and gateway 10.0.0.1",
  },
  {
    label: "Date (YYYY-MM-DD)",
    pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
    flags: ["g"],
    example: "Start: 2024-01-15, End: 2024-12-31",
  },
];

interface ExplainToken {
  token: string;
  description: string;
}

function explainRegex(pattern: string): ExplainToken[] {
  const tokens: ExplainToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    // Escape sequences
    if (ch === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const escapeMap: Record<string, string> = {
        d: "Digit [0-9]",
        D: "Non-digit [^0-9]",
        w: "Word character [a-zA-Z0-9_]",
        W: "Non-word character",
        s: "Whitespace character",
        S: "Non-whitespace character",
        b: "Word boundary",
        B: "Non-word boundary",
        n: "Newline",
        r: "Carriage return",
        t: "Tab",
        ".": "Literal dot",
        "\\": "Literal backslash",
        "/": "Literal forward slash",
        "(": "Literal opening parenthesis",
        ")": "Literal closing parenthesis",
        "[": "Literal opening bracket",
        "]": "Literal closing bracket",
        "{": "Literal opening brace",
        "}": "Literal closing brace",
        "+": "Literal plus sign",
        "*": "Literal asterisk",
        "?": "Literal question mark",
        "^": "Literal caret",
        $: "Literal dollar sign",
        "|": "Literal pipe",
      };
      if (escapeMap[next]) {
        tokens.push({ token: `\\${next}`, description: escapeMap[next] });
      } else if (/\d/.test(next)) {
        tokens.push({ token: `\\${next}`, description: `Back-reference to group ${next}` });
      } else {
        tokens.push({ token: `\\${next}`, description: `Escaped character "${next}"` });
      }
      i += 2;
      continue;
    }

    // Character classes
    if (ch === "[") {
      let end = i + 1;
      if (end < pattern.length && pattern[end] === "^") end++;
      if (end < pattern.length && pattern[end] === "]") end++;
      while (end < pattern.length && pattern[end] !== "]") {
        if (pattern[end] === "\\") end++;
        end++;
      }
      end++; // include ]
      const classContent = pattern.substring(i, end);
      const negated = classContent.startsWith("[^");
      tokens.push({
        token: classContent,
        description: negated
          ? `Character class: NOT any of ${classContent}`
          : `Character class: any of ${classContent}`,
      });
      i = end;
      continue;
    }

    // Groups
    if (ch === "(") {
      let groupDesc = "Capturing group";
      if (pattern.substring(i, i + 3) === "(?:") {
        groupDesc = "Non-capturing group";
        tokens.push({ token: "(?:", description: groupDesc });
        i += 3;
        continue;
      } else if (pattern.substring(i, i + 4) === "(?=") {
        tokens.push({ token: "(?=", description: "Positive lookahead" });
        i += 3;
        continue;
      } else if (pattern.substring(i, i + 4) === "(?!") {
        tokens.push({ token: "(?!", description: "Negative lookahead" });
        i += 3;
        continue;
      } else if (pattern.substring(i, i + 4) === "(?<=") {
        tokens.push({ token: "(?<=", description: "Positive lookbehind" });
        i += 4;
        continue;
      } else if (pattern.substring(i, i + 4) === "(?<!") {
        tokens.push({ token: "(?<!", description: "Negative lookbehind" });
        i += 4;
        continue;
      } else if (pattern.substring(i, i + 3) === "(?<") {
        const nameEnd = pattern.indexOf(">", i + 3);
        if (nameEnd !== -1) {
          const name = pattern.substring(i + 3, nameEnd);
          tokens.push({ token: pattern.substring(i, nameEnd + 1), description: `Named capturing group "${name}"` });
          i = nameEnd + 1;
          continue;
        }
      }
      tokens.push({ token: "(", description: groupDesc });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ token: ")", description: "End of group" });
      i++;
      continue;
    }

    // Quantifiers
    if (ch === "*" || ch === "+" || ch === "?") {
      let token = ch;
      let desc = "";
      if (ch === "*") desc = "Zero or more (greedy)";
      if (ch === "+") desc = "One or more (greedy)";
      if (ch === "?") desc = "Zero or one (optional, greedy)";
      if (i + 1 < pattern.length && pattern[i + 1] === "?") {
        token += "?";
        desc = desc.replace("(greedy)", "(lazy/non-greedy)");
      }
      tokens.push({ token, description: desc });
      i += token.length;
      continue;
    }

    if (ch === "{") {
      const end = pattern.indexOf("}", i);
      if (end !== -1) {
        const quant = pattern.substring(i, end + 1);
        const inner = quant.slice(1, -1);
        let desc = "";
        if (inner.includes(",")) {
          const [min, max] = inner.split(",");
          if (max === "") {
            desc = `${min} or more times`;
          } else {
            desc = `Between ${min} and ${max} times`;
          }
        } else {
          desc = `Exactly ${inner} times`;
        }
        tokens.push({ token: quant, description: desc });
        i = end + 1;
        // Check for lazy
        if (i < pattern.length && pattern[i] === "?") {
          tokens.push({ token: "?", description: " (lazy/non-greedy modifier)" });
          i++;
        }
        continue;
      }
    }

    // Anchors
    if (ch === "^") {
      tokens.push({ token: "^", description: "Start of string (or line in multiline mode)" });
      i++;
      continue;
    }

    if (ch === "$") {
      tokens.push({ token: "$", description: "End of string (or line in multiline mode)" });
      i++;
      continue;
    }

    // Alternation
    if (ch === "|") {
      tokens.push({ token: "|", description: "Alternation (OR)" });
      i++;
      continue;
    }

    // Dot
    if (ch === ".") {
      tokens.push({ token: ".", description: "Any character (except newline, unless DotAll flag)" });
      i++;
      continue;
    }

    // Literal character
    tokens.push({ token: ch, description: `Literal character "${ch}"` });
    i++;
  }

  return tokens;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Flag[]>(["g"]);
  const [testString, setTestString] = useState("");

  const flagString = flags.join("");

  const regex = useMemo(() => {
    if (!pattern) return null;
    try {
      return new RegExp(pattern, flagString);
    } catch {
      return null;
    }
  }, [pattern, flagString]);

  const regexError = useMemo(() => {
    if (!pattern) return null;
    try {
      new RegExp(pattern, flagString);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }, [pattern, flagString]);

  const matches = useMemo(() => {
    if (!regex || !testString) return [];
    const results: { match: string; index: number; groups?: string[] }[] = [];
    if (flags.includes("g")) {
      let m: RegExpExecArray | null;
      const re = new RegExp(pattern, flagString);
      while ((m = re.exec(testString)) !== null) {
        results.push({
          match: m[0],
          index: m.index,
          groups: m.length > 1 ? m.slice(1) : undefined,
        });
        if (m[0].length === 0) re.lastIndex++;
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        results.push({
          match: m[0],
          index: m.index,
          groups: m.length > 1 ? m.slice(1) : undefined,
        });
      }
    }
    return results;
  }, [regex, testString, pattern, flagString, flags]);

  const explanation = useMemo(() => explainRegex(pattern), [pattern]);

  const toggleFlag = (flag: Flag) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const loadPreset = (preset: Preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.example);
  };

  const highlightedText = useMemo(() => {
    if (!regex || !testString || matches.length === 0) return null;
    const parts: { text: string; highlighted: boolean }[] = [];
    let lastIndex = 0;
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
    for (const m of sortedMatches) {
      if (m.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, m.index), highlighted: false });
      }
      parts.push({ text: m.match, highlighted: true });
      lastIndex = m.index + m.match.length;
    }
    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), highlighted: false });
    }
    return parts;
  }, [regex, testString, matches]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Regular Expression
        </label>
        <div className="flex items-center gap-2">
          <span className="text-surface-400 font-mono text-lg">/</span>
          <input
            type="text"
            className="input-field flex-1 font-mono"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            spellCheck={false}
          />
          <span className="text-surface-400 font-mono text-lg">/</span>
          <span className="text-surface-600 dark:text-surface-400 font-mono text-sm min-w-[2rem]">
            {flagString}
          </span>
          {pattern && <CopyButton text={`/${pattern}/${flagString}`} />}
        </div>
        {regexError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-mono">{regexError}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {(Object.keys(FLAG_LABELS) as Flag[]).map((flag) => (
          <label key={flag} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={flags.includes(flag)}
              onChange={() => toggleFlag(flag)}
              className="rounded border-surface-300 dark:border-surface-600"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">
              {FLAG_LABELS[flag]}
            </span>
          </label>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Test String
          </label>
          <span className="text-xs text-surface-500 dark:text-surface-400">
            {matches.length} match{matches.length !== 1 ? "es" : ""}
          </span>
        </div>
        <textarea
          className="input-field w-full h-32 text-sm font-mono resize-y"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          spellCheck={false}
        />
      </div>

      {testString && matches.length > 0 && highlightedText && (
        <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-4">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Highlighted Matches
          </h3>
          <pre className="text-sm font-mono whitespace-pre-wrap break-all text-surface-900 dark:text-surface-100">
            {highlightedText.map((part, i) =>
              part.highlighted ? (
                <mark
                  key={i}
                  className="bg-yellow-200 dark:bg-yellow-800 text-surface-900 dark:text-surface-100 rounded px-0.5"
                >
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </pre>
        </div>
      )}

      {matches.length > 0 && (
        <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-4">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Match List
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {matches.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm py-1 px-2 rounded bg-surface-50 dark:bg-surface-800"
              >
                <span className="text-surface-500 dark:text-surface-400 text-xs w-8">#{i + 1}</span>
                <span className="font-mono text-green-700 dark:text-green-400 break-all">
                  &quot;{m.match}&quot;
                </span>
                <span className="text-surface-400 text-xs">at index {m.index}</span>
                {m.groups && m.groups.length > 0 && (
                  <span className="text-surface-400 text-xs">
                    groups: [{m.groups.map((g) => `"${g}"`).join(", ")}]
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern && (
        <div className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 p-4">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Explanation
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {explanation.length === 0 ? (
              <p className="text-sm text-surface-400 italic">No tokens to explain</p>
            ) : (
              explanation.map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm py-1 px-2 rounded bg-surface-50 dark:bg-surface-800"
                >
                  <code className="font-mono text-blue-600 dark:text-blue-400 shrink-0 min-w-[6rem]">
                    {t.token}
                  </code>
                  <span className="text-surface-600 dark:text-surface-400">{t.description}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Common Patterns
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => loadPreset(preset)}
              className="btn-secondary text-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
