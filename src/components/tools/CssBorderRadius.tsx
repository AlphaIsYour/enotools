"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CopyButton } from "@/components/CopyButton";

interface Corners {
  tlh: number;
  tlv: number;
  trh: number;
  trv: number;
  brh: number;
  brv: number;
  blh: number;
  blv: number;
}

const defaultCorners: Corners = {
  tlh: 16,
  tlv: 16,
  trh: 16,
  trv: 16,
  brh: 16,
  brv: 16,
  blh: 16,
  blv: 16,
};

type Preset = { name: string; corners: Corners };

const presets: Preset[] = [
  {
    name: "Circle",
    corners: { tlh: 50, tlv: 50, trh: 50, trv: 50, brh: 50, brv: 50, blh: 50, blv: 50 },
  },
  {
    name: "Pill",
    corners: { tlh: 9999, tlv: 9999, trh: 9999, trv: 9999, brh: 9999, brv: 9999, blh: 9999, blv: 9999 },
  },
  {
    name: "Rounded Card",
    corners: { tlh: 16, tlv: 16, trh: 16, trv: 16, brh: 4, brv: 4, blh: 4, blv: 4 },
  },
  {
    name: "Leaf",
    corners: { tlh: 0, tlv: 50, trh: 50, trv: 0, brh: 0, brv: 50, blh: 50, blv: 0 },
  },
  {
    name: "Blob",
    corners: { tlh: 30, tlv: 70, trh: 70, trv: 30, brh: 30, brv: 70, blh: 70, blv: 30 },
  },
];

