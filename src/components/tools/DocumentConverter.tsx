"use client";

import { useState, useCallback, useEffect } from "react";
import { CopyButton } from "@/components/CopyButton";

type Format = "plain" | "markdown" | "html" | "json" | "csv";

const FORMAT_LABELS: Record<Format, string> = {
  plain: "Plain Text",
  markdown: "Markdown",
  html: "HTML",
  json: "JSON",
  csv: "CSV",
};

// --- Conversion functions ---

function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>");
  // Avoid double-wrapping: only wrap <li> that aren't already inside <ul>
  html = html.replace(/(?<!<\/ul>)(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes("<ul>")) return match;
    return `<ol>\n${match}</ol>`;
  });

  // Horizontal rules
  html = html.replace(/^---+$/gm, "<hr>");

  // Paragraphs: wrap remaining plain text lines
  const lines = html.split("\n");
  const result: string[] = [];
  let inBlock = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("</") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<hr") ||
      trimmed.startsWith("<code") ||
      trimmed === ""
    ) {
      result.push(line);
      if (trimmed.startsWith("<pre")) inBlock = true;
      if (trimmed.startsWith("</pre")) inBlock = false;
    } else if (inBlock) {
      result.push(line);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  return result.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlToPlainText(html: string): string {
  // Remove script and style tags with content
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Replace <br> and <p> with newlines
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, "");
  // Decode common entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, " ");
  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

function jsonToCsv(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  const arr = Array.isArray(data) ? data : [data];

  if (arr.length === 0) return "";

  // Flatten each object
  const flatArr = arr.map((item) => flattenObject(item));
  const headers = Array.from(new Set(flatArr.flatMap((item) => Object.keys(item))));

  const csvLines: string[] = [];
  csvLines.push(headers.map(csvEscape).join(","));
  for (const row of flatArr) {
    csvLines.push(
      headers
        .map((h) => {
          const val = row[h];
          return csvEscape(val === undefined || val === null ? "" : String(val));
        })
        .join(",")
    );
  }
  return csvLines.join("\n");
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      result[fullKey] = JSON.stringify(value);
    } else {
      result[fullKey] = value === null || value === undefined ? "" : String(value);
    }
  }
  return result;
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function csvToJson(csvStr: string): string {
  const lines = csvStr.trim().split("\n");
  if (lines.length < 2) return "[]";

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return JSON.stringify(rows, null, 2);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

function plainToJsonLines(text: string): string {
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.map((line) => JSON.stringify({ line: line.trim() })).join("\n");
}

// --- Conversion mapping ---

function convert(input: string, from: Format, to: Format): string {
  if (from === to) return input;
  if (!input.trim()) return "";

  try {
    // Markdown -> HTML
    if (from === "markdown" && to === "html") return markdownToHtml(input);
    // HTML -> Plain Text
    if (from === "html" && to === "plain") return htmlToPlainText(input);
    // JSON -> CSV
    if (from === "json" && to === "csv") return jsonToCsv(input);
    // CSV -> JSON
    if (from === "csv" && to === "json") return csvToJson(input);
    // Plain Text -> JSON Lines
    if (from === "plain" && to === "json") return plainToJsonLines(input);

    // Intermediate conversions
    // Markdown -> Plain: first to HTML, then strip tags
    if (from === "markdown" && to === "plain")
      return htmlToPlainText(markdownToHtml(input));
    // Markdown -> JSON Lines
    if (from === "markdown" && to === "json")
      return plainToJsonLines(htmlToPlainText(markdownToHtml(input)));
    // HTML -> Markdown (not supported natively, convert to plain first)
    if (from === "html" && to === "markdown") return htmlToPlainText(input);
    // JSON -> Plain
    if (from === "json" && to === "plain") {
      try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return input;
      }
    }
    // CSV -> Plain
    if (from === "csv" && to === "plain") return input;
    // CSV -> HTML
    if (from === "csv" && to === "html") {
      const lines = input.trim().split("\n");
      if (lines.length === 0) return "";
      const headers = parseCsvLine(lines[0]);
      let html = "<table>\n<thead>\n<tr>\n";
      headers.forEach((h) => {
        html += `  <th>${escapeHtml(h)}</th>\n`;
      });
      html += "</tr>\n</thead>\n<tbody>\n";
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCsvLine(lines[i]);
        html += "<tr>\n";
        vals.forEach((v) => {
          html += `  <td>${escapeHtml(v)}</td>\n`;
        });
        html += "</tr>\n";
      }
      html += "</tbody>\n</table>";
      return html;
    }
    // Plain -> HTML
    if (from === "plain" && to === "html")
      return input
        .split("\n")
        .map((l) => `<p>${escapeHtml(l)}</p>`)
        .join("\n");
    // JSON -> CSV (already handled above)
    // JSON -> Markdown
    if (from === "json" && to === "markdown") {
      return jsonToCsv(input)
        .split("\n")
        .map((line, i, arr) => {
          const cells = parseCsvLine(line);
          const row = `| ${cells.join(" ")} |`;
          if (i === 0) {
            const sep = `| ${cells.map(() => "---").join(" ")} |`;
            return `${row}\n${sep}`;
          }
          return row;
        })
        .join("\n");
    }
    // HTML -> JSON Lines
    if (from === "html" && to === "json")
      return plainToJsonLines(htmlToPlainText(input));
    // CSV -> Markdown
    if (from === "csv" && to === "markdown") {
      const lines = input.trim().split("\n");
      if (lines.length === 0) return "";
      return lines
        .map((line, i) => {
          const cells = parseCsvLine(line);
          const row = `| ${cells.join(" ")} |`;
          if (i === 0) {
            const sep = `| ${cells.map(() => "---").join(" ")} |`;
            return `${row}\n${sep}`;
          }
          return row;
        })
        .join("\n");
    }
    // Plain -> CSV
    if (from === "plain" && to === "csv") {
      return input
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => csvEscape(l.trim()))
        .join("\n");
    }
    // Plain -> Markdown
    if (from === "plain" && to === "markdown") return input;
    // HTML -> CSV
    if (from === "html" && to === "csv") return htmlToPlainText(input);
    // Markdown -> CSV
    if (from === "markdown" && to === "csv")
      return htmlToPlainText(markdownToHtml(input));

    return input;
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

