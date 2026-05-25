import {
  HairstyleContentBlock,
  HairstylePage,
  HairstyleRelatedItem,
} from "@/types/pages/hairstyles";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function getLocalizedHref(url: string, locale: string) {
  if (!url.startsWith("/") || locale === "en") {
    return url;
  }

  return `/${locale}${url}`;
}

const labels: Record<string, { tags: string; contents: string; faq: string; related: string }> =
  {
    en: {
      tags: "Tags",
      contents: "Contents",
      faq: "FAQ",
      related: "Related Hairstyles",
    },
    "zh-cn": {
      tags: "标签",
      contents: "目录",
      faq: "常见问题",
      related: "相关发型",
    },
    "zh-tw": {
      tags: "標籤",
      contents: "目錄",
      faq: "常見問題",
      related: "相關髮型",
    },
    ja: {
      tags: "タグ",
      contents: "目次",
      faq: "FAQ",
      related: "関連ヘアスタイル",
    },
    ko: {
      tags: "태그",
      contents: "목차",
      faq: "FAQ",
      related: "관련 헤어스타일",
    },
    fr: {
      tags: "Tags",
      contents: "Sommaire",
      faq: "FAQ",
      related: "Coiffures liees",
    },
    de: {
      tags: "Tags",
      contents: "Inhalt",
      faq: "FAQ",
      related: "Verwandte Frisuren",
    },
    es: {
      tags: "Etiquetas",
      contents: "Contenido",
      faq: "FAQ",
      related: "Peinados relacionados",
    },
    ru: {
      tags: "Теги",
      contents: "Содержание",
      faq: "FAQ",
      related: "Похожие прически",
    },
  };

function getLabels(locale: string) {
  return labels[locale] || labels.en;
}

function ContentBlock({
  block,
  locale,
}: {
  block: HairstyleContentBlock;
  locale: string;
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-lg leading-8 text-muted-foreground">{block.text}</p>
      );
    case "list":
      return (
        <ul className="space-y-3 pl-5 text-lg leading-8 text-muted-foreground">
          {block.items.map((item) => (
            <li key={item} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      );
    case "image":
      if (!block.src) {
        return null;
      }

      return (
        <figure>
          <img
            src={block.src}
            alt={block.alt}
            className="w-full rounded-lg object-cover object-top"
          />
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary bg-primary/5 px-5 py-4 text-lg font-medium leading-8">
          {block.text}
        </blockquote>
      );
    case "cta":
      return (
        <div className="rounded-lg border bg-primary/5 p-5">
          <h3 className="text-xl font-semibold">{block.title}</h3>
          {block.description && (
            <p className="mt-2 text-muted-foreground">{block.description}</p>
          )}
          <Button asChild className="mt-4">
            <Link href={getLocalizedHref(block.button.url, locale)}>
              {block.button.title}
            </Link>
          </Button>
        </div>
      );
    default:
      return null;
  }
}

function ArticleJsonLd({
  page,
  locale,
  webUrl,
}: {
  page: HairstylePage;
  locale: string;
  webUrl: string;
}) {
  const canonicalPath = getLocalizedHref(
    page.metadata.canonical || `/hairstyles/${page.slug}`,
    locale
  );
  const pageUrl = `${webUrl}${canonicalPath}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        item: `${webUrl}${getLocalizedHref(item.url, locale)}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.hero.title,
      description: page.hero.description,
      image: page.hero.image?.src,
      mainEntityOfPage: pageUrl,
      inLanguage: locale,
    },
    page.faq && page.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null,
  ].filter(Boolean);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HairstyleArticle({
  page,
  related,
  locale,
}: {
  page: HairstylePage;
  related: HairstyleRelatedItem[];
  locale: string;
}) {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "";
  const label = getLabels(locale);

  return (
    <>
      <ArticleJsonLd page={page} locale={locale} webUrl={webUrl} />
      <article className="py-10 md:py-14">
        <div className="container">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {page.breadcrumb.map((item, index) => (
              <span key={item.url} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {index === page.breadcrumb.length - 1 ? (
                  <span className="font-medium text-foreground">
                    {item.title}
                  </span>
                ) : (
                  <Link
                    href={getLocalizedHref(item.url, locale)}
                    className="hover:text-primary"
                  >
                    {item.title}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <header className="mt-8 max-w-5xl">
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-normal md:text-6xl">
              {page.hero.title}
            </h1>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-muted-foreground">
              {page.hero.description}
            </p>
            {page.hero.tags && page.hero.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-l-4 border-primary pl-4">
                <span className="font-semibold">{label.tags}</span>
                {page.hero.tags.map((tag) => (
                  <span
                    key={tag.title}
                    className="rounded-full border px-3 py-1 text-sm text-muted-foreground"
                  >
                    {tag.title}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="mt-12 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
            <aside className="hidden lg:block">
              <div className="sticky top-6">
                <h2 className="text-2xl font-semibold">{label.contents}</h2>
                <nav className="mt-5 space-y-1">
                  {page.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="min-w-0 space-y-12">
              {page.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-8">
                  <h2 className="text-3xl font-bold tracking-normal">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-6">
                    {section.content.map((block, index) => (
                      <ContentBlock
                        key={`${section.id}-${index}`}
                        block={block}
                        locale={locale}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {page.faq && page.faq.length > 0 && (
                <section id="faq" className="scroll-mt-8">
                  <h2 className="text-3xl font-bold tracking-normal">
                    {label.faq}
                  </h2>
                  <div className="mt-5 divide-y rounded-lg border bg-card">
                    {page.faq.map((item) => (
                      <div key={item.question} className="p-5">
                        <h3 className="text-lg font-semibold">
                          {item.question}
                        </h3>
                        <p className="mt-2 leading-7 text-muted-foreground">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {related.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold tracking-normal">
                    {label.related}
                  </h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {related.map((item) => (
                      <Link
                        key={item.slug}
                        href={getLocalizedHref(`/hairstyles/${item.slug}`, locale)}
                        className="rounded-lg border bg-card p-5 transition-colors hover:border-primary"
                      >
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </main>

            <aside>
              <div className="sticky top-6 rounded-lg border bg-card p-5">
                {page.hero.image?.src && (
                  <img
                    src={page.hero.image.src}
                    alt={page.hero.image.alt || page.hero.title}
                    className="aspect-square w-full rounded-lg object-cover object-top"
                  />
                )}
                <h2 className="mt-5 text-xl font-semibold">
                  {page.cta.title}
                </h2>
                {page.cta.description && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {page.cta.description}
                  </p>
                )}
                <Button asChild className="mt-5 w-full">
                  <Link href={getLocalizedHref(page.cta.button.url, locale)}>
                    {page.cta.button.title}
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
