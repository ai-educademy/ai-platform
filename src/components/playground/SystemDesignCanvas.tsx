"use client";

import { useState, useCallback, useRef, useEffect, type MouseEvent as RMouseEvent } from "react";

/* ── types ─────────────────────────────────────────────────────── */
type ShapeKind = "server" | "database" | "decision" | "service" | "queue" | "text";

interface Shape {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  label: string;
}

interface Arrow {
  id: string;
  from: string;
  to: string;
  label: string;
}

type Snapshot = { shapes: Shape[]; arrows: Arrow[] };

const COLORS: Record<ShapeKind, string> = {
  server: "#6366f1",
  database: "#06b6d4",
  decision: "#f59e0b",
  service: "#10b981",
  queue: "#8b5cf6",
  text: "#94a3b8",
};

const PALETTE: { kind: ShapeKind; label: string; icon: string }[] = [
  { kind: "server", label: "Server", icon: "▭" },
  { kind: "database", label: "Database", icon: "◎" },
  { kind: "decision", label: "Decision", icon: "◇" },
  { kind: "service", label: "Service", icon: "⬭" },
  { kind: "queue", label: "Queue", icon: "⊞" },
  { kind: "text", label: "Text", icon: "T" },
];

const W = 120, H = 60;
let _counter = Date.now();
const uid = () => `n${++_counter}`;

/* ── shape SVG renderers ──────────────────────────────────────── */
function ShapeSVG({ kind, color, w = W, h = H }: { kind: ShapeKind; color: string; w?: number; h?: number }) {
  const f = `${color}22`, s = color;
  switch (kind) {
    case "server":
      return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={f} stroke={s} strokeWidth={2} />;
    case "database":
      return (
        <g>
          <ellipse cx={0} cy={0} rx={w / 2.4} ry={h / 2} fill={f} stroke={s} strokeWidth={2} />
          <ellipse cx={0} cy={-h / 4} rx={w / 2.4} ry={h / 5} fill="none" stroke={s} strokeWidth={1} opacity={0.4} />
        </g>
      );
    case "decision":
      return <polygon points={`0,${-h / 1.5} ${w / 2},0 0,${h / 1.5} ${-w / 2},0`} fill={f} stroke={s} strokeWidth={2} />;
    case "service":
      return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={f} stroke={s} strokeWidth={2} />;
    case "queue":
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={f} stroke={s} strokeWidth={2} />
          <line x1={w / 2 - 18} y1={-h / 2 + 6} x2={w / 2 - 18} y2={h / 2 - 6} stroke={s} strokeWidth={1.5} />
          <line x1={w / 2 - 30} y1={-h / 2 + 6} x2={w / 2 - 30} y2={h / 2 - 6} stroke={s} strokeWidth={1.5} />
        </g>
      );
    case "text":
      return <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="transparent" stroke="none" />;
  }
}

