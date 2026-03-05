"use client";

import { createContext, useContext, useCallback, useState, useEffect } from "react";

const ACCOUNTS_KEY = "open-ai-school-accounts";
const SESSION_KEY = "open-ai-school-session";

export interface GuestProfile {
  name: string;
  avatar: string;
  joinedAt: string;
  username: string;
}

export interface StoredAccount {
  username: string;
  displayName: string;
  passwordHash: string;
  avatar: string;
  joinedAt: string;
}

interface GuestProfileContextValue {
  profile: GuestProfile | null;
  saveProfile: (name: string) => void;
  clearProfile: () => void;
  isSignedIn: boolean;
  signUp: (username: string, password: string, displayName: string) => { success: boolean; error?: string };
  signIn: (username: string, password: string) => { success: boolean; error?: string };
}

const avatars = ["🧑‍🎓", "👨‍💻", "👩‍💻", "🧑‍🔬", "👨‍🔬", "👩‍🔬", "🧑‍🏫", "👨‍🏫", "👩‍🏫", "🦊", "🐱", "🐼", "🦉", "🐬", "🦋", "🌻", "🍄", "🌈"];

function pickAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return avatars[Math.abs(hash) % avatars.length];
}

export function simpleHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function getAccounts(): StoredAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function profileFromAccount(account: StoredAccount): GuestProfile {
  return {
    name: account.displayName,
    avatar: account.avatar,
    joinedAt: account.joinedAt,
    username: account.username,
  };
}

export function useGuestProfileState(): GuestProfileContextValue {
  const [profile, setProfile] = useState<GuestProfile | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
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
      username: "",
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
  }, []);

  const signUp = useCallback((username: string, password: string, displayName: string): { success: boolean; error?: string } => {
    const accounts = getAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: "usernameTaken" };
    }
    const account: StoredAccount = {
      username: username.toLowerCase(),
      displayName: displayName.trim(),
      passwordHash: simpleHash(password),
      avatar: pickAvatar(displayName),
      joinedAt: new Date().toISOString(),
    };
    accounts.push(account);
    saveAccounts(accounts);
    const p = profileFromAccount(account);
    localStorage.setItem(SESSION_KEY, JSON.stringify(p));
    setProfile(p);
    return { success: true };
  }, []);

  const signIn = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    const accounts = getAccounts();
    const account = accounts.find((a) => a.username.toLowerCase() === username.toLowerCase());
    if (!account || account.passwordHash !== simpleHash(password)) {
      return { success: false, error: "invalidCredentials" };
    }
    const p = profileFromAccount(account);
    localStorage.setItem(SESSION_KEY, JSON.stringify(p));
    setProfile(p);
    return { success: true };
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem("open-ai-school-progress");
    localStorage.removeItem(SESSION_KEY);
    setProfile(null);
  }, []);

  return {
    profile,
    saveProfile,
    clearProfile,
    isSignedIn: !!profile,
    signUp,
    signIn,
  };
}

export const GuestProfileContext = createContext<GuestProfileContextValue>({
  profile: null,
  saveProfile: () => {},
  clearProfile: () => {},
  isSignedIn: false,
  signUp: () => ({ success: false }),
  signIn: () => ({ success: false }),
});

export function useGuestProfile() {
  return useContext(GuestProfileContext);
}
