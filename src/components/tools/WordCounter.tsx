"use client";

import { useState, useMemo } from "react";

interface TextStats {
  words: number;
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  avgWordsPerSentence: number;
  readingTime: number;
  speakingTime: number;
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo<TextStats>(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed
      ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
      : 0;
    const paragraphs = trimmed
      ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
      : 0;
    const lines = text ? text.split("\n").length : 0;
    const avgWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 150);

    return {
      words,
      charsWithSpaces,
      charsWithoutSpaces: charsNoSpaces,
      sentences,
      paragraphs,
      lines,
      avgWordsPerSentence,
      readingTime,
      speakingTime,
    };
  }, [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const handleClear = () => {
    setText("");
  };

  const statCards = [
    { label: "Words", value: stats.words },
    { label: "Characters (with spaces)", value: stats.charsWithSpaces },
    { label: "Characters (no spaces)", value: stats.charsWithoutSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Avg Words/Sentence", value: stats.avgWordsPerSentence },
    { label: "Reading Time", value: `${stats.readingTime} min` },
    { label: "Speaking Time", value: `${stats.speakingTime} min` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border p-4 bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-800"
          >
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {card.value}
            </div>
            <div className="text-xs text-surface-600 dark:text-surface-400 mt-1">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={handleCopy} className="btn-secondary">
          Copy Text
        </button>
        <button onClick={handleClear} className="btn-secondary">
          Clear
        </button>
      </div>

      <div>
        <textarea
          className="input-field w-full h-64 text-sm resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
        />
      </div>

      {text.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 p-4">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              UPPERCASE
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 font-mono break-words max-h-32 overflow-y-auto">
              {text.toUpperCase()}
            </p>
          </div>
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 p-4">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              lowercase
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 font-mono break-words max-h-32 overflow-y-auto">
              {text.toLowerCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
