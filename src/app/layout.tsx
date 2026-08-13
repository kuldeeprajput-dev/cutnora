import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cutnora — Private browser video editor",
    template: "%s · Cutnora",
  },
  description:
    "A private, multitrack video editor that keeps projects and media on your device.",
  keywords: [
    "video editor",
    "browser video editor",
    "webm export",
    "mp4 export",
    "multitrack timeline",
    "cutnora",
  ],
  authors: [{ name: "Cutnora Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Cutnora — Private browser video editor",
    description:
      "Edit, mix, and export video locally in your browser. No account or upload required.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f9fb",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
  try {
    const storedTheme = localStorage.getItem("cutnora_theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : systemTheme;
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#070707" : "#f8f9fb");
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
