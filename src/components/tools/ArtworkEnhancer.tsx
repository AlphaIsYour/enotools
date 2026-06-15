"use client";

import { useState, useRef } from "react";

export default function ArtworkEnhancer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResultUrl(null);
    resetFilters();
  };

  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    setGrayscale(0);
    setSepia(0);
    setHueRotate(0);
  };

  const getCssFilter = () => {
    const parts: string[] = [];
    if (brightness !== 0) parts.push(`brightness(${(100 + brightness) / 100})`);
    if (contrast !== 0) parts.push(`contrast(${(100 + contrast) / 100})`);
    if (saturation !== 0) parts.push(`saturate(${(100 + saturation) / 100})`);
    if (blur > 0) parts.push(`blur(${blur}px)`);
    if (grayscale > 0) parts.push(`grayscale(${grayscale / 100})`);
    if (sepia > 0) parts.push(`sepia(${sepia / 100})`);
    if (hueRotate !== 0) parts.push(`hue-rotate(${hueRotate}deg)`);
    return parts.length > 0 ? parts.join(" ") : "none";
  };

  const applyFilters = () => {
    if (!imageUrl) return;
    setLoading(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.filter = getCssFilter();
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";

      setResultUrl(canvas.toDataURL("image/png"));
      setLoading(false);
    };
    img.src = imageUrl;
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "enhanced.png";
    a.click();
  };

  interface SliderProps {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    unit?: string;
  }

  const Slider = ({ label, value, onChange, min, max, unit = "" }: SliderProps) => (
    <div>
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
        {label}: {value}{unit}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <button
          onClick={() => onChange(0)}
          className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
          title="Reset"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Upload Image</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
          Upload Image
        </button>
      </div>

      {imageUrl && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Filters</h3>
          <div className="space-y-4">
            <Slider label="Brightness" value={brightness} onChange={setBrightness} min={-100} max={100} unit="%" />
            <Slider label="Contrast" value={contrast} onChange={setContrast} min={-100} max={100} unit="%" />
            <Slider label="Saturation" value={saturation} onChange={setSaturation} min={-100} max={100} unit="%" />
            <Slider label="Blur" value={blur} onChange={setBlur} min={0} max={20} unit="px" />
            <Slider label="Grayscale" value={grayscale} onChange={setGrayscale} min={0} max={100} unit="%" />
            <Slider label="Sepia" value={sepia} onChange={setSepia} min={0} max={100} unit="%" />
            <Slider label="Hue Rotate" value={hueRotate} onChange={setHueRotate} min={0} max={360} unit="°" />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={applyFilters} className="btn-primary" disabled={loading}>
              {loading ? "Applying..." : "Apply Filters"}
            </button>
            <button onClick={resetFilters} className="btn-secondary">Reset</button>
            {resultUrl && (
              <button onClick={download} className="btn-secondary">Download</button>
            )}
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Live Preview</h3>
          <div className="overflow-hidden rounded border border-surface-200 dark:border-surface-700">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-full"
              style={{ filter: getCssFilter() }}
            />
          </div>
        </div>
      )}

      {resultUrl && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Result</h3>
          <img src={resultUrl} alt="Enhanced" className="max-w-full rounded border border-surface-200 dark:border-surface-700" />
        </div>
      )}
    </div>
  );
}
