"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";

// Shavian Unicode block U+10450 - U+1047F
// Consonants:
// 𐑐 p, 𐑑 t, 𐑒 k, 𐑓 f, 𐑔 th, 𐑕 s, 𐑖 sh, 𐑗 ch
// 𐑘 y, 𐑙 ng, 𐑚 b, 𐑛 d, 𐑜 g, 𐑝 v, 𐑞 th(voiced), 𐑟 z
// 𐑠 zh, 𐑡 j, 𐑢 w, 𐑣 h, 𐑤 l, 𐑥 m, 𐑮 r, 𐑯 n
// Vowels:
// 𐑦 i(short), 𐑧 e(short), 𐑨 a(short), 𐑩 uh, 𐑪 o(short), 𐑳 u(short)
// 𐑰 ee, 𐑱 ay, 𐑲 i(long), 𐑴 oh, 𐑵 oo, 𐑶 oy
// 𐑬 ow, 𐑭 ah, 𐑷 (dear reader), 𐑸 are, 𐑹 or, 𐑺 air, 𐑻 err, 𐑼 array, 𐑽 ear, 𐑾 ian, 𐑿 yew

function transliterateToShavian(text: string): string {
  let result = text;

  const rules: [RegExp, string][] = [
    // Digraph consonants (must come before single letters)
    [/\u{2019}?t?ion/giu, "\u{10456}\u{10469}\u{1046F}"], // tion -> shun
    [/sh/gi, "\u{10456}"],
    [/ch/gi, "\u{10457}"],
    [/th/gi, "\u{10454}"],
    [/ng/gi, "\u{10459}"],
    [/zh/gi, "\u{10460}"],
    [/ph/gi, "\u{10453}"],
    [/wh/gi, "\u{10462}"],
    [/qu/gi, "\u{10452}\u{10462}"],
    [/ck/gi, "\u{10452}"],
    [/gn/gi, "\u{1046F}"],  // silent g

    // Vowel digraphs
    [/oo/gi, "\u{10475}"],   // 𐑵 as in moon
    [/ou/gi, "\u{1046C}"],   // 𐑬 as in out
    [/ow/gi, "\u{1046C}"],   // 𐑬 as in cow
    [/ea/gi, "\u{10470}"],   // 𐑰 as in eat
    [/ee/gi, "\u{10470}"],   // 𐑰 as in see
    [/ie/gi, "\u{10470}"],   // 𐑰 as in field
    [/ei/gi, "\u{10471}"],   // 𐑱 as in vein
    [/ai/gi, "\u{10471}"],   // 𐑱 as in rain
    [/ay/gi, "\u{10471}"],   // 𐑱 as in day
    [/oi/gi, "\u{10476}"],   // 𐑶 as in oil
    [/oy/gi, "\u{10476}"],   // 𐑶 as in boy
    [/au/gi, "\u{1046D}"],   // 𐑭 as in cause
    [/aw/gi, "\u{1046D}"],   // 𐑭 as in saw
    [/igh/gi, "\u{10472}"],  // 𐑲 as in night
    [/ough/gi, "\u{10474}"], // 𐑴 as in though (simplified)

    // Single consonants
    [/p/gi, "\u{10450}"],
    [/t/gi, "\u{10451}"],
    [/k/gi, "\u{10452}"],
    [/f/gi, "\u{10453}"],
    [/s/gi, "\u{10455}"],
    [/j/gi, "\u{10461}"],
    [/y/gi, "\u{10458}"],
    [/b/gi, "\u{1045A}"],
    [/d/gi, "\u{1045B}"],
    [/g/gi, "\u{1045C}"],
    [/v/gi, "\u{1045D}"],
    [/z/gi, "\u{1045F}"],
    [/w/gi, "\u{10462}"],
    [/h/gi, "\u{10463}"],
    [/l/gi, "\u{10464}"],
    [/m/gi, "\u{10465}"],
    [/r/gi, "\u{1046E}"],
    [/n/gi, "\u{1046F}"],
    [/x/gi, "\u{10452}\u{10455}"], // ks

    // Single vowels (after digraphs)
    [/i/gi, "\u{10466}"],   // 𐑦 short i
    [/e/gi, "\u{10467}"],   // 𐑧 short e
    [/a/gi, "\u{10468}"],   // 𐑨 short a
    [/u/gi, "\u{10473}"],   // 𐑳 short u
    [/o/gi, "\u{1046A}"],   // 𐑪 short o
  ];

  for (const [pattern, replacement] of rules) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

const mappingReference: { shavian: string; latin: string; example: string }[] = [
  { shavian: "\u{10450}", latin: "p", example: "peep" },
  { shavian: "\u{10451}", latin: "t", example: "tot" },
  { shavian: "\u{10452}", latin: "k", example: "kick" },
  { shavian: "\u{10453}", latin: "f", example: "fee" },
  { shavian: "\u{10454}", latin: "th", example: "thigh" },
  { shavian: "\u{10455}", latin: "s", example: "so" },
  { shavian: "\u{10456}", latin: "sh", example: "sure" },
  { shavian: "\u{10457}", latin: "ch", example: "church" },
  { shavian: "\u{10458}", latin: "y", example: "yea" },
  { shavian: "\u{10459}", latin: "ng", example: "hung" },
  { shavian: "\u{1045A}", latin: "b", example: "bib" },
  { shavian: "\u{1045B}", latin: "d", example: "dead" },
  { shavian: "\u{1045C}", latin: "g", example: "gag" },
  { shavian: "\u{1045D}", latin: "v", example: "vow" },
  { shavian: "\u{1045E}", latin: "th (voiced)", example: "they" },
  { shavian: "\u{1045F}", latin: "z", example: "zoo" },
  { shavian: "\u{10460}", latin: "zh", example: "measure" },
  { shavian: "\u{10461}", latin: "j", example: "judge" },
  { shavian: "\u{10462}", latin: "w", example: "woe" },
  { shavian: "\u{10463}", latin: "h", example: "ha-ha" },
  { shavian: "\u{10464}", latin: "l", example: "loll" },
  { shavian: "\u{10465}", latin: "m", example: "mime" },
  { shavian: "\u{1046E}", latin: "r", example: "roar" },
  { shavian: "\u{1046F}", latin: "n", example: "noon" },
  { shavian: "\u{10466}", latin: "i (short)", example: "if" },
  { shavian: "\u{10467}", latin: "e (short)", example: "egg" },
  { shavian: "\u{10468}", latin: "a (short)", example: "ash" },
  { shavian: "\u{10469}", latin: "uh", example: "adze" },
  { shavian: "\u{1046A}", latin: "o (short)", example: "on" },
  { shavian: "\u{10473}", latin: "u (short)", example: "up" },
  { shavian: "\u{10470}", latin: "ee", example: "eat" },
  { shavian: "\u{10471}", latin: "ay", example: "age" },
  { shavian: "\u{10472}", latin: "i (long)", example: "ice" },
  { shavian: "\u{10474}", latin: "oh", example: "oak" },
  { shavian: "\u{10475}", latin: "oo", example: "ooze" },
  { shavian: "\u{10476}", latin: "oy", example: "oil" },
  { shavian: "\u{1046C}", latin: "ow", example: "out" },
  { shavian: "\u{1046D}", latin: "ah", example: "ooh" },
];

export default function ShavianTransliterator() {
  const [input, setInput] = useState("The quick brown fox jumps over the lazy dog");

  const output = useMemo(() => transliterateToShavian(input), [input]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Latin Input
          </label>
          <textarea
            className="input-field min-h-[200px]"
            placeholder="Enter English text..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Shavian Output
            </label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            className="input-field min-h-[200px] text-lg"
            readOnly
            value={output}
            placeholder="Shavian script will appear here..."
          />
        </div>
      </div>

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Shavian Alphabet Reference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {mappingReference.map((item) => (
            <div
              key={item.latin}
              className="flex items-center gap-2 p-2 rounded bg-surface-50 dark:bg-surface-800"
            >
              <span className="text-2xl">{item.shavian}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                  {item.latin}
                </p>
                <p className="text-xs text-surface-500 truncate">{item.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
