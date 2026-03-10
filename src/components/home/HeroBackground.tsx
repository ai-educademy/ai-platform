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
  const nSymbols = Math.floor(count * 0.35);
  for (let i = 0; i < count; i++) {
    const z = Math.random();
    const isSymbol = i < nSymbols;
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      z,
      vx: (Math.random() - 0.5) * (0.2 + z * 0.5),
      vy: (Math.random() - 0.5) * (0.2 + z * 0.5),
      size: 2 + z * 4,
      opacity: 0.15 + z * 0.45,
      isSymbol,
      symbol: isSymbol ? SYMBOLS[i % SYMBOLS.length] : undefined,
    });
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════
   HeroBackground - 3D parallax layers with AI education identity
   ═══════════════════════════════════════════════════════════════
   Layer 1 (deepest):  Neural SVG - perspective tilt + gradient-pulse connections
   Layer 2 (middle):   Canvas particles + floating knowledge symbols
   Layer 3 (nearest):  Dot grid - subtle shift opposite to mouse
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
  const visible = useRef(true);

  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || isMobile || reduced.current) return;

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
      const smallScreen = window.innerWidth < 768;
      const particleCount = smallScreen ? 20 : 35;
      particles.current = seedParticles(rect.width, rect.height, particleCount);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* ── IntersectionObserver to pause RAF when off-screen ── */
    const observer = new IntersectionObserver(
      ([entry]) => { visible.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    /* ── Animation loop ── */
    const startAnimation = () => {
      const tick = () => {
        if (!visible.current) {
          raf.current = requestAnimationFrame(tick);
          return;
        }

        // Smooth lerp toward target
        const lerp = 0.04;
        mouse.current.x += (target.current.x - mouse.current.x) * lerp;
        mouse.current.y += (target.current.y - mouse.current.y) * lerp;

        const mx = mouse.current.x;
        const my = mouse.current.y;

        /* ── Layer 1: Neural SVG parallax - perspective tilt + translate ── */
        if (neuralRef.current) {
          neuralRef.current.style.transform =
            `perspective(600px) rotateX(${(my - 0.5) * 12}deg) rotateY(${(mx - 0.5) * -12}deg) translate(${(mx - 0.5) * -25}px, ${(my - 0.5) * -25}px)`;
        }

        /* ── Layer 3: Grid parallax - slight opposite shift ── */
        if (gridRef.current) {
          gridRef.current.style.transform = `translate(${(mx - 0.5) * 25}px, ${(my - 0.5) * 25}px)`;
        }

        /* ── Layer 2: Canvas - depth particles + knowledge symbols ── */
        if (canvas && ctx) {
          const { w, h } = bounds.current;
          ctx.clearRect(0, 0, w, h);

          const dark = document.documentElement.classList.contains("dark");
          const rgb = dark ? "165,140,255" : "99,102,241";

          // Draw particles
          for (const p of particles.current) {
              p.x += p.vx;
              p.y += p.vy;
              if (p.x < -30) p.x = w + 30;
              if (p.x > w + 30) p.x = -30;
              if (p.y < -30) p.y = h + 30;
              if (p.y > h + 30) p.y = -30;

            const px = (mx - 0.5) * p.z * 40;
            const py = (my - 0.5) * p.z * 40;
            const dx = p.x + px;
            const dy = p.y + py;

            if (p.isSymbol && p.symbol) {
              ctx.font = `bold ${14 + p.z * 12}px 'JetBrains Mono','Fira Code',monospace`;
              ctx.fillStyle = `rgba(${rgb},${p.opacity * 0.9})`;
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
              if (dist < 120) {
                const op =
                  (1 - dist / 120) *
                  Math.min(a.opacity, b.opacity) *
                  0.5;
                const apx = (mx - 0.5) * a.z * 40;
                const apy = (my - 0.5) * a.z * 40;
                const bpx = (mx - 0.5) * b.z * 40;
                const bpy = (my - 0.5) * b.z * 40;
                ctx.beginPath();
                ctx.moveTo(a.x + apx, a.y + apy);
                ctx.lineTo(b.x + bpx, b.y + bpy);
                ctx.strokeStyle = `rgba(${rgb},${op})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }

        raf.current = requestAnimationFrame(tick);
      };

      raf.current = requestAnimationFrame(tick);
    };

    // Defer animation start to after paint
    if ('requestIdleCallback' in window) {
      requestIdleCallback(startAnimation);
    } else {
      setTimeout(startAnimation, 100);
    }

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
      observer.disconnect();
    };
  }, [ready, isMobile]);

  if (!ready) return null;

  /* ── Mobile / reduced-motion: static version — zero JS animation overhead ── */
  if (isMobile || reduced.current) {
    return (
      <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-4" style={{ opacity: 0.2 }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {CONNECTIONS.map(([a, b], i) => (
              <line key={i} x1={DOTS[a].cx} y1={DOTS[a].cy} x2={DOTS[b].cx} y2={DOTS[b].cy}
                stroke="var(--color-primary)" strokeWidth="0.35" opacity="0.4" />
            ))}
            {DOTS.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r="0.7" fill="var(--color-primary)" opacity="0.5" />
            ))}
          </svg>
        </div>
        <div className="absolute -inset-4 bg-grid" />
        <div className="absolute inset-0 noise-texture" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Layer 1 - Neural SVG (deepest: perspective tilt + gradient-pulsing connections) */}
      <div
        ref={neuralRef}
        className="absolute -inset-4 will-change-transform"
        style={{ opacity: 0.3 }}
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
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
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
              strokeWidth="0.35"
            />
          ))}
          {DOTS.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r="0.7"
              fill="var(--color-primary)"
            />
          ))}
        </svg>
      </div>

      {/* Layer 2 - Canvas: depth-scaled particles + knowledge symbols (middle) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Layer 3 - Dot grid (nearest: shifts with mouse) */}
      <div
        ref={gridRef}
        className="absolute -inset-4 bg-grid will-change-transform"
      />

      {/* Layer 4 - Noise texture */}
      <div className="absolute inset-0 noise-texture" />
    </div>
  );
}
