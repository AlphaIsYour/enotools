export type ToolCategory =
  | "encoding"
  | "text"
  | "developer"
  | "design"
  | "math"
  | "generator"
  | "css"
  | "image";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  featured?: boolean;
  new?: boolean;
}

export const categories: { id: ToolCategory; name: string; description: string; icon: string }[] = [
  { id: "encoding", name: "Encoding & Decoding", description: "Encode, decode, and transform data formats", icon: "Binary" },
  { id: "text", name: "Text Tools", description: "Transform, analyze, and manipulate text", icon: "Type" },
  { id: "developer", name: "Developer Tools", description: "Utilities for everyday development work", icon: "Code" },
  { id: "design", name: "Design Tools", description: "Generate and preview visual properties", icon: "Palette" },
  { id: "math", name: "Math & Conversion", description: "Calculations, conversions, and number tools", icon: "Calculator" },
  { id: "generator", name: "Generators", description: "Generate content, IDs, and sample data", icon: "Sparkles" },
  { id: "css", name: "CSS Tools", description: "Build and preview CSS properties visually", icon: "Paintbrush" },
  { id: "image", name: "Image Tools", description: "Extract colors and process images", icon: "Image" },
];

export const tools: Tool[] = [
  // Encoding & Decoding
  { slug: "qr-code-generator", name: "QR Code Generator", description: "Generate QR codes with PNG and SVG export, logo overlay support", category: "encoding", icon: "QrCode", featured: true },
  { slug: "url-encoder-decoder", name: "URL Encoder/Decoder", description: "Encode and decode URLs and URI components instantly", category: "encoding", icon: "Link" },
  { slug: "base64", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 text with UTF-8 support", category: "encoding", icon: "FileCode" },
  { slug: "html-entities", name: "HTML Entity Encoder/Decoder", description: "Convert special characters to and from HTML entities", category: "encoding", icon: "Code" },
  { slug: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JSON Web Tokens, view headers and payload", category: "encoding", icon: "KeyRound", featured: true },

  // Text Tools
  { slug: "text-diff", name: "Text Diff Checker", description: "Compare two texts and highlight differences line by line", category: "text", icon: "GitCompare" },
  { slug: "markdown-editor", name: "Markdown Editor", description: "Live markdown editor with preview and export", category: "text", icon: "FileText", featured: true },
  { slug: "word-counter", name: "Word & Character Counter", description: "Count words, characters, sentences, and paragraphs", category: "text", icon: "Hash" },
  { slug: "case-converter", name: "Case Converter", description: "Convert text between camelCase, snake_case, PascalCase, and more", category: "text", icon: "CaseSensitive" },
  { slug: "slug-generator", name: "Slug Generator", description: "Convert text to URL-friendly slugs", category: "text", icon: "Minus" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate placeholder text in paragraphs, sentences, or words", category: "text", icon: "AlignLeft" },

  // Developer Tools
  { slug: "json-formatter", name: "JSON Formatter", description: "Format, validate, minify, and tree-view JSON data", category: "developer", icon: "Braces", featured: true },
  { slug: "regex-tester", name: "Regex Tester", description: "Test regular expressions with live matching and explanation", category: "developer", icon: "Regex", featured: true },
  { slug: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes", category: "developer", icon: "Fingerprint" },
  { slug: "timestamp-converter", name: "Unix Timestamp Converter", description: "Convert between Unix timestamps and human-readable dates", category: "developer", icon: "Clock" },
  { slug: "color-palette-extractor", name: "Color Palette Extractor", description: "Extract dominant colors from uploaded images", category: "developer", icon: "Pipette", new: true },

  // Design & CSS Tools
  { slug: "css-box-shadow", name: "CSS Box Shadow Generator", description: "Visually build and preview CSS box shadows", category: "css", icon: "Square" },
  { slug: "css-border-radius", name: "CSS Border Radius Generator", description: "Visually build CSS border-radius with live preview", category: "css", icon: "Circle" },

  // Math & Conversion
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Calculate percentages, percentage change, and ratios", category: "math", icon: "Percent" },
  { slug: "unit-converter", name: "Unit Converter", description: "Convert between units of length, weight, temperature, and more", category: "math", icon: "Ruler" },
];

export const categoryOrder: ToolCategory[] = [
  "encoding",
  "developer",
  "text",
  "css",
  "design",
  "math",
  "generator",
  "image",
];

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getFeaturedTools(): Tool[] {
  return tools.filter((t) => t.featured);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase();
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
