"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Eraser, Hand, Maximize2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WindowControls } from "@/components/window-controls";
import { useWindowNavBehavior } from "@/lib/use-window-nav-behavior";
import { createClient } from "@/utils/supabase/client";

const COLS = 500;
const ROWS = 500;
const BASE_CELL = 20;       // logical px per cell
const MIN_ZOOM = 0.04;
const MAX_ZOOM = 16;
const GRID_LINE_COLOR = "#D1D1D6";
const EMPTY_COLOR = "#FFFFFF";

const PALETTE = [
  "#000000", "#3A3A3C", "#8E8E93",
  "#FF3B30", "#FF9500", "#FFCC00",
  "#34C759", "#5AC8FA", "#007AFF",
  "#AF52DE", "#FF2D55", "#FFFFFF",
];

type CellGrid = Record<string, string>;

function cellKey(col: number, row: number) { return `${col},${row}`; }

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function fitAndCenter(canvasW: number, canvasH: number) {
  const z = clamp(
    Math.min(canvasW / (COLS * BASE_CELL), canvasH / (ROWS * BASE_CELL)),
    MIN_ZOOM,
    MAX_ZOOM
  );
  return {
    zoom: z,
    panX: (canvasW - COLS * BASE_CELL * z) / 2,
    panY: (canvasH - ROWS * BASE_CELL * z) / 2,
  };
}

interface CanvasAppProps {
  isMobile?: boolean;
  inShell?: boolean;
}

