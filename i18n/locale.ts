import { Pathnames } from "next-intl/routing";

export const locales = ["en", "de", "fr", "es", "ja", "zh-cn", "zh-tw", "ko","ru"];

export const localeNames: any = {
  en: "English",
  de: "German",
  fr: "French",
  es: "Spanish",
  ja: "Japanese",
  "zh-cn": "中文（简体）",
  "zh-tw": "中文（繁體）",
  ko: "Korean",
  ru: "Russian"
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";

export const pathnames = {
  en: {
    "privacy-policy": "/privacy-policy",
    "terms-of-service": "/terms-of-service",
  },
} satisfies Pathnames<typeof locales>;
