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
  title: {
    default: "Endlessync – The Infinite Real-Time Collaborative Canvas | Endless Sync",
    template: "%s | Endlessync",
  },
  description:
    "Endlessync (Endless Sync / Webtigo Infinity Canvas) is an infinite, persistent collaborative whiteboard where creators worldwide brainstorm, sketch with vector brushes, pin audio and text cards, and travel at warp speed in real time.",
  metadataBase: new URL("https://endlessync.vercel.app"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Endlessync",
    "Endless Sync",
    "EndlessSync",
    "Infinity Canvas",
    "Webtigo Infinity Canvas",
    "infinite canvas",
    "infinite whiteboard online",
    "collaborative drawing",
    "multiplayer whiteboard",
    "real-time synchronization",
    "WebSocket canvas",
    "digital canvas infinite",
    "infinite plane whiteboard",
    "online brainstorming board",
    "real-time collaborative canvas",
    "shared canvas online",
    "spatial note taking",
    "virtual whiteboard",
  ],
  authors: [{ name: "Aaditya Wahal", url: "https://endlessync.vercel.app" }],
  creator: "Endlessync Team",
  publisher: "Endlessync",
  verification: {
    google: "12uCiJpKQjiUNhJ1NcfriED4-pmNfedVJroRTKthng8",
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.png" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    title: "Endlessync – The Infinite Real-Time Collaborative Canvas",
    description:
      "A boundless collaborative whiteboard connecting creators worldwide with real-time WebSockets, 2D rocket propulsion, vector drawing, and spatial media pins.",
    url: "https://endlessync.vercel.app",
    siteName: "Endlessync",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Endlessync – The Infinite Real-Time Collaborative Canvas",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Endlessync – The Infinite Real-Time Collaborative Canvas",
    description:
      "Explore, sketch, and record on an infinite persistent digital canvas with instant real-time synchronization.",
    images: ["/og-image.png"],
    creator: "@endlessync",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Rich JSON-LD Structured Data Schema for Google Search & AI Search Engines (Google AI Overviews, Perplexity, Bing Copilot, ChatGPT)
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://endlessync.vercel.app/#webapp",
      "name": "Endlessync",
      "alternateName": [
        "Endless Sync",
        "EndlessSync",
        "Webtigo Infinity Canvas",
        "Infinity Canvas"
      ],
      "url": "https://endlessync.vercel.app",
      "description":
        "Endlessync is a persistent, boundary-free collaborative digital whiteboard with real-time WebSockets, 2D rocket propulsion navigation, vector sketching, and spatial media pins.",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Infinite Cartesian coordinate plane without borders",
        "24/7 global real-time WebSocket synchronization",
        "Protected Origin Sanctuary centerpiece at (0, 0)",
        "Warp-speed 2D Rocket propulsion mode (10x, 24x, 48x)",
        "Vector drawing pens and opacity-controlled fill bucket",
        "Precision paint eraser with cursor preview",
        "Spatial voice notes, text notes, and photo uploads",
        "Instant coordinate teleportation HUD"
      ],
      "screenshot": "https://endlessync.vercel.app/og-image.png"
    },
    {
      "@type": "Organization",
      "@id": "https://endlessync.vercel.app/#organization",
      "name": "Endlessync",
      "url": "https://endlessync.vercel.app",
      "logo": "https://endlessync.vercel.app/media/endlessync-symbol.png",
      "sameAs": [
        "https://github.com/AadityaWahal/webtigo-infinity-client"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://endlessync.vercel.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Endlessync (Endless Sync / Webtigo Infinity Canvas)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Endlessync is a persistent, boundary-free digital whiteboard where participants worldwide interact on the exact same coordinate plane in real time without locked rooms or passwords."
          }
        },
        {
          "@type": "Question",
          "name": "How does navigation work on the infinite canvas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can navigate using the Pan tool, holding the Spacebar and dragging, or toggling 2D Rocket Mode to cruise across vast distances at warp velocities."
          }
        },
        {
          "@type": "Question",
          "name": "Can anyone clear or wipe the entire canvas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The global clear option has been permanently removed, and the origin at (0, 0) is protected by the Origin Sanctuary to preserve the collective creations of all contributors indefinitely."
          }
        },
        {
          "@type": "Question",
          "name": "How do voice notes and media cards work in Endlessync?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Using the Click-to-Paste Media Hub, users can record audio notes, type text cards, or attach images, and click anywhere on the Cartesian grid to anchor them spatially."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
