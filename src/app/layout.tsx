import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cutframe — Private browser video editor",
    template: "%s · Cutframe",
  },
  description:
    "A private, multitrack video editor that keeps projects and media on your device.",
  keywords: [
    "video editor",
    "browser video editor",
    "webm export",
    "mp4 export",
    "multitrack timeline",
    "cutframe",
  ],
  authors: [{ name: "Cutframe Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Cutframe — Private browser video editor",
    description:
      "Edit, mix, and export video locally in your browser. No account or upload required.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#101216",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
