import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { useProgress } from '@/hooks/useProgress';

const STORAGE_PREFIX = 'aieducademy-progress';
const SESSION_KEY = 'aieducademy-session';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useProgress', () => {
  describe('initial state', () => {
    it('starts with empty progress when localStorage has no data', () => {
      const { result } = renderHook(() => useProgress('ai-seeds'));

      expect(result.current.completedCount).toBe(0);
      expect(result.current.completed).toEqual([]);
      expect(result.current.totalCompleted).toBe(0);
    });

    it('returns empty allData when nothing is stored', () => {
      const { result } = renderHook(() => useProgress());

      expect(result.current.allData).toEqual({});
    });
  });

  describe('markComplete', () => {
    it('marks a lesson as complete for the given program', () => {
      const { result } = renderHook(() => useProgress('ai-seeds'));

      act(() => {
        result.current.markComplete('lesson-1');
      });

      expect(result.current.isCompleted('lesson-1')).toBe(true);
      expect(result.current.completedCount).toBe(1);
    });

    it('does not duplicate a lesson that is already completed', () => {
      const { result } = renderHook(() => useProgress('ai-seeds'));

      act(() => {
        result.current.markComplete('lesson-1');
      });
      act(() => {
        result.current.markComplete('lesson-1');
      });

      expect(result.current.completedCount).toBe(1);
    });

    it('supports program/lesson composite keys', () => {
      const { result } = renderHook(() => useProgress());

      act(() => {
        result.current.markComplete('ai-sprouts/intro');
      });

      expect(result.current.isCompleted('ai-sprouts/intro')).toBe(true);
    });

    it('stores a timestamp when marking a lesson complete', () => {
      const { result } = renderHook(() => useProgress('ai-seeds'));

      act(() => {
        result.current.markComplete('lesson-1');
      });

      const ts = result.current.getCompletedAt('lesson-1');
      expect(ts).toBeTruthy();
      expect(new Date(ts!).getTime()).not.toBeNaN();
    });
  });

  describe('completion percentage / counts', () => {
    it('counts completed lessons per program', () => {
      const { result } = renderHook(() => useProgress('ai-seeds'));

      act(() => {
        result.current.markComplete('lesson-1');
      });
      act(() => {
        result.current.markComplete('lesson-2');
      });

      expect(result.current.completedCount).toBe(2);
      expect(result.current.completed).toEqual(['lesson-1', 'lesson-2']);
    });

    it('tracks totalCompleted across programs', () => {
      const { result } = renderHook(() => useProgress());

      act(() => {
        result.current.markComplete('ai-seeds/lesson-1');
      });
      act(() => {
        result.current.markComplete('ai-sprouts/intro');
      });

      expect(result.current.totalCompleted).toBe(2);
    });
  });

  describe('persistence', () => {
    it('persists progress to localStorage', () => {
      const { result } = renderHook(() => useProgress('ai-seeds'));

      act(() => {
        result.current.markComplete('lesson-1');
      });

      const stored = localStorage.getItem(`${STORAGE_PREFIX}-guest`);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed['ai-seeds'].completed).toContain('lesson-1');
    });

    it('loads saved progress from localStorage on mount', () => {
      const saved = {
        'ai-seeds': {
          completed: ['lesson-1', 'lesson-2'],
          timestamps: { 'lesson-1': '2024-01-01T00:00:00Z', 'lesson-2': '2024-01-02T00:00:00Z' },
        },
      };
      localStorage.setItem(`${STORAGE_PREFIX}-guest`, JSON.stringify(saved));

      const { result } = renderHook(() => useProgress('ai-seeds'));

      expect(result.current.completedCount).toBe(2);
      expect(result.current.isCompleted('lesson-1')).toBe(true);
    });

    it('uses user-scoped key when guest profile is present', () => {
      const session = { username: 'testuser', name: 'Test', avatar: '🧑', joinedAt: '2024-01-01' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      const saved = { 'ai-seeds': { completed: ['lesson-1'], timestamps: {} } };
      localStorage.setItem(`${STORAGE_PREFIX}-testuser`, JSON.stringify(saved));

      const { result } = renderHook(() => useProgress('ai-seeds'));

      expect(result.current.isCompleted('lesson-1')).toBe(true);
    });
  });

  describe('corrupted localStorage', () => {
    it('handles corrupted progress data gracefully', () => {
      localStorage.setItem(`${STORAGE_PREFIX}-guest`, 'not-valid-json!!!');

      const { result } = renderHook(() => useProgress('ai-seeds'));

      expect(result.current.completedCount).toBe(0);
      expect(result.current.completed).toEqual([]);
    });

    it('handles corrupted session data gracefully', () => {
      localStorage.setItem(SESSION_KEY, '{{{bad json');

      const { result } = renderHook(() => useProgress('ai-seeds'));

      // Should fall back to guest key without crashing
      expect(result.current.completedCount).toBe(0);
    });
  });

  describe('legacy migration', () => {
    it('migrates old array format to program-scoped format', () => {
      localStorage.setItem(`${STORAGE_PREFIX}-guest`, JSON.stringify(['lesson-a', 'lesson-b']));

      const { result } = renderHook(() => useProgress('ai-seeds'));

      expect(result.current.allData['ai-seeds']).toBeDefined();
      expect(result.current.allData['ai-seeds'].completed).toEqual(['lesson-a', 'lesson-b']);
    });

    it('migrates old flat completed format', () => {
      localStorage.setItem(
        `${STORAGE_PREFIX}-guest`,
        JSON.stringify({ completed: ['l1'], timestamps: {} }),
      );

      const { result } = renderHook(() => useProgress('ai-seeds'));

      expect(result.current.allData['ai-seeds']).toBeDefined();
      expect(result.current.allData['ai-seeds'].completed).toContain('l1');
    });
  });

  describe('reset', () => {
    it('clears all progress and removes from localStorage', () => {
      const { result } = renderHook(() => useProgress('ai-seeds'));

      act(() => {
        result.current.markComplete('lesson-1');
      });
      expect(result.current.completedCount).toBe(1);

      act(() => {
        result.current.reset();
      });

      expect(result.current.completedCount).toBe(0);
      expect(localStorage.getItem(`${STORAGE_PREFIX}-guest`)).toBeNull();
    });
  });

  describe('getProgram', () => {
    it('returns empty program for unknown slug', () => {
      const { result } = renderHook(() => useProgress());
      const prog = result.current.getProgram('unknown-program');

      expect(prog.completed).toEqual([]);
      expect(prog.timestamps).toEqual({});
    });
  });
});
