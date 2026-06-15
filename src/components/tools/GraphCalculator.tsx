"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type GraphMode = "cartesian" | "parametric" | "polar";

interface FunctionEntry {
  id: number;
  expr: string;
  color: string;
  visible: boolean;
}

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

// ── Simple expression evaluator ─────────────────────────────────────────
function safeEval(expr: string, vars: Record<string, number>): number {
  // Replace constants
  let processed = expr
    .replace(/\bpi\b/g, `(${Math.PI})`)
    .replace(/\be\b/g, `(${Math.E})`);

  // Replace functions with Math equivalents
  const funcMap: Record<string, string> = {
    sin: "Math.sin",
    cos: "Math.cos",
    tan: "Math.tan",
    asin: "Math.asin",
    acos: "Math.acos",
    atan: "Math.atan",
    sqrt: "Math.sqrt",
    abs: "Math.abs",
    log: "Math.log10",
    ln: "Math.log",
    exp: "Math.exp",
    floor: "Math.floor",
    ceil: "Math.ceil",
    round: "Math.round",
  };

  for (const [fn, mathFn] of Object.entries(funcMap)) {
    processed = processed.replace(new RegExp(`\\b${fn}\\b`, "g"), mathFn);
  }

  // Replace ^ with **
  processed = processed.replace(/\^/g, "**");

  // Replace variable values
  for (const [name, val] of Object.entries(vars)) {
    processed = processed.replace(new RegExp(`\\b${name}\\b`, "g"), `(${val})`);
  }

  // Safety check: only allow Math, numbers, operators, parens
  if (/[a-zA-Z_$]/.test(processed.replace(/Math\.\w+/g, ""))) {
    throw new Error("Invalid expression");
  }

  // eslint-disable-next-line no-eval
  const result = Function(`"use strict"; return (${processed})`)();
  if (typeof result !== "number" || !isFinite(result)) return NaN;
  return result;
}

