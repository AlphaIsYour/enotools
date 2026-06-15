"use client";

import dynamic from "next/dynamic";

function ToolLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-3">
        <div className="h-9 w-24 rounded-md bg-surface-200 dark:bg-surface-800" />
        <div className="h-9 w-24 rounded-md bg-surface-200 dark:bg-surface-800" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <div className="h-4 w-20 rounded bg-surface-200 dark:bg-surface-800" />
          <div className="h-32 rounded-md bg-surface-100 dark:bg-surface-800" />
        </div>
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <div className="h-4 w-20 rounded bg-surface-200 dark:bg-surface-800" />
          <div className="h-32 rounded-md bg-surface-100 dark:bg-surface-800" />
        </div>
      </div>
    </div>
  );
}

const toolComponents: Record<string, React.ComponentType> = {
  // === Encoding & Decoding (existing) ===
  "qr-code-generator": dynamic(() => import("./tools/QrCodeGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "url-encoder-decoder": dynamic(() => import("./tools/UrlEncoderDecoder"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "base64": dynamic(() => import("./tools/Base64Tool"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "html-entities": dynamic(() => import("./tools/HtmlEntities"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "jwt-decoder": dynamic(() => import("./tools/JwtDecoder"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Text Tools (existing) ===
  "text-diff": dynamic(() => import("./tools/TextDiff"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "markdown-editor": dynamic(() => import("./tools/MarkdownEditor"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "word-counter": dynamic(() => import("./tools/WordCounter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "case-converter": dynamic(() => import("./tools/CaseConverter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "slug-generator": dynamic(() => import("./tools/SlugGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "lorem-ipsum": dynamic(() => import("./tools/LoremIpsum"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Developer Tools (existing) ===
  "json-formatter": dynamic(() => import("./tools/JsonFormatter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "regex-tester": dynamic(() => import("./tools/RegexTester"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "hash-generator": dynamic(() => import("./tools/HashGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "timestamp-converter": dynamic(() => import("./tools/TimestampConverter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "color-palette-extractor": dynamic(() => import("./tools/ColorPaletteExtractor"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === CSS Tools (existing) ===
  "css-box-shadow": dynamic(() => import("./tools/CssBoxShadow"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "css-border-radius": dynamic(() => import("./tools/CssBorderRadius"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Math & Conversion (existing) ===
  "percentage-calculator": dynamic(() => import("./tools/PercentageCalculator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "unit-converter": dynamic(() => import("./tools/UnitConverter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Colour Tools (new) ===
  "colour-converter": dynamic(() => import("./tools/ColourConverter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "contrast-checker": dynamic(() => import("./tools/ContrastChecker"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "colour-blindness-simulator": dynamic(() => import("./tools/ColourBlindnessSimulator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "gradient-generator": dynamic(() => import("./tools/GradientGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "harmony-generator": dynamic(() => import("./tools/HarmonyGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "palette-collection": dynamic(() => import("./tools/PaletteCollection"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "palette-generator": dynamic(() => import("./tools/PaletteGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "pixel-picker": dynamic(() => import("./tools/PixelPicker"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "tailwind-shade-generator": dynamic(() => import("./tools/TailwindShadeGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Images & Assets (new) ===
  "placeholder-generator": dynamic(() => import("./tools/PlaceholderGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "favicon-generator": dynamic(() => import("./tools/FaviconGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "image-converter": dynamic(() => import("./tools/ImageConverter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "image-clipper": dynamic(() => import("./tools/ImageClipper"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "image-splitter": dynamic(() => import("./tools/ImageSplitter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "watermarker": dynamic(() => import("./tools/Watermarker"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "artwork-enhancer": dynamic(() => import("./tools/ArtworkEnhancer"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "paste-image": dynamic(() => import("./tools/PasteImage"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "background-remover": dynamic(() => import("./tools/BackgroundRemover"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "image-tracer": dynamic(() => import("./tools/ImageTracer"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "svg-optimiser": dynamic(() => import("./tools/SvgOptimiser"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "seamless-scroll-generator": dynamic(() => import("./tools/SeamlessScrollGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "social-media-cropper": dynamic(() => import("./tools/SocialMediaCropper"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "social-media-matte": dynamic(() => import("./tools/SocialMediaMatte"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Typography & Text (new) ===
  "text-editor": dynamic(() => import("./tools/TextEditor"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "px-to-rem": dynamic(() => import("./tools/PxToRem"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "line-height-calculator": dynamic(() => import("./tools/LineHeightCalculator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "paper-sizes": dynamic(() => import("./tools/PaperSizes"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "typography-calculator": dynamic(() => import("./tools/TypographyCalculator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "font-file-explorer": dynamic(() => import("./tools/FontFileExplorer"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "glyph-browser": dynamic(() => import("./tools/GlyphBrowser"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "document-converter": dynamic(() => import("./tools/DocumentConverter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Print & Production (new) ===
  "pdf-preflight": dynamic(() => import("./tools/PdfPreflight"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "print-imposer": dynamic(() => import("./tools/PrintImposer"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "zine-imposer": dynamic(() => import("./tools/ZineImposer"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Calculators (new) ===
  "base-converter": dynamic(() => import("./tools/BaseConverter"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "scientific-calculator": dynamic(() => import("./tools/ScientificCalculator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "algebra-calculator": dynamic(() => import("./tools/AlgebraCalculator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "graph-calculator": dynamic(() => import("./tools/GraphCalculator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "time-calculator": dynamic(() => import("./tools/TimeCalculator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "encoding-tools": dynamic(() => import("./tools/EncodingTools"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === Other Tools (new) ===
  "barcode-generator": dynamic(() => import("./tools/BarcodeGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "cipher-decoder": dynamic(() => import("./tools/CipherDecoder"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "meta-tag-generator": dynamic(() => import("./tools/MetaTagGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "tailwind-cheat-sheet": dynamic(() => import("./tools/TailwindCheatSheet"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "text-scratchpad": dynamic(() => import("./tools/TextScratchpad"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "shavian-transliterator": dynamic(() => import("./tools/ShavianTransliterator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === PDF Tools (new) ===
  "merge-pdf": dynamic(() => import("./tools/MergePdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "split-pdf": dynamic(() => import("./tools/SplitPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "remove-pdf-pages": dynamic(() => import("./tools/RemovePdfPages"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "extract-pdf-pages": dynamic(() => import("./tools/ExtractPdfPages"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "organize-pdf-pages": dynamic(() => import("./tools/OrganizePdfPages"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "compress-pdf": dynamic(() => import("./tools/CompressPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "jpg-to-pdf": dynamic(() => import("./tools/JpgToPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "pdf-to-jpg": dynamic(() => import("./tools/PdfToJpg"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "edit-pdf": dynamic(() => import("./tools/EditPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "pdf-page-numbers": dynamic(() => import("./tools/PdfPageNumbers"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "watermark-pdf": dynamic(() => import("./tools/WatermarkPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "rotate-pdf": dynamic(() => import("./tools/RotatePdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "protect-pdf": dynamic(() => import("./tools/ProtectPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "unlock-pdf": dynamic(() => import("./tools/UnlockPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "pdf-to-pdfa": dynamic(() => import("./tools/PdfToPdfa"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "sign-pdf": dynamic(() => import("./tools/SignPdf"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),

  // === New Image Tools ===
  "image-compress": dynamic(() => import("./tools/ImageCompress"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "image-resize": dynamic(() => import("./tools/ImageResize"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "image-rotate": dynamic(() => import("./tools/ImageRotate"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "meme-generator": dynamic(() => import("./tools/MemeGenerator"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  "html-to-image": dynamic(() => import("./tools/HtmlToImage"), { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
};

interface ToolRendererProps {
  slug: string;
}

export function ToolRenderer({ slug }: ToolRendererProps) {
  const Component = toolComponents[slug];

  if (!Component) {
    return (
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-12 text-center">
        <p className="text-sm text-surface-500 dark:text-surface-400">
          This tool is coming soon.
        </p>
      </div>
    );
  }

  return <Component />;
}
