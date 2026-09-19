import { describe, expect, it } from "vitest";
import {
  isFreeLessonAccess,
  isFreeProgram,
  requiresPremium,
} from "@/lib/content-access";
import { routing } from "@/i18n/routing";
import { getLessons } from "@/lib/lessons";
import { getPrograms } from "@/lib/programs";

describe("content access", () => {
  it("gives every programme, including the former starter tier, only a one-lesson taste", () => {
    for (const program of [
      "ai-seeds",
      "ai-sprouts",
      "ai-sketch",
      "ai-launchpad",
    ]) {
      expect(isFreeProgram(program)).toBe(false);
      expect(isFreeLessonAccess(program, 1)).toBe(true);
      expect(requiresPremium(program, 1)).toBe(false);
      expect(isFreeLessonAccess(program, 2)).toBe(false);
      expect(requiresPremium(program, 2)).toBe(true);
    }
  });

  it("makes the first lesson of other programmes a free preview", () => {
    expect(isFreeProgram("ai-forest")).toBe(false);
    expect(isFreeLessonAccess("ai-forest", 1)).toBe(true);
    expect(requiresPremium("ai-forest", 1)).toBe(false);
    expect(isFreeLessonAccess("ai-forest", 2)).toBe(false);
    expect(requiresPremium("ai-forest", 2)).toBe(true);
  });

  it("given every locale, when published lessons are gated, then only order 1 is free", () => {
    for (const locale of routing.locales) {
      for (const program of getPrograms()) {
        const lessons = getLessons(program.slug, locale);

        for (const lesson of lessons) {
          expect(
            requiresPremium(program.slug, lesson.order),
            `${locale}/${program.slug}/${lesson.slug} order ${lesson.order}`,
          ).toBe(lesson.order !== 1);
        }
      }
    }
  });
});
