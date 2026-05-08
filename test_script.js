const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.findMany({
    include: { problemSets: true }
  });
  console.log(JSON.stringify(problems.map(p => ({ code: p.code, title: p.title, hasProblemSet: p.problemSets.length > 0 })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
