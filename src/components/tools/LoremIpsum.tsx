"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "semper", "risus",
  "viverra", "maecenas", "accumsan", "lacus", "vel", "facilisis", "volutpat",
  "velit", "pellentesque", "habitant", "morbi", "tristique", "senectus", "netus",
  "malesuada", "fames", "turpis", "egestas", "maecenas", "pharetra", "convallis",
  "posuere", "morbi", "leo", "urna", "molestie", "at", "elementum", "eu",
  "facilisis", "odio", "utilis", "enim", "lobortis", "scelerisque", "fermentum",
  "dui", "faucibus", "ornare", "suspendisse", "potenti", "nullam", "ac", "tortor",
  "dignissim", "convallis", "aenean", "et", "tortor", "at", "risus", "viverra",
  "feugiat", "pretium", "nibh", "ipsum", "consequat", "nisl", "vel", "pretium",
  "lectus", "quam", "vitae", "proinin", "sagittis", "purus", "volutpat",
  "tellus", "pellentesque", "eu", "tincidunt", "tortor", "aliquam", "nulla",
  "porttitor", "massa", "id", "neque", "aliquam", "vestibulum", "morbi",
  "blandit", "cursus", "risus", "ultrices", "tincidunt", "arcu", "non",
  "sodales", "neque", "sodales", "etiam", "erat", "velit", "scelerisque",
  "in", "dictum", "non", "dolor", "sit", "amet", "consectetur",
];

const HIPSTER_WORDS = [
  "hipster", "ipsum", "artisan", "craft", "beer", "kombucha", "gastropub",
  "vinyl", "aesthetic", "brunch", "locavore", "typewriter", "fixie", "pabst",
  "heirloom", "kale", "chips", "sustainable", "organic", "farm-to-table",
  "biodiesel", "skateboard", "portland", "brooklyn", "beard", "tattoo",
  "messenger", "bag", "sourdough", "microdosing", "retro", "neon", "chambray",
  "dreamcatcher", "polaroid", "sriracha", "tofu", "quinoa", "avocado", "toast",
  "la croix", "matcha", "oat", "milk", "cortado", "affogato", "cold", "brew",
  "pitchfork", "narwhal", "wolf", "moon", "selvage", "denim", "flannel",
  "shoreditch", "williamsburg", "bushwick", "austin", "echo", "park",
  "helvetica", "vetica", "disrupt", "intuitive", "asymmetrical", "banjo",
  "synth", "pop-up", "ethical", "slow-carb", "paleo", "wes", "anderson",
  "mumblecore", "next", "level", "salvia", "pok", "pok", "yuccie",
  "single-origin", "coffee", "lumbersexual", "blog", "copper", "mug",
];

function getRandomWords(wordList: string[], count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(wordList[Math.floor(Math.random() * wordList.length)]);
  }
  return result;
}

function generateSentence(wordList: string[], minWords: number, maxWords: number): string {
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const words = getRandomWords(wordList, wordCount);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(
  wordList: string[],
  sentencesPerParagraph: number,
  minWords: number,
  maxWords: number,
): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentencesPerParagraph; i++) {
    sentences.push(generateSentence(wordList, minWords, maxWords));
  }
  return sentences.join(" ");
}

interface Preset {
  label: string;
  paragraphs: number;
}

const PRESETS: Preset[] = [
  { label: "1 paragraph", paragraphs: 1 },
  { label: "3 paragraphs", paragraphs: 3 },
  { label: "5 paragraphs", paragraphs: 5 },
];

export default function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);
  const [minWords, setMinWords] = useState(4);
  const [maxWords, setMaxWords] = useState(12);
  const [variant, setVariant] = useState<"lorem" | "hipster">("lorem");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const wordList = variant === "hipster" ? HIPSTER_WORDS : LOREM_WORDS;
    const result: string[] = [];
    for (let i = 0; i < paragraphs; i++) {
      const para = generateParagraph(wordList, sentencesPerParagraph, minWords, maxWords);
      if (i === 0 && variant === "lorem") {
        result.push(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
            para.split(". ").slice(1).join(". ")
        );
      } else {
        result.push(para);
      }
    }
    setOutput(result.join("\n\n"));
  }, [paragraphs, sentencesPerParagraph, minWords, maxWords, variant]);

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Paragraphs
          </label>
          <input
            type="number"
            className="input-field w-full"
            value={paragraphs}
            onChange={(e) =>
              setParagraphs(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))
            }
            min={1}
            max={20}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Sentences per paragraph
          </label>
          <input
            type="number"
            className="input-field w-full"
            value={sentencesPerParagraph}
            onChange={(e) =>
              setSentencesPerParagraph(
                Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
              )
            }
            min={1}
            max={20}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Min words per sentence
          </label>
          <input
            type="number"
            className="input-field w-full"
            value={minWords}
            onChange={(e) => setMinWords(Math.max(1, Math.min(maxWords, parseInt(e.target.value) || 1)))}
            min={1}
            max={maxWords}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Max words per sentence
          </label>
          <input
            type="number"
            className="input-field w-full"
            value={maxWords}
            onChange={(e) =>
              setMaxWords(Math.max(minWords, Math.min(30, parseInt(e.target.value) || minWords)))
            }
            min={minWords}
            max={30}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden">
          <button
            onClick={() => setVariant("lorem")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              variant === "lorem"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
            }`}
          >
            Classic Lorem
          </button>
          <button
            onClick={() => setVariant("hipster")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              variant === "hipster"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
            }`}
          >
            Hipster Ipsum
          </button>
        </div>

        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setParagraphs(preset.paragraphs)}
              className="btn-secondary text-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={generate} className="btn-primary">
          Generate
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Output
          </label>
          <div className="flex items-center gap-3">
            {output && (
              <>
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  {wordCount} words &middot; {charCount} chars
                </span>
                <CopyButton text={output} />
              </>
            )}
          </div>
        </div>
        <textarea
          className="input-field w-full h-72 text-sm font-mono resize-y"
          value={output}
          readOnly
          placeholder="Click 'Generate' to create placeholder text..."
        />
      </div>
    </div>
  );
}
