import { describe, expect, it } from "vitest";
import { generateCode as generateSignupCode } from "@/app/api/auth/signup/route";
import { generateCode as generateResendCode } from "@/app/api/auth/resend-code/route";

const CODE_RE = /^\d{6}$/;

describe("verification code generation", () => {
  it("keeps signup codes in the six-digit verification range", () => {
    const codes = Array.from({ length: 20 }, () => generateSignupCode());

    expect(codes.every((code) => CODE_RE.test(code))).toBe(true);
    expect(
      codes.every((code) => Number(code) >= 100000 && Number(code) <= 999999),
    ).toBe(true);
    expect(new Set(codes).size).toBeGreaterThan(1);
  });

  it("keeps resend codes in the six-digit verification range", () => {
    const codes = Array.from({ length: 20 }, () => generateResendCode());

    expect(codes.every((code) => CODE_RE.test(code))).toBe(true);
    expect(
      codes.every((code) => Number(code) >= 100000 && Number(code) <= 999999),
    ).toBe(true);
    expect(new Set(codes).size).toBeGreaterThan(1);
  });
});
