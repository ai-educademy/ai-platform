"use client";

import { useState, useCallback, useRef, type MouseEvent } from "react";

/* ── types ─────────────────────────────────────────────────────── */
type ShapeKind = "server" | "database" | "decision" | "service" | "queue";

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
}

type Snapshot = { shapes: Shape[]; arrows: Arrow[] };

const COLORS: Record<ShapeKind, string> = {
  server: "#6366f1",
  database: "#06b6d4",
  decision: "#f59e0b",
  service: "#10b981",
  queue: "#8b5cf6",
};

const PALETTE: { kind: ShapeKind; label: string }[] = [
  { kind: "server", label: "Server" },
  { kind: "database", label: "Database" },
  { kind: "decision", label: "Decision" },
  { kind: "service", label: "Service" },
  { kind: "queue", label: "Queue" },
];

const W = 120,
  H = 60;

let _id = 0;
const uid = () => `n${++_id}`;

/* ── shape renderers ───────────────────────────────────────────── */
function ShapeSVG({ kind, color }: { kind: ShapeKind; color: string }) {
  const f = `${color}22`,
    s = color;
  switch (kind) {
    case "server":
      return <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={8} fill={f} stroke={s} strokeWidth={2} />;
    case "database":
      return <ellipse cx={0} cy={0} rx={W / 2.4} ry={H / 2} fill={f} stroke={s} strokeWidth={2} />;
    case "decision":
      return (
        <polygon
          points={`0,${-H / 1.6} ${W / 2},0 0,${H / 1.6} ${-W / 2},0`}
          fill={f}
          stroke={s}
          strokeWidth={2}
        />
      );
    case "service":
      return <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={H / 2} fill={f} stroke={s} strokeWidth={2} />;
    case "queue":
      return (
        <g>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={4} fill={f} stroke={s} strokeWidth={2} />
          <line x1={W / 2 - 18} y1={-H / 2 + 6} x2={W / 2 - 18} y2={H / 2 - 6} stroke={s} strokeWidth={1.5} />
          <line x1={W / 2 - 30} y1={-H / 2 + 6} x2={W / 2 - 30} y2={H / 2 - 6} stroke={s} strokeWidth={1.5} />
        </g>
      );
  }
}

