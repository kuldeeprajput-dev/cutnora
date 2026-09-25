export const siteConfig = {
  name: "Cutnora",
  description: "Private browser video editor",
  githubRepoUrl: "https://github.com/kuldeeprajput-dev/cutnora",
  githubApiStarsUrl: "https://api.github.com/repos/kuldeeprajput-dev/cutnora",
} as const;

export type SiteConfig = typeof siteConfig;
