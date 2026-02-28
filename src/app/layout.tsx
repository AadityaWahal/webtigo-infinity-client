import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webtigo Infinity Canvas - Collaborative Infinite Drawing Board",
  description: "Join Webtigo Infinity Canvas, a real-time multiplayer infinite drawing board. Build, sketch, add voice notes, and drop images collaboratively on an endless digital canvas.",
  metadataBase: new URL('https://webtigo-infinity.vercel.app'),
  alternates: {
    canonical: '/',
  },
  keywords: ["infinite canvas", "collaborative drawing", "multiplayer whiteboard", "digital canvas", "real-time sketching", "Webtigo", "Webtigo Infinity"],
  authors: [{ name: "Webtigo" }],
  openGraph: {
    title: "Webtigo Infinity Canvas",
    description: "A limitless multiplayer drawing board for your creativity.",
    url: 'https://webtigo-infinity.vercel.app',
    siteName: 'Webtigo Infinity Canvas',
    images: [
      {
        url: '/og-image.png', // Fallback, we will update this later if an image is provided
        width: 1200,
        height: 630,
        alt: 'Webtigo Infinity Canvas Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Webtigo Infinity Canvas",
    description: "Explore the infinite collaborative whiteboard. Draw, chat, and create globally.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '12uCiJpKQjiUNhJ1NcfriED4-pmNfedVJroRTKthng8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
