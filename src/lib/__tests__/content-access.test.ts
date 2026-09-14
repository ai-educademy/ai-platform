import { describe, expect, it } from "vitest";
import {
  isFreeLessonAccess,
  isFreeProgram,
  requiresPremium,
} from "@/lib/content-access";

describe("content access", () => {
  it("keeps the starter programmes fully free", () => {
    for (const program of [
      "ai-seeds",
      "ai-sprouts",
      "ai-sketch",
      "ai-launchpad",
    ]) {
      expect(isFreeProgram(program)).toBe(true);
      expect(isFreeLessonAccess(program, 1)).toBe(true);
      expect(isFreeLessonAccess(program, 10)).toBe(true);
      expect(requiresPremium(program, 10)).toBe(false);
    }
  });

  it("makes the first lesson of other programmes a free preview", () => {
    expect(isFreeProgram("ai-forest")).toBe(false);
    expect(isFreeLessonAccess("ai-forest", 1)).toBe(true);
    expect(requiresPremium("ai-forest", 1)).toBe(false);
    expect(isFreeLessonAccess("ai-forest", 2)).toBe(false);
    expect(requiresPremium("ai-forest", 2)).toBe(true);
  });
});
