import { getTranslations } from "next-intl/server";

const LANGUAGE_KEYS = [
  "en",
  "fr",
  "de",
  "es",
  "pt",
  "nl",
  "hi",
  "te",
  "ja",
  "zh",
  "ar",
] as const;

type Props = {
  /** The locale the reader asked for. */
  requestedLocale: string;
  /**
   * `fallback` - no translation exists and the English body was served.
   * `machine`  - a translation exists but it was machine generated.
   */
  variant: "fallback" | "machine";
};

/**
 * Tells the reader what language state this lesson body is actually in.
 *
 * Two different honesty problems are handled here. A fallback lesson renders
 * fully translated navigation, buttons and headings around an English body,
 * which reads as a bug rather than a known content gap. A machine-translated
 * lesson reads fluently enough that nobody would guess it was never reviewed by
 * a person, which on a paid product is worse: it invites the reader to trust
 * wording that may be subtly wrong.
 */
export async function ContentLanguageNotice({ requestedLocale, variant }: Props) {
  const t = await getTranslations("lessons");

  const languageName = (LANGUAGE_KEYS as readonly string[]).includes(requestedLocale)
    ? t(`languages.${requestedLocale}`)
    : requestedLocale;

  const message =
    variant === "fallback"
      ? t("fallbackNotice", { language: languageName })
      : t("machineTranslatedNotice", { language: languageName });

  return (
    <div
      role="note"
      className="mb-8 flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-section)] px-4 py-3"
    >
      <span aria-hidden="true" className="text-lg leading-6">
        {variant === "fallback" ? "🌐" : "🤖"}
      </span>
      <p className="text-sm leading-6 text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}
