/**
 * Starter programmes are free. Premium programmes expose their first lesson
 * as a preview; the remaining lessons require an active Pro plan or admin role.
 */
const FREE_PROGRAMS = new Set([
  "ai-seeds",
  "ai-sprouts",
  "ai-sketch",
  "ai-launchpad",
]);

export function isFreeLessonAccess(
  programSlug: string,
  lessonOrder: number
): boolean {
  return FREE_PROGRAMS.has(programSlug) || lessonOrder === 1;
}

export function isFreeProgram(programSlug: string): boolean {
  return FREE_PROGRAMS.has(programSlug);
}

export function requiresPremium(
  programSlug: string,
  lessonOrder: number
): boolean {
  return !isFreeLessonAccess(programSlug, lessonOrder);
}
