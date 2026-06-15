"use client";

import { useState, useRef, useCallback } from "react";
import { Download, Code, Loader2, Globe, AlertTriangle } from "lucide-react";
import html2canvas from "html2canvas";

export default function HtmlToImage() {
  const [mode, setMode] = useState<"code" | "url">("code");
  const [htmlCode, setHtmlCode] = useState(
    '<div style="padding: 40px; font-family: sans-serif; text-align: center;">\n  <h1 style="color: #3b82f6;">Hello World</h1>\n  <p style="color: #6b7280;">Edit this HTML to generate an image</p>\n</div>'
  );
  const [url, setUrl] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const renderRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(800);

  const captureHtml = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    try {
      if (mode === "code") {
        if (!htmlCode.trim()) {
          setError("Please enter some HTML code.");
          setIsProcessing(false);
          return;
        }

        const container = renderRef.current;
        if (!container) return;

        // Render HTML into hidden div
        container.innerHTML = htmlCode;
        container.style.width = `${renderWidth}px`;
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";

        // Wait for images/fonts to load
        await new Promise((resolve) => setTimeout(resolve, 300));

        const canvas = await html2canvas(container, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: renderWidth,
          scale: 2,
        });

        const dataUrl = canvas.toDataURL("image/png");
        if (resultImage) URL.revokeObjectURL(resultImage);
        setResultImage(dataUrl);

        // Clean up
        container.innerHTML = "";
        container.style.position = "";
        container.style.left = "";
        container.style.top = "";
        container.style.width = "";
      } else {
        // URL mode - note about cross-origin
        if (!url.trim()) {
          setError("Please enter a URL.");
          setIsProcessing(false);
          return;
        }

        // Validate URL
        let parsedUrl: URL;
        try {
          parsedUrl = new URL(url);
        } catch {
          setError("Please enter a valid URL (e.g., https://example.com).");
          setIsProcessing(false);
          return;
        }

        // Create an iframe to load the URL
        const iframe = document.createElement("iframe");
        iframe.style.width = `${renderWidth}px`;
        iframe.style.height = "600px";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.style.top = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        try {
          iframe.src = parsedUrl.href;

          // Wait for iframe to load
          await new Promise<void>((resolve, reject) => {
            iframe.onload = () => resolve();
            iframe.onerror = () => reject(new Error("Failed to load URL"));
            setTimeout(() => reject(new Error("Timeout loading URL")), 15000);
          });

          // Wait extra for rendering
          await new Promise((resolve) => setTimeout(resolve, 1000));

          try {
            const canvas = await html2canvas(iframe.contentDocument?.body as HTMLElement, {
              useCORS: true,
              allowTaint: false,
              backgroundColor: "#ffffff",
              width: renderWidth,
              scale: 2,
            });

            const dataUrl = canvas.toDataURL("image/png");
            if (resultImage) URL.revokeObjectURL(resultImage);
            setResultImage(dataUrl);
          } catch {
            setError(
              "Cross-origin restriction: Cannot capture this URL due to browser security policies. " +
              "Most websites block iframe access from other domains. " +
              "Try using the HTML code mode instead, or use a URL on the same origin."
            );
          }
        } catch (loadErr) {
          setError(
            `Failed to load URL: ${loadErr instanceof Error ? loadErr.message : "Unknown error"}. ` +
            "Cross-origin restrictions may prevent capturing external websites. " +
            "Try using the HTML code mode instead."
          );
        } finally {
          document.body.removeChild(iframe);
        }
      }
    } catch (captureErr) {
      setError(
        `Capture failed: ${captureErr instanceof Error ? captureErr.message : "Unknown error"}. ` +
        "Make sure the HTML is valid and does not reference blocked external resources."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [mode, htmlCode, url, renderWidth, resultImage]);

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.download = "html-capture.png";
    link.href = resultImage;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Hidden render container */}
      <div ref={renderRef} className="overflow-hidden" />

      {/* Mode toggle */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Capture Mode
        </h2>
        <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
          <button
            onClick={() => {
              setMode("code");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
              mode === "code"
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
            }`}
          >
            <Code className="h-4 w-4" />
            HTML Code
          </button>
          <button
            onClick={() => {
              setMode("url");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
              mode === "url"
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
            }`}
          >
            <Globe className="h-4 w-4" />
            URL
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          {mode === "code" ? "HTML Code" : "Website URL"}
        </h2>

        {mode === "code" ? (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Paste your HTML code below
            </label>
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="<div>Your HTML here...</div>"
              className="input-field min-h-[200px] resize-y font-mono text-sm"
              spellCheck={false}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Enter website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="input-field"
            />
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Cross-origin limitation:</strong> Most websites block being loaded in iframes
                or accessed from other origins due to browser security policies (CORS/X-Frame-Options).
                If URL capture fails, use the HTML code mode instead and paste the page source.
              </p>
            </div>
          </div>
        )}

        {/* Render width */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Render Width: {renderWidth}px
          </label>
          <input
            type="range"
            min={320}
            max={1920}
            step={80}
            value={renderWidth}
            onChange={(e) => setRenderWidth(Number(e.target.value))}
            className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-xs text-surface-500 mt-1">
            <span>320px</span>
            <span>1920px</span>
          </div>
        </div>

        <button
          onClick={captureHtml}
          disabled={isProcessing}
          className="btn-primary w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Code className="h-4 w-4" />
              Capture as Image
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {resultImage && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Captured Image
          </h2>
          <div className="rounded-lg overflow-hidden bg-surface-50 dark:bg-surface-800 p-2">
            <img
              src={resultImage}
              alt="Captured HTML"
              className="max-w-full h-auto rounded mx-auto"
            />
          </div>
          <button onClick={downloadImage} className="btn-primary w-full">
            <Download className="h-4 w-4" />
            Download as PNG
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-surface-600 dark:text-surface-400">
          <div>
            <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-1">
              HTML Code Mode
            </h3>
            <p>
              Paste any valid HTML code. The tool renders it in a hidden container
              and uses html2canvas to capture it as a PNG image. Inline styles,
              images (same-origin), and text are supported.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-1">
              URL Mode
            </h3>
            <p>
              Attempts to load and capture a webpage. Due to cross-origin security
              policies (CORS, X-Frame-Options), most external websites cannot be
              captured. For best results, use the HTML code mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
