/**
 * Every programme exposes its first lesson as a free preview; the remaining
 * lessons require an active Pro plan or admin role. No programme is fully free.
 */
export function isFreeLessonAccess(
  _programSlug: string,
  lessonOrder: number
): boolean {
  return lessonOrder === 1;
}

export function isFreeProgram(_programSlug: string): boolean {
  return false;
}

export function requiresPremium(
  programSlug: string,
  lessonOrder: number
): boolean {
  return !isFreeLessonAccess(programSlug, lessonOrder);
}
