"use client";

import { useState, useCallback, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltDeg?: number;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 20 };

/**
 * 3D perspective tilt card that follows mouse position.
 * Subtle - max rotation controlled by tiltDeg (default 4°).
 * Springs back to flat on mouse leave. Respects prefers-reduced-motion.
 */
export function TiltCard({
  children,
  className = "",
  tiltDeg = 4,
}: TiltCardProps) {
  const prefersReduced = useReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rotateX: -y * tiltDeg, rotateY: x * tiltDeg });
    },
    [tiltDeg, prefersReduced],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={tilt}
      transition={spring}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}
