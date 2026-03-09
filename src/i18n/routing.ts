import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "nl", "hi", "te"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
