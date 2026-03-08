import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { useGuestProfileState, simpleHash } from '@/hooks/useGuestProfile';

const ACCOUNTS_KEY = 'aieducademy-accounts';
const SESSION_KEY = 'aieducademy-session';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('simpleHash', () => {
  it('returns a non-empty string', () => {
    expect(simpleHash('password')).toBeTruthy();
    expect(typeof simpleHash('password')).toBe('string');
  });

  it('returns the same hash for the same input', () => {
    expect(simpleHash('hello')).toBe(simpleHash('hello'));
  });

  it('returns different hashes for different inputs', () => {
    expect(simpleHash('password1')).not.toBe(simpleHash('password2'));
  });
});

describe('useGuestProfileState', () => {
  describe('initial state', () => {
    it('starts with null profile when no session is stored', () => {
      const { result } = renderHook(() => useGuestProfileState());

      expect(result.current.profile).toBeNull();
      expect(result.current.isSignedIn).toBe(false);
    });

    it('loads existing profile from localStorage on mount', () => {
      const saved = {
        name: 'Ramesh',
        avatar: '🧑‍💻',
        joinedAt: '2024-01-01T00:00:00Z',
        username: 'ramesh',
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(saved));

      const { result } = renderHook(() => useGuestProfileState());

      expect(result.current.profile).toEqual(saved);
      expect(result.current.isSignedIn).toBe(true);
    });

    it('handles corrupted session data gracefully', () => {
      localStorage.setItem(SESSION_KEY, '{{{invalid json');

      const { result } = renderHook(() => useGuestProfileState());

      expect(result.current.profile).toBeNull();
    });
  });

  describe('saveProfile', () => {
    it('creates a new guest profile with a name', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.saveProfile('Alice');
      });

      expect(result.current.profile).not.toBeNull();
      expect(result.current.profile!.name).toBe('Alice');
      expect(result.current.isSignedIn).toBe(true);
    });

    it('trims whitespace from the name', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.saveProfile('  Bob  ');
      });

      expect(result.current.profile!.name).toBe('Bob');
    });

    it('assigns an avatar emoji', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.saveProfile('Charlie');
      });

      expect(result.current.profile!.avatar).toBeTruthy();
    });

    it('sets a joinedAt timestamp', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.saveProfile('Test');
      });

      expect(new Date(result.current.profile!.joinedAt).getTime()).not.toBeNaN();
    });

    it('persists profile to localStorage', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.saveProfile('Dana');
      });

      const stored = JSON.parse(localStorage.getItem(SESSION_KEY)!);
      expect(stored.name).toBe('Dana');
    });
  });

  describe('signUp', () => {
    it('creates a new account and signs in', () => {
      const { result } = renderHook(() => useGuestProfileState());

      let res: { success: boolean; error?: string };
      act(() => {
        res = result.current.signUp('alice', 'password123', 'Alice Smith');
      });

      expect(res!.success).toBe(true);
      expect(result.current.profile).not.toBeNull();
      expect(result.current.profile!.username).toBe('alice');
      expect(result.current.profile!.name).toBe('Alice Smith');
    });

    it('rejects duplicate usernames (case-insensitive)', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.signUp('alice', 'pass1', 'Alice');
      });

      let res: { success: boolean; error?: string };
      act(() => {
        res = result.current.signUp('ALICE', 'pass2', 'Alice 2');
      });

      expect(res!.success).toBe(false);
      expect(res!.error).toBe('usernameTaken');
    });

    it('stores account in accounts list', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.signUp('bob', 'pass', 'Bob');
      });

      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY)!);
      expect(accounts).toHaveLength(1);
      expect(accounts[0].username).toBe('bob');
      expect(accounts[0].passwordHash).toBe(simpleHash('pass'));
    });
  });

  describe('signIn', () => {
    it('signs in with correct credentials', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.signUp('charlie', 'secret', 'Charlie');
      });
      act(() => {
        result.current.clearProfile();
      });
      expect(result.current.profile).toBeNull();

      let res: { success: boolean; error?: string };
      act(() => {
        res = result.current.signIn('charlie', 'secret');
      });

      expect(res!.success).toBe(true);
      expect(result.current.profile!.username).toBe('charlie');
    });

    it('rejects wrong password', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.signUp('dave', 'correct', 'Dave');
      });
      act(() => {
        result.current.clearProfile();
      });

      let res: { success: boolean; error?: string };
      act(() => {
        res = result.current.signIn('dave', 'wrong');
      });

      expect(res!.success).toBe(false);
      expect(res!.error).toBe('invalidCredentials');
    });

    it('rejects non-existent username', () => {
      const { result } = renderHook(() => useGuestProfileState());

      let res: { success: boolean; error?: string };
      act(() => {
        res = result.current.signIn('nobody', 'pass');
      });

      expect(res!.success).toBe(false);
      expect(res!.error).toBe('invalidCredentials');
    });

    it('is case-insensitive for username', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.signUp('eve', 'pass', 'Eve');
      });
      act(() => {
        result.current.clearProfile();
      });

      let res: { success: boolean; error?: string };
      act(() => {
        res = result.current.signIn('EVE', 'pass');
      });

      expect(res!.success).toBe(true);
    });
  });

  describe('clearProfile', () => {
    it('clears the profile and removes session from localStorage', () => {
      const { result } = renderHook(() => useGuestProfileState());

      act(() => {
        result.current.saveProfile('Test');
      });
      expect(result.current.isSignedIn).toBe(true);

      act(() => {
        result.current.clearProfile();
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.isSignedIn).toBe(false);
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });
});
