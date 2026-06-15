export type ToolCategory =
  | "encoding"
  | "text"
  | "developer"
  | "math"
  | "css"
  | "colour"
  | "images"
  | "typography"
  | "print"
  | "calculators"
  | "other"
  | "pdf";

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
  { id: "math", name: "Math & Conversion", description: "Calculations, conversions, and number tools", icon: "Calculator" },
  { id: "css", name: "CSS Tools", description: "Build and preview CSS properties visually", icon: "Paintbrush" },
  { id: "colour", name: "Colour Tools", description: "Color conversion, palettes, gradients, and accessibility", icon: "Palette" },
  { id: "images", name: "Images & Assets", description: "Image editing, conversion, and asset generation", icon: "Image" },
  { id: "typography", name: "Typography & Text", description: "Font tools, text editing, and typographic calculators", icon: "Type" },
  { id: "print", name: "Print & Production", description: "Prepress, imposition, and print preparation tools", icon: "Printer" },
  { id: "calculators", name: "Calculators", description: "Scientific, algebraic, and specialized calculators", icon: "Calculator" },
  { id: "other", name: "Other Tools", description: "Miscellaneous utilities and generators", icon: "Wrench" },
  { id: "pdf", name: "PDF Tools", description: "Merge, split, compress, convert, and edit PDF documents", icon: "FileText" },
];