/* ── component ─────────────────────────────────────────────────── */
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
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const save = useCallback(() => {
    setHistory((h) => [...h.slice(-30), { shapes: [...shapes], arrows: [...arrows] }]);
  }, [shapes, arrows]);

  const undo = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setShapes(prev.shapes);
      setArrows(prev.arrows);
      return h.slice(0, -1);
    });
  }, []);

  const clearAll = () => {
    save();
    setShapes([]);
    setArrows([]);
    setSelected(null);
    setConnectFrom(null);
  };

  /* svg coords from mouse event */
  const pt = (e: MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  /* canvas click — place shape */
  const onCanvasClick = (e: MouseEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current && (e.target as SVGElement).tagName !== "pattern") return;
    if (!activeTool) {
      setSelected(null);
      setConnectFrom(null);
      return;
    }
    const { x, y } = pt(e);
    save();
    setShapes((s) => [...s, { id: uid(), kind: activeTool, x, y, label: activeTool.charAt(0).toUpperCase() + activeTool.slice(1) }]);
  };

  /* shape pointer events */
  const onShapeDown = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const s = shapes.find((n) => n.id === id)!;
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(id);
        setSelected(id);
      } else if (connectFrom !== id) {
        save();
        setArrows((a) => [...a, { id: uid(), from: connectFrom, to: id }]);
        setConnectFrom(null);
      }
      return;
    }
    setSelected(id);
    dragRef.current = { id, ox: e.clientX - s.x, oy: e.clientY - s.y };
  };

  const onPointerMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    const { id, ox, oy } = dragRef.current;
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, x: e.clientX - ox, y: e.clientY - oy } : s)));
  };

  const onPointerUp = () => {
    if (dragRef.current) save();
    dragRef.current = null;
  };

  const onDoubleClick = (id: string) => {
    const s = shapes.find((n) => n.id === id)!;
    setEditingId(id);
    setEditText(s.label);
  };

  const commitEdit = () => {
    if (editingId) {
      setShapes((s) => s.map((n) => (n.id === editingId ? { ...n, label: editText } : n)));
      setEditingId(null);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selected && !editingId) {
      save();
      setShapes((s) => s.filter((n) => n.id !== selected));
      setArrows((a) => a.filter((c) => c.from !== selected && c.to !== selected));
      setSelected(null);
    }
  };

  /* arrow path */
  const arrowPath = (a: Arrow) => {
    const from = shapes.find((n) => n.id === a.from);
    const to = shapes.find((n) => n.id === a.to);
    if (!from || !to) return null;
    const dx = to.x - from.x,
      dy = to.y - from.y,
      len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len,
      uy = dy / len;
    const sx = from.x + ux * 40,
      sy = from.y + uy * 30;
    const ex = to.x - ux * 40,
      ey = to.y - uy * 30;
    const cx = (sx + ex) / 2 + (dy > 0 ? -30 : 30) * (Math.abs(dy) < 20 ? 0 : uy * 0.5);
    return `M${sx},${sy} Q${cx},${(sy + ey) / 2} ${ex},${ey}`;
  };

  return (
    <div
      className="flex flex-col h-full w-full select-none"
      style={{ background: "var(--color-bg-card)", color: "var(--color-text)" }}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* header */}
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          🏗️ System Design Canvas
        </h2>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Drag, connect, design
        </p>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 text-xs border-b" style={{ borderColor: "var(--color-border)" }}>
        <button onClick={clearAll} className="px-2 py-1 rounded" style={{ background: "var(--color-primary)", color: "#fff" }}>
          Clear All
        </button>
        <button onClick={undo} className="px-2 py-1 rounded border" style={{ borderColor: "var(--color-border)" }}>
          ↩ Undo
        </button>
        <button
          onClick={() => { setConnectMode((c) => !c); setConnectFrom(null); }}
          className="px-2 py-1 rounded border"
          style={{
            borderColor: connectMode ? "var(--color-primary)" : "var(--color-border)",
            background: connectMode ? "var(--color-primary)" : "transparent",
            color: connectMode ? "#fff" : "var(--color-text)",
          }}
        >
          {connectMode ? "🔗 Connecting…" : "🔗 Connect"}
        </button>
        {activeTool && (
          <span className="ml-auto opacity-70">
            Placing: <strong>{activeTool}</strong> — click canvas
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* palette */}
        <div className="flex flex-col gap-2 p-3 w-28 shrink-0 border-r" style={{ borderColor: "var(--color-border)" }}>
          <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Shapes
          </span>
          {PALETTE.map((p) => (
            <button
              key={p.kind}
              onClick={() => setActiveTool((t) => (t === p.kind ? null : p.kind))}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-[11px] transition-all"
              style={{
                border: `2px solid ${activeTool === p.kind ? COLORS[p.kind] : "var(--color-border)"}`,
                background: activeTool === p.kind ? `${COLORS[p.kind]}18` : "transparent",
                color: "var(--color-text)",
              }}
            >
              <svg width={36} height={24} viewBox="-60 -30 120 60">
                <ShapeSVG kind={p.kind} color={COLORS[p.kind]} />
              </svg>
              {p.label}
            </button>
          ))}
        </div>

        {/* canvas */}
        <svg
          ref={svgRef}
          className="flex-1 cursor-crosshair"
          style={{ minHeight: 400 }}
          onClick={onCanvasClick}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
        >
          {/* grid */}
          <defs>
            <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
              <circle cx={1} cy={1} r={0.8} fill="var(--color-border)" opacity={0.4} />
            </pattern>
            <marker id="ah" markerWidth={10} markerHeight={7} refX={9} refY={3.5} orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-muted)" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* arrows */}
          {arrows.map((a) => {
            const d = arrowPath(a);
            return d ? (
              <path key={a.id} d={d} fill="none" stroke="var(--color-text-muted)" strokeWidth={2} markerEnd="url(#ah)" />
            ) : null;
          })}

          {/* shapes */}
          {shapes.map((s) => (
            <g
              key={s.id}
              transform={`translate(${s.x},${s.y})`}
              onMouseDown={(e) => onShapeDown(s.id, e)}
              onDoubleClick={() => onDoubleClick(s.id)}
              style={{ cursor: connectMode ? "pointer" : "grab", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.18))" }}
            >
              <ShapeSVG kind={s.kind} color={COLORS[s.kind]} />
              {/* selection ring */}
              {selected === s.id && (
                <rect
                  x={-W / 2 - 4}
                  y={-H / 2 - 4}
                  width={W + 8}
                  height={H + 8}
                  rx={12}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                />
              )}
              <text
                textAnchor="middle"
                dy={4}
                fontSize={12}
                fontWeight={600}
                fill={COLORS[s.kind]}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {s.label}
              </text>
            </g>
          ))}

          {/* inline edit overlay */}
          {editingId && (() => {
            const s = shapes.find((n) => n.id === editingId);
            if (!s) return null;
            return (
              <foreignObject x={s.x - 60} y={s.y - 14} width={120} height={28}>
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                  className="w-full h-full text-center text-xs rounded border-none outline-none"
                  style={{ background: "var(--color-bg-card)", color: "var(--color-text)", border: "1px solid var(--color-primary)" }}
                />
              </foreignObject>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
