"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "aieducademy-streak";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function loadStreakFromStorage(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: "" };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as StreakData;
      const today = getToday();
      const yesterday = getYesterday();
      if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
        return { currentStreak: 0, longestStreak: data.longestStreak, lastActiveDate: data.lastActiveDate };
      }
      return data;
    }
  } catch { /* localStorage unavailable */ }
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: "" };
}

function saveStreakToStorage(data: StreakData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/** Merge two streak sources, taking the better values */
function mergeStreaks(a: StreakData, b: StreakData): StreakData {
  const best = a.currentStreak >= b.currentStreak ? a : b;
  return {
    currentStreak: best.currentStreak,
    longestStreak: Math.max(a.longestStreak, b.longestStreak),
    lastActiveDate: best.lastActiveDate,
  };
}

export function useStreak() {
  const { data: session, status: sessionStatus } = useSession();
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveDate: "" });
  const isGuest = sessionStatus !== "authenticated" || !session?.user?.id;

  // Load streak on mount / session change
  useEffect(() => {
    if (sessionStatus === "loading") return;

    const local = loadStreakFromStorage();

    if (isGuest) {
      setStreak(local);
      return;
    }

    // Signed-in: fetch from DB, merge with localStorage
    fetch("/api/streak")
      .then((r) => (r.ok ? r.json() : null))
      .then((db: { currentStreak: number; longestStreak: number; lastActivityDate: string } | null) => {
        if (!db || (!db.lastActivityDate && !local.lastActiveDate)) {
          setStreak(local);
          // Migrate localStorage data to DB if it exists
          if (local.lastActiveDate) {
            fetch("/api/streak", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentStreak: local.currentStreak,
                longestStreak: local.longestStreak,
                lastActivityDate: local.lastActiveDate,
              }),
            }).catch(() => {});
          }
          return;
        }

        if (!db.lastActivityDate) {
          // DB empty, localStorage has data → migrate to DB
          setStreak(local);
          fetch("/api/streak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currentStreak: local.currentStreak,
              longestStreak: local.longestStreak,
              lastActivityDate: local.lastActiveDate,
            }),
          }).catch(() => {});
          return;
        }

        // Both have data → merge (DB is source of truth, but take higher values)
        const dbStreak: StreakData = {
          currentStreak: db.currentStreak,
          longestStreak: db.longestStreak,
          lastActiveDate: db.lastActivityDate,
        };
        const merged = mergeStreaks(dbStreak, local);
        setStreak(merged);
        saveStreakToStorage(merged);
      })
      .catch(() => {
        // API failed — fall back to localStorage
        setStreak(local);
      });
    // Intentionally keyed on auth state only: this syncs once per sign-in
    // transition and must not re-run when the streak value itself changes.
  }, [sessionStatus, isGuest]);

  const recordStreak = useCallback(() => {
    setStreak((prev) => {
      const today = getToday();
      const yesterday = getYesterday();

      if (prev.lastActiveDate === today) return prev;

      let newCurrent: number;
      if (prev.lastActiveDate === yesterday) {
        newCurrent = prev.currentStreak + 1;
      } else {
        newCurrent = 1;
      }

      const newLongest = Math.max(prev.longestStreak, newCurrent);
      const next: StreakData = {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today,
      };

      // Always update localStorage
      saveStreakToStorage(next);

      // Fire-and-forget sync to DB for signed-in users
      if (!isGuest) {
        fetch("/api/streak", { method: "POST" }).catch(() => {});
      }

      return next;
    });
  }, [isGuest]);

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    recordStreak,
  };
}
