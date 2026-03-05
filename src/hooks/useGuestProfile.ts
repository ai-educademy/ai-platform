"use client";

import { createContext, useContext, useCallback, useState, useEffect } from "react";

const PROFILE_KEY = "open-ai-school-profile";

export interface GuestProfile {
  name: string;
  avatar: string;
  joinedAt: string;
}

interface GuestProfileContextValue {
  profile: GuestProfile | null;
  saveProfile: (name: string) => void;
  clearProfile: () => void;
  isSignedIn: boolean;
}

const avatars = ["🧑‍🎓", "👨‍💻", "👩‍💻", "🧑‍🔬", "👨‍🔬", "👩‍🔬", "🧑‍🏫", "👨‍🏫", "👩‍🏫", "🦊", "🐱", "🐼", "🦉", "🐬", "🦋", "🌻", "🍄", "🌈"];

function pickAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return avatars[Math.abs(hash) % avatars.length];
}

export function useGuestProfileState(): GuestProfileContextValue {
  const [profile, setProfile] = useState<GuestProfile | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) setProfile(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const saveProfile = useCallback((name: string) => {
    const newProfile: GuestProfile = {
      name: name.trim(),
      avatar: pickAvatar(name),
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
  }, []);

  const clearProfile = useCallback(() => {
    // Also clear progress data on sign-out so tracking doesn't persist
    localStorage.removeItem("open-ai-school-progress");
    localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }, []);

  return {
    profile,
    saveProfile,
    clearProfile,
    isSignedIn: !!profile,
  };
}

export const GuestProfileContext = createContext<GuestProfileContextValue>({
  profile: null,
  saveProfile: () => {},
  clearProfile: () => {},
  isSignedIn: false,
});

export function useGuestProfile() {
  return useContext(GuestProfileContext);
}
