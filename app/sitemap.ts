import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/locale";
import { getAllHairstyleSlugs } from "@/services/hairstyles";

const baseUrl = (
  process.env.NEXT_PUBLIC_WEB_URL || "https://www.tryonhairstyle.com"
).replace(/\/$/, "");

function getLocalizedPath(path: string, locale: string) {
  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;

  if (locale === defaultLocale) {
    return normalizedPath || "/";
  }

  return `/${locale}${normalizedPath}`;
}

function getUrl(path: string, locale: string) {
  return `${baseUrl}${getLocalizedPath(path, locale)}`;
}

function getLanguageAlternates(path: string) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, getUrl(path, locale)])
    ),
    "x-default": getUrl(path, defaultLocale),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    {
      path: "/",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      path: "/hairstyles",
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...getAllHairstyleSlugs().map((slug) => ({
      path: `/hairstyles/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: getUrl(route.path, locale),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: getLanguageAlternates(route.path),
      },
    }))
  );
}
