"use client";

import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";
import { useMemo, useState } from "react";

export default function Feature1({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const [showVideo, setShowVideo] = useState(false);

  const videoSrc = section.video?.src as string | undefined;
  const isYouTube =
    typeof videoSrc === "string" &&
    /(?:youtube\.com|youtu\.be)/i.test(videoSrc ?? "");

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|\/)([\w-]{11})(?:[\?&]|$)/);
    return match?.[1];
  };

  const youtubeId = useMemo(
    () => (videoSrc && isYouTube ? extractYouTubeId(videoSrc) : undefined),
    [isYouTube, videoSrc]
  );

  const youtubeEmbed = useMemo(() => {
    if (!youtubeId) return undefined;
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=1&mute=1&loop=1&playlist=${youtubeId}`;
  }, [youtubeId]);

  const thumb = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : "/YouTube-Logosu.png";

  return (
    <section id={section.name} className="py-16">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {section.image && !section.video && (
            <img
              src={section.image?.src}
              alt="placeholder hero"
              className="max-h-full w-full rounded-md object-cover"
            />
          )}
          {section.video && isYouTube && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
              {showVideo && youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={section.title ?? "YouTube video"}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className="group relative block h-full w-full"
                  aria-label="Play video"
                >
                  <img
                    src={thumb}
                    alt={section.title ?? "YouTube cover"}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <img
                      src="/YouTube-Logosu.png"
                      alt="YouTube logo"
                      className="h-14 w-20 drop-shadow-lg transition duration-200 group-hover:scale-105"
                    />
                  </div>
                </button>
              )}
            </div>
          )}
          <div className="flex flex-col lg:text-left">
            {section.title && (
              <h2 className="mb-6 text-pretty text-3xl font-bold lg:text-4xl">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="mb-8 max-w-xl text-muted-foreground lg:max-w-none lg:text-lg">
                {section.description}
              </p>
            )}
            <ul className="flex flex-col justify-center gap-y-8">
              {section.items?.map((item, i) => (
                <li key={i} className="flex">
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      className="mr-2 size-6 shrink-0 lg:mr-2 lg:size-6"
                    />
                  )}
                  <div>
                    <div className="mb-3 h-5 text-sm font-semibold text-accent-foreground md:text-base">
                      {item.title}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground md:text-base">
                      {item.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
