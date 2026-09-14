/**
 * Course access is paid. The public site can still expose programme
 * descriptions, the Lab, and articles, but lesson content requires a plan.
 */
export function isFreeProgram(_programSlug: string): boolean {
  return false;
}

export function isFreeLessonAccess(
  _programSlug: string,
  _lessonOrder: number
): boolean {
  return false;
}

export function requiresPremium(
  programSlug: string,
  lessonOrder: number
): boolean {
  return !isFreeLessonAccess(programSlug, lessonOrder);
}