export const tools: Tool[] = [
  // === Encoding & Decoding ===
  { slug: "qr-code-generator", name: "QR Code Generator", description: "Generate QR codes with PNG and SVG export, logo overlay support", category: "encoding", icon: "QrCode", featured: true },
  { slug: "url-encoder-decoder", name: "URL Encoder/Decoder", description: "Encode and decode URLs and URI components instantly", category: "encoding", icon: "Link" },
  { slug: "base64", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 text with UTF-8 support", category: "encoding", icon: "FileCode" },
  { slug: "html-entities", name: "HTML Entity Encoder/Decoder", description: "Convert special characters to and from HTML entities", category: "encoding", icon: "Code" },
  { slug: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JSON Web Tokens, view headers and payload", category: "encoding", icon: "KeyRound", featured: true },

  // === Text Tools ===
  { slug: "text-diff", name: "Text Diff Checker", description: "Compare two texts and highlight differences line by line", category: "text", icon: "GitCompare" },
  { slug: "markdown-editor", name: "Markdown Editor", description: "Live markdown editor with preview and export", category: "text", icon: "FileText", featured: true },
  { slug: "word-counter", name: "Word & Character Counter", description: "Count words, characters, sentences, and paragraphs", category: "text", icon: "Hash" },
  { slug: "case-converter", name: "Case Converter", description: "Convert text between camelCase, snake_case, PascalCase, and more", category: "text", icon: "CaseSensitive" },
  { slug: "slug-generator", name: "Slug Generator", description: "Convert text to URL-friendly slugs", category: "text", icon: "Minus" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate placeholder text in paragraphs, sentences, or words", category: "text", icon: "AlignLeft" },

  // === Developer Tools ===
  { slug: "json-formatter", name: "JSON Formatter", description: "Format, validate, minify, and tree-view JSON data", category: "developer", icon: "Braces", featured: true },
  { slug: "regex-tester", name: "Regex Tester", description: "Test regular expressions with live matching and explanation", category: "developer", icon: "Regex", featured: true },
  { slug: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes", category: "developer", icon: "Fingerprint" },
  { slug: "timestamp-converter", name: "Unix Timestamp Converter", description: "Convert between Unix timestamps and human-readable dates", category: "developer", icon: "Clock" },
  { slug: "color-palette-extractor", name: "Color Palette Extractor", description: "Extract dominant colors from uploaded images", category: "developer", icon: "Pipette", new: true },

  // === CSS Tools ===
  { slug: "css-box-shadow", name: "CSS Box Shadow Generator", description: "Visually build and preview CSS box shadows", category: "css", icon: "Square" },
  { slug: "css-border-radius", name: "CSS Border Radius Generator", description: "Visually build CSS border-radius with live preview", category: "css", icon: "Circle" },

  // === Math & Conversion ===
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Calculate percentages, percentage change, and ratios", category: "math", icon: "Percent" },
  { slug: "unit-converter", name: "Unit Converter", description: "Convert between units of length, weight, temperature, and more", category: "math", icon: "Ruler" },

  // === Colour Tools ===
  { slug: "colour-converter", name: "Colour Converter", description: "Convert between HEX, RGB, HSL, HSV, CMYK, and Tailwind formats", category: "colour", icon: "Palette", new: true },
  { slug: "contrast-checker", name: "Contrast Checker", description: "Check WCAG color contrast ratios for accessibility compliance", category: "colour", icon: "CheckCheck", new: true },
  { slug: "colour-blindness-simulator", name: "Colour Blindness Simulator", description: "Simulate how colors appear to people with color vision deficiency", category: "colour", icon: "Eye", new: true },
  { slug: "gradient-generator", name: "Gradient Generator", description: "Build CSS linear, radial, and conic gradients with live preview", category: "colour", icon: "Layers", new: true },
  { slug: "harmony-generator", name: "Harmony Generator", description: "Generate complementary, analogous, triadic, and tetradic color schemes", category: "colour", icon: "CircleDot", new: true },
  { slug: "palette-collection", name: "Palette Collection", description: "Browse curated color palettes for design inspiration", category: "colour", icon: "Bookmark", new: true },
  { slug: "palette-generator", name: "Palette Generator", description: "Generate random harmonious color palettes", category: "colour", icon: "Paintbrush", new: true },
  { slug: "pixel-picker", name: "Pixel Picker", description: "Pick colors from images or a canvas with zoom precision", category: "colour", icon: "Pipette", new: true },
  { slug: "tailwind-shade-generator", name: "Tailwind Shade Generator", description: "Generate a full Tailwind-compatible shade scale from any color", category: "colour", icon: "SwatchBook", new: true },

  // === Images & Assets ===
  { slug: "placeholder-generator", name: "Placeholder Generator", description: "Generate placeholder images with custom size, color, and text", category: "images", icon: "Image", new: true },
  { slug: "favicon-generator", name: "Favicon Generator", description: "Generate favicons in all sizes from an uploaded image", category: "images", icon: "Globe", new: true },
  { slug: "image-converter", name: "Image Converter", description: "Convert images between PNG, JPEG, WebP, and BMP formats", category: "images", icon: "RefreshCw", new: true },
  { slug: "image-clipper", name: "Image Clipper", description: "Crop and clip images with precise pixel control", category: "images", icon: "Scissors", new: true },
  { slug: "image-splitter", name: "Image Splitter", description: "Split images into a grid of smaller tiles", category: "images", icon: "LayoutGrid", new: true },
  { slug: "watermarker", name: "Watermarker", description: "Add text or image watermarks to your images", category: "images", icon: "Stamp", new: true },
  { slug: "artwork-enhancer", name: "Artwork Enhancer", description: "Apply filters like brightness, contrast, saturation, and blur to images", category: "images", icon: "Sparkles", new: true },
  { slug: "paste-image", name: "Paste Image", description: "Paste images from clipboard and edit or convert them", category: "images", icon: "ClipboardPaste", new: true },
  { slug: "background-remover", name: "Background Remover", description: "Remove solid-color backgrounds from images using threshold detection", category: "images", icon: "Eraser", new: true },
  { slug: "image-tracer", name: "Image Tracer", description: "Convert raster images to SVG vector paths", category: "images", icon: "Spline", new: true },
  { slug: "svg-optimiser", name: "SVG Optimiser", description: "Minify and optimise SVG files by removing unnecessary data", category: "images", icon: "FileCode", new: true },
  { slug: "seamless-scroll-generator", name: "Seamless Scroll Generator", description: "Create seamless tileable patterns from images", category: "images", icon: "Repeat", new: true },
  { slug: "social-media-cropper", name: "Social Media Cropper", description: "Crop images to social media dimensions (Instagram, Twitter, Facebook)", category: "images", icon: "Crop", new: true },
  { slug: "social-media-matte", name: "Social Media Matte Generator", description: "Add colored matte borders to images for social media posts", category: "images", icon: "Frame", new: true },

  // === Typography & Text ===
  { slug: "text-editor", name: "Text Editor", description: "A clean, distraction-free text editor with basic formatting", category: "typography", icon: "Type", new: true },
  { slug: "px-to-rem", name: "PX to REM Converter", description: "Convert pixel values to REM units and vice versa", category: "typography", icon: "ArrowRightLeft", new: true },
  { slug: "line-height-calculator", name: "Line Height Calculator", description: "Calculate optimal line height for given font size and measure", category: "typography", icon: "AlignVerticalSpaceAround", new: true },
  { slug: "paper-sizes", name: "Paper Sizes Reference", description: "Reference guide for international and US paper sizes in pixels and mm", category: "typography", icon: "RectangleHorizontal", new: true },
  { slug: "typography-calculator", name: "Typography Calculator", description: "Calculate font scaling, modular scales, and type ratios", category: "typography", icon: "Calculator", new: true },
  { slug: "font-file-explorer", name: "Font File Explorer", description: "Inspect font files to view metadata, glyph counts, and tables", category: "typography", icon: "FolderOpen", new: true },
  { slug: "glyph-browser", name: "Glyph Browser", description: "Browse all glyphs in a font file with their Unicode values", category: "typography", icon: "ALargeSmall", new: true },
  { slug: "document-converter", name: "Document Converter", description: "Convert between text formats: Markdown, HTML, plain text, and JSON", category: "typography", icon: "FileText", new: true },

  // === Print & Production ===
  { slug: "pdf-preflight", name: "PDF Preflight", description: "Analyze PDF files for print readiness: bleed, resolution, color space", category: "print", icon: "FileCheck", new: true },
  { slug: "print-imposer", name: "Print Imposer", description: "Calculate printer spreads and imposition layouts for booklets", category: "print", icon: "BookOpen", new: true },
  { slug: "zine-imposer", name: "Zine Imposer", description: "Calculate zine folding and page ordering for DIY printing", category: "print", icon: "Book", new: true },

  // === Calculators ===
  { slug: "base-converter", name: "Base Converter", description: "Convert numbers between binary, octal, decimal, hex, and custom bases", category: "calculators", icon: "Binary", new: true },
  { slug: "scientific-calculator", name: "Scientific Calculator", description: "Full scientific calculator with trig, log, exp, and constants", category: "calculators", icon: "Calculator", new: true },
  { slug: "algebra-calculator", name: "Algebra Calculator", description: "Solve algebraic expressions and equations step by step", category: "calculators", icon: "Sigma", new: true },
  { slug: "graph-calculator", name: "Graph Calculator", description: "Plot mathematical functions on an interactive graph", category: "calculators", icon: "LineChart", new: true },
  { slug: "time-calculator", name: "Time Calculator", description: "Add, subtract, and convert time durations", category: "calculators", icon: "Clock", new: true },
  { slug: "encoding-tools", name: "Encoding Tools", description: "All-in-one Base64, URL encoding, and hash generation tool", category: "calculators", icon: "Lock", new: true },

  // === Other Tools ===
  { slug: "barcode-generator", name: "Barcode Generator", description: "Generate barcodes in Code128, EAN-13, UPC-A, and more formats", category: "other", icon: "Barcode", new: true },
  { slug: "cipher-decoder", name: "Cipher Decoder", description: "Decode and encode with Caesar, Vigenère, ROT13, and Atbash ciphers", category: "other", icon: "Key", new: true },
  { slug: "meta-tag-generator", name: "Meta Tag Generator", description: "Generate HTML meta tags for SEO, Open Graph, and Twitter Cards", category: "other", icon: "Tags", new: true },
  { slug: "tailwind-cheat-sheet", name: "Tailwind Cheat Sheet", description: "Quick reference for Tailwind CSS utility classes", category: "other", icon: "BookMarked", new: true },
  { slug: "text-scratchpad", name: "Text Scratchpad", description: "Quick disposable notepad for temporary text and notes", category: "other", icon: "NotepadText", new: true },
  { slug: "shavian-transliterator", name: "Shavian Transliterator", description: "Convert Latin text to Shavian alphabet and vice versa", category: "other", icon: "Languages", new: true },

  // === PDF Tools ===
  { slug: "merge-pdf", name: "Merge PDF", description: "Combine multiple PDF files into a single document", category: "pdf", icon: "Files", new: true },
  { slug: "split-pdf", name: "Split PDF", description: "Split a PDF into separate files by page ranges", category: "pdf", icon: "Scissors", new: true },
  { slug: "remove-pdf-pages", name: "Remove PDF Pages", description: "Delete specific pages from a PDF document", category: "pdf", icon: "Trash2", new: true },
  { slug: "extract-pdf-pages", name: "Extract PDF Pages", description: "Extract selected pages into a new PDF file", category: "pdf", icon: "Copy", new: true },
  { slug: "organize-pdf-pages", name: "Organize PDF Pages", description: "Reorder, rotate, and manage PDF pages visually", category: "pdf", icon: "GripVertical", new: true },
  { slug: "compress-pdf", name: "Compress PDF", description: "Reduce PDF file size while maintaining quality", category: "pdf", icon: "Minimize2", new: true },
  { slug: "jpg-to-pdf", name: "JPG to PDF", description: "Convert JPG, PNG, or WebP images into a PDF document", category: "pdf", icon: "FileImage", new: true },
  { slug: "pdf-to-jpg", name: "PDF to JPG", description: "Convert each page of a PDF into JPG images", category: "pdf", icon: "ImageIcon", new: true },
  { slug: "edit-pdf", name: "Edit PDF", description: "Add text, images, and shapes to PDF pages", category: "pdf", icon: "PenTool", new: true },
  { slug: "pdf-page-numbers", name: "PDF Page Numbers", description: "Add page numbers to PDF with custom format and position", category: "pdf", icon: "Hash", new: true },
  { slug: "watermark-pdf", name: "Watermark PDF", description: "Add text or image watermark to PDF pages", category: "pdf", icon: "Stamp", new: true },
  { slug: "rotate-pdf", name: "Rotate PDF", description: "Rotate PDF pages by 90, 180, or 270 degrees", category: "pdf", icon: "RotateCw", new: true },
  { slug: "protect-pdf", name: "Protect PDF", description: "Add password protection to a PDF document", category: "pdf", icon: "Lock", new: true },
  { slug: "unlock-pdf", name: "Unlock PDF", description: "Remove password protection from a PDF", category: "pdf", icon: "Unlock", new: true },
  { slug: "pdf-to-pdfa", name: "PDF to PDF/A", description: "Convert PDF to PDF/A format for long-term archival", category: "pdf", icon: "FileCheck", new: true },
  { slug: "sign-pdf", name: "Sign PDF", description: "Draw or upload a signature and place it on a PDF", category: "pdf", icon: "PenLine", new: true },

  // === New Image Tools ===
  { slug: "image-compress", name: "Image Compress", description: "Reduce image file size with quality control", category: "images", icon: "Minimize2", new: true },
  { slug: "image-resize", name: "Image Resize", description: "Resize images by pixels or percentage", category: "images", icon: "Maximize2", new: true },
  { slug: "image-rotate", name: "Image Rotate", description: "Rotate images by any angle", category: "images", icon: "RotateCw", new: true },
  { slug: "meme-generator", name: "Meme Generator", description: "Create memes with custom text on images", category: "images", icon: "Laugh", new: true },
  { slug: "html-to-image", name: "HTML to Image", description: "Capture web pages or HTML elements as images", category: "images", icon: "Camera", new: true },
];

export const categoryOrder: ToolCategory[] = [
  "encoding",
  "developer",
  "text",
  "colour",
  "images",
  "typography",
  "css",
  "math",
  "calculators",
  "print",
  "pdf",
  "other",
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
