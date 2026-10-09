import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { ToastContainer } from "@/shared/components/ui/Toast/ToastContainer";
import { NativeContextMenuBlocker } from "@/shared/components/providers/NativeContextMenuBlocker";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s · Cutnora",
  },
  description: siteConfig.description,
  keywords: [
    "video editor",
    "browser video editor",
    "online video editor",
    "webm export",
    "mp4 export",
    "multitrack timeline",
    "cutnora",
  ],
  authors: [
    { name: "Kuldeep Rajput", url: "https://github.com/kuldeeprajput-dev" },
  ],
  applicationName: siteConfig.name,
  icons: {
    icon: { url: "/brand/cutnora-logo.svg", type: "image/svg+xml", sizes: "any" },
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.socialImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
  try {
    const storedTheme = localStorage.getItem("cutnora_theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : systemTheme;
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0d0d0d" : "#fafafa");
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
      </head>
      <body suppressHydrationWarning>
        <NativeContextMenuBlocker />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
