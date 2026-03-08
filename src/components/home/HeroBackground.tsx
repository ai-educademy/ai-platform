"use client";

import { useEffect, useRef, useState } from "react";

/* ── Neural network topology ── */
const DOTS = [
  { cx: 10, cy: 20 },
  { cx: 25, cy: 50 },
  { cx: 40, cy: 15 },
  { cx: 55, cy: 45 },
  { cx: 70, cy: 25 },
  { cx: 85, cy: 55 },
  { cx: 15, cy: 75 },
  { cx: 35, cy: 85 },
  { cx: 60, cy: 70 },
  { cx: 80, cy: 80 },
  { cx: 95, cy: 35 },
  { cx: 50, cy: 90 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [1, 3],
  [6, 7],
  [7, 8],
  [8, 9],
  [6, 8],
  [3, 8],
  [4, 10],
  [7, 11],
  [2, 4],
  [5, 10],
];

/* ── Knowledge symbols (30% of particles become these) ── */
const SYMBOLS = [
  "∑",
  "λ",
  "{ }",
  "∂",
  "01",
  "AI",
  "∫",
  "π",
  "</>",
  "Δ",
  "∞",
  "→",
];

/* ── Particle with z-depth ── */
interface Particle {
  x: number;
  y: number;
  z: number; // 0 = far, 1 = close
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  isSymbol: boolean;
  symbol?: string;
}

function seedParticles(w: number, h: number, count: number): Particle[] {
  const out: Particle[] = [];
  const nSymbols = Math.floor(count * 0.3);
  for (let i = 0; i < count; i++) {
    const z = Math.random();
    const isSymbol = i < nSymbols;
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      z,
      vx: (Math.random() - 0.5) * (0.15 + z * 0.3),
      vy: (Math.random() - 0.5) * (0.15 + z * 0.3),
      size: 1.5 + z * 3.5,
      opacity: 0.1 + z * 0.3,
      isSymbol,
      symbol: isSymbol ? SYMBOLS[i % SYMBOLS.length] : undefined,
    });
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════
   HeroBackground — 3D parallax layers with AI education identity
   ═══════════════════════════════════════════════════════════════
   Layer 1 (deepest):  Neural SVG — perspective tilt + gradient-pulse connections
   Layer 2 (middle):   Canvas particles + floating knowledge symbols
   Layer 3 (nearest):  Dot grid — subtle shift opposite to mouse
   Layer 4:            Noise texture overlay
   ═══════════════════════════════════════════════════════════════ */
export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuralRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: 0.5, y: 0.5 });
  const target = useRef({ x: 0.5, y: 0.5 });
  const particles = useRef<Particle[]>([]);
  const bounds = useRef({ w: 0, h: 0 });
  const raf = useRef(0);
  const reduced = useRef(false);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let drift = 0;

    /* ── Mouse tracking (window-level so pointer-events-none doesn't block) ── */
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (e.clientY < rect.top - 100 || e.clientY > rect.bottom + 100) return;
      target.current = {
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
      };
    };

    if (!reduced.current) {
      window.addEventListener("mousemove", onMove, { passive: true });
    }

    /* ── Canvas setup ── */
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const resize = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      bounds.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles.current = seedParticles(rect.width, rect.height, 45);
    };

    resize();
    window.addEventListener("resize", resize);

    /* ── Animation loop ── */
    const tick = () => {
      // Mobile: gentle auto-drift
      if (isTouch && !reduced.current) {
        drift += 0.003;
        target.current = {
          x: 0.5 + Math.sin(drift) * 0.12,
          y: 0.5 + Math.cos(drift * 0.7) * 0.08,
        };
      }

      // Smooth lerp toward target
      const lerp = reduced.current ? 1 : 0.04;
      mouse.current.x += (target.current.x - mouse.current.x) * lerp;
      mouse.current.y += (target.current.y - mouse.current.y) * lerp;

      const mx = mouse.current.x;
      const my = mouse.current.y;

      /* ── Layer 1: Neural SVG parallax — perspective tilt + translate ── */
      if (neuralRef.current && !reduced.current) {
        neuralRef.current.style.transform =
          `perspective(800px) rotateX(${(my - 0.5) * 8}deg) rotateY(${(mx - 0.5) * -8}deg) translate(${(mx - 0.5) * -15}px, ${(my - 0.5) * -15}px)`;
      }

      /* ── Layer 3: Grid parallax — slight opposite shift ── */
      if (gridRef.current && !reduced.current) {
        gridRef.current.style.transform = `translate(${(mx - 0.5) * 18}px, ${(my - 0.5) * 18}px)`;
      }

      /* ── Layer 2: Canvas — depth particles + knowledge symbols ── */
      if (canvas && ctx) {
        const { w, h } = bounds.current;
        ctx.clearRect(0, 0, w, h);

        const dark = document.documentElement.classList.contains("dark");
        const rgb = dark ? "165,140,255" : "99,102,241";

        // Draw particles
        for (const p of particles.current) {
          if (!reduced.current) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -30) p.x = w + 30;
            if (p.x > w + 30) p.x = -30;
            if (p.y < -30) p.y = h + 30;
            if (p.y > h + 30) p.y = -30;
          }

          const px = reduced.current ? 0 : (mx - 0.5) * p.z * 25;
          const py = reduced.current ? 0 : (my - 0.5) * p.z * 25;
          const dx = p.x + px;
          const dy = p.y + py;

          if (p.isSymbol && p.symbol) {
            ctx.font = `${12 + p.z * 10}px 'JetBrains Mono','Fira Code',monospace`;
            ctx.fillStyle = `rgba(${rgb},${p.opacity * 0.8})`;
            ctx.fillText(p.symbol, dx, dy);
          } else {
            ctx.beginPath();
            ctx.arc(dx, dy, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb},${p.opacity})`;
            ctx.fill();
          }
        }

        // Connecting lines between nearby dot-particles
        const pts = particles.current;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          if (a.isSymbol) continue;
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j];
            if (b.isSymbol) continue;
            const ddx = a.x - b.x;
            const ddy = a.y - b.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dist < 100) {
              const op =
                (1 - dist / 100) *
                Math.min(a.opacity, b.opacity) *
                0.35;
              const apx = reduced.current ? 0 : (mx - 0.5) * a.z * 25;
              const apy = reduced.current ? 0 : (my - 0.5) * a.z * 25;
              const bpx = reduced.current ? 0 : (mx - 0.5) * b.z * 25;
              const bpy = reduced.current ? 0 : (my - 0.5) * b.z * 25;
              ctx.beginPath();
              ctx.moveTo(a.x + apx, a.y + apy);
              ctx.lineTo(b.x + bpx, b.y + bpy);
              ctx.strokeStyle = `rgba(${rgb},${op})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Layer 1 — Neural SVG (deepest: perspective tilt + gradient-pulsing connections) */}
      <div
        ref={neuralRef}
        className="absolute -inset-4 will-change-transform"
        style={{ opacity: 0.2 }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {CONNECTIONS.map(([a, b], i) => (
              <linearGradient
                key={i}
                id={`cg${i}`}
                x1={DOTS[a].cx}
                y1={DOTS[a].cy}
                x2={DOTS[b].cx}
                y2={DOTS[b].cy}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="var(--color-primary)">
                  {!reduced.current && (
                    <animate
                      attributeName="stop-opacity"
                      values="0.2;0.95;0.2"
                      dur={`${2 + (i % 3)}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.2}s`}
                    />
                  )}
                </stop>
                <stop offset="100%" stopColor="#818cf8">
                  {!reduced.current && (
                    <animate
                      attributeName="stop-opacity"
                      values="0.1;0.7;0.1"
                      dur={`${2 + (i % 3)}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.2}s`}
                    />
                  )}
                </stop>
              </linearGradient>
            ))}
          </defs>
          {CONNECTIONS.map(([a, b], i) => (
            <line
              key={i}
              x1={DOTS[a].cx}
              y1={DOTS[a].cy}
              x2={DOTS[b].cx}
              y2={DOTS[b].cy}
              stroke={`url(#cg${i})`}
              strokeWidth="0.2"
            />
          ))}
          {DOTS.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r="0.5"
              fill="var(--color-primary)"
              style={
                reduced.current
                  ? undefined
                  : {
                      animation: `float ${3 + (i % 3)}s ease-in-out infinite ${i * 0.5}s`,
                    }
              }
            />
          ))}
        </svg>
      </div>

      {/* Layer 2 — Canvas: depth-scaled particles + knowledge symbols (middle) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Layer 3 — Dot grid (nearest: shifts with mouse) */}
      <div
        ref={gridRef}
        className="absolute -inset-4 bg-grid will-change-transform"
      />

      {/* Layer 4 — Noise texture */}
      <div className="absolute inset-0 noise-texture" />
    </div>
  );
}
