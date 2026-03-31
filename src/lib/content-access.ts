/**
 * Content access rules for the freemium model.
 *
 * When NEXT_PUBLIC_PREMIUM_ENABLED is "false", ALL content is free.
 *
 * Free programs (always accessible):
 *   - ai-seeds (Track 1, Level 1)
 *   - ai-sprouts (Track 1, Level 2)
 *   - ai-sketch (Track 2, Level 1)
 *   - ai-launchpad (Track 3, Level 1)
 *
 * Premium programs: everything else (levels 3-5 of each track, plus ai-chisel)
 *
 * Free lesson rule: the FIRST lesson of every program is free (teaser).
 */

const FREE_PROGRAMS = new Set([
  "ai-seeds",
  "ai-sprouts",
  "ai-sketch",
  "ai-launchpad",
]);

function isPremiumEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PREMIUM_ENABLED !== "false";
}

export function isFreeProgram(programSlug: string): boolean {
  if (!isPremiumEnabled()) return true;
  return FREE_PROGRAMS.has(programSlug);
}

export function isFreeLessonAccess(
  programSlug: string,
  lessonOrder: number
): boolean {
  if (!isPremiumEnabled()) return true;
  if (isFreeProgram(programSlug)) return true;
  if (lessonOrder === 1) return true;
  return false;
}

export function requiresPremium(
  programSlug: string,
  lessonOrder: number
): boolean {
  return !isFreeLessonAccess(programSlug, lessonOrder);
}
