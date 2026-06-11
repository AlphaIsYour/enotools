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
    await navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setText("");
  };

  const statCards = [
    { label: "Words", value: stats.words, color: "blue" },
    { label: "Characters (with spaces)", value: stats.charsWithSpaces, color: "green" },
    { label: "Characters (no spaces)", value: stats.charsWithoutSpaces, color: "teal" },
    { label: "Sentences", value: stats.sentences, color: "purple" },
    { label: "Paragraphs", value: stats.paragraphs, color: "pink" },
    { label: "Lines", value: stats.lines, color: "orange" },
    { label: "Avg Words/Sentence", value: stats.avgWordsPerSentence, color: "indigo" },
    { label: "Reading Time", value: `${stats.readingTime} min`, color: "cyan" },
    { label: "Speaking Time", value: `${stats.speakingTime} min`, color: "amber" },
  ];

  const colorMap: Record<string, string> = {
    blue: "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30",
    green: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30",
    teal: "border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/30",
    purple: "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30",
    pink: "border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/30",
    orange: "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30",
    indigo: "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30",
    cyan: "border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/30",
    amber: "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30",
  };

  const textColorMap: Record<string, string> = {
    blue: "text-blue-800 dark:text-blue-200",
    green: "text-green-800 dark:text-green-200",
    teal: "text-teal-800 dark:text-teal-200",
    purple: "text-purple-800 dark:text-purple-200",
    pink: "text-pink-800 dark:text-pink-200",
    orange: "text-orange-800 dark:text-orange-200",
    indigo: "text-indigo-800 dark:text-indigo-200",
    cyan: "text-cyan-800 dark:text-cyan-200",
    amber: "text-amber-800 dark:text-amber-200",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border p-4 ${colorMap[card.color]}`}
          >
            <div className={`text-2xl font-bold ${textColorMap[card.color]}`}>
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
          <div className="rounded-lg border border-surface-300 dark:border-surface-600 p-4">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              UPPERCASE
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 font-mono break-words max-h-32 overflow-y-auto">
              {text.toUpperCase()}
            </p>
          </div>
          <div className="rounded-lg border border-surface-300 dark:border-surface-600 p-4">
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
