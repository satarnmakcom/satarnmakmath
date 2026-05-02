import { PrismaClient, CompetitionLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing old data...')
  // Order matters due to foreign key constraints
  await prisma.submission.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.problem.deleteMany()
  await prisma.user.deleteMany()
  await prisma.curriculumModule.deleteMany()

  console.log('Seeding Users...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Titan_Math',
        country: 'TH',
        rating: 2847,
        streak: 28,
        globalRank: 1,
      }
    }),
    prisma.user.create({
      data: {
        name: 'GeoMaster',
        country: 'KR',
        rating: 2791,
        streak: 15,
        globalRank: 2,
      }
    }),
    prisma.user.create({
      data: {
        name: 'Alex Chen',
        country: 'TH',
        rating: 2147,
        streak: 12,
        globalRank: 342,
      }
    })
  ])

  console.log('Seeding Problems...')
  const problems = await Promise.all([
    prisma.problem.create({
      data: {
        code: 'TMO2565-04',
        title: 'Cyclic Quadrilateral Perpendiculars',
        content: 'Let $ABCD$ be a cyclic quadrilateral inscribed in circle $\\Gamma$. Let $P$ be the intersection of diagonals $AC$ and $BD$. Let $E$ and $F$ be the feet of perpendiculars from $P$ to sides $AB$ and $CD$ respectively.\n\nProve that line $EF$ is perpendicular to the line connecting the midpoints of $AD$ and $BC$.',
        level: CompetitionLevel.TMO,
        difficulty: 1800,
        tags: ['Geometry', 'Cyclic Quads']
      }
    }),
    prisma.problem.create({
      data: {
        code: 'POSN1-2566-01',
        title: 'Basic Number Theory',
        content: 'Find all prime numbers $p$ such that $p^2 + 2$ is also a prime number.',
        level: CompetitionLevel.POSN1,
        difficulty: 1400,
        tags: ['Number Theory', 'Primes']
      }
    }),
    prisma.problem.create({
      data: {
        code: 'IMO2023-06',
        title: 'Combinatorial Geometry',
        content: 'A difficult combinatorial geometry problem from IMO 2023.',
        level: CompetitionLevel.IMO,
        difficulty: 2800,
        tags: ['Combinatorics', 'Geometry']
      }
    })
  ])

  console.log('Seeding Submissions (Mock Solves)...')
  await prisma.submission.create({
    data: {
      userId: users[2].id, // Alex
      problemId: problems[0].id, // TMO
      content: 'Here is my proof...',
      status: 'ACCEPTED'
    }
  })

  await prisma.submission.create({
    data: {
      userId: users[0].id, // Titan
      problemId: problems[2].id, // IMO
      content: 'Trivial by moving points.',
      status: 'ACCEPTED'
    }
  })

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