export default function DocumentConverter() {
  const [input, setInput] = useState("");
  const [fromFormat, setFromFormat] = useState<Format>("markdown");
  const [toFormat, setToFormat] = useState<Format>("html");
  const [output, setOutput] = useState("");

  const handleConvert = useCallback(() => {
    const result = convert(input, fromFormat, toFormat);
    setOutput(result);
  }, [input, fromFormat, toFormat]);

  useEffect(() => {
    const timer = setTimeout(handleConvert, 200);
    return () => clearTimeout(timer);
  }, [handleConvert]);

  return (
    <div className="space-y-6">
      {/* Format selectors */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              From Format
            </label>
            <select
              value={fromFormat}
              onChange={(e) => setFromFormat(e.target.value as Format)}
              className="input-field text-sm"
            >
              {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              To Format
            </label>
            <select
              value={toFormat}
              onChange={(e) => setToFormat(e.target.value as Format)}
              className="input-field text-sm"
            >
              {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Input ({FORMAT_LABELS[fromFormat]})
            </h2>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter ${FORMAT_LABELS[fromFormat].toLowerCase()} here...`}
            className="input-field min-h-[300px] resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>

        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Output ({FORMAT_LABELS[toFormat]})
            </h2>
            <CopyButton text={output} />
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Converted result will appear here..."
            className="input-field min-h-[300px] resize-y font-mono text-sm bg-surface-50 dark:bg-surface-800"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
