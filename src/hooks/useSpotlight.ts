"use client";

import { useState, useCallback } from "react";

interface SpotlightState {
  x: number;
  y: number;
  isHovering: boolean;
}

/**
 * Mouse-following spotlight hook.
 * Returns position state and handlers to create a radial glow that tracks the cursor.
 */
export function useSpotlight() {
  const [state, setState] = useState<SpotlightState>({
    x: 0,
    y: 0,
    isHovering: false,
  });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setState({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovering: true,
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isHovering: false }));
  }, []);

  const spotlightStyle: React.CSSProperties = {
    background: `radial-gradient(400px circle at ${state.x}px ${state.y}px, var(--color-primary-glow), transparent 70%)`,
    opacity: state.isHovering ? 1 : 0,
  };

  return { spotlightStyle, onMouseMove, onMouseLeave, pos: state };
}
