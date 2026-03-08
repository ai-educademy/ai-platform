"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const STORAGE_PREFIX = "aieducademy-progress";
const SESSION_KEY = "aieducademy-session";

interface ProgramProgress {
  completed: string[];
  timestamps: Record<string, string>;
}

type ProgressData = Record<string, ProgramProgress>;

function emptyProgram(): ProgramProgress {
  return { completed: [], timestamps: {} };
}

/** Returns the guest profile username, or null */
function getGuestUser(): string | null {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.username) return parsed.username;
    }
  } catch { /* ignore */ }
  return null;
}

function storageKeyFor(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}-${userId}` : `${STORAGE_PREFIX}-guest`;
}

function migrateOldFormat(stored: string): ProgressData {
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return { "ai-seeds": { completed: parsed, timestamps: {} } };
    }
    if (parsed.completed && Array.isArray(parsed.completed)) {
      return { "ai-seeds": parsed as ProgramProgress };
    }
    return parsed as ProgressData;
  } catch {
    return {};
  }
}

// Migrate legacy global key to user-scoped key on first load
function migrateGlobalKey(userId: string | null) {
  const legacy = localStorage.getItem(STORAGE_PREFIX);
  if (!legacy) return;
  const userKey = storageKeyFor(userId);
  if (!localStorage.getItem(userKey)) {
    localStorage.setItem(userKey, legacy);
  }
  localStorage.removeItem(STORAGE_PREFIX);
}

export function useProgress(programSlug?: string) {
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = useState<ProgressData>({});
  const [storageKey, setStorageKey] = useState<string>(`${STORAGE_PREFIX}-guest`);
  const [isGuest, setIsGuest] = useState(true);

  // Resolve user identity from guest profile OR NextAuth OAuth session
  const resolveUserId = useCallback((): string | null => {
    const guest = getGuestUser();
    if (guest) return guest;
    const oauthId = session?.user?.email || session?.user?.name;
    if (oauthId) return `oauth-${oauthId}`;
    return null;
  }, [session]);

  useEffect(() => {
    // Don't run while NextAuth is still loading — prevents wiping progress
    if (sessionStatus === "loading") return;

    const userId = resolveUserId();
    migrateGlobalKey(userId);
    const key = storageKeyFor(userId);
    const signedIn = userId !== null;
    setStorageKey(key);
    setIsGuest(!signedIn);

    // Always load progress — guests use the "guest" key, signed-in users
    // use their scoped key. Never wipe guest progress on load.
    const stored = localStorage.getItem(key);
    if (stored) {
      setData(migrateOldFormat(stored));
    } else {
      setData({});
    }
  }, [resolveUserId, sessionStatus]);

  const getProgram = useCallback(
    (slug: string): ProgramProgress => data[slug] || emptyProgram(),
    [data]
  );

  const markComplete = useCallback((lessonKey: string) => {
    setData((prev) => {
      const parts = lessonKey.split("/");
      const pSlug = parts.length > 1 ? parts[0] : (programSlug || "ai-seeds");
      const lSlug = parts.length > 1 ? parts.slice(1).join("/") : parts[0];

      const prog = prev[pSlug] || emptyProgram();
      if (prog.completed.includes(lSlug)) return prev;

      const next: ProgressData = {
        ...prev,
        [pSlug]: {
          completed: [...prog.completed, lSlug],
          timestamps: { ...prog.timestamps, [lSlug]: new Date().toISOString() },
        },
      };
      // Always persist to localStorage (guest and signed-in users)
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [programSlug, storageKey, isGuest]);

  const isCompleted = useCallback(
    (lessonKey: string) => {
      const parts = lessonKey.split("/");
      const pSlug = parts.length > 1 ? parts[0] : (programSlug || "ai-seeds");
      const lSlug = parts.length > 1 ? parts.slice(1).join("/") : parts[0];
      return (data[pSlug]?.completed || []).includes(lSlug);
    },
    [data, programSlug]
  );

  const getCompletedAt = useCallback(
    (lessonKey: string) => {
      const parts = lessonKey.split("/");
      const pSlug = parts.length > 1 ? parts[0] : (programSlug || "ai-seeds");
      const lSlug = parts.length > 1 ? parts.slice(1).join("/") : parts[0];
      return data[pSlug]?.timestamps[lSlug] || null;
    },
    [data, programSlug]
  );

  const reset = useCallback(() => {
    setData({});
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Per-program counts
  const prog = programSlug ? getProgram(programSlug) : null;
  const completed = prog ? prog.completed : Object.values(data).flatMap((p) => p.completed);
  const completedCount = completed.length;

  // Total across all programs
  const totalCompleted = Object.values(data).reduce((sum, p) => sum + p.completed.length, 0);

  return {
    completed,
    completedCount,
    totalCompleted,
    markComplete,
    isCompleted,
    getCompletedAt,
    getProgram,
    allData: data,
    reset,
  };
}
