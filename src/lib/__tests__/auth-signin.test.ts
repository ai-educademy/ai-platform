import { describe, expect, it } from "vitest";
import {
  credentialsUserForSession,
  googleEmailVerificationPatch,
  roleForInitialToken,
  type CredentialsUserRow,
} from "@/lib/auth-signin";

const baseUser: CredentialsUserRow = {
  id: "user-1",
  name: "Learner",
  email: "learner@example.com",
  image: null,
  role: "free",
  password: "hashed-password",
  emailVerified: null,
};

describe("credentialsUserForSession", () => {
  it("allows an unverified password user to sign in", () => {
    const result = credentialsUserForSession(baseUser, true);

    expect(result).toEqual({
      id: "user-1",
      name: "Learner",
      email: "learner@example.com",
      image: null,
      role: "free",
      emailVerified: false,
    });
  });

  it("preserves an admin role during sign-in", () => {
    const result = credentialsUserForSession({ ...baseUser, role: "admin" }, true);

    expect(result?.role).toBe("admin");
  });

  it("rejects invalid passwords", () => {
    expect(credentialsUserForSession(baseUser, false)).toBeNull();
  });
});

describe("googleEmailVerificationPatch", () => {
  it("marks Google OAuth users as email verified without changing role", () => {
    const now = new Date("2026-09-25T00:00:00.000Z");
    const patch = googleEmailVerificationPatch("google", null, now);

    expect(patch).toEqual({ emailVerified: now, updatedAt: now });
    expect(patch).not.toHaveProperty("role");
  });

  it("does not overwrite an existing verification timestamp", () => {
    const now = new Date("2026-09-25T00:00:00.000Z");
    const existing = new Date("2026-09-01T00:00:00.000Z");

    expect(googleEmailVerificationPatch("google", existing, now)).toBeNull();
  });

  it("does nothing for non-Google providers", () => {
    expect(googleEmailVerificationPatch("github", null, new Date())).toBeNull();
  });
});

describe("roleForInitialToken", () => {
  it("uses the database role for OAuth users so admins are never demoted at sign-in", () => {
    expect(roleForInitialToken(undefined, "admin")).toBe("admin");
  });

  it("preserves the role already returned by credentials sign-in", () => {
    expect(roleForInitialToken("pro", "admin")).toBe("pro");
  });
});
