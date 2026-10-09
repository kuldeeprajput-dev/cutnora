import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { MinimalLanding } from "@/modules/landing/components/MinimalLanding";

export const metadata: Metadata = {
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    url: siteConfig.url,
    images: [siteConfig.socialImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      alternateName: "Cutnora Video Editor",
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      "@id": `${siteConfig.url}/#application`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      applicationCategory: "MultimediaApplication",
      browserRequirements:
        "Requires JavaScript and a browser with supported media APIs.",
      featureList: [
        "Multi-track video editing",
        "Text, image, and audio layers",
        "Local project storage",
        "MP4 and WebM export, depending on browser support",
      ],
      isPartOf: { "@id": `${siteConfig.url}/#website` },
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <MinimalLanding />
    </>
  );
}
