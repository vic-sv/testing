import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@admin.com', password: adminPassword, isAdmin: true },
  })

  const matches = [
    { homeTeam: 'Brazil', awayTeam: 'Mexico', stage: 'Group D', matchDate: new Date('2026-06-12T15:00:00Z') },
    { homeTeam: 'Argentina', awayTeam: 'France', stage: 'Group C', matchDate: new Date('2026-06-13T18:00:00Z') },
    { homeTeam: 'Spain', awayTeam: 'Germany', stage: 'Group A', matchDate: new Date('2026-06-14T21:00:00Z') },
    { homeTeam: 'England', awayTeam: 'Portugal', stage: 'Group B', matchDate: new Date('2026-06-15T15:00:00Z') },
    { homeTeam: 'Netherlands', awayTeam: 'Italy', stage: 'Group E', matchDate: new Date('2026-06-16T18:00:00Z') },
    { homeTeam: 'USA', awayTeam: 'Canada', stage: 'Group F', matchDate: new Date('2026-06-17T21:00:00Z') },
    { homeTeam: 'Japan', awayTeam: 'South Korea', stage: 'Group G', matchDate: new Date('2026-06-18T15:00:00Z') },
    { homeTeam: 'Morocco', awayTeam: 'Senegal', stage: 'Group H', matchDate: new Date('2026-06-19T18:00:00Z') },
    { homeTeam: 'Brazil', awayTeam: 'Argentina', stage: 'Semi-final', matchDate: new Date('2026-07-07T19:00:00Z') },
    { homeTeam: 'Spain', awayTeam: 'England', stage: 'Final', matchDate: new Date('2026-07-19T19:00:00Z') },
  ]

  for (const match of matches) {
    await prisma.match.create({ data: match })
  }

  console.log('Seed complete! Admin: admin@admin.com / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
