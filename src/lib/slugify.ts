/**
 * Converts heading text to a URL-friendly slug for anchor IDs.
 * Matches the logic used in TableOfContents and heading ID generation.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
