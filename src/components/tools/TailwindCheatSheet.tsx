"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

interface TwEntry {
  class: string;
  css: string;
  preview?: string;
}

interface TwCategory {
  name: string;
  entries: TwEntry[];
}

const tailwindData: TwCategory[] = [
  {
    name: "Layout",
    entries: [
      { class: "container", css: "width: 100%; max-width: ..." },
      { class: "columns-1", css: "columns: 1" },
      { class: "columns-2", css: "columns: 2" },
      { class: "columns-3", css: "columns: 3" },
      { class: "columns-4", css: "columns: 4" },
      { class: "break-before-auto", css: "break-before: auto" },
      { class: "break-before-page", css: "break-before: page" },
      { class: "break-inside-auto", css: "break-inside: auto" },
      { class: "break-inside-avoid", css: "break-inside: avoid" },
      { class: "box-border", css: "box-sizing: border-box" },
      { class: "box-content", css: "box-sizing: content-box" },
      { class: "float-left", css: "float: left" },
      { class: "float-right", css: "float: right" },
      { class: "clear-both", css: "clear: both" },
      { class: "isolate", css: "isolation: isolate" },
      { class: "object-cover", css: "object-fit: cover" },
      { class: "object-contain", css: "object-fit: contain" },
      { class: "overflow-auto", css: "overflow: auto" },
      { class: "overflow-hidden", css: "overflow: hidden" },
      { class: "overflow-scroll", css: "overflow: scroll" },
      { class: "overflow-visible", css: "overflow: visible" },
      { class: "static", css: "position: static" },
      { class: "fixed", css: "position: fixed" },
      { class: "absolute", css: "position: absolute" },
      { class: "relative", css: "position: relative" },
      { class: "sticky", css: "position: sticky" },
      { class: "inset-0", css: "top: 0; right: 0; bottom: 0; left: 0" },
      { class: "visible", css: "visibility: visible" },
      { class: "invisible", css: "visibility: invisible" },
      { class: "z-0", css: "z-index: 0" },
      { class: "z-10", css: "z-index: 10" },
      { class: "z-20", css: "z-index: 20" },
      { class: "z-30", css: "z-index: 30" },
      { class: "z-40", css: "z-index: 40" },
      { class: "z-50", css: "z-index: 50" },
    ],
  },
  {
    name: "Flexbox",
    entries: [
      { class: "flex", css: "display: flex" },
      { class: "inline-flex", css: "display: inline-flex" },
      { class: "flex-row", css: "flex-direction: row" },
      { class: "flex-row-reverse", css: "flex-direction: row-reverse" },
      { class: "flex-col", css: "flex-direction: column" },
      { class: "flex-col-reverse", css: "flex-direction: column-reverse" },
      { class: "flex-wrap", css: "flex-wrap: wrap" },
      { class: "flex-nowrap", css: "flex-wrap: nowrap" },
      { class: "flex-1", css: "flex: 1 1 0%" },
      { class: "flex-auto", css: "flex: 1 1 auto" },
      { class: "flex-initial", css: "flex: 0 1 auto" },
      { class: "flex-none", css: "flex: none" },
      { class: "grow", css: "flex-grow: 1" },
      { class: "grow-0", css: "flex-grow: 0" },
      { class: "shrink", css: "flex-shrink: 1" },
      { class: "shrink-0", css: "flex-shrink: 0" },
      { class: "order-first", css: "order: -9999" },
      { class: "order-last", css: "order: 9999" },
      { class: "order-none", css: "order: 0" },
    ],
  },
  {
    name: "Alignment",
    entries: [
      { class: "items-start", css: "align-items: flex-start" },
      { class: "items-end", css: "align-items: flex-end" },
      { class: "items-center", css: "align-items: center" },
      { class: "items-baseline", css: "align-items: baseline" },
      { class: "items-stretch", css: "align-items: stretch" },
      { class: "justify-start", css: "justify-content: flex-start" },
      { class: "justify-end", css: "justify-content: flex-end" },
      { class: "justify-center", css: "justify-content: center" },
      { class: "justify-between", css: "justify-content: space-between" },
      { class: "justify-around", css: "justify-content: space-around" },
      { class: "justify-evenly", css: "justify-content: space-evenly" },
      { class: "self-auto", css: "align-self: auto" },
      { class: "self-start", css: "align-self: flex-start" },
      { class: "self-end", css: "align-self: flex-end" },
      { class: "self-center", css: "align-self: center" },
      { class: "self-stretch", css: "align-self: stretch" },
    ],
  },
  {
    name: "Grid",
    entries: [
      { class: "grid", css: "display: grid" },
      { class: "inline-grid", css: "display: inline-grid" },
      { class: "grid-cols-1", css: "grid-template-columns: repeat(1, minmax(0, 1fr))" },
      { class: "grid-cols-2", css: "grid-template-columns: repeat(2, minmax(0, 1fr))" },
      { class: "grid-cols-3", css: "grid-template-columns: repeat(3, minmax(0, 1fr))" },
      { class: "grid-cols-4", css: "grid-template-columns: repeat(4, minmax(0, 1fr))" },
      { class: "grid-cols-5", css: "grid-template-columns: repeat(5, minmax(0, 1fr))" },
      { class: "grid-cols-6", css: "grid-template-columns: repeat(6, minmax(0, 1fr))" },
      { class: "grid-cols-12", css: "grid-template-columns: repeat(12, minmax(0, 1fr))" },
      { class: "grid-cols-none", css: "grid-template-columns: none" },
      { class: "grid-rows-1", css: "grid-template-rows: repeat(1, minmax(0, 1fr))" },
      { class: "grid-rows-2", css: "grid-template-rows: repeat(2, minmax(0, 1fr))" },
      { class: "grid-rows-3", css: "grid-template-rows: repeat(3, minmax(0, 1fr))" },
      { class: "col-span-1", css: "grid-column: span 1 / span 1" },
      { class: "col-span-2", css: "grid-column: span 2 / span 2" },
      { class: "col-span-3", css: "grid-column: span 3 / span 3" },
      { class: "col-span-full", css: "grid-column: 1 / -1" },
      { class: "gap-0", css: "gap: 0px" },
      { class: "gap-1", css: "gap: 0.25rem" },
      { class: "gap-2", css: "gap: 0.5rem" },
      { class: "gap-3", css: "gap: 0.75rem" },
      { class: "gap-4", css: "gap: 1rem" },
      { class: "gap-6", css: "gap: 1.5rem" },
      { class: "gap-8", css: "gap: 2rem" },
      { class: "auto-cols-auto", css: "grid-auto-columns: auto" },
      { class: "auto-cols-fr", css: "grid-auto-columns: minmax(0, 1fr)" },
      { class: "auto-rows-auto", css: "grid-auto-rows: auto" },
      { class: "auto-rows-fr", css: "grid-auto-rows: minmax(0, 1fr)" },
    ],
  },
  {
    name: "Spacing",
    entries: [
      { class: "p-0", css: "padding: 0px" },
      { class: "p-1", css: "padding: 0.25rem" },
      { class: "p-2", css: "padding: 0.5rem" },
      { class: "p-3", css: "padding: 0.75rem" },
      { class: "p-4", css: "padding: 1rem" },
      { class: "p-5", css: "padding: 1.25rem" },
      { class: "p-6", css: "padding: 1.5rem" },
      { class: "p-8", css: "padding: 2rem" },
      { class: "p-10", css: "padding: 2.5rem" },
      { class: "p-12", css: "padding: 3rem" },
      { class: "px-4", css: "padding-left: 1rem; padding-right: 1rem" },
      { class: "py-4", css: "padding-top: 1rem; padding-bottom: 1rem" },
      { class: "pt-4", css: "padding-top: 1rem" },
      { class: "pr-4", css: "padding-right: 1rem" },
      { class: "pb-4", css: "padding-bottom: 1rem" },
      { class: "pl-4", css: "padding-left: 1rem" },
      { class: "m-0", css: "margin: 0px" },
      { class: "m-1", css: "margin: 0.25rem" },
      { class: "m-2", css: "margin: 0.5rem" },
      { class: "m-3", css: "margin: 0.75rem" },
      { class: "m-4", css: "margin: 1rem" },
      { class: "m-auto", css: "margin: auto" },
      { class: "mx-auto", css: "margin-left: auto; margin-right: auto" },
      { class: "mx-4", css: "margin-left: 1rem; margin-right: 1rem" },
      { class: "my-4", css: "margin-top: 1rem; margin-bottom: 1rem" },
      { class: "mt-4", css: "margin-top: 1rem" },
      { class: "mr-4", css: "margin-right: 1rem" },
      { class: "mb-4", css: "margin-bottom: 1rem" },
      { class: "ml-4", css: "margin-left: 1rem" },
      { class: "space-x-4", css: "> * + * { margin-left: 1rem }" },
      { class: "space-y-4", css: "> * + * { margin-top: 1rem }" },
    ],
  },
  {
    name: "Sizing",
    entries: [
      { class: "w-0", css: "width: 0px" },
      { class: "w-1", css: "width: 0.25rem" },
      { class: "w-2", css: "width: 0.5rem" },
      { class: "w-4", css: "width: 1rem" },
      { class: "w-8", css: "width: 2rem" },
      { class: "w-12", css: "width: 3rem" },
      { class: "w-16", css: "width: 4rem" },
      { class: "w-24", css: "width: 6rem" },
      { class: "w-32", css: "width: 8rem" },
      { class: "w-48", css: "width: 12rem" },
      { class: "w-64", css: "width: 16rem" },
      { class: "w-auto", css: "width: auto" },
      { class: "w-1/2", css: "width: 50%" },
      { class: "w-1/3", css: "width: 33.333333%" },
      { class: "w-2/3", css: "width: 66.666667%" },
      { class: "w-1/4", css: "width: 25%" },
      { class: "w-3/4", css: "width: 75%" },
      { class: "w-full", css: "width: 100%" },
      { class: "w-screen", css: "width: 100vw" },
      { class: "w-min", css: "width: min-content" },
      { class: "w-max", css: "width: max-content" },
      { class: "w-fit", css: "width: fit-content" },
      { class: "min-w-0", css: "min-width: 0px" },
      { class: "min-w-full", css: "min-width: 100%" },
      { class: "min-w-min", css: "min-width: min-content" },
      { class: "min-w-max", css: "min-width: max-content" },
      { class: "max-w-xs", css: "max-width: 20rem" },
      { class: "max-w-sm", css: "max-width: 24rem" },
      { class: "max-w-md", css: "max-width: 28rem" },
      { class: "max-w-lg", css: "max-width: 32rem" },
      { class: "max-w-xl", css: "max-width: 36rem" },
      { class: "max-w-2xl", css: "max-width: 42rem" },
      { class: "max-w-full", css: "max-width: 100%" },
      { class: "max-w-prose", css: "max-width: 65ch" },
      { class: "max-w-screen-sm", css: "max-width: 640px" },
      { class: "max-w-screen-md", css: "max-width: 768px" },
      { class: "max-w-screen-lg", css: "max-width: 1024px" },
      { class: "max-w-screen-xl", css: "max-width: 1280px" },
      { class: "h-0", css: "height: 0px" },
      { class: "h-4", css: "height: 1rem" },
      { class: "h-8", css: "height: 2rem" },
      { class: "h-12", css: "height: 3rem" },
      { class: "h-16", css: "height: 4rem" },
      { class: "h-24", css: "height: 6rem" },
      { class: "h-32", css: "height: 8rem" },
      { class: "h-48", css: "height: 12rem" },
      { class: "h-64", css: "height: 16rem" },
      { class: "h-auto", css: "height: auto" },
      { class: "h-full", css: "height: 100%" },
      { class: "h-screen", css: "height: 100vh" },
    ],
  },
  {
    name: "Typography",
    entries: [
      { class: "font-sans", css: "font-family: ui-sans-serif, system-ui, ..." },
      { class: "font-serif", css: "font-family: ui-serif, Georgia, ..." },
      { class: "font-mono", css: "font-family: ui-monospace, SFMono-Regular, ..." },
      { class: "text-xs", css: "font-size: 0.75rem; line-height: 1rem" },
      { class: "text-sm", css: "font-size: 0.875rem; line-height: 1.25rem" },
      { class: "text-base", css: "font-size: 1rem; line-height: 1.5rem" },
      { class: "text-lg", css: "font-size: 1.125rem; line-height: 1.75rem" },
      { class: "text-xl", css: "font-size: 1.25rem; line-height: 1.75rem" },
      { class: "text-2xl", css: "font-size: 1.5rem; line-height: 2rem" },
      { class: "text-3xl", css: "font-size: 1.875rem; line-height: 2.25rem" },
      { class: "text-4xl", css: "font-size: 2.25rem; line-height: 2.5rem" },
      { class: "text-5xl", css: "font-size: 3rem; line-height: 1" },
      { class: "text-6xl", css: "font-size: 3.75rem; line-height: 1" },
      { class: "text-7xl", css: "font-size: 4.5rem; line-height: 1" },
      { class: "text-8xl", css: "font-size: 6rem; line-height: 1" },
      { class: "text-9xl", css: "font-size: 8rem; line-height: 1" },
      { class: "font-thin", css: "font-weight: 100" },
      { class: "font-extralight", css: "font-weight: 200" },
      { class: "font-light", css: "font-weight: 300" },
      { class: "font-normal", css: "font-weight: 400" },
      { class: "font-medium", css: "font-weight: 500" },
      { class: "font-semibold", css: "font-weight: 600" },
      { class: "font-bold", css: "font-weight: 700" },
      { class: "font-extrabold", css: "font-weight: 800" },
      { class: "font-black", css: "font-weight: 900" },
      { class: "leading-none", css: "line-height: 1" },
      { class: "leading-tight", css: "line-height: 1.25" },
      { class: "leading-snug", css: "line-height: 1.375" },
      { class: "leading-normal", css: "line-height: 1.5" },
      { class: "leading-relaxed", css: "line-height: 1.625" },
      { class: "leading-loose", css: "line-height: 2" },
      { class: "tracking-tighter", css: "letter-spacing: -0.05em" },
      { class: "tracking-tight", css: "letter-spacing: -0.025em" },
      { class: "tracking-normal", css: "letter-spacing: 0em" },
      { class: "tracking-wide", css: "letter-spacing: 0.025em" },
      { class: "tracking-wider", css: "letter-spacing: 0.05em" },
      { class: "tracking-widest", css: "letter-spacing: 0.1em" },
      { class: "text-left", css: "text-align: left" },
      { class: "text-center", css: "text-align: center" },
      { class: "text-right", css: "text-align: right" },
      { class: "text-justify", css: "text-align: justify" },
      { class: "uppercase", css: "text-transform: uppercase" },
      { class: "lowercase", css: "text-transform: lowercase" },
      { class: "capitalize", css: "text-transform: capitalize" },
      { class: "normal-case", css: "text-transform: none" },
      { class: "truncate", css: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap" },
      { class: "break-words", css: "overflow-wrap: break-word" },
      { class: "break-all", css: "word-break: break-all" },
      { class: "whitespace-normal", css: "white-space: normal" },
      { class: "whitespace-nowrap", css: "white-space: nowrap" },
      { class: "whitespace-pre", css: "white-space: pre" },
      { class: "whitespace-pre-wrap", css: "white-space: pre-wrap" },
    ],
  },
  {
    name: "Backgrounds",
    entries: [
      { class: "bg-auto", css: "background-size: auto" },
      { class: "bg-cover", css: "background-size: cover" },
      { class: "bg-contain", css: "background-size: contain" },
      { class: "bg-bottom", css: "background-position: bottom" },
      { class: "bg-center", css: "background-position: center" },
      { class: "bg-left", css: "background-position: left" },
      { class: "bg-right", css: "background-position: right" },
      { class: "bg-top", css: "background-position: top" },
      { class: "bg-no-repeat", css: "background-repeat: no-repeat" },
      { class: "bg-repeat", css: "background-repeat: repeat" },
      { class: "bg-repeat-x", css: "background-repeat: repeat-x" },
      { class: "bg-repeat-y", css: "background-repeat: repeat-y" },
      { class: "bg-fixed", css: "background-attachment: fixed" },
      { class: "bg-local", css: "background-attachment: local" },
      { class: "bg-scroll", css: "background-attachment: scroll" },
      { class: "bg-gradient-to-r", css: "background-image: linear-gradient(to right, ...)" },
      { class: "bg-gradient-to-l", css: "background-image: linear-gradient(to left, ...)" },
      { class: "bg-gradient-to-t", css: "background-image: linear-gradient(to top, ...)" },
      { class: "bg-gradient-to-b", css: "background-image: linear-gradient(to bottom, ...)" },
      { class: "bg-gradient-to-br", css: "background-image: linear-gradient(to bottom right, ...)" },
      { class: "bg-gradient-to-bl", css: "background-image: linear-gradient(to bottom left, ...)" },
      { class: "from-blue-500", css: "--tw-gradient-from: #3b82f6" },
      { class: "via-purple-500", css: "--tw-gradient-stops: ..., #8b5cf6, ..." },
      { class: "to-pink-500", css: "--tw-gradient-to: #ec4899" },
    ],
  },
  {
    name: "Colors (Common)",
    entries: [
      { class: "text-black", css: "color: #000000" },
      { class: "text-white", css: "color: #ffffff" },
      { class: "text-gray-500", css: "color: #6b7280" },
      { class: "text-gray-700", css: "color: #374151" },
      { class: "text-gray-900", css: "color: #111827" },
      { class: "text-red-500", css: "color: #ef4444" },
      { class: "text-blue-500", css: "color: #3b82f6" },
      { class: "text-green-500", css: "color: #22c55e" },
      { class: "text-yellow-500", css: "color: #eab308" },
      { class: "text-purple-500", css: "color: #a855f7" },
      { class: "text-pink-500", css: "color: #ec4899" },
      { class: "text-indigo-500", css: "color: #6366f1" },
      { class: "bg-white", css: "background-color: #ffffff" },
      { class: "bg-black", css: "background-color: #000000" },
      { class: "bg-gray-100", css: "background-color: #f3f4f6" },
      { class: "bg-gray-200", css: "background-color: #e5e7eb" },
      { class: "bg-gray-800", css: "background-color: #1f2937" },
      { class: "bg-gray-900", css: "background-color: #111827" },
      { class: "bg-red-500", css: "background-color: #ef4444" },
      { class: "bg-blue-500", css: "background-color: #3b82f6" },
      { class: "bg-green-500", css: "background-color: #22c55e" },
      { class: "bg-yellow-500", css: "background-color: #eab308" },
      { class: "bg-purple-500", css: "background-color: #a855f7" },
      { class: "bg-transparent", css: "background-color: transparent" },
    ],
  },
  {
    name: "Borders",
    entries: [
      { class: "border", css: "border-width: 1px" },
      { class: "border-0", css: "border-width: 0px" },
      { class: "border-2", css: "border-width: 2px" },
      { class: "border-4", css: "border-width: 4px" },
      { class: "border-t", css: "border-top-width: 1px" },
      { class: "border-r", css: "border-right-width: 1px" },
      { class: "border-b", css: "border-bottom-width: 1px" },
      { class: "border-l", css: "border-left-width: 1px" },
      { class: "border-solid", css: "border-style: solid" },
      { class: "border-dashed", css: "border-style: dashed" },
      { class: "border-dotted", css: "border-style: dotted" },
      { class: "border-double", css: "border-style: double" },
      { class: "border-none", css: "border-style: none" },
      { class: "rounded-none", css: "border-radius: 0px" },
      { class: "rounded-sm", css: "border-radius: 0.125rem" },
      { class: "rounded", css: "border-radius: 0.25rem" },
      { class: "rounded-md", css: "border-radius: 0.375rem" },
      { class: "rounded-lg", css: "border-radius: 0.5rem" },
      { class: "rounded-xl", css: "border-radius: 0.75rem" },
      { class: "rounded-2xl", css: "border-radius: 1rem" },
      { class: "rounded-3xl", css: "border-radius: 1.5rem" },
      { class: "rounded-full", css: "border-radius: 9999px" },
      { class: "rounded-t-lg", css: "border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem" },
      { class: "rounded-r-lg", css: "border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem" },
      { class: "rounded-b-lg", css: "border-bottom-right-radius: 0.5rem; border-bottom-left-radius: 0.5rem" },
      { class: "rounded-l-lg", css: "border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem" },
      { class: "divide-x", css: "> * + * { border-left-width: 1px }" },
      { class: "divide-y", css: "> * + * { border-top-width: 1px }" },
      { class: "ring-1", css: "box-shadow: 0 0 0 1px ..." },
      { class: "ring-2", css: "box-shadow: 0 0 0 2px ..." },
      { class: "ring-4", css: "box-shadow: 0 0 0 4px ..." },
    ],
  },
  {
    name: "Effects",
    entries: [
      { class: "shadow-sm", css: "box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)" },
      { class: "shadow", css: "box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)" },
      { class: "shadow-md", css: "box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)" },
      { class: "shadow-lg", css: "box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)" },
      { class: "shadow-xl", css: "box-shadow: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)" },
      { class: "shadow-2xl", css: "box-shadow: 0 25px 50px rgba(0,0,0,0.25)" },
      { class: "shadow-inner", css: "box-shadow: inset 0 2px 4px rgba(0,0,0,0.06)" },
      { class: "shadow-none", css: "box-shadow: 0 0 #0000" },
      { class: "opacity-0", css: "opacity: 0" },
      { class: "opacity-5", css: "opacity: 0.05" },
      { class: "opacity-10", css: "opacity: 0.1" },
      { class: "opacity-20", css: "opacity: 0.2" },
      { class: "opacity-25", css: "opacity: 0.25" },
      { class: "opacity-30", css: "opacity: 0.3" },
      { class: "opacity-40", css: "opacity: 0.4" },
      { class: "opacity-50", css: "opacity: 0.5" },
      { class: "opacity-60", css: "opacity: 0.6" },
      { class: "opacity-70", css: "opacity: 0.7" },
      { class: "opacity-75", css: "opacity: 0.75" },
      { class: "opacity-80", css: "opacity: 0.8" },
      { class: "opacity-90", css: "opacity: 0.9" },
      { class: "opacity-95", css: "opacity: 0.95" },
      { class: "opacity-100", css: "opacity: 1" },
      { class: "mix-blend-normal", css: "mix-blend-mode: normal" },
      { class: "mix-blend-multiply", css: "mix-blend-mode: multiply" },
      { class: "mix-blend-screen", css: "mix-blend-mode: screen" },
      { class: "mix-blend-overlay", css: "mix-blend-mode: overlay" },
    ],
  },
  {
    name: "Transitions",
    entries: [
      { class: "transition", css: "transition-property: color, background-color, border-color, ..." },
      { class: "transition-none", css: "transition-property: none" },
      { class: "transition-all", css: "transition-property: all" },
      { class: "transition-colors", css: "transition-property: color, background-color, border-color, ..." },
      { class: "transition-opacity", css: "transition-property: opacity" },
      { class: "transition-shadow", css: "transition-property: box-shadow" },
      { class: "transition-transform", css: "transition-property: transform" },
      { class: "duration-75", css: "transition-duration: 75ms" },
      { class: "duration-100", css: "transition-duration: 100ms" },
      { class: "duration-150", css: "transition-duration: 150ms" },
      { class: "duration-200", css: "transition-duration: 200ms" },
      { class: "duration-300", css: "transition-duration: 300ms" },
      { class: "duration-500", css: "transition-duration: 500ms" },
      { class: "duration-700", css: "transition-duration: 700ms" },
      { class: "duration-1000", css: "transition-duration: 1000ms" },
      { class: "ease-linear", css: "transition-timing-function: linear" },
      { class: "ease-in", css: "transition-timing-function: cubic-bezier(0.4, 0, 1, 1)" },
      { class: "ease-out", css: "transition-timing-function: cubic-bezier(0, 0, 0.2, 1)" },
      { class: "ease-in-out", css: "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)" },
      { class: "delay-75", css: "transition-delay: 75ms" },
      { class: "delay-100", css: "transition-delay: 100ms" },
      { class: "delay-150", css: "transition-delay: 150ms" },
      { class: "delay-300", css: "transition-delay: 300ms" },
    ],
  },
  {
    name: "Transforms",
    entries: [
      { class: "scale-0", css: "transform: scale(0)" },
      { class: "scale-50", css: "transform: scale(0.5)" },
      { class: "scale-75", css: "transform: scale(0.75)" },
      { class: "scale-90", css: "transform: scale(0.9)" },
      { class: "scale-95", css: "transform: scale(0.95)" },
      { class: "scale-100", css: "transform: scale(1)" },
      { class: "scale-105", css: "transform: scale(1.05)" },
      { class: "scale-110", css: "transform: scale(1.1)" },
      { class: "scale-125", css: "transform: scale(1.25)" },
      { class: "scale-150", css: "transform: scale(1.5)" },
      { class: "scale-x-100", css: "transform: scaleX(1)" },
      { class: "scale-y-100", css: "transform: scaleY(1)" },
      { class: "rotate-0", css: "transform: rotate(0deg)" },
      { class: "rotate-1", css: "transform: rotate(1deg)" },
      { class: "rotate-2", css: "transform: rotate(2deg)" },
      { class: "rotate-3", css: "transform: rotate(3deg)" },
      { class: "rotate-6", css: "transform: rotate(6deg)" },
      { class: "rotate-12", css: "transform: rotate(12deg)" },
      { class: "rotate-45", css: "transform: rotate(45deg)" },
      { class: "rotate-90", css: "transform: rotate(90deg)" },
      { class: "rotate-180", css: "transform: rotate(180deg)" },
      { class: "translate-x-0", css: "transform: translateX(0)" },
      { class: "translate-x-1", css: "transform: translateX(0.25rem)" },
      { class: "translate-x-2", css: "transform: translateX(0.5rem)" },
      { class: "translate-x-4", css: "transform: translateX(1rem)" },
      { class: "translate-x-full", css: "transform: translateX(100%)" },
      { class: "translate-y-0", css: "transform: translateY(0)" },
      { class: "translate-y-1", css: "transform: translateY(0.25rem)" },
      { class: "translate-y-2", css: "transform: translateY(0.5rem)" },
      { class: "translate-y-4", css: "transform: translateY(1rem)" },
      { class: "translate-y-full", css: "transform: translateY(100%)" },
      { class: "skew-x-3", css: "transform: skewX(3deg)" },
      { class: "skew-x-6", css: "transform: skewX(6deg)" },
      { class: "skew-y-3", css: "transform: skewY(3deg)" },
      { class: "skew-y-6", css: "transform: skewY(6deg)" },
      { class: "origin-center", css: "transform-origin: center" },
      { class: "origin-top", css: "transform-origin: top" },
      { class: "origin-top-right", css: "transform-origin: top right" },
      { class: "origin-right", css: "transform-origin: right" },
      { class: "origin-bottom-right", css: "transform-origin: bottom right" },
      { class: "origin-bottom", css: "transform-origin: bottom" },
      { class: "origin-bottom-left", css: "transform-origin: bottom left" },
      { class: "origin-left", css: "transform-origin: left" },
      { class: "origin-top-left", css: "transform-origin: top left" },
    ],
  },
  {
    name: "Interactivity",
    entries: [
      { class: "cursor-auto", css: "cursor: auto" },
      { class: "cursor-default", css: "cursor: default" },
      { class: "cursor-pointer", css: "cursor: pointer" },
      { class: "cursor-wait", css: "cursor: wait" },
      { class: "cursor-text", css: "cursor: text" },
      { class: "cursor-move", css: "cursor: move" },
      { class: "cursor-not-allowed", css: "cursor: not-allowed" },
      { class: "cursor-grab", css: "cursor: grab" },
      { class: "cursor-grabbing", css: "cursor: grabbing" },
      { class: "pointer-events-none", css: "pointer-events: none" },
      { class: "pointer-events-auto", css: "pointer-events: auto" },
      { class: "resize", css: "resize: both" },
      { class: "resize-x", css: "resize: horizontal" },
      { class: "resize-y", css: "resize: vertical" },
      { class: "resize-none", css: "resize: none" },
      { class: "select-none", css: "user-select: none" },
      { class: "select-text", css: "user-select: text" },
      { class: "select-all", css: "user-select: all" },
      { class: "select-auto", css: "user-select: auto" },
      { class: "scroll-auto", css: "scroll-behavior: auto" },
      { class: "scroll-smooth", css: "scroll-behavior: smooth" },
      { class: "snap-start", css: "scroll-snap-align: start" },
      { class: "snap-center", css: "scroll-snap-align: center" },
      { class: "snap-end", css: "scroll-snap-align: end" },
      { class: "snap-mandatory", css: "scroll-snap-type: ... mandatory" },
      { class: "snap-x", css: "scroll-snap-type: x" },
      { class: "snap-y", css: "scroll-snap-type: y" },
      { class: "touch-auto", css: "touch-action: auto" },
      { class: "touch-none", css: "touch-action: none" },
      { class: "touch-manipulation", css: "touch-action: manipulation" },
    ],
  },
  {
    name: "Hover / Focus States",
    entries: [
      { class: "hover:", css: "Apply on hover (pseudo-class prefix)" },
      { class: "focus:", css: "Apply on focus (pseudo-class prefix)" },
      { class: "focus-within:", css: "Apply on focus-within (pseudo-class prefix)" },
      { class: "focus-visible:", css: "Apply on focus-visible (pseudo-class prefix)" },
      { class: "active:", css: "Apply on active (pseudo-class prefix)" },
      { class: "visited:", css: "Apply on visited (pseudo-class prefix)" },
      { class: "first:", css: "Apply on first-child (pseudo-class prefix)" },
      { class: "last:", css: "Apply on last-child (pseudo-class prefix)" },
      { class: "odd:", css: "Apply on odd children (pseudo-class prefix)" },
      { class: "even:", css: "Apply on even children (pseudo-class prefix)" },
      { class: "group-hover:", css: "Apply when parent has group class hovered" },
      { class: "peer-checked:", css: "Apply when sibling peer is checked" },
      { class: "dark:", css: "Apply in dark mode (prefers-color-scheme or class)" },
      { class: "md:", css: "Apply at medium breakpoint (768px+)" },
      { class: "lg:", css: "Apply at large breakpoint (1024px+)" },
      { class: "xl:", css: "Apply at extra-large breakpoint (1280px+)" },
      { class: "2xl:", css: "Apply at 2xl breakpoint (1536px+)" },
      { class: "sm:", css: "Apply at small breakpoint (640px+)" },
    ],
  },
];

export default function TailwindCheatSheet() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleCategory = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(tailwindData.map((c) => c.name)));
  const collapseAll = () => setExpanded(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return tailwindData;
    const q = search.toLowerCase();
    return tailwindData
      .map((cat) => ({
        ...cat,
        entries: cat.entries.filter(
          (e) =>
            e.class.toLowerCase().includes(q) ||
            e.css.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.entries.length > 0);
  }, [search]);

  const totalResults = filtered.reduce((sum, c) => sum + c.entries.length, 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            className="input-field pl-10 w-full"
            placeholder="Search classes or CSS properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={expandAll} className="btn-secondary text-sm">Expand All</button>
        <button onClick={collapseAll} className="btn-secondary text-sm">Collapse All</button>
      </div>

      {search && (
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {totalResults} result{totalResults !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {filtered.map((cat) => {
          const isExpanded = expanded.has(cat.name) || search.trim() !== "";

          return (
            <div
              key={cat.name}
              className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(cat.name)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-surface-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-surface-400" />
                  )}
                  <span className="font-semibold text-surface-900 dark:text-surface-100">
                    {cat.name}
                  </span>
                  <span className="text-xs text-surface-400 dark:text-surface-500">
                    {cat.entries.length} classes
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-surface-200 dark:border-surface-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-50 dark:bg-surface-800/50">
                        <th className="text-left px-6 py-2 font-medium text-surface-500 dark:text-surface-400 w-1/3">
                          Class
                        </th>
                        <th className="text-left px-6 py-2 font-medium text-surface-500 dark:text-surface-400">
                          CSS Output
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.entries.map((entry, i) => (
                        <tr
                          key={i}
                          className="border-t border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                        >
                          <td className="px-6 py-2">
                            <code className="text-sm font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">
                              {entry.class}
                            </code>
                          </td>
                          <td className="px-6 py-2">
                            <code className="text-xs font-mono text-surface-600 dark:text-surface-400">
                              {entry.css}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && search && (
        <div className="text-center py-12">
          <p className="text-surface-400 dark:text-surface-500">
            No classes found matching &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
