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
  title: "Endlessync - Real-Time Collaborative Infinite Canvas",
  description: "Endlessync connects teams and creators in real time across a limitless, high-performance canvas with instantaneous synchronization.",
  metadataBase: new URL('https://endlessync.vercel.app'),
  alternates: {
    canonical: '/',
  },
  keywords: [
    "Endlessync",
    "infinite canvas",
    "collaborative drawing",
    "multiplayer whiteboard",
    "real-time synchronization",
    "WebSocket canvas"
  ],
  authors: [{ name: "Endlessync" }],
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/favicon.png' },
    ],
    apple: '/icon.png',
  },
  openGraph: {
    title: "Endlessync - Collaborative Infinite Canvas",
    description: "Connect and create in real-time on an endless digital canvas.",
    url: 'https://endlessync.vercel.app',
    siteName: 'Endlessync',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Endlessync Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Endlessync - Collaborative Infinite Canvas",
    description: "Real-time limitless collaborative whiteboard.",
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
