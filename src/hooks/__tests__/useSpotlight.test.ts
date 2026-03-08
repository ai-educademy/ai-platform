import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpotlight } from '@/hooks/useSpotlight';

function createMouseEvent(clientX: number, clientY: number, rect = { left: 0, top: 0 }) {
  return {
    clientX,
    clientY,
    currentTarget: {
      getBoundingClientRect: () => ({ left: rect.left, top: rect.top }),
    },
  } as unknown as React.MouseEvent<HTMLDivElement>;
}

describe('useSpotlight', () => {
  it('starts with isHovering false and position at 0,0', () => {
    const { result } = renderHook(() => useSpotlight());

    expect(result.current.pos.isHovering).toBe(false);
    expect(result.current.pos.x).toBe(0);
    expect(result.current.pos.y).toBe(0);
  });

  it('updates position on mouse move', () => {
    const { result } = renderHook(() => useSpotlight());

    act(() => {
      result.current.onMouseMove(createMouseEvent(150, 200));
    });

    expect(result.current.pos.x).toBe(150);
    expect(result.current.pos.y).toBe(200);
    expect(result.current.pos.isHovering).toBe(true);
  });

  it('offsets position by element bounding rect', () => {
    const { result } = renderHook(() => useSpotlight());

    act(() => {
      result.current.onMouseMove(createMouseEvent(200, 300, { left: 50, top: 100 }));
    });

    expect(result.current.pos.x).toBe(150);
    expect(result.current.pos.y).toBe(200);
  });

  it('sets isHovering to false on mouse leave', () => {
    const { result } = renderHook(() => useSpotlight());

    act(() => {
      result.current.onMouseMove(createMouseEvent(100, 100));
    });
    expect(result.current.pos.isHovering).toBe(true);

    act(() => {
      result.current.onMouseLeave();
    });
    expect(result.current.pos.isHovering).toBe(false);
  });

  it('preserves position after mouse leave', () => {
    const { result } = renderHook(() => useSpotlight());

    act(() => {
      result.current.onMouseMove(createMouseEvent(42, 84));
    });
    act(() => {
      result.current.onMouseLeave();
    });

    expect(result.current.pos.x).toBe(42);
    expect(result.current.pos.y).toBe(84);
  });

  it('returns a spotlight style with radial gradient', () => {
    const { result } = renderHook(() => useSpotlight());

    act(() => {
      result.current.onMouseMove(createMouseEvent(10, 20));
    });

    expect(result.current.spotlightStyle.background).toContain('radial-gradient');
    expect(result.current.spotlightStyle.background).toContain('10px');
    expect(result.current.spotlightStyle.background).toContain('20px');
  });

  it('sets opacity to 1 when hovering, 0 when not', () => {
    const { result } = renderHook(() => useSpotlight());

    expect(result.current.spotlightStyle.opacity).toBe(0);

    act(() => {
      result.current.onMouseMove(createMouseEvent(10, 20));
    });
    expect(result.current.spotlightStyle.opacity).toBe(1);

    act(() => {
      result.current.onMouseLeave();
    });
    expect(result.current.spotlightStyle.opacity).toBe(0);
  });
});
