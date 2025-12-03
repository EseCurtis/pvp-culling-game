import { prisma } from "../src/lib/prisma";
import { getInitialXp } from "../src/lib/business-logic.config";

async function main() {
  console.log("Seeding XP for all users...");
  
  const initialXp = getInitialXp();
  console.log(`Target initial XP: ${initialXp}`);
  
  // Get all characters
  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      xp: true,
    },
  });
  
  console.log(`Found ${characters.length} characters`);
  
  // Filter characters that need XP update
  const charactersNeedingXp = characters.filter(
    (char) => char.xp < initialXp
  );
  
  console.log(
    `${charactersNeedingXp.length} characters need XP update (have less than ${initialXp} XP)`
  );
  
  if (charactersNeedingXp.length === 0) {
    console.log("All characters already have sufficient XP!");
    return;
  }
  
  // Update all characters that need XP
  let updatedCount = 0;
  for (const char of charactersNeedingXp) {
    const xpToAdd = initialXp - char.xp;
    await prisma.character.update({
      where: { id: char.id },
      data: {
        xp: initialXp,
      },
    });
    updatedCount++;
    console.log(
      `  ✓ ${char.name}: ${char.xp} → ${initialXp} XP (+${xpToAdd})`
    );
  }
  
  console.log(`\nUpdated ${updatedCount} characters with initial XP.`);
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

