import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Culling Game - AI-Powered Jujutsu Kaisen Battle Simulator",
    short_name: "Culling Game",
    description:
      "AI-powered Jujutsu Kaisen battle simulator with real-time battles, XP economy, and character progression",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

