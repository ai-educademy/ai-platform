"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════ Types ═══════════════════════════ */

export interface GrowthPoint {
  date: string;
  users: number;
  subscribers: number;
}

export interface PlanBreakdown {
  monthly: number;
  annual: number;
  lifetime: number;
}

export interface FeedbackSentiment {
  up: number;
  down: number;
}

/* ═══════════════════════════ Shared ═══════════════════════════ */

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold mb-0.5">{title}</h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">{subtitle}</p>
      {children}
    </div>
  );
}

/** Check prefers-reduced-motion */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ═══════════════════════════ 1. Line Chart — User Growth ═══════════════════════════ */

export function UserGrowthChart({ data }: { data: GrowthPoint[] }) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    point: GrowthPoint;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Chart dimensions
  const W = 800;
  const H = 300;
  const PAD = { top: 20, right: 20, bottom: 40, left: 45 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => Math.max(d.users, d.subscribers)), 1);
  const yMax = Math.ceil(maxVal * 1.15) || 1;

  const xScale = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v: number) => PAD.top + chartH - (v / yMax) * chartH;

  const buildPath = (key: "users" | "subscribers") =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(d[key]).toFixed(1)}`)
      .join(" ");

  const usersPath = buildPath("users");
  const subscribersPath = buildPath("subscribers");

  // Path length for stroke animation
  const approxLen = data.length * (chartW / Math.max(data.length - 1, 1)) + chartH;

  // Y-axis grid lines (4-5 ticks)
  const yTicks: number[] = [];
  const step = Math.ceil(yMax / 4) || 1;
  for (let v = 0; v <= yMax; v += step) yTicks.push(v);

  // X-axis labels (show ~6 evenly spaced)
  const xLabelCount = Math.min(data.length, 6);
  const xLabelStep = Math.max(1, Math.floor((data.length - 1) / (xLabelCount - 1)));
  const xLabels: { i: number; label: string }[] = [];
  for (let i = 0; i < data.length; i += xLabelStep) {
    const d = new Date(data[i].date);
    xLabels.push({ i, label: `${d.getDate()}/${d.getMonth() + 1}` });
  }
  // Always include last point
  if (xLabels.length > 0 && xLabels[xLabels.length - 1].i !== data.length - 1) {
    const d = new Date(data[data.length - 1].date);
    xLabels.push({ i: data.length - 1, label: `${d.getDate()}/${d.getMonth() + 1}` });
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      // Find nearest data point
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const dist = Math.abs(xScale(i) - mouseX);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }
      setTooltip({ x: xScale(closestIdx), y: yScale(data[closestIdx].users), point: data[closestIdx] });
    },
    // xScale/yScale are pure functions of `data` (via chartW/yMax), so `data`
    // already covers them. Listing them would rebuild this callback on every
    // render, since they are plain consts rather than memoised values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  // Must sit below every hook call, including the useCallback above, or the
  // hook count changes once signup data loads and React throws.
  if (data.length === 0) {
    return (
      <ChartCard title="User Growth" subtitle="Last 30 days">
        <div className="h-48 flex items-center justify-center text-sm text-[var(--color-text-muted)]">
          No signup data for the last 30 days
        </div>
      </ChartCard>
    );
  }

  const animStyle = !reducedMotion && mounted
    ? { strokeDasharray: approxLen, strokeDashoffset: 0, transition: "stroke-dashoffset 1.2s ease-out" }
    : {};
  const initialDash = !reducedMotion && !mounted
    ? { strokeDasharray: approxLen, strokeDashoffset: approxLen }
    : {};

  return (
    <ChartCard title="User Growth" subtitle="New signups & newsletter subscribers — last 30 days">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={yScale(v)}
              x2={W - PAD.right}
              y2={yScale(v)}
              stroke="var(--color-border)"
              strokeOpacity={0.3}
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={yScale(v) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--color-text-muted)"
            >
              {v}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ i, label }) => (
          <text
            key={i}
            x={xScale(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={11}
            fill="var(--color-text-muted)"
          >
            {label}
          </text>
        ))}

        {/* Users line (indigo) */}
        <path
          d={usersPath}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ ...initialDash, ...animStyle }}
        />

        {/* Subscribers line (emerald) */}
        <path
          d={subscribersPath}
          fill="none"
          stroke="#10b981"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ ...initialDash, ...animStyle }}
        />

        {/* Data point dots */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xScale(i)} cy={yScale(d.users)} r={3} fill="#6366f1" opacity={mounted || reducedMotion ? 1 : 0} style={{ transition: "opacity 0.4s ease 1s" }} />
            <circle cx={xScale(i)} cy={yScale(d.subscribers)} r={3} fill="#10b981" opacity={mounted || reducedMotion ? 1 : 0} style={{ transition: "opacity 0.4s ease 1s" }} />
          </g>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line
              x1={tooltip.x}
              y1={PAD.top}
              x2={tooltip.x}
              y2={PAD.top + chartH}
              stroke="var(--color-text-muted)"
              strokeOpacity={0.3}
              strokeDasharray="3 3"
            />
            <circle cx={tooltip.x} cy={yScale(tooltip.point.users)} r={5} fill="#6366f1" stroke="white" strokeWidth={2} />
            <circle cx={tooltip.x} cy={yScale(tooltip.point.subscribers)} r={5} fill="#10b981" stroke="white" strokeWidth={2} />

            {/* Tooltip box */}
            <rect
              x={tooltip.x + (tooltip.x > W / 2 ? -140 : 12)}
              y={Math.max(PAD.top, tooltip.y - 45)}
              width={128}
              height={54}
              rx={8}
              fill="var(--color-bg-card)"
              stroke="var(--color-border)"
            />
            <text
              x={tooltip.x + (tooltip.x > W / 2 ? -76 : 76)}
              y={Math.max(PAD.top, tooltip.y - 45) + 17}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-text-muted)"
            >
              {new Date(tooltip.point.date).toLocaleDateString()}
            </text>
            <text
              x={tooltip.x + (tooltip.x > W / 2 ? -76 : 76)}
              y={Math.max(PAD.top, tooltip.y - 45) + 33}
              textAnchor="middle"
              fontSize={11}
              fill="#6366f1"
              fontWeight="bold"
            >
              Users: {tooltip.point.users}
            </text>
            <text
              x={tooltip.x + (tooltip.x > W / 2 ? -76 : 76)}
              y={Math.max(PAD.top, tooltip.y - 45) + 47}
              textAnchor="middle"
              fontSize={11}
              fill="#10b981"
              fontWeight="bold"
            >
              Subscribers: {tooltip.point.subscribers}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 rounded bg-indigo-500" /> Users
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 rounded bg-emerald-500" /> Subscribers
        </span>
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════ 2. Bar Chart — Revenue / Plan Breakdown ═══════════════════════════ */

export function PlanBarChart({ data }: { data: PlanBreakdown }) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const bars: { label: string; value: number; color: string }[] = [
    { label: "Monthly", value: data.monthly, color: "#6366f1" },
    { label: "Annual", value: data.annual, color: "#a855f7" },
    { label: "Lifetime", value: data.lifetime, color: "#f59e0b" },
  ];

  const W = 300;
  const H = 240;
  const PAD = { top: 25, right: 20, bottom: 35, left: 20 };
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const yMax = Math.ceil(maxVal * 1.2) || 1;

  const barWidth = 50;
  const gap = (W - PAD.left - PAD.right - barWidth * bars.length) / (bars.length + 1);

  return (
    <ChartCard title="Subscription Plans" subtitle="Active subscriptions by plan type">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Y-axis grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD.top + chartH * (1 - frac);
          return (
            <line
              key={frac}
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="var(--color-border)"
              strokeOpacity={0.2}
              strokeDasharray="3 3"
            />
          );
        })}

        {bars.map((bar, i) => {
          const x = PAD.left + gap * (i + 1) + barWidth * i;
          const barH = (bar.value / yMax) * chartH;
          const y = PAD.top + chartH - barH;
          const animatedH = mounted || reducedMotion ? barH : 0;
          const animatedY = mounted || reducedMotion ? y : PAD.top + chartH;

          return (
            <g key={bar.label}>
              <rect
                x={x}
                y={animatedY}
                width={barWidth}
                height={animatedH}
                rx={6}
                fill={bar.color}
                opacity={0.85}
                style={
                  !reducedMotion
                    ? { transition: "y 0.8s ease-out, height 0.8s ease-out", transitionDelay: `${i * 0.15}s` }
                    : {}
                }
              />
              {/* Count label above bar */}
              <text
                x={x + barWidth / 2}
                y={animatedY - 6}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fill="var(--color-text)"
                style={
                  !reducedMotion
                    ? { transition: "y 0.8s ease-out", transitionDelay: `${i * 0.15}s` }
                    : {}
                }
              >
                {bar.value}
              </text>
              {/* Label below bar */}
              <text
                x={x + barWidth / 2}
                y={H - 10}
                textAnchor="middle"
                fontSize={12}
                fill="var(--color-text-muted)"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

/* ═══════════════════════════ 3. Donut Chart — Feedback Sentiment ═══════════════════════════ */

export function SentimentDonut({ data }: { data: FeedbackSentiment }) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = data.up + data.down;
  const positivePct = total > 0 ? Math.round((data.up / total) * 100) : 0;

  const SIZE = 240;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 90;
  const STROKE = 24;
  const circumference = 2 * Math.PI * R;

  const positiveLen = total > 0 ? (data.up / total) * circumference : 0;
  const negativeLen = total > 0 ? (data.down / total) * circumference : 0;

  if (total === 0) {
    return (
      <ChartCard title="Feedback Sentiment" subtitle="Thumbs up vs thumbs down">
        <div className="h-48 flex items-center justify-center text-sm text-[var(--color-text-muted)]">
          No feedback data yet
        </div>
      </ChartCard>
    );
  }

  // For the negative segment, offset by the positive arc length
  const negativeOffset = circumference - positiveLen;

  return (
    <ChartCard title="Feedback Sentiment" subtitle="Thumbs up vs thumbs down ratio">
      <div className="flex flex-col items-center">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-48 h-48">
          {/* Background ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--color-border)"
            strokeOpacity={0.15}
            strokeWidth={STROKE}
          />

          {/* Positive arc (emerald) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#10b981"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${positiveLen} ${circumference - positiveLen}`}
            strokeDashoffset={circumference * 0.25}
            style={
              !reducedMotion
                ? {
                    strokeDasharray: mounted
                      ? `${positiveLen} ${circumference - positiveLen}`
                      : `0 ${circumference}`,
                    transition: "stroke-dasharray 1s ease-out",
                  }
                : {}
            }
          />

          {/* Negative arc (rose) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${negativeLen} ${circumference - negativeLen}`}
            strokeDashoffset={circumference * 0.25 - positiveLen}
            style={
              !reducedMotion
                ? {
                    strokeDasharray: mounted
                      ? `${negativeLen} ${circumference - negativeLen}`
                      : `0 ${circumference}`,
                    transition: "stroke-dasharray 1s ease-out 0.3s",
                  }
                : {}
            }
          />

          {/* Center text */}
          <text x={CX} y={CY - 8} textAnchor="middle" fontSize={28} fontWeight="bold" fill="var(--color-text)">
            {positivePct}%
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" fontSize={12} fill="var(--color-text-muted)">
            positive
          </text>
          <text x={CX} y={CY + 30} textAnchor="middle" fontSize={11} fill="var(--color-text-muted)">
            {total} total
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" /> 👍 {data.up}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-rose-500" /> 👎 {data.down}
          </span>
        </div>
      </div>
    </ChartCard>
  );
}
