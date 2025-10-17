import { Image, Button } from "@/types/blocks/base";

export interface SectionItem {
  date: any;
  logo: any;
  tag: any;
  desc: any;
  badge: any;
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  image?: Image;
  buttons?: Button[];
  url?: string;
  target?: string;
  children?: SectionItem[];
}

export interface Section {
  className: any;
  variant: string;
  button_text: ReactNode;
  heading: string | undefined;
  subheading: string | undefined;
  video?: any;
  email?: any;
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  image?: Image;
  buttons?: Button[];
  items?: SectionItem[];
}
