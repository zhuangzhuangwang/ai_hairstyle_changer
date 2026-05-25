import {
  HairstyleIndexPage,
  HairstylePage,
  HairstyleRelatedItem,
  HairstyleSharedAssets,
} from "@/types/pages/hairstyles";

export const hairstyleSlugs = [
  "buzz-cut",
  "hair-trends-bob",
  "shoulder-length-hair",
] as const;

export type HairstyleSlug = (typeof hairstyleSlugs)[number];

const localeAliases: Record<string, string> = {
  "zh-CN": "zh-cn",
  "zh-TW": "zh-tw",
  zh: "zh-cn",
};

function normalizeLocale(locale: string) {
  return localeAliases[locale] || locale.toLowerCase();
}

export function isHairstyleSlug(slug: string): slug is HairstyleSlug {
  return hairstyleSlugs.includes(slug as HairstyleSlug);
}

export function getAllHairstyleSlugs() {
  return [...hairstyleSlugs];
}

async function getHairstyleSharedAssets(
  slug: HairstyleSlug
): Promise<HairstyleSharedAssets> {
  try {
    return await import(`@/i18n/pages/hairstyles/${slug}/assets.json`).then(
      (module) => module.default as HairstyleSharedAssets
    );
  } catch (error) {
    return {};
  }
}

async function applyIndexSharedAssets(page: HairstyleIndexPage) {
  const items = await Promise.all(
    page.items.map(async (item) => {
      if (!isHairstyleSlug(item.slug)) {
        return item;
      }

      const assets = await getHairstyleSharedAssets(item.slug);
      const src = assets.images?.index || assets.images?.hero;

      if (!src) {
        return item;
      }

      return {
        ...item,
        image: {
          ...item.image,
          src,
        },
      };
    })
  );

  return {
    ...page,
    items,
  };
}

function applyPageSharedAssets(
  page: HairstylePage,
  assets: HairstyleSharedAssets
) {
  const heroImageSrc = assets.images?.hero;
  const sectionImages = assets.images?.sections || {};

  return {
    ...page,
    hero: {
      ...page.hero,
      image: heroImageSrc
        ? {
            ...page.hero.image,
            src: heroImageSrc,
          }
        : page.hero.image,
    },
    sections: page.sections.map((section) => {
      const imageSrcs = sectionImages[section.id] || [];
      let imageIndex = 0;

      return {
        ...section,
        content: section.content.map((block) => {
          if (block.type !== "image") {
            return block;
          }

          const src = imageSrcs[imageIndex];
          imageIndex += 1;

          return src
            ? {
                ...block,
                src,
              }
            : block;
        }),
      };
    }),
  };
}

export async function getHairstyleIndexPage(
  locale: string
): Promise<HairstyleIndexPage> {
  const normalizedLocale = normalizeLocale(locale);

  try {
    const page = await import(
      `@/i18n/pages/hairstyles/index/${normalizedLocale}.json`
    ).then((module) => module.default as HairstyleIndexPage);
    return applyIndexSharedAssets(page);
  } catch (error) {
    const page = await import("@/i18n/pages/hairstyles/index/en.json").then(
      (module) => module.default as HairstyleIndexPage
    );
    return applyIndexSharedAssets(page);
  }
}

export async function getHairstylePage(
  slug: string,
  locale: string
): Promise<HairstylePage | null> {
  if (!isHairstyleSlug(slug)) {
    return null;
  }

  const normalizedLocale = normalizeLocale(locale);
  const assets = await getHairstyleSharedAssets(slug);

  try {
    const page = await import(
      `@/i18n/pages/hairstyles/${slug}/${normalizedLocale}.json`
    ).then((module) => module.default as HairstylePage);
    return applyPageSharedAssets(page, assets);
  } catch (error) {
    const page = await import(`@/i18n/pages/hairstyles/${slug}/en.json`).then(
      (module) => module.default as HairstylePage
    );
    return applyPageSharedAssets(page, assets);
  }
}

export async function getRelatedHairstyles(
  slugs: string[] = [],
  locale: string
): Promise<HairstyleRelatedItem[]> {
  const relatedPages = await Promise.all(
    slugs.map((slug) => getHairstylePage(slug, locale))
  );

  return relatedPages
    .filter((page): page is HairstylePage => Boolean(page))
    .map((page) => ({
      slug: page.slug,
      title: page.hero.title,
      description: page.hero.description,
      image: page.hero.image,
    }));
}
