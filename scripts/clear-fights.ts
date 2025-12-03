import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing all fight records...");
  
  const result = await prisma.fightResult.deleteMany({});
  
  console.log(`Deleted ${result.count} fight records.`);
  
  // Reset character stats
  await prisma.character.updateMany({
    data: {
      wins: 0,
      losses: 0,
      ranking: 0,
      lastFoughtAt: null,
    },
  });
  
  console.log("Reset all character stats.");
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

