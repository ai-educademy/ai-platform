/**
 * Type for translation functions accepting dynamic string keys.
 * Use when i18n keys are constructed at runtime (e.g. `${slug}.title`).
 */
export type DynamicTranslate = (key: string, values?: Record<string, string | number>) => string;
