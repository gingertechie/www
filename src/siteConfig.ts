import type {
  SiteConfiguration,
  NavigationLinks,
  SocialLinks,
} from "@/types.ts";

export const SITE: SiteConfiguration = {
  title: "GingerTechie",
  description:
    "Articles on fintech, product management, and technology by Dave Anderson.",
  href: "https://blog.gingertechie.com",
  author: "Dave Anderson",
  locale: "en-CA",
};

export const NAV_LINKS: NavigationLinks = {
  blog: {
    path: "/blog",
    label: "Blog",
  },
};

export const SOCIAL_LINKS: SocialLinks = {
  twitter: {
    label: "X (formerly Twitter)",
    href: "https://twitter.com/supergingerdave",
  },
};
