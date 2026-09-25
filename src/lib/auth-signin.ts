export type CredentialsUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "free" | "pro" | "admin";
  password: string | null;
  emailVerified: Date | null;
};

export type AuthorizedCredentialsUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "free" | "pro" | "admin";
  image: string | null;
  emailVerified: boolean;
};

export function credentialsUserForSession(
  user: CredentialsUserRow | undefined,
  passwordValid: boolean,
): AuthorizedCredentialsUser | null {
  if (!user || !user.password || !passwordValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    emailVerified: Boolean(user.emailVerified),
  };
}

export function googleEmailVerificationPatch(
  provider: string | undefined,
  alreadyVerified: boolean | Date | null | undefined,
  now: Date,
): { emailVerified: Date; updatedAt: Date } | null {
  if (provider !== "google" || alreadyVerified) return null;
  return { emailVerified: now, updatedAt: now };
}

export function roleForInitialToken(
  userRole: string | undefined,
  databaseRole: string | null | undefined,
): string {
  return userRole ?? databaseRole ?? "free";
}