export default function CssBorderRadius() {
  const [corners, setCorners] = useState<Corners>({ ...defaultCorners });
  const [linked, setLinked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [boxSize, setBoxSize] = useState(240);
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [dragging, setDragging] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const updateCorner = useCallback(
    (key: keyof Corners, value: number) => {
      if (linked) {
        setCorners({
          tlh: value,
          tlv: value,
          trh: value,
          trv: value,
          brh: value,
          brv: value,
          blh: value,
          blv: value,
        });
      } else {
        setCorners((prev) => ({ ...prev, [key]: value }));
      }
    },
    [linked]
  );

  const applyPreset = (preset: Preset) => {
    setLinked(false);
    setCorners({ ...preset.corners });
  };

  const handleMouseDown = useCallback((handle: string) => {
    setDragging(handle);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const half = rect.width / 2;
      const halfH = rect.height / 2;

      const getVal = (posX: number, posY: number) => {
        const x = Math.max(0, Math.min(half, posX));
        const y = Math.max(0, Math.min(halfH, posY));
        return Math.round(
          unit === "px"
            ? Math.max(x, y)
            : (Math.max(x, y) / half) * 100
        );
      };

      switch (dragging) {
        case "tl": {
          const x = rect.left + half - e.clientX;
          const y = rect.top + half - e.clientY;
          const v = getVal(x, y);
          setCorners((prev) => (linked ? { ...prev, tlh: v, tlv: v, trh: v, trv: v, brh: v, brv: v, blh: v, blv: v } : { ...prev, tlh: v, tlv: v }));
          break;
        }
        case "tr": {
          const x = e.clientX - (rect.left + half);
          const y = rect.top + half - e.clientY;
          const v = getVal(x, y);
          setCorners((prev) => (linked ? { ...prev, tlh: v, tlv: v, trh: v, trv: v, brh: v, brv: v, blh: v, blv: v } : { ...prev, trh: v, trv: v }));
          break;
        }
        case "br": {
          const x = e.clientX - (rect.left + half);
          const y = e.clientY - (rect.top + half);
          const v = getVal(x, y);
          setCorners((prev) => (linked ? { ...prev, tlh: v, tlv: v, trh: v, trv: v, brh: v, brv: v, blh: v, blv: v } : { ...prev, brh: v, brv: v }));
          break;
        }
        case "bl": {
          const x = rect.left + half - e.clientX;
          const y = e.clientY - (rect.top + half);
          const v = getVal(x, y);
          setCorners((prev) => (linked ? { ...prev, tlh: v, tlv: v, trh: v, trv: v, brh: v, brv: v, blh: v, blv: v } : { ...prev, blh: v, blv: v }));
          break;
        }
      }
    },
    [dragging, linked, unit]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const borderRadiusValue = `${corners.tlh}${unit} ${corners.trh}${unit} ${corners.brh}${unit} ${corners.blh}${unit} / ${corners.tlv}${unit} ${corners.trv}${unit} ${corners.brv}${unit} ${corners.blv}${unit}`;

  const simplifiedRadius = (() => {
    const h = [corners.tlh, corners.trh, corners.brh, corners.blh];
    const v = [corners.tlv, corners.trv, corners.brv, corners.blv];
    const allSame = h.every((x) => x === h[0]) && v.every((x) => x === v[0]) && h[0] === v[0];
    const hSame = h.every((x) => x === h[0]);
    const vSame = v.every((x) => x === v[0]);
    const hvSame = hSame && vSame && h[0] === v[0];

    if (allSame) return `${h[0]}${unit}`;
    if (hvSame) return `${h[0]}${unit}`;
    if (hSame && vSame) return `${h[0]}${unit} / ${v[0]}${unit}`;
    return borderRadiusValue;
  })();

  const cssCode = `border-radius: ${simplifiedRadius};`;

  const CornerInput = ({
    label,
    hKey,
    vKey,
  }: {
    label: string;
    hKey: keyof Corners;
    vKey: keyof Corners;
  }) => (
    <div className="space-y-1">
      <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{label}</span>
      <div className="flex gap-1">
        <input
          type="number"
          value={corners[hKey]}
          onChange={(e) => updateCorner(hKey, Number(e.target.value))}
          className="input-field !w-full text-center text-sm"
          min={0}
          max={unit === "%" ? 50 : 9999}
          title="Horizontal"
          disabled={linked}
        />
        {!linked && (
          <input
            type="number"
            value={corners[vKey]}
            onChange={(e) => updateCorner(vKey, Number(e.target.value))}
            className="input-field !w-full text-center text-sm"
            min={0}
            max={unit === "%" ? 50 : 9999}
            title="Vertical"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls */}
        <div className="flex-1 space-y-4">
          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
              Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="btn-secondary text-xs"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Toggle & Link */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
              <button
                onClick={() => setUnit("px")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  unit === "px"
                    ? "bg-white dark:bg-surface-600 text-surface-800 dark:text-surface-100 shadow-sm"
                    : "text-surface-500 dark:text-surface-400"
                }`}
              >
                px
              </button>
              <button
                onClick={() => setUnit("%")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  unit === "%"
                    ? "bg-white dark:bg-surface-600 text-surface-800 dark:text-surface-100 shadow-sm"
                    : "text-surface-500 dark:text-surface-400"
                }`}
              >
                %
              </button>
            </div>

            <button
              onClick={() => setLinked(!linked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                linked
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400"
              }`}
              title="Link all corners"
            >
              <span>{linked ? "🔗" : "🔓"}</span>
              {linked ? "Linked" : "Unlinked"}
            </button>
          </div>

          {/* Corner Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <CornerInput label="Top-Left" hKey="tlh" vKey="tlv" />
            <CornerInput label="Top-Right" hKey="trh" vKey="trv" />
            <CornerInput label="Bottom-Left" hKey="blh" vKey="blv" />
            <CornerInput label="Bottom-Right" hKey="brh" vKey="brv" />
          </div>

          {/* Preview Settings */}
          <div className="flex gap-3">
            <div className="space-y-1 flex-1">
              <label className="text-sm text-surface-600 dark:text-surface-300">Size</label>
              <input
                type="range"
                min={120}
                max={400}
                value={boxSize}
                onChange={(e) => setBoxSize(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-surface-600 dark:text-surface-300">Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-9 rounded cursor-pointer border border-surface-200 dark:border-surface-600"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview & Output */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-center min-h-[320px] bg-surface-50 dark:bg-surface-900 rounded-lg p-8">
            <div
              ref={previewRef}
              className="relative cursor-pointer select-none"
              style={{
                width: boxSize,
                height: boxSize,
                backgroundColor: bgColor,
                borderRadius: borderRadiusValue,
              }}
            >
              {/* Drag handles */}
              {(
                [
                  ["tl", "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize"],
                  ["tr", "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize"],
                  ["bl", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize"],
                  ["br", "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize"],
                ] as const
              ).map(([id, cls]) => (
                <div
                  key={id}
                  onMouseDown={() => handleMouseDown(id)}
                  className={`absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md z-10 ${cls}`}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">Generated CSS</span>
              <CopyButton text={cssCode} />
            </div>
            <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