export function CanvasApp({ isMobile = false, inShell = false }: CanvasAppProps) {
  const nav = useWindowNavBehavior({ isDesktop: inShell, isMobile });

  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const gridRef        = useRef<CellGrid>({});
  const pendingRef     = useRef<Map<string, string | null>>(new Map());
  const flushTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transform (refs for zero-latency event handlers)
  const zoomRef        = useRef(1);
  const panXRef        = useRef(0);
  const panYRef        = useRef(0);
  const initializedRef = useRef(false);

  // Interaction state
  const isPanModeRef   = useRef(false);
  const isPanningRef   = useRef(false);
  const lastPanPtRef   = useRef({ x: 0, y: 0 });
  const isDrawingRef   = useRef(false);
  const paintColorRef  = useRef("#000000");
  const lastCellRef    = useRef<string | null>(null);

  // React state for toolbar only
  const [color, setColor]         = useState("#000000");
  const [isEraser, setIsEraser]   = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [zoomPct, setZoomPct]     = useState(100);

  // ── Full redraw (viewport-culled for 500×500 performance) ──
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const z  = zoomRef.current;
    const px = panXRef.current;
    const py = panYRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(z, z);

    const c0 = Math.max(0,    Math.floor(-px / z / BASE_CELL));
    const c1 = Math.min(COLS, Math.ceil((canvas.width  - px) / z / BASE_CELL) + 1);
    const r0 = Math.max(0,    Math.floor(-py / z / BASE_CELL));
    const r1 = Math.min(ROWS, Math.ceil((canvas.height - py) / z / BASE_CELL) + 1);

    if (c1 <= c0 || r1 <= r0) { ctx.restore(); return; }

    const cellPx = BASE_CELL * z;

    if (cellPx >= 2) {
      ctx.fillStyle = GRID_LINE_COLOR;
      ctx.fillRect(c0 * BASE_CELL, r0 * BASE_CELL,
        (c1 - c0) * BASE_CELL, (r1 - r0) * BASE_CELL);

      for (let r = r0; r < r1; r++) {
        for (let c = c0; c < c1; c++) {
          ctx.fillStyle = gridRef.current[cellKey(c, r)] ?? EMPTY_COLOR;
          ctx.fillRect(c * BASE_CELL + 0.5, r * BASE_CELL + 0.5, BASE_CELL - 1, BASE_CELL - 1);
        }
      }
    } else {
      ctx.fillStyle = EMPTY_COLOR;
      ctx.fillRect(c0 * BASE_CELL, r0 * BASE_CELL,
        (c1 - c0) * BASE_CELL, (r1 - r0) * BASE_CELL);

      for (const [key, cellColor] of Object.entries(gridRef.current)) {
        const comma = key.indexOf(",");
        const col   = +key.slice(0, comma);
        const row   = +key.slice(comma + 1);
        if (col >= c0 && col < c1 && row >= r0 && row < r1) {
          ctx.fillStyle = cellColor;
          ctx.fillRect(col * BASE_CELL, row * BASE_CELL, BASE_CELL, BASE_CELL);
        }
      }
    }

    ctx.restore();
  }, []);

  // ── Render a single cell directly to canvas ─────────────────
  const renderCell = useCallback((col: number, row: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.translate(panXRef.current, panYRef.current);
    ctx.scale(zoomRef.current, zoomRef.current);
    ctx.fillStyle = fillColor;
    ctx.fillRect(
      col * BASE_CELL + 0.5,
      row * BASE_CELL + 0.5,
      BASE_CELL - 1,
      BASE_CELL - 1
    );
    ctx.restore();
  }, []);

  // ── Flush pending cell writes to Supabase ───────────────────
  const flushPending = useCallback(async () => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    if (!pendingRef.current.size) return;

    const batch = new Map(pendingRef.current);
    pendingRef.current.clear();

    const upserts: { cell_key: string; col: number; row: number; color: string }[] = [];
    const deleteKeys: string[] = [];

    for (const [key, c] of batch) {
      if (c === null) {
        deleteKeys.push(key);
      } else {
        const comma = key.indexOf(",");
        upserts.push({ cell_key: key, col: +key.slice(0, comma), row: +key.slice(comma + 1), color: c });
      }
    }

    const supabase = createClient();
    if (upserts.length) {
      await supabase.from("canvas_cells").upsert(upserts, { onConflict: "cell_key" });
    }
    if (deleteKeys.length) {
      await supabase.from("canvas_cells").delete().in("cell_key", deleteKeys);
    }
  }, []);

  const schedulePendingFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushPending, 500);
  }, [flushPending]);

  // ── Paint one cell (local-first, queued DB write) ────────────
  const paintCell = useCallback((col: number, row: number, paintColor: string) => {
    const key     = cellKey(col, row);
    const isErase = paintColor === EMPTY_COLOR;

    if (isErase) {
      if (!gridRef.current[key]) return;
      delete gridRef.current[key];
    } else {
      if (gridRef.current[key] === paintColor) return;
      gridRef.current[key] = paintColor;
    }

    renderCell(col, row, isErase ? EMPTY_COLOR : paintColor);
    pendingRef.current.set(key, isErase ? null : paintColor);
    schedulePendingFlush();
  }, [renderCell, schedulePendingFlush]);

  // ── Load canvas state from Supabase on mount ─────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const supabase = createClient();

    async function loadCanvas() {
      const PAGE_SIZE = 1000;
      let offset = 0;

      while (true) {
        const { data, error } = await supabase
          .from("canvas_cells")
          .select("cell_key, color")
          .range(offset, offset + PAGE_SIZE - 1);

        if (error || !data || data.length === 0) break;

        for (const { cell_key, color } of data) {
          gridRef.current[cell_key] = color;
        }

        if (data.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }

      redraw();
    }

    loadCanvas();
  }, []);

  // ── Realtime: mirror other visitors' strokes ─────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("canvas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "canvas_cells" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const key = (payload.old as { cell_key: string }).cell_key;
            if (!gridRef.current[key]) return;
            delete gridRef.current[key];
            const comma = key.indexOf(",");
            renderCell(+key.slice(0, comma), +key.slice(comma + 1), EMPTY_COLOR);
          } else {
            const { cell_key, color } = payload.new as { cell_key: string; color: string };
            if (gridRef.current[cell_key] === color) return; // own echo — skip
            gridRef.current[cell_key] = color;
            const comma = cell_key.indexOf(",");
            renderCell(+cell_key.slice(0, comma), +cell_key.slice(comma + 1), color);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Sync canvas size to container ───────────────────────────
  const syncSize = useCallback(() => {
    const el     = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const { width, height } = el.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    canvas.width  = Math.floor(width);
    canvas.height = Math.floor(height);

    if (!initializedRef.current) {
      const { zoom, panX, panY } = fitAndCenter(canvas.width, canvas.height);
      zoomRef.current = zoom;
      panXRef.current = panX;
      panYRef.current = panY;
      setZoomPct(Math.round(zoom * 100));
      initializedRef.current = true;
    }
    redraw();
  }, [redraw]);

  useEffect(() => {
    syncSize();
    const obs = new ResizeObserver(syncSize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [syncSize]);

  // ── Canvas → grid cell ───────────────────────────────────────
  const getCell = useCallback((e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const lx   = (e.clientX - rect.left  - panXRef.current) / zoomRef.current;
    const ly   = (e.clientY - rect.top   - panYRef.current) / zoomRef.current;
    const col  = Math.floor(lx / BASE_CELL);
    const row  = Math.floor(ly / BASE_CELL);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return { col, row };
  }, []);

  // ── Pointer events ───────────────────────────────────────────
  const onDown = useCallback((e: PointerEvent) => {
    const pan = isPanModeRef.current || e.button === 1;
    if (pan) {
      e.preventDefault();
      canvasRef.current?.setPointerCapture(e.pointerId);
      isPanningRef.current  = true;
      lastPanPtRef.current  = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    isDrawingRef.current   = true;
    paintColorRef.current  = isEraser ? EMPTY_COLOR : color;
    lastCellRef.current    = null;
    const cell = getCell(e);
    if (cell) {
      paintCell(cell.col, cell.row, paintColorRef.current);
      lastCellRef.current = cellKey(cell.col, cell.row);
    }
  }, [getCell, paintCell, color, isEraser]);

  const onMove = useCallback((e: PointerEvent) => {
    if (isPanningRef.current) {
      panXRef.current += e.clientX - lastPanPtRef.current.x;
      panYRef.current += e.clientY - lastPanPtRef.current.y;
      lastPanPtRef.current = { x: e.clientX, y: e.clientY };
      redraw();
      return;
    }
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const cell = getCell(e);
    if (!cell) return;
    const key = cellKey(cell.col, cell.row);
    if (key === lastCellRef.current) return;
    lastCellRef.current = key;
    paintCell(cell.col, cell.row, paintColorRef.current);
  }, [getCell, paintCell, redraw]);

  const onUp = useCallback(() => {
    isPanningRef.current = false;
    isDrawingRef.current = false;
    lastCellRef.current  = null;
    flushPending();
  }, [flushPending]);

  // Scroll-wheel zoom, centered on cursor position
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20;
    if (e.deltaMode === 2) delta *= 400;

    const rect    = canvas.getBoundingClientRect();
    const cx      = e.clientX - rect.left;
    const cy      = e.clientY - rect.top;
    const oldZoom = zoomRef.current;
    const newZoom = clamp(oldZoom * Math.exp(-delta * 0.001), MIN_ZOOM, MAX_ZOOM);
    const ratio   = newZoom / oldZoom;

    panXRef.current = cx - (cx - panXRef.current) * ratio;
    panYRef.current = cy - (cy - panYRef.current) * ratio;
    zoomRef.current = newZoom;
    setZoomPct(Math.round(newZoom * 100));
    redraw();
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("pointerdown",   onDown);
    canvas.addEventListener("pointermove",   onMove);
    canvas.addEventListener("pointerup",     onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel",         onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("pointerdown",   onDown);
      canvas.removeEventListener("pointermove",   onMove);
      canvas.removeEventListener("pointerup",     onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel",         onWheel);
    };
  }, [onDown, onMove, onUp, onWheel]);

  // ── Toolbar actions ──────────────────────────────────────────
  const handleFitZoom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { zoom, panX, panY } = fitAndCenter(canvas.width, canvas.height);
    zoomRef.current = zoom;
    panXRef.current = panX;
    panYRef.current = panY;
    setZoomPct(Math.round(zoom * 100));
    redraw();
  }, [redraw]);

  const applyZoom = useCallback((factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx      = canvas.width  / 2;
    const cy      = canvas.height / 2;
    const oldZoom = zoomRef.current;
    const newZoom = clamp(oldZoom * factor, MIN_ZOOM, MAX_ZOOM);
    const ratio   = newZoom / oldZoom;
    panXRef.current = cx - (cx - panXRef.current) * ratio;
    panYRef.current = cy - (cy - panYRef.current) * ratio;
    zoomRef.current = newZoom;
    setZoomPct(Math.round(newZoom * 100));
    redraw();
  }, [redraw]);

  const togglePanMode = useCallback(() => {
    const next = !isPanModeRef.current;
    isPanModeRef.current = next;
    setIsPanMode(next);
  }, []);

  const effectiveColor = isEraser ? EMPTY_COLOR : color;

  return (
    <div className="flex flex-col h-full bg-white select-none">

      {/* ── Toolbar ── */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 border-b border-[#E5E5EA] bg-[#F8F8F8] flex-shrink-0",
          isMobile ? "py-1.5 gap-1.5" : "py-2"
        )}
        onMouseDown={nav.onDragStart}
      >
        <div onMouseDown={(e) => e.stopPropagation()} className="flex-shrink-0">
          <WindowControls
            inShell={nav.inShell}
            onClose={nav.onClose}
            onMinimize={nav.onMinimize}
            onToggleMaximize={nav.onToggleMaximize}
            isMaximized={nav.isMaximized}
          />
        </div>

        <div className="w-px h-5 bg-[#D1D1D6] mx-0.5 flex-shrink-0" />

        {/* Color palette */}
        <div className="flex items-center gap-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              style={{ backgroundColor: c }}
              className={cn(
                "w-5 h-5 rounded-full flex-shrink-0 transition-all",
                c === "#FFFFFF" && "border border-gray-300",
                !isEraser && color === c
                  ? "ring-2 ring-offset-1 ring-gray-500 scale-110"
                  : "hover:scale-105 active:scale-95"
              )}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-[#D1D1D6] mx-0.5 flex-shrink-0" />

        {/* Draw tools */}
        <div className="flex items-center gap-1 flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsEraser((v) => !v)}
            title="Eraser"
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
              isEraser ? "bg-[#1C1C1E] text-white" : "text-[#3C3C3E] hover:bg-[#E5E5EA]"
            )}
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Pan + zoom on right */}
        <div
          className="flex items-center gap-1 flex-shrink-0 ml-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={togglePanMode}
            title="Pan mode — or hold middle mouse button to pan anytime"
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
              isPanMode ? "bg-[#1C1C1E] text-white" : "text-[#3C3C3E] hover:bg-[#E5E5EA]"
            )}
          >
            <Hand className="w-4 h-4" />
          </button>

          <button
            onClick={handleFitZoom}
            title="Fit canvas to window"
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#3C3C3E] hover:bg-[#E5E5EA] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Zoom − / % / + */}
          <div className="flex items-center rounded-md overflow-hidden border border-[#D1D1D6] bg-white h-7">
            <button
              onClick={() => applyZoom(1 / 1.25)}
              title="Zoom out"
              className="w-6 h-full flex items-center justify-center text-[#3C3C3E] hover:bg-[#E5E5EA] transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={handleFitZoom}
              title="Reset to fit"
              className="text-[10px] text-[#3C3C3E] w-10 text-center tabular-nums hover:bg-[#E5E5EA] h-full transition-colors"
            >
              {zoomPct}%
            </button>
            <button
              onClick={() => applyZoom(1.25)}
              title="Zoom in"
              className="w-6 h-full flex items-center justify-center text-[#3C3C3E] hover:bg-[#E5E5EA] transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Active color swatch */}
          <div
            className={cn(
              "w-4 h-4 rounded-sm flex-shrink-0 border ml-0.5",
              effectiveColor === "#FFFFFF" ? "border-gray-300" : "border-transparent"
            )}
            style={{ backgroundColor: effectiveColor }}
          />
        </div>
      </div>

      {/* ── Canvas ── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#D1D1D6]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{
            cursor: isPanMode ? "grab" : (isEraser ? "cell" : "crosshair"),
            touchAction: "none",
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}
