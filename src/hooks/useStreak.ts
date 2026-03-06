"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "open-ai-school-streak";

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

function loadStreak(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: "" };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as StreakData;
      // Reset streak if gap > 1 day
      const today = getToday();
      const yesterday = getYesterday();
      if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
        return { currentStreak: 0, longestStreak: data.longestStreak, lastActiveDate: data.lastActiveDate };
      }
      return data;
    }
  } catch {
    // ignore
  }
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: "" };
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveDate: "" });

  useEffect(() => {
    setStreak(loadStreak());
  }, []);

  const recordStreak = useCallback(() => {
    setStreak((prev) => {
      const today = getToday();
      const yesterday = getYesterday();

      // Already recorded today
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    recordStreak,
  };
}
