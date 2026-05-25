import { HairstyleIndexPage } from "@/types/pages/hairstyles";
import Link from "next/link";

function getLocalizedHref(url: string, locale: string) {
  if (!url.startsWith("/") || locale === "en") {
    return url;
  }

  return `/${locale}${url}`;
}

export default function HairstyleIndex({
  page,
  locale,
}: {
  page: HairstyleIndexPage;
  locale: string;
}) {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-normal md:text-6xl">
            {page.hero.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {page.hero.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {page.items.map((item) => (
            <Link
              key={item.slug}
              href={getLocalizedHref(`/hairstyles/${item.slug}`, locale)}
              className="group overflow-hidden rounded-lg border bg-card text-card-foreground transition-colors hover:border-primary"
            >
              {item.image?.src && (
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={item.image.src}
                    alt={item.image.alt || item.title}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                {item.tags && item.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.title}
                        className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tag.title}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
