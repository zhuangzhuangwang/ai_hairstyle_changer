import { Image } from "@/types/blocks/base";

export interface HairstyleMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

export interface HairstyleBreadcrumbItem {
  title: string;
  url: string;
}

export interface HairstyleTag {
  title: string;
}

export interface HairstyleHero {
  title: string;
  description: string;
  tags?: HairstyleTag[];
  image?: Image;
}

export interface HairstyleCta {
  title: string;
  description?: string;
  button: {
    title: string;
    url: string;
  };
}

export type HairstyleContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "image";
      src?: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "cta";
      title: string;
      description?: string;
      button: {
        title: string;
        url: string;
      };
    };

export interface HairstyleSection {
  id: string;
  title: string;
  content: HairstyleContentBlock[];
}

export interface HairstyleFaqItem {
  question: string;
  answer: string;
}

export interface HairstyleRelatedItem {
  slug: string;
  title: string;
  description: string;
  image?: Image;
}

export interface HairstylePage {
  slug: string;
  locale: string;
  metadata: HairstyleMeta;
  breadcrumb: HairstyleBreadcrumbItem[];
  hero: HairstyleHero;
  cta: HairstyleCta;
  sections: HairstyleSection[];
  faq?: HairstyleFaqItem[];
  related?: string[];
}

export interface HairstyleIndexItem {
  slug: string;
  title: string;
  description: string;
  image?: Image;
  tags?: HairstyleTag[];
}

export interface HairstyleIndexPage {
  metadata: HairstyleMeta;
  hero: {
    title: string;
    description: string;
  };
  items: HairstyleIndexItem[];
}

export interface HairstyleSharedAssets {
  images?: {
    index?: string;
    hero?: string;
    sections?: Record<string, string[]>;
  };
}
