import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cutframe — Web Video Editor',
  description: 'Fast, multitrack, browser-based local video editing software.',
  keywords: ['video editor', 'browser video editor', 'webm export', 'mp4 export', 'multitrack timeline', 'cutframe'],
  authors: [{ name: 'Cutframe Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Cutframe — Web Video Editor',
    description: 'Fast, multitrack, browser-based local video editing software.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#101216',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#101216] text-[#F4F5F7] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
