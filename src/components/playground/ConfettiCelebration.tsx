"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* Confetti celebration using Framer Motion for smooth animations */
export default function ConfettiCelebration() {
  const prefersReduced = useReducedMotion();
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; color: string; delay: number; size: number; shape: "circle" | "square" }>
  >([]);

  useEffect(() => {
    if (prefersReduced) return;
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#eab308", "#34d399", "#06b6d4", "#f43f5e"];
    const p = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.6,
      size: Math.random() * 6 + 4,
      shape: (Math.random() > 0.5 ? "circle" : "square") as "circle" | "square",
    }));
    setParticles(p);
  }, [prefersReduced]);

  if (prefersReduced || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: 450,
            opacity: 0,
            rotate: 720,
            scale: 0.3,
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
