"use client";

import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import AutoScroll from "embla-carousel-auto-scroll";
import { Section as SectionType } from "@/types/blocks/section";

type LinkItem = {
  title: string;
  desc?: string;
  url: string;
  tag?: "Media" | "Tutorial" | "Docs" | "Partnership" | "Community" | string;
  badge?: "Official" | "New" | "Hot" | string;
  rel?: ("nofollow" | "sponsored")[];
  utm?: { source?: string; medium?: string; campaign?: string };
  date?: string; // "2025-10-01"
  logo?: string; // Add logo property
};

function buildTrackedUrl(item: LinkItem) {
  if (!item.utm) return item.url;
  const u = new URL(item.url);
  if (item.utm.source) u.searchParams.set("utm_source", item.utm.source);
  if (item.utm.medium) u.searchParams.set("utm_medium", item.utm.medium);
  if (item.utm.campaign) u.searchParams.set("utm_campaign", item.utm.campaign);
  return u.toString();
}

export default function ExternalLinksSection({ section }: { section: SectionType }) {
  const isCards = section.variant === "cards";
  const plugin = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.7,
    })
  );

  return (
    <section id={section.name} className={`py-12 ${section.className}`}>
      <div className="lg:container">
        <header className="mb-8 text-center">
          <h2 className="mb-6 text-pretty text-3xl font-bold lg:text-4xl">
            {section.heading}
          </h2>
          {section.subheading && (
            <p className="mt-3 text-gray-600">{section.subheading}</p>
          )}
        </header>

        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[plugin.current]}
          onMouseLeave={() => plugin.current.play()}
          onMouseEnter={() => plugin.current.stop()}
          className="relative before:absolute before:bottom-0 before:left-0 before:top-0 before:z-10 before:w-16 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:bottom-0 after:right-0 after:top-0 after:z-10 after:w-16 after:bg-gradient-to-l after:from-background before:opacity-60 after:opacity-60 after:to-transparent"
        >
          <CarouselContent className="items-stretch">
            {section.items && section.items.map((item, idx) => {
              if (isCards) {
                return (
                  <CarouselItem key={idx} className="basis-auto">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${item.title}（外部链接）`}
                      className="group flex flex-col h-full bg-card text-card-foreground rounded-2xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {item.label && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                              {item.label}
                            </span>
                          )}
                          {item.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-primary text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-3 font-semibold leading-snug group-hover:text-foreground">
                        {item.title}
                      </h3>
                      {item.desc && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {item.desc}
                        </p>
                      )}
                      <div className="flex items-center text-sm font-medium mt-auto">
                        <span className="group-hover:underline">{section.button_text ?? "Visit External Links"}</span>
                        <svg className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {item.date && (
                        <div className="mt-2 text-xs text-muted-foreground">{item.date}</div>
                      )}
                    </a>
                  </CarouselItem>
                );
              }

              // logos variant
              return (
                <CarouselItem key={idx} className="basis-auto">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.title} (External Link)`}
                    className="group flex items-center gap-3 bg-card text-card-foreground rounded-xl border p-3 hover:shadow-sm hover:-translate-y-0.5 transition"
                  >
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt=""
                        className="h-8 w-8 rounded object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted" />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{item.title}</span>
                        {item.tag && (
                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700">
                            {item.tag}
                          </span>
                        )}
                        {item.badge && (
                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] rounded bg-primary text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.desc && (
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      )}
                    </div>

                    <svg className="ml-auto h-4 w-4 opacity-60 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}