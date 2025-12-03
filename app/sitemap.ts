import { MetadataRoute } from "next";
import { prisma } from "@/src/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Get all characters for dynamic routes
  const characters = await prisma.character.findMany({
    select: { id: true, updatedAt: true },
  });

  // Get all fights for dynamic routes
  const fights = await prisma.fightResult.findMany({
    select: { id: true, occurredAt: true },
    take: 100, // Limit to recent fights
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const characterRoutes: MetadataRoute.Sitemap = characters.map((character) => ({
    url: `${baseUrl}/characters/${character.id}`,
    lastModified: character.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const fightRoutes: MetadataRoute.Sitemap = fights.map((fight) => ({
    url: `${baseUrl}/fights/${fight.id}`,
    lastModified: fight.occurredAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...characterRoutes, ...fightRoutes];
}

