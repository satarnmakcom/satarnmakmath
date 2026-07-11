import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      isBanned: true,
      role: true,
    }
  });

  console.log(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
