import {
  getHairstylePage,
  getRelatedHairstyles,
} from "@/services/hairstyles";
import HairstyleArticle from "@/components/hairstyles/HairstyleArticle";
import { Metadata } from "next";
import { notFound } from "next/navigation";

function getLocalizedPath(path: string, locale: string) {
  if (locale === "en") {
    return path;
  }

  return `/${locale}${path}`;
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const page = await getHairstylePage(slug, locale);

  if (!page) {
    return {};
  }

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "";
  const canonicalPath = getLocalizedPath(
    page.metadata.canonical || `/hairstyles/${slug}`,
    locale
  );

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    alternates: {
      canonical: `${webUrl}${canonicalPath}`,
    },
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      url: `${webUrl}${canonicalPath}`,
      type: "article",
      images: page.hero.image?.src ? [page.hero.image.src] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.metadata.title,
      description: page.metadata.description,
      images: page.hero.image?.src ? [page.hero.image.src] : undefined,
    },
  };
}

export default async function HairstyleDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const page = await getHairstylePage(slug, locale);

  if (!page) {
    notFound();
  }

  const related = await getRelatedHairstyles(page.related, locale);

  return <HairstyleArticle page={page} related={related} locale={locale} />;
}
