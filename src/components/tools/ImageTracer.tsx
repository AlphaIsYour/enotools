"use client";

import { useState, useRef, useCallback } from "react";

export default function ImageTracer() {
  const [original, setOriginal] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(128);
  const [detail, setDetail] = useState<"low" | "medium" | "high">("medium");
  const [colorMode, setColorMode] = useState<"monochrome" | "color">("monochrome");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setOriginal(ev.target?.result as string);
        setSvgOutput(null);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0);
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const traceImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);

    requestAnimationFrame(() => {
      const ctx = canvas.getContext("2d")!;
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // Step 1: Convert to grayscale or get color data
      const stepSize = detail === "low" ? 4 : detail === "medium" ? 2 : 1;

      // Create binary grid
      const gridW = Math.ceil(w / stepSize);
      const gridH = Math.ceil(h / stepSize);
      const grid: number[][] = [];
      const colorGrid: { r: number; g: number; b: number }[][] = [];

      for (let gy = 0; gy < gridH; gy++) {
        grid[gy] = [];
        colorGrid[gy] = [];
        for (let gx = 0; gx < gridW; gx++) {
          const px = gx * stepSize;
          const py = gy * stepSize;
          const idx = (py * w + px) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          grid[gy][gx] = gray < threshold ? 1 : 0;
          colorGrid[gy][gx] = { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
        }
      }

      // Step 2: Marching squares to trace contours
      const paths: { path: string; color: string }[] = [];
      const visited = new Set<string>();

      const getKey = (x: number, y: number) => `${x},${y}`;

      // Find contour cells using marching squares
      for (let y = 0; y < gridH - 1; y++) {
        for (let x = 0; x < gridW - 1; x++) {
          const tl = grid[y][x];
          const tr = grid[y][x + 1];
          const br = grid[y + 1][x + 1];
          const bl = grid[y + 1][x];
          const cellValue = (tl << 3) | (tr << 2) | (br << 1) | bl;

          if (cellValue === 0 || cellValue === 15) continue;

          const key = getKey(x, y);
          if (visited.has(key)) continue;
          visited.add(key);

          const px = x * stepSize;
          const py = y * stepSize;
          const s = stepSize;
          const midX = px + s / 2;
          const midY = py + s / 2;

          const cellColor =
            colorMode === "color"
              ? `rgb(${colorGrid[y][x].r},${colorGrid[y][x].g},${colorGrid[y][x].b})`
              : grid[y][x] === 1
                ? "#000000"
                : "#ffffff";

          // Generate path segments based on marching squares case
          let segment = "";
          switch (cellValue) {
            case 1:
            case 14:
              segment = `M${px},${midY} L${midX},${py + s} L${px},${py + s}Z`;
              break;
            case 2:
            case 13:
              segment = `M${midX},${py + s} L${px + s},${midY} L${px + s},${py + s}Z`;
              break;
            case 3:
            case 12:
              segment = `M${px},${midY} L${px + s},${midY} L${px + s},${py + s} L${px},${py + s}Z`;
              break;
            case 4:
            case 11:
              segment = `M${midX},${py} L${px + s},${midY} L${px + s},${py}Z`;
              break;
            case 5:
              segment = `M${px},${midY} L${midX},${py} L${px + s},${midY} L${midX},${py + s}Z`;
              break;
            case 6:
            case 9:
              segment = `M${midX},${py} L${midX},${py + s} L${px + s},${py + s} L${px + s},${py}Z`;
              break;
            case 7:
            case 8:
              segment = `M${px},${midY} L${midX},${py} L${px},${py}Z`;
              break;
            case 10:
              segment = `M${midX},${py} L${px + s},${midY} L${midX},${py + s} L${px},${midY}Z`;
              break;
          }

          if (segment) {
            paths.push({ path: segment, color: cellColor });
          }
        }
      }

      // Merge same-color paths
      const colorGroups = new Map<string, string[]>();
      for (const p of paths) {
        if (!colorGroups.has(p.color)) colorGroups.set(p.color, []);
        colorGroups.get(p.color)!.push(p.path);
      }

      let svgPaths = "";
      for (const [color, pathData] of colorGroups) {
        svgPaths += `<path d="${pathData.join(" ")}" fill="${color}" />\n`;
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${svgPaths}</svg>`;
      setSvgOutput(svg);
      setLoading(false);
    });
  }, [threshold, detail, colorMode]);

  const downloadSvg = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput as unknown as BlobPart], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "traced.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary w-full"
        >
          Upload Image
        </button>
      </div>

      {original && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Threshold: {threshold}
            </label>
            <input
              type="range"
              min={0}
              max={255}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Detail Level
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDetail(d)}
                  className={detail === d ? "btn-primary" : "btn-secondary"}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Color Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setColorMode("monochrome")}
                className={colorMode === "monochrome" ? "btn-primary" : "btn-secondary"}
              >
                Monochrome
              </button>
              <button
                onClick={() => setColorMode("color")}
                className={colorMode === "color" ? "btn-primary" : "btn-secondary"}
              >
                Color
              </button>
            </div>
          </div>

          <button
            onClick={traceImage}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Tracing..." : "Trace Image"}
          </button>
        </div>
      )}

      {original && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Original
              </h3>
              <img src={original} alt="Original" className="w-full rounded border" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                SVG Preview
              </h3>
              {svgOutput ? (
                <div
                  className="w-full rounded border overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-surface-400 rounded border border-dashed">
                  Click &quot;Trace Image&quot; to generate SVG
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {svgOutput && (
        <button onClick={downloadSvg} className="btn-primary">
          Download SVG
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
