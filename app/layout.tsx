import { QueryProvider } from "@/src/providers/query-provider";
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
    default: "The Culling Game - AI-Powered Jujutsu Kaisen Battle Simulator",
    template: "%s | The Culling Game",
  },
  description:
    "Experience epic AI-driven battles in the Jujutsu Kaisen universe. Create your sorcerer, challenge fighters, and climb the leaderboard. Real-time battles powered by advanced AI with XP economy, binding vows, and technique mastery.",
  keywords: [
    "Jujutsu Kaisen",
    "JJK",
    "battle simulator",
    "AI battles",
    "sorcerer battles",
    "cursed energy",
    "domain expansion",
    "binding vows",
    "anime battles",
    "character battles",
  ],
  authors: [{ name: "Ese Curtis", url: "https://esecurtis.cv" }],
  creator: "Ese Curtis",
  publisher: "Ese Curtis",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "The Culling Game",
    title: "The Culling Game - AI-Powered Jujutsu Kaisen Battle Simulator",
    description:
      "Experience epic AI-driven battles in the Jujutsu Kaisen universe. Create your sorcerer, challenge fighters, and climb the leaderboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Culling Game - AI-Powered Battle Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Culling Game - AI-Powered Jujutsu Kaisen Battle Simulator",
    description:
      "Experience epic AI-driven battles in the Jujutsu Kaisen universe. Create your sorcerer, challenge fighters, and climb the leaderboard.",
    images: ["/og-image.png"],
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
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  category: "games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
