import HairstyleIndex from "@/components/hairstyles/HairstyleIndex";
import { Metadata } from "next";
import { getHairstyleIndexPage } from "@/services/hairstyles";

function getLocalizedPath(path: string, locale: string) {
  if (locale === "en") {
    return path;
  }

  return `/${locale}${path}`;
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const page = await getHairstyleIndexPage(locale);
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "";
  const canonicalPath = getLocalizedPath(
    page.metadata.canonical || "/hairstyles",
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
      type: "website",
    },
  };
}

export default async function HairstylesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const page = await getHairstyleIndexPage(locale);
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "";
  const pageUrl = `${webUrl}${getLocalizedPath("/hairstyles", locale)}`;
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.hero.title,
    description: page.hero.description,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${webUrl}${getLocalizedPath(`/hairstyles/${item.slug}`, locale)}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HairstyleIndex page={page} locale={locale} />
    </>
  );
}