// ── Canvas drawing ──────────────────────────────────────────────────────
interface ViewBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function drawGraph(
  canvas: HTMLCanvasElement,
  functions: FunctionEntry[],
  viewBox: ViewBox,
  mode: GraphMode,
  mousePos: { x: number; y: number } | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("color-scheme") === "dark"
    ? "#1e1e2e"
    : "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const { xMin, xMax, yMin, yMax } = viewBox;
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const toScreenX = (x: number) => ((x - xMin) / xRange) * W;
  const toScreenY = (y: number) => H - ((y - yMin) / yRange) * H;
  const toMathX = (sx: number) => (sx / W) * xRange + xMin;
  const toMathY = (sy: number) => -((sy / H) * yRange - yMin);

  // Grid
  const gridColor = "rgba(148, 163, 184, 0.2)";
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  // Calculate nice grid spacing
  const xStep = niceStep(xRange / 10);
  const yStep = niceStep(yRange / 10);

  ctx.font = `${11 * dpr}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(100, 116, 139, 0.8)";

  // Vertical grid lines
  const xStart = Math.ceil(xMin / xStep) * xStep;
  for (let x = xStart; x <= xMax; x += xStep) {
    const sx = toScreenX(x);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, H);
    ctx.stroke();
    ctx.fillText(x.toFixed(2), sx + 4, H - 4);
  }

  // Horizontal grid lines
  const yStart = Math.ceil(yMin / yStep) * yStep;
  for (let y = yStart; y <= yMax; y += yStep) {
    const sy = toScreenY(y);
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(W, sy);
    ctx.stroke();
    if (Math.abs(y) > yStep * 0.01) {
      ctx.fillText(y.toFixed(2), 4, sy - 4);
    }
  }

  // Axes
  ctx.strokeStyle = "rgba(100, 116, 139, 0.6)";
  ctx.lineWidth = 1.5;

  // X-axis
  if (yMin <= 0 && yMax >= 0) {
    const sy = toScreenY(0);
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(W, sy);
    ctx.stroke();
  }

  // Y-axis
  if (xMin <= 0 && xMax >= 0) {
    const sx = toScreenX(0);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, H);
    ctx.stroke();
  }

  // Plot functions
  for (const fn of functions) {
    if (!fn.visible || !fn.expr.trim()) continue;

    ctx.strokeStyle = fn.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;
    const steps = W;

    try {
      if (mode === "cartesian") {
        for (let i = 0; i <= steps; i++) {
          const x = toMathX(i);
          const y = safeEval(fn.expr, { x });
          if (isNaN(y)) { started = false; continue; }
          const sy = toScreenY(y);
          if (!started) { ctx.moveTo(i, sy); started = true; }
          else ctx.lineTo(i, sy);
        }
      } else if (mode === "polar") {
        // Polar: r = f(theta), theta from 0 to 2*pi
        const thetaSteps = steps * 2;
        for (let i = 0; i <= thetaSteps; i++) {
          const theta = (i / thetaSteps) * 2 * Math.PI;
          const r = safeEval(fn.expr, { theta, t: theta });
          if (isNaN(r)) { started = false; continue; }
          const x = r * Math.cos(theta);
          const y = r * r * Math.sin(theta) / r || r * Math.sin(theta);
          const sx = toScreenX(x);
          const sy = toScreenY(y);
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else ctx.lineTo(sx, sy);
        }
      } else if (mode === "parametric") {
        // Parametric: x(t), y(t) separated by semicolon
        const parts = fn.expr.split(";");
        if (parts.length !== 2) continue;
        const xExpr = parts[0].trim();
        const yExpr = parts[1].trim();
        const tSteps = steps * 2;
        const tMin = 0;
        const tMax = 2 * Math.PI;
        for (let i = 0; i <= tSteps; i++) {
          const t = tMin + (i / tSteps) * (tMax - tMin);
          const x = safeEval(xExpr, { t });
          const y = safeEval(yExpr, { t });
          if (isNaN(x) || isNaN(y)) { started = false; continue; }
          const sx = toScreenX(x);
          const sy = toScreenY(y);
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else ctx.lineTo(sx, sy);
        }
      }
    } catch {
      // Skip invalid functions
    }

    ctx.stroke();
  }

  // Mouse crosshair and coordinates
  if (mousePos) {
    const { x: mx, y: my } = mousePos;
    const mathX = toMathX(mx);
    const mathY = toMathY(my);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(mx, 0);
    ctx.lineTo(mx, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, my);
    ctx.lineTo(W, my);
    ctx.stroke();

    ctx.setLineDash([]);

    // Label
    ctx.font = `bold ${12 * dpr}px monospace`;
    ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
    const label = `(${mathX.toFixed(3)}, ${mathY.toFixed(3)})`;
    const textW = ctx.measureText(label).width;
    const lx = mx + 10 + textW > W ? mx - textW - 10 : mx + 10;
    const ly = my - 10 < 0 ? my + 20 : my - 10;
    ctx.fillText(label, lx, ly);
  }
}

function niceStep(rough: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  if (norm < 1.5) return pow;
  if (norm < 3.5) return 2 * pow;
  if (norm < 7.5) return 5 * pow;
  return 10 * pow;
}

// ── Component ───────────────────────────────────────────────────────────
export default function GraphCalculator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<GraphMode>("cartesian");
  const [nextId, setNextId] = useState(1);
  const [functions, setFunctions] = useState<FunctionEntry[]>([
    { id: 0, expr: "x^2", color: COLORS[0], visible: true },
  ]);
  const [viewBox, setViewBox] = useState<ViewBox>({
    xMin: -10, xMax: 10, yMin: -10, yMax: 10,
  });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; vb: ViewBox } | null>(null);

  const addFunction = () => {
    const id = nextId;
    setNextId(id + 1);
    setFunctions((prev) => [
      ...prev,
      { id, expr: "", color: COLORS[id % COLORS.length], visible: true },
    ]);
  };

  const removeFunction = (id: number) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const updateExpr = (id: number, expr: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, expr } : f))
    );
  };

  const toggleVisible = (id: number) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  const zoomIn = () => {
    setViewBox((vb) => {
      const cx = (vb.xMin + vb.xMax) / 2;
      const cy = (vb.yMin + vb.yMax) / 2;
      const xr = (vb.xMax - vb.xMin) / 4;
      const yr = (vb.yMax - vb.yMin) / 4;
      return { xMin: cx - xr, xMax: cx + xr, yMin: cy - yr, yMax: cy + yr };
    });
  };

  const zoomOut = () => {
    setViewBox((vb) => {
      const cx = (vb.xMin + vb.xMax) / 2;
      const cy = (vb.yMin + vb.yMax) / 2;
      const xr = (vb.xMax - vb.xMin);
      const yr = (vb.yMax - vb.yMin);
      return { xMin: cx - xr, xMax: cx + xr, yMin: cy - yr, yMax: cy + yr };
    });
  };

  const resetView = () => {
    setViewBox({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  };

  // Draw on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawGraph(canvas, functions, viewBox, mode, mousePos);
  }, [functions, viewBox, mode, mousePos]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPanning && panStart.current) {
      const dx = x - panStart.current.x;
      const dy = y - panStart.current.y;
      const vb = panStart.current.vb;
      const xScale = (vb.xMax - vb.xMin) / rect.width;
      const yScale = (vb.yMax - vb.yMin) / rect.height;
      setViewBox({
        xMin: vb.xMin - dx * xScale,
        xMax: vb.xMax - dx * xScale,
        yMin: vb.yMin + dy * yScale,
        yMax: vb.yMax + dy * yScale,
      });
    } else {
      setMousePos({ x, y });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsPanning(true);
    panStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      vb: { ...viewBox },
    };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox((vb) => {
      const cx = (vb.xMin + vb.xMax) / 2;
      const cy = (vb.yMin + vb.yMax) / 2;
      const xr = ((vb.xMax - vb.xMin) / 2) * factor;
      const yr = ((vb.yMax - vb.yMin) / 2) * factor;
      return { xMin: cx - xr, xMax: cx + xr, yMin: cy - yr, yMax: cy + yr };
    });
  };

  const getPlaceholder = () => {
    switch (mode) {
      case "cartesian": return "x^2, sin(x), 2*x+1";
      case "parametric": return "cos(t); sin(t)  (x; y)";
      case "polar": return "1 + cos(theta)";
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
          {(["cartesian", "parametric", "polar"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Functions
            </h3>
            {functions.map((fn) => (
              <div key={fn.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleVisible(fn.id)}
                  className="w-6 h-6 rounded-full border-2 flex-shrink-0 transition-opacity"
                  style={{
                    borderColor: fn.color,
                    backgroundColor: fn.visible ? fn.color : "transparent",
                    opacity: fn.visible ? 1 : 0.4,
                  }}
                />
                <input
                  type="text"
                  className="input-field flex-1 font-mono text-sm"
                  value={fn.expr}
                  onChange={(e) => updateExpr(fn.id, e.target.value)}
                  placeholder={getPlaceholder()}
                />
                {functions.length > 1 && (
                  <button
                    onClick={() => removeFunction(fn.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            <button onClick={addFunction} className="btn-secondary w-full text-sm">
              + Add Function
            </button>
          </div>

          {/* Range controls */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              View Range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  X Min
                </label>
                <input
                  type="number"
                  className="input-field text-sm font-mono"
                  value={viewBox.xMin}
                  onChange={(e) => setViewBox((vb) => ({ ...vb, xMin: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  X Max
                </label>
                <input
                  type="number"
                  className="input-field text-sm font-mono"
                  value={viewBox.xMax}
                  onChange={(e) => setViewBox((vb) => ({ ...vb, xMax: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Y Min
                </label>
                <input
                  type="number"
                  className="input-field text-sm font-mono"
                  value={viewBox.yMin}
                  onChange={(e) => setViewBox((vb) => ({ ...vb, yMin: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Y Max
                </label>
                <input
                  type="number"
                  className="input-field text-sm font-mono"
                  value={viewBox.yMax}
                  onChange={(e) => setViewBox((vb) => ({ ...vb, yMax: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={zoomIn} className="btn-secondary flex-1 text-sm">Zoom +</button>
              <button onClick={zoomOut} className="btn-secondary flex-1 text-sm">Zoom -</button>
              <button onClick={resetView} className="btn-secondary flex-1 text-sm">Reset</button>
            </div>
          </div>

          {/* Mode hints */}
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-2">
              {mode === "cartesian" && "Cartesian Mode"}
              {mode === "parametric" && "Parametric Mode"}
              {mode === "polar" && "Polar Mode"}
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {mode === "cartesian" && "Enter f(x) expressions like x^2, sin(x), ln(x), exp(x). Variable is x."}
              {mode === "parametric" && "Enter x(t); y(t) separated by semicolon. Variable is t (0 to 2pi). Example: cos(t); sin(t)"}
              {mode === "polar" && "Enter r(theta) expression. Variable is theta (0 to 2pi). Example: 1 + cos(theta)"}
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">
              Pan: click and drag. Zoom: scroll wheel or buttons.
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-2">
          <div
            ref={containerRef}
            className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden"
            style={{ height: 500 }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { handleMouseUp(); setMousePos(null); }}
              onWheel={handleWheel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
