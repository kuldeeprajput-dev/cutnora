export const siteConfig = {
  name: "Cutnora",
  // Public production domain used by SEO metadata, social cards, and the sitemap.
  url: "https://cutnora.app",
  title: "Cutnora — Online Video Editor",
  description:
    "Edit video in your browser with Cutnora. Trim clips, layer text and audio, and export MP4 or WebM. Your media and projects stay on your device.",
  socialImage: {
    url: "/images/og-image/og-image.png",
    alt: "Cutnora — edit video directly in your browser",
    width: 1672,
    height: 941,
  },
  githubRepoUrl: "https://github.com/kuldeeprajput-dev/cutnora",
  twitterUrl: "https://x.com/kuldeepdotcom",
  twitterHandle: "@kuldeepdotcom",
} as const;

export type SiteConfig = typeof siteConfig;
