import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HappyUsers from "./happy-users";
// import HeroBg from "./bg";
import { Hero as HeroType } from "@/types/blocks/hero";
import Icon from "@/components/icon";
import Link from "next/link";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from "react";

// 首先定义可用的颜色类
const colorClasses = {
  amber: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  red: 'bg-red-500/10 text-red-500 border border-red-500/20',
  blue: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  green: 'bg-green-500/10 text-green-500 border border-green-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  pink: 'bg-pink-500/10 text-pink-500 border border-pink-500/20',
};

export default function Hero({ hero }: { hero: HeroType }) {
  if (hero.disabled) {
    return null;
  }

  const highlightText = hero.highlight_text;
  let texts = null;
  if (highlightText) {
    texts = hero.title?.split(highlightText, 2);
  }
  
  return (
    <>
      {/* <HeroBg /> */}
      <section className="py-16">
        <div className="container">
          {hero.show_badge && (
            <div className="flex items-center justify-center mb-8">
              <img
                src="/imgs/badges/phdaily.svg"
                alt="phdaily"
                className="h-10 object-cover"
              />
            </div>
          )}
          {hero.show_label && (
            <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mt-8">
              {hero.labels.map((label: { color: any; title: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }, i: Key | null | undefined) => (
                <div 
                  key={i} 
                  className={`inline-flex items-center px-3 py-1 text-xs rounded-full ${colorClasses[label.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'}`}
                >
                  {label.title}
                </div>
              ))}
            </div>
          )}
          <div className="text-center">
            {hero.announcement && (
              <a
                href={hero.announcement.url}
                className="mx-auto mb-3 inline-flex items-center gap-3 rounded-full border px-2 py-1 text-sm"
              >
                {hero.announcement.label && (
                  <Badge>{hero.announcement.label}</Badge>
                )}
                {hero.announcement.title}
              </a>
            )}

            {texts && texts.length > 1 ? (
              <h1 className="mx-auto mb-3 mt-4 max-w-4xl text-balance text-4xl font-bold lg:mb-7 lg:text-7xl">
                {texts[0]}
                <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent via-amber-400" >
                  {highlightText}
                </span>
                <span className="text-primary" style={{ color: 'rgba(237, 234, 222, 0.8)' }}>{texts[1]}</span>
              </h1>
            ) : (
              <h1 className="mx-auto mb-3 mt-4 max-w-3xl text-balance text-4xl font-bold lg:mb-7 lg:text-7xl">
                {hero.title}
              </h1>
            )}

            <p
              className="m mx-auto max-w-3xl text-muted-foreground lg:text-xl"
              dangerouslySetInnerHTML={{ __html: hero.description || "" }}
            />
            {hero.buttons && (
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                {hero.buttons.map((item, i) => {
                  return (
                    <Link
                      key={i}
                      href={item.url || ""}
                      target={item.target || ""}
                      className="flex items-center"
                    >
                      <Button
                        className="w-full"
                        size="lg"
                        variant={item.variant || "default"}
                      >
                        {item.title}
                        {item.icon && (
                          <Icon name={item.icon} className="ml-1" />
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}
            {hero.tip && (
              <p className="mt-8 text-md text-muted-foreground">{hero.tip}</p>
            )}
            {hero.show_happy_users && <HappyUsers />}
          </div>
        </div>
      </section>
    </>
  );
}