/* ── main component ───────────────────────────────────────────── */
export function SystemDesignCanvas() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
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

  /* SVG coordinates from mouse event */
  const svgPt = (e: RMouseEvent | globalThis.MouseEvent) => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  /* click empty canvas area → place shape */
  const onCanvasPointerDown = (e: RMouseEvent<SVGSVGElement>) => {
    // Only respond to clicks directly on the SVG background (the grid rect or svg itself)
    const tag = (e.target as SVGElement).tagName;
    if (tag !== "svg" && tag !== "rect") return;
    // Don't place if we clicked a shape's rect
    const target = e.target as SVGElement;
    if (target.closest("[data-shape-id]")) return;

    if (!activeTool) {
      setSelected(null);
      setConnectFrom(null);
      return;
    }
    const { x, y } = svgPt(e);
    pushHistory();
    const label = activeTool === "text" ? "Label" : activeTool.charAt(0).toUpperCase() + activeTool.slice(1);
    const newShape: Shape = { id: uid(), kind: activeTool, x, y, label };
    setShapes((s) => [...s, newShape]);
    // Auto-open edit for text shapes
    if (activeTool === "text") {
      setEditingId(newShape.id);
      setEditText(label);
    }
  };

  /* shape pointer down — start drag or connect */
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
        // Auto-open arrow label edit
        setEditingArrowId(newArrow.id);
        setArrowEditText("");
      }
      return;
    }

    setSelected(id);
    dragRef.current = { id, ox: e.clientX - s.x, oy: e.clientY - s.y, moved: false };

    // Attach global listeners for drag
    const onMove = (me: globalThis.MouseEvent) => {
      if (!dragRef.current) return;
      dragRef.current.moved = true;
      const nx = me.clientX - dragRef.current.ox;
      const ny = me.clientY - dragRef.current.oy;
      setShapes((prev) => prev.map((sh) => (sh.id === dragRef.current!.id ? { ...sh, x: nx, y: ny } : sh)));
    };
    const onUp = () => {
      if (dragRef.current?.moved) {
        pushHistory();
      }
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

  /* double-click arrow label → edit it */
  const onArrowDblClick = (id: string, e: RMouseEvent) => {
    e.stopPropagation();
    const a = arrows.find((ar) => ar.id === id);
    if (a) {
      setEditingArrowId(id);
      setArrowEditText(a.label);
    }
  };

  /* keyboard: delete selected, undo */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingId || editingArrowId) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        pushHistory();
        setShapes((s) => s.filter((n) => n.id !== selected));
        setArrows((a) => a.filter((c) => c.from !== selected && c.to !== selected));
        setSelected(null);
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        undo();
      }
      if (e.key === "Escape") {
        setSelected(null);
        setConnectFrom(null);
        setActiveTool(null);
      }
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
    // Slight curve perpendicular to the line
    const perp = Math.min(30, len * 0.15);
    const cx = (sx + ex) / 2 - uy * perp;
    const cy = (sy + ey) / 2 + ux * perp;
    return { d: `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`, mx: (sx + ex) / 2, my: (sy + ey) / 2 };
  };

  /* status text */
  const statusText = connectMode
    ? connectFrom ? "Click target shape to connect" : "Click source shape"
    : activeTool ? `Click canvas to place ${activeTool}` : "Select a shape from the palette, or drag existing shapes";

  return (
    <div className="flex flex-col w-full select-none" style={{ color: "var(--color-text)" }}>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-card)" }}>
        <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#ef4444", color: "#fff" }}>
          🗑 Clear
        </button>
        <button onClick={undo} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
          ↩ Undo
        </button>
        <div className="w-px h-5 mx-1" style={{ background: "var(--color-border)" }} />
        <button
          onClick={() => { setConnectMode((c) => !c); setConnectFrom(null); setActiveTool(null); }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{
            borderColor: connectMode ? "var(--color-primary)" : "var(--color-border)",
            background: connectMode ? "var(--color-primary)" : "transparent",
            color: connectMode ? "#fff" : "var(--color-text)",
          }}
        >
          → Connect
        </button>
        <div className="w-px h-5 mx-1" style={{ background: "var(--color-border)" }} />
        {PALETTE.map((p) => (
          <button
            key={p.kind}
            onClick={() => { setActiveTool((t) => (t === p.kind ? null : p.kind)); setConnectMode(false); }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{
              borderColor: activeTool === p.kind ? COLORS[p.kind] : "var(--color-border)",
              background: activeTool === p.kind ? `${COLORS[p.kind]}20` : "transparent",
              color: activeTool === p.kind ? COLORS[p.kind] : "var(--color-text)",
            }}
            title={`Place ${p.label}`}
          >
            <span className="mr-1">{p.icon}</span>{p.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>
          {statusText}
        </span>
      </div>

      {/* canvas */}
      <div className="relative flex-1" style={{ minHeight: 450, background: "var(--color-bg-card)" }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minHeight: 450, cursor: activeTool ? "crosshair" : connectMode ? "pointer" : "default" }}
          onMouseDown={onCanvasPointerDown}
        >
          {/* dot grid */}
          <defs>
            <pattern id="sd-grid" width={20} height={20} patternUnits="userSpaceOnUse">
              <circle cx={10} cy={10} r={0.8} fill="var(--color-border)" opacity={0.5} />
            </pattern>
            <marker id="sd-arrow" markerWidth={12} markerHeight={8} refX={10} refY={4} orient="auto">
              <polygon points="0 0, 12 4, 0 8" fill="var(--color-text-muted)" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#sd-grid)" />

          {/* arrows */}
          {arrows.map((a) => {
            const path = arrowPath(a);
            if (!path) return null;
            return (
              <g key={a.id}>
                {/* Invisible thick path for easier clicking */}
                <path d={path.d} fill="none" stroke="transparent" strokeWidth={14} onDoubleClick={(e) => onArrowDblClick(a.id, e)} style={{ cursor: "pointer" }} />
                <path d={path.d} fill="none" stroke="var(--color-text-muted)" strokeWidth={2} markerEnd="url(#sd-arrow)" style={{ pointerEvents: "none" }} />
                {a.label && (
                  <text
                    x={path.mx}
                    y={path.my - 8}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={500}
                    fill="var(--color-text-muted)"
                    onDoubleClick={(e) => onArrowDblClick(a.id, e)}
                    style={{ cursor: "pointer" }}
                  >
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
              {/* selection indicator */}
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
              {/* label */}
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

          {/* inline edit for shape label */}
          {editingId && (() => {
            const s = shapes.find((n) => n.id === editingId);
            if (!s) return null;
            return (
              <foreignObject x={s.x - 70} y={s.y - 14} width={140} height={28}>
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitShapeEdit}
                  onKeyDown={(e) => { if (e.key === "Enter") commitShapeEdit(); if (e.key === "Escape") setEditingId(null); }}
                  className="w-full h-full text-center text-xs rounded px-1"
                  style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "2px solid var(--color-primary)", outline: "none" }}
                />
              </foreignObject>
            );
          })()}

          {/* inline edit for arrow label */}
          {editingArrowId && (() => {
            const a = arrows.find((ar) => ar.id === editingArrowId);
            if (!a) return null;
            const path = arrowPath(a);
            if (!path) return null;
            return (
              <foreignObject x={path.mx - 50} y={path.my - 24} width={100} height={24}>
                <input
                  autoFocus
                  value={arrowEditText}
                  placeholder="label…"
                  onChange={(e) => setArrowEditText(e.target.value)}
                  onBlur={commitArrowEdit}
                  onKeyDown={(e) => { if (e.key === "Enter") commitArrowEdit(); if (e.key === "Escape") setEditingArrowId(null); }}
                  className="w-full h-full text-center text-[10px] rounded px-1"
                  style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "2px solid var(--color-primary)", outline: "none" }}
                />
              </foreignObject>
            );
          })()}
        </svg>

        {/* help text */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono" style={{ color: "var(--color-text-muted)" }}>
          Double-click to rename · Del to remove · ⌘Z to undo · Esc to deselect
        </div>
      </div>
    </div>
  );
}
