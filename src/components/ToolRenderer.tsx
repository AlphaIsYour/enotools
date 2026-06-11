"use client";

import dynamic from "next/dynamic";

const toolComponents: Record<string, React.ComponentType> = {
  "qr-code-generator": dynamic(() => import("./tools/QrCodeGenerator"), { ssr: false }),
  "url-encoder-decoder": dynamic(() => import("./tools/UrlEncoderDecoder"), { ssr: false }),
  "base64": dynamic(() => import("./tools/Base64Tool"), { ssr: false }),
  "html-entities": dynamic(() => import("./tools/HtmlEntities"), { ssr: false }),
  "jwt-decoder": dynamic(() => import("./tools/JwtDecoder"), { ssr: false }),
  "text-diff": dynamic(() => import("./tools/TextDiff"), { ssr: false }),
  "markdown-editor": dynamic(() => import("./tools/MarkdownEditor"), { ssr: false }),
  "word-counter": dynamic(() => import("./tools/WordCounter"), { ssr: false }),
  "case-converter": dynamic(() => import("./tools/CaseConverter"), { ssr: false }),
  "slug-generator": dynamic(() => import("./tools/SlugGenerator"), { ssr: false }),
  "lorem-ipsum": dynamic(() => import("./tools/LoremIpsum"), { ssr: false }),
  "json-formatter": dynamic(() => import("./tools/JsonFormatter"), { ssr: false }),
  "regex-tester": dynamic(() => import("./tools/RegexTester"), { ssr: false }),
  "hash-generator": dynamic(() => import("./tools/HashGenerator"), { ssr: false }),
  "timestamp-converter": dynamic(() => import("./tools/TimestampConverter"), { ssr: false }),
  "color-palette-extractor": dynamic(() => import("./tools/ColorPaletteExtractor"), { ssr: false }),
  "css-box-shadow": dynamic(() => import("./tools/CssBoxShadow"), { ssr: false }),
  "css-border-radius": dynamic(() => import("./tools/CssBorderRadius"), { ssr: false }),
  "percentage-calculator": dynamic(() => import("./tools/PercentageCalculator"), { ssr: false }),
  "unit-converter": dynamic(() => import("./tools/UnitConverter"), { ssr: false }),
};

interface ToolRendererProps {
  slug: string;
}

export function ToolRenderer({ slug }: ToolRendererProps) {
  const Component = toolComponents[slug];

  if (!Component) {
    return (
      <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-12 text-center">
        <p className="text-surface-500 dark:text-surface-400">
          This tool is coming soon.
        </p>
      </div>
    );
  }

  return <Component />;
}
