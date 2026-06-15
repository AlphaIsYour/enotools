"use client";

import { useState, useRef } from "react";

interface Tile {
  url: string;
  index: number;
  row: number;
  col: number;
}

export default function ImageSplitter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageUrl(img.src);
      setTiles([]);
    };
    img.src = URL.createObjectURL(file);
  };

  const split = () => {
    if (!image) return;
    setLoading(true);

    const tileW = Math.floor(image.width / cols);
    const tileH = Math.floor(image.height / rows);
    const results: Tile[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement("canvas");
        canvas.width = tileW;
        canvas.height = tileH;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        ctx.drawImage(
          image,
          c * tileW,
          r * tileH,
          tileW,
          tileH,
          0,
          0,
          tileW,
          tileH
        );

        results.push({
          url: canvas.toDataURL("image/png"),
          index: r * cols + c,
          row: r,
          col: c,
        });
      }
    }

    setTiles(results);
    setLoading(false);
  };

  const downloadTile = (tile: Tile) => {
    const a = document.createElement("a");
    a.href = tile.url;
    a.download = `tile-${tile.row + 1}-${tile.col + 1}.png`;
    a.click();
  };

  const downloadAll = () => {
    tiles.forEach((tile) => downloadTile(tile));
  };

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
        {imageUrl && (
          <div className="mt-4">
            <img src={imageUrl} alt="Source" className="max-w-md rounded border border-surface-200 dark:border-surface-700" />
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              {image?.width} x {image?.height} px
            </p>
          </div>
        )}
      </div>

      {image && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">Split Settings</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Rows</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
                className="input-field"
                min={1}
                max={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Columns</label>
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
                className="input-field"
                min={1}
                max={20}
              />
            </div>
          </div>

          {/* Grid overlay preview */}
          <div className="mb-4">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Grid Preview</p>
            <div className="relative inline-block">
              <img src={imageUrl!} alt="Grid preview" className="max-w-md rounded border border-surface-200 dark:border-surface-700" />
              <div className="absolute inset-0 pointer-events-none">
                {/* Vertical lines */}
                {Array.from({ length: cols - 1 }, (_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 border-l-2 border-red-500 border-dashed"
                    style={{ left: `${((i + 1) / cols) * 100}%` }}
                  />
                ))}
                {/* Horizontal lines */}
                {Array.from({ length: rows - 1 }, (_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 border-t-2 border-red-500 border-dashed"
                    style={{ top: `${((i + 1) / rows) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={split} className="btn-primary" disabled={loading}>
              {loading ? "Splitting..." : "Split Image"}
            </button>
            {tiles.length > 0 && (
              <button onClick={downloadAll} className="btn-secondary">Download All</button>
            )}
          </div>
        </div>
      )}

      {tiles.length > 0 && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">
            Split Tiles ({tiles.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tiles.map((tile) => (
              <div key={tile.index} className="text-center">
                <img
                  src={tile.url}
                  alt={`Tile ${tile.row + 1}-${tile.col + 1}`}
                  className="w-full rounded border border-surface-200 dark:border-surface-700 mb-2"
                />
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">
                  Row {tile.row + 1}, Col {tile.col + 1}
                </p>
                <button onClick={() => downloadTile(tile)} className="btn-secondary text-xs">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
