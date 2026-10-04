import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { ToastContainer } from "@/shared/components/ui/Toast/ToastContainer";
import { NativeContextMenuBlocker } from "@/shared/components/providers/NativeContextMenuBlocker";

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
    icon: "/brand/cutnora-logo.svg",
    apple: "/brand/cutnora-logo.svg",
  },
  openGraph: {
    title: "Cutnora — Private browser video editor",
    description:
      "Edit, mix, and export video locally in your browser. No account or upload required.",
    type: "website",
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
