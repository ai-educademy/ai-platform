"use client";

import { useState, useCallback, useRef, useEffect, memo, type MouseEvent as RMouseEvent } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { DynamicTranslate } from "@/lib/i18n-utils";
import type { Shape, Arrow, ShapeKind, CanvasData, Snapshot, SavedCanvas } from "./types";
import { COLORS, PALETTE, W, H, uid, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from "./types";
import { getUserKey, loadCanvases, saveCanvases } from "./canvasStorage";
import { ShapeSVG } from "./ShapeSVG";
import { CanvasPicker } from "./CanvasPicker";
import { CanvasToolbar } from "./CanvasToolbar";
import { ShapeEditors } from "./ShapeEditors";

/* ── main component ───────────────────────────────────────────── */
export const SystemDesignCanvas = memo(() => {
  const { data: authSession } = useSession();
  const tp = useTranslations("lab.playground");
  const tpd = tp as unknown as DynamicTranslate;
  const userKeyRef = useRef("");

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [_history, setHistory] = useState<Snapshot[]>([]);
  const [activeTool, setActiveTool] = useState<ShapeKind | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editingArrowId, setEditingArrowId] = useState<string | null>(null);
  const [arrowEditText, setArrowEditText] = useState("");
  const dragRef = useRef<{ id: string; ox: number; oy: number; moved: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* zoom & pan state */
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  /* saved canvases */
  const [savedList, setSavedList] = useState<SavedCanvas[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);

  /* load saved canvases on mount */
  useEffect(() => {
    const key = getUserKey(authSession);
    userKeyRef.current = key;
    const list = loadCanvases(key);
    setSavedList(list);
    // If there are saved canvases, don't auto-load - show picker
    if (list.length > 0) {
      setShowPicker(true);
    }
  }, [authSession]);

  /* auto-save debounce */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!activeCanvasId) return;
    if (shapes.length === 0 && arrows.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const key = userKeyRef.current;
      const list = loadCanvases(key);
      const idx = list.findIndex((c) => c.id === activeCanvasId);
      const data: CanvasData = { shapes, arrows };
      if (idx >= 0) {
        list[idx].data = data;
        list[idx].updatedAt = new Date().toISOString();
      } else {
        list.push({ id: activeCanvasId, name: `Design ${list.length + 1}`, data, updatedAt: new Date().toISOString() });
      }
      saveCanvases(key, list);
      setSavedList(list);
      setSaveIndicator(tp("saved"));
      setTimeout(() => setSaveIndicator(null), 1500);
    }, 800);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [shapes, arrows, activeCanvasId, tp]);

  /* start a new blank canvas */
  const newCanvas = useCallback(() => {
    const id = `canvas-${Date.now()}`;
    setActiveCanvasId(id);
    setShapes([]);
    setArrows([]);
    setHistory([]);
    setSelected(null);
    setConnectFrom(null);
    setShowPicker(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* load a saved canvas */
  const loadCanvas = useCallback((c: SavedCanvas) => {
    setActiveCanvasId(c.id);
    setShapes(c.data.shapes || []);
    setArrows(c.data.arrows || []);
    setHistory([]);
    setSelected(null);
    setConnectFrom(null);
    setShowPicker(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* delete a saved canvas */
  const deleteCanvas = useCallback((id: string) => {
    const key = userKeyRef.current;
    const list = loadCanvases(key).filter((c) => c.id !== id);
    saveCanvases(key, list);
    setSavedList(list);
    if (activeCanvasId === id) {
      newCanvas();
    }
  }, [activeCanvasId, newCanvas]);

  /* rename canvas */
  const _renameCanvas = useCallback((id: string, name: string) => {
    const key = userKeyRef.current;
    const list = loadCanvases(key);
    const c = list.find((x) => x.id === id);
    if (c) { c.name = name; saveCanvases(key, list); setSavedList(list); }
  }, []);

  /* save snapshot for undo */
  const pushHistory = useCallback(() => {
    setHistory((h) => [...h.slice(-30), { shapes, arrows }]);
  }, [shapes, arrows]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setShapes(prev.shapes);
      setArrows(prev.arrows);
      return h.slice(0, -1);
    });
  }, []);

  const clearAll = () => {
    pushHistory();
    setShapes([]);
    setArrows([]);
    setSelected(null);
    setConnectFrom(null);
    setEditingId(null);
    setEditingArrowId(null);
  };

  /* SVG coordinates from mouse event (accounting for zoom + pan) */
  const svgPt = (e: RMouseEvent | globalThis.MouseEvent) => {
    const wrap = wrapRef.current!;
    const r = wrap.getBoundingClientRect();
    return {
      x: (e.clientX - r.left - pan.x) / zoom,
      y: (e.clientY - r.top - pan.y) / zoom,
    };
  };

  /* zoom */
  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  const zoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  /* wheel zoom */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  /* click empty canvas area → place shape or start pan */
  const onCanvasPointerDown = (e: RMouseEvent<SVGSVGElement>) => {
    const tag = (e.target as SVGElement).tagName;
    if (tag !== "svg" && tag !== "rect") return;
    const target = e.target as SVGElement;
    if (target.closest("[data-shape-id]")) return;

    // Middle mouse or space+click = pan
    if (e.button === 1) {
      e.preventDefault();
      panRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
      const onMove = (me: globalThis.MouseEvent) => {
        if (!panRef.current) return;
        setPan({ x: panRef.current.panX + (me.clientX - panRef.current.startX), y: panRef.current.panY + (me.clientY - panRef.current.startY) });
      };
      const onUp = () => { panRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return;
    }

    if (!activeTool) {
      setSelected(null);
      setConnectFrom(null);
      return;
    }
    const { x, y } = svgPt(e);
    pushHistory();
    const paletteItem = PALETTE.find(p => p.kind === activeTool);
    const label = activeTool === "text" ? tp("defaultLabel") : paletteItem ? tpd(paletteItem.labelKey) : activeTool!.charAt(0).toUpperCase() + activeTool!.slice(1);
    const newShape: Shape = { id: uid(), kind: activeTool, x, y, label };
    setShapes((s) => [...s, newShape]);
    if (activeTool === "text") {
      setEditingId(newShape.id);
      setEditText(label);
    }
  };

  /* shape pointer down - start drag or connect */
  const onShapePointerDown = (id: string, e: RMouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const s = shapes.find((n) => n.id === id)!;

    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(id);
        setSelected(id);
      } else if (connectFrom !== id) {
        pushHistory();
        const newArrow: Arrow = { id: uid(), from: connectFrom, to: id, label: "" };
        setArrows((a) => [...a, newArrow]);
        setConnectFrom(null);
        setEditingArrowId(newArrow.id);
        setArrowEditText("");
      }
      return;
    }

    setSelected(id);
    const pt = svgPt(e);
    dragRef.current = { id, ox: pt.x - s.x, oy: pt.y - s.y, moved: false };

    const onMove = (me: globalThis.MouseEvent) => {
      if (!dragRef.current) return;
      dragRef.current.moved = true;
      const wrap = wrapRef.current!;
      const r = wrap.getBoundingClientRect();
      const nx = (me.clientX - r.left - pan.x) / zoom - dragRef.current.ox;
      const ny = (me.clientY - r.top - pan.y) / zoom - dragRef.current.oy;
      setShapes((prev) => prev.map((sh) => (sh.id === dragRef.current!.id ? { ...sh, x: nx, y: ny } : sh)));
    };
    const onUp = () => {
      if (dragRef.current?.moved) pushHistory();
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  /* double-click shape → edit label */
  const onShapeDblClick = (id: string, e: RMouseEvent) => {
    e.stopPropagation();
    const s = shapes.find((n) => n.id === id)!;
    setEditingId(id);
    setEditText(s.label);
  };

  const commitShapeEdit = () => {
    if (editingId) {
      pushHistory();
      setShapes((s) => s.map((n) => (n.id === editingId ? { ...n, label: editText } : n)));
      setEditingId(null);
    }
  };

  const commitArrowEdit = () => {
    if (editingArrowId) {
      setArrows((a) => a.map((ar) => (ar.id === editingArrowId ? { ...ar, label: arrowEditText } : ar)));
      setEditingArrowId(null);
    }
  };

  const onArrowDblClick = (id: string, e: RMouseEvent) => {
    e.stopPropagation();
    const a = arrows.find((ar) => ar.id === id);
    if (a) { setEditingArrowId(id); setArrowEditText(a.label); }
  };

  /* keyboard: delete, undo, zoom */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingId || editingArrowId) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        pushHistory();
        setShapes((s) => s.filter((n) => n.id !== selected));
        setArrows((a) => a.filter((c) => c.from !== selected && c.to !== selected));
        setSelected(null);
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); undo(); }
      if (e.key === "=" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); zoomIn(); }
      if (e.key === "-" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); zoomOut(); }
      if (e.key === "0" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); zoomReset(); }
      if (e.key === "Escape") { setSelected(null); setConnectFrom(null); setActiveTool(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, editingId, editingArrowId, pushHistory, undo]);

  /* arrow path with smooth curve */
  const arrowPath = (a: Arrow) => {
    const from = shapes.find((n) => n.id === a.from);
    const to = shapes.find((n) => n.id === a.to);
    if (!from || !to) return null;
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const offset = 40;
    const sx = from.x + ux * offset, sy = from.y + uy * offset;
    const ex = to.x - ux * offset, ey = to.y - uy * offset;
    const perp = Math.min(30, len * 0.15);
    const cx = (sx + ex) / 2 - uy * perp;
    const cy = (sy + ey) / 2 + ux * perp;
    return { d: `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`, mx: (sx + ex) / 2, my: (sy + ey) / 2 };
  };

  const statusText = connectMode
    ? connectFrom ? tp("clickTarget") : tp("clickSource")
    : activeTool ? tp("clickToPlace") : tp("selectOrDrag");

  const zoomPct = Math.round(zoom * 100);

  /* ── canvas picker overlay ────────────────────────────────────── */
  if (showPicker) {
    return (
      <CanvasPicker
        t={tpd}
        savedList={savedList}
        newCanvas={newCanvas}
        loadCanvas={loadCanvas}
        deleteCanvas={deleteCanvas}
      />
    );
  }

  return (
    <div className="flex flex-col w-full select-none" style={{ color: "var(--color-text)" }}>
      {/* toolbar */}
      <CanvasToolbar
        t={tpd}
        activeTool={activeTool}
        connectMode={connectMode}
        zoomPct={zoomPct}
        saveIndicator={saveIndicator}
        statusText={statusText}
        setShowPicker={setShowPicker}
        clearAll={clearAll}
        undo={undo}
        setConnectMode={setConnectMode}
        setConnectFrom={setConnectFrom}
        setActiveTool={setActiveTool}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomReset={zoomReset}
      />

      {/* canvas */}
      <div ref={wrapRef} className="relative flex-1 overflow-hidden" style={{ minHeight: 450, background: "var(--color-bg-card)", cursor: activeTool ? "crosshair" : connectMode ? "pointer" : "default" }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minHeight: 450 }}
          onMouseDown={onCanvasPointerDown}
        >
          {/* dot grid (fixed, not zoomed - gives parallax depth feel) */}
          <defs>
            <pattern id="sd-grid" width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % (20 * zoom)},${pan.y % (20 * zoom)})`}>
              <circle cx={10 * zoom} cy={10 * zoom} r={0.8} fill="var(--color-border)" opacity={0.5} />
            </pattern>
            <marker id="sd-arrow" markerWidth={12} markerHeight={8} refX={10} refY={4} orient="auto">
              <polygon points="0 0, 12 4, 0 8" fill="var(--color-text-muted)" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#sd-grid)" />

          {/* zoom + pan group */}
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* arrows */}
            {arrows.map((a) => {
              const path = arrowPath(a);
              if (!path) return null;
              return (
                <g key={a.id}>
                  <path d={path.d} fill="none" stroke="transparent" strokeWidth={14 / zoom} onDoubleClick={(e) => onArrowDblClick(a.id, e)} style={{ cursor: "pointer" }} />
                  <path d={path.d} fill="none" stroke="var(--color-text-muted)" strokeWidth={2} markerEnd="url(#sd-arrow)" style={{ pointerEvents: "none" }} />
                  {a.label && (
                    <text x={path.mx} y={path.my - 8} textAnchor="middle" fontSize={10} fontWeight={500} fill="var(--color-text-muted)" onDoubleClick={(e) => onArrowDblClick(a.id, e)} style={{ cursor: "pointer" }}>
                      {a.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* shapes */}
            {shapes.map((s) => (
              <g
                key={s.id}
                data-shape-id={s.id}
                transform={`translate(${s.x},${s.y})`}
                onMouseDown={(e) => onShapePointerDown(s.id, e)}
                onDoubleClick={(e) => onShapeDblClick(s.id, e)}
                style={{ cursor: connectMode ? "pointer" : "grab", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.15))" }}
              >
                <ShapeSVG kind={s.kind} color={COLORS[s.kind]} />
                {(selected === s.id || connectFrom === s.id) && (
                  <rect
                    x={-W / 2 - 5} y={-H / 2 - 5}
                    width={W + 10} height={H + 10}
                    rx={12} fill="none"
                    stroke={connectFrom === s.id ? "#f59e0b" : "var(--color-primary)"}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                  />
                )}
                {editingId !== s.id && (
                  <text
                    textAnchor="middle" dy={s.kind === "text" ? 5 : 4}
                    fontSize={s.kind === "text" ? 14 : 12}
                    fontWeight={600}
                    fill={s.kind === "text" ? "var(--color-text)" : COLORS[s.kind]}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {s.label}
                  </text>
                )}
              </g>
            ))}

            {/* inline editors */}
            <ShapeEditors
              t={tpd}
              editingId={editingId}
              shapes={shapes}
              editText={editText}
              setEditText={setEditText}
              commitShapeEdit={commitShapeEdit}
              setEditingId={setEditingId}
              editingArrowId={editingArrowId}
              arrows={arrows}
              arrowPath={arrowPath}
              arrowEditText={arrowEditText}
              setArrowEditText={setArrowEditText}
              commitArrowEdit={commitArrowEdit}
              setEditingArrowId={setEditingArrowId}
            />
          </g>
        </svg>

        {/* help text */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono" style={{ color: "var(--color-text-muted)" }}>
          {tp("helpText")}
        </div>
      </div>
    </div>
  );
});
