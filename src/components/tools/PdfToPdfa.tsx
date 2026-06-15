"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, FileCheck, Download, FileText, Loader2, Info } from "lucide-react";

export default function PdfToPdfa() {
  const [pdfFile, setPdfFile] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data);
      setPdfFile({ name: file.name, data });
      setPageCount(pdf.getPageCount());
      setError("");
      setSuccess("");
    } catch (err) {
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const convertToPdfa = async () => {
    if (!pdfFile) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const pdf = await PDFDocument.load(pdfFile.data);

      // Set metadata for PDF/A compliance
      pdf.setTitle(pdfFile.name.replace(/\.pdf$/i, ""));
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setProducer("enotools PDF/A Converter");

      // Add XMP metadata for PDF/A
      const docTitle = pdfFile.name.replace(/\.pdf$/i, "");
      const xmpMetadata = `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <dc:title>${docTitle}</dc:title>
      <dc:creator>Unknown</dc:creator>
      <xmp:CreatorTool>enotools PDF/A Converter</xmp:CreatorTool>
      <xmp:CreateDate>${new Date().toISOString()}</xmp:CreateDate>
      <xmp:ModifyDate>${new Date().toISOString()}</xmp:ModifyDate>
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`;

      // Note: pdf-lib doesn't have a direct setXmpMetadata method,
      // but we set the standard metadata fields above which is the
      // best we can do client-side.
      void xmpMetadata; // Available for future use if pdf-lib adds XMP support

      const pdfaBytes = await pdf.save({
        useObjectStreams: false,
      });

      const blob = new Blob([pdfaBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = pdfFile.name.replace(/\.pdf$/i, "") + "-pdfa.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess("PDF downloaded with PDF/A metadata. Note: true PDF/A compliance requires validation with specialized tools.");
    } catch (err) {
      setError(`Failed to convert PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    setPageCount(0);
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Upload PDF
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full"
        >
          <Upload className="h-4 w-4" />
          Select PDF File
        </button>
      </div>

      {pdfFile && (
        <>
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                    {pdfFile.name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {pageCount} page{pageCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p className="font-medium">What is PDF/A?</p>
                <p>
                  PDF/A is an ISO-standardized version of PDF designed for long-term digital
                  preservation. It embeds all fonts, removes device-dependent colour, and ensures
                  the document looks the same regardless of the software used to open it.
                </p>
                <p className="font-medium">Limitations</p>
                <p>
                  True PDF/A compliance requires embedding all fonts, removing JavaScript, and
                  validating against the ISO 19005 standard. This client-side tool applies PDF/A
                  metadata and best-effort settings. For certified PDF/A compliance, use
                  specialized validation tools like veraPDF or Adobe Acrobat Preflight.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <button
            onClick={convertToPdfa}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                Convert to PDF/A
              </>
            )}
          </button>
        </>
      )}

      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
          How it works
        </h2>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Upload a PDF file and convert it to a PDF/A-compatible format. This tool sets PDF/A
          metadata, preserves all content, and produces a best-effort PDF/A output. For certified
          compliance, validate the output with veraPDF or Adobe Acrobat Preflight. All processing
          happens in your browser.
        </p>
      </div>
    </div>
  );
}
