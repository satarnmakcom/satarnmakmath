import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bannedUsers = await prisma.user.findMany({
    where: {
      isBanned: true,
    },
  });

  console.log(`Found ${bannedUsers.length} banned users.`);

  for (const user of bannedUsers) {
    console.log(`Unbanning user: ${user.name || user.email || user.id}`);
  }

  const result = await prisma.user.updateMany({
    where: {
      isBanned: true,
    },
    data: {
      isBanned: false,
    },
  });

  console.log(`Successfully unbanned ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
