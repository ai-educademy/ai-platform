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
};

/**
 * Tells the reader that this lesson has not been translated yet.
 *
 * Without this the page renders fully translated navigation, buttons and
 * headings around an English lesson body, which reads as a bug rather than as
 * a known gap in the content.
 */
export async function FallbackContentNotice({ requestedLocale }: Props) {
  const t = await getTranslations("lessons");

  const languageName = (LANGUAGE_KEYS as readonly string[]).includes(
    requestedLocale
  )
    ? t(`languages.${requestedLocale}`)
    : requestedLocale;

  return (
    <div
      role="note"
      className="mb-8 flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-section)] px-4 py-3"
    >
      <span aria-hidden="true" className="text-lg leading-6">
        🌐
      </span>
      <p className="text-sm leading-6 text-[var(--color-text-muted)]">
        {t("fallbackNotice", { language: languageName })}
      </p>
    </div>
  );
}
