import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@admin.com', password: adminPassword, isAdmin: true },
  })

  // Real World Cup 2026 group stage schedule (UTC times)
  // Results for matches played by June 20, 2026
  const matches = [
    // === GROUP A: Mexico, South Africa, South Korea, Czechia ===
    { homeTeam: 'Mexico',       awayTeam: 'South Africa', stage: 'Group A', matchDate: new Date('2026-06-11T13:00:00Z'), homeScore: 2, awayScore: 0 },
    { homeTeam: 'South Korea',  awayTeam: 'Czechia',      stage: 'Group A', matchDate: new Date('2026-06-11T16:00:00Z'), homeScore: 2, awayScore: 1 },
    { homeTeam: 'Czechia',      awayTeam: 'South Africa', stage: 'Group A', matchDate: new Date('2026-06-18T16:00:00Z'), homeScore: 1, awayScore: 1 },
    { homeTeam: 'Mexico',       awayTeam: 'South Korea',  stage: 'Group A', matchDate: new Date('2026-06-18T19:00:00Z'), homeScore: 1, awayScore: 0 },
    { homeTeam: 'South Africa', awayTeam: 'South Korea',  stage: 'Group A', matchDate: new Date('2026-06-22T20:00:00Z') },
    { homeTeam: 'Czechia',      awayTeam: 'Mexico',       stage: 'Group A', matchDate: new Date('2026-06-22T20:00:00Z') },

    // === GROUP B: Canada, Bosnia & Herzegovina, Qatar, Switzerland ===
    { homeTeam: 'Canada',               awayTeam: 'Bosnia & Herzegovina', stage: 'Group B', matchDate: new Date('2026-06-12T13:00:00Z'), homeScore: 1, awayScore: 1 },
    { homeTeam: 'Switzerland',          awayTeam: 'Qatar',                stage: 'Group B', matchDate: new Date('2026-06-13T19:00:00Z'), homeScore: 1, awayScore: 1 },
    { homeTeam: 'Switzerland',          awayTeam: 'Bosnia & Herzegovina', stage: 'Group B', matchDate: new Date('2026-06-18T22:00:00Z'), homeScore: 4, awayScore: 1 },
    { homeTeam: 'Canada',               awayTeam: 'Qatar',                stage: 'Group B', matchDate: new Date('2026-06-19T02:00:00Z'), homeScore: 6, awayScore: 0 },
    { homeTeam: 'Bosnia & Herzegovina', awayTeam: 'Qatar',                stage: 'Group B', matchDate: new Date('2026-06-23T20:00:00Z') },
    { homeTeam: 'Canada',               awayTeam: 'Switzerland',          stage: 'Group B', matchDate: new Date('2026-06-23T20:00:00Z') },

    // === GROUP C: Brazil, Morocco, Haiti, Scotland ===
    { homeTeam: 'Brazil',   awayTeam: 'Haiti',    stage: 'Group C', matchDate: new Date('2026-06-12T16:00:00Z') },
    { homeTeam: 'Morocco',  awayTeam: 'Scotland', stage: 'Group C', matchDate: new Date('2026-06-12T22:00:00Z') },
    { homeTeam: 'Scotland', awayTeam: 'Haiti',    stage: 'Group C', matchDate: new Date('2026-06-19T16:00:00Z') },
    { homeTeam: 'Brazil',   awayTeam: 'Morocco',  stage: 'Group C', matchDate: new Date('2026-06-19T22:00:00Z') },
    { homeTeam: 'Haiti',    awayTeam: 'Morocco',  stage: 'Group C', matchDate: new Date('2026-06-23T16:00:00Z') },
    { homeTeam: 'Scotland', awayTeam: 'Brazil',   stage: 'Group C', matchDate: new Date('2026-06-23T16:00:00Z') },

    // === GROUP D: United States, Paraguay, Australia, Turkey ===
    { homeTeam: 'United States', awayTeam: 'Paraguay',   stage: 'Group D', matchDate: new Date('2026-06-12T19:00:00Z'), homeScore: 4, awayScore: 1 },
    { homeTeam: 'Australia',     awayTeam: 'Turkey',     stage: 'Group D', matchDate: new Date('2026-06-13T16:00:00Z'), homeScore: 2, awayScore: 0 },
    { homeTeam: 'United States', awayTeam: 'Australia',  stage: 'Group D', matchDate: new Date('2026-06-20T22:00:00Z') },
    { homeTeam: 'Turkey',        awayTeam: 'Paraguay',   stage: 'Group D', matchDate: new Date('2026-06-20T19:00:00Z') },
    { homeTeam: 'Turkey',        awayTeam: 'United States', stage: 'Group D', matchDate: new Date('2026-06-24T20:00:00Z') },
    { homeTeam: 'Paraguay',      awayTeam: 'Australia',  stage: 'Group D', matchDate: new Date('2026-06-24T20:00:00Z') },

    // === GROUP E: Germany, Curaçao, Ivory Coast, Ecuador ===
    { homeTeam: 'Germany',      awayTeam: 'Curaçao',     stage: 'Group E', matchDate: new Date('2026-06-14T16:00:00Z'), homeScore: 7, awayScore: 1 },
    { homeTeam: 'Ivory Coast',  awayTeam: 'Ecuador',     stage: 'Group E', matchDate: new Date('2026-06-14T19:00:00Z'), homeScore: 1, awayScore: 0 },
    { homeTeam: 'Germany',      awayTeam: 'Ivory Coast', stage: 'Group E', matchDate: new Date('2026-06-20T16:00:00Z') },
    { homeTeam: 'Ecuador',      awayTeam: 'Curaçao',     stage: 'Group E', matchDate: new Date('2026-06-20T13:00:00Z') },
    { homeTeam: 'Ecuador',      awayTeam: 'Germany',     stage: 'Group E', matchDate: new Date('2026-06-24T16:00:00Z') },
    { homeTeam: 'Curaçao',      awayTeam: 'Ivory Coast', stage: 'Group E', matchDate: new Date('2026-06-24T16:00:00Z') },

    // === GROUP F: Netherlands, Japan, Tunisia, Sweden ===
    { homeTeam: 'Netherlands',  awayTeam: 'Japan',    stage: 'Group F', matchDate: new Date('2026-06-13T22:00:00Z') },
    { homeTeam: 'Tunisia',      awayTeam: 'Sweden',   stage: 'Group F', matchDate: new Date('2026-06-14T22:00:00Z') },
    { homeTeam: 'Netherlands',  awayTeam: 'Tunisia',  stage: 'Group F', matchDate: new Date('2026-06-21T22:00:00Z') },
    { homeTeam: 'Sweden',       awayTeam: 'Japan',    stage: 'Group F', matchDate: new Date('2026-06-21T19:00:00Z') },
    { homeTeam: 'Sweden',       awayTeam: 'Netherlands', stage: 'Group F', matchDate: new Date('2026-06-25T20:00:00Z') },
    { homeTeam: 'Japan',        awayTeam: 'Tunisia',  stage: 'Group F', matchDate: new Date('2026-06-25T20:00:00Z') },

    // === GROUP G: Belgium, Egypt, Iran, New Zealand ===
    { homeTeam: 'Belgium',     awayTeam: 'Egypt',       stage: 'Group G', matchDate: new Date('2026-06-15T19:00:00Z') },
    { homeTeam: 'Iran',        awayTeam: 'New Zealand', stage: 'Group G', matchDate: new Date('2026-06-15T22:00:00Z') },
    { homeTeam: 'Belgium',     awayTeam: 'Iran',        stage: 'Group G', matchDate: new Date('2026-06-21T13:00:00Z') },
    { homeTeam: 'New Zealand', awayTeam: 'Egypt',       stage: 'Group G', matchDate: new Date('2026-06-21T16:00:00Z') },
    { homeTeam: 'New Zealand', awayTeam: 'Belgium',     stage: 'Group G', matchDate: new Date('2026-06-25T16:00:00Z') },
    { homeTeam: 'Egypt',       awayTeam: 'Iran',        stage: 'Group G', matchDate: new Date('2026-06-25T16:00:00Z') },

    // === GROUP H: Spain, Uruguay, Cape Verde, Saudi Arabia ===
    { homeTeam: 'Spain',        awayTeam: 'Uruguay',      stage: 'Group H', matchDate: new Date('2026-06-15T16:00:00Z') },
    { homeTeam: 'Cape Verde',   awayTeam: 'Saudi Arabia', stage: 'Group H', matchDate: new Date('2026-06-15T13:00:00Z') },
    { homeTeam: 'Spain',        awayTeam: 'Cape Verde',   stage: 'Group H', matchDate: new Date('2026-06-22T16:00:00Z') },
    { homeTeam: 'Saudi Arabia', awayTeam: 'Uruguay',      stage: 'Group H', matchDate: new Date('2026-06-22T13:00:00Z') },
    { homeTeam: 'Saudi Arabia', awayTeam: 'Spain',        stage: 'Group H', matchDate: new Date('2026-06-26T20:00:00Z') },
    { homeTeam: 'Uruguay',      awayTeam: 'Cape Verde',   stage: 'Group H', matchDate: new Date('2026-06-26T20:00:00Z') },

    // === GROUP I: France, Senegal, Norway, Iraq ===
    { homeTeam: 'France',   awayTeam: 'Iraq',    stage: 'Group I', matchDate: new Date('2026-06-16T16:00:00Z') },
    { homeTeam: 'Senegal',  awayTeam: 'Norway',  stage: 'Group I', matchDate: new Date('2026-06-16T22:00:00Z') },
    { homeTeam: 'France',   awayTeam: 'Senegal', stage: 'Group I', matchDate: new Date('2026-06-22T22:00:00Z') },
    { homeTeam: 'Norway',   awayTeam: 'Iraq',    stage: 'Group I', matchDate: new Date('2026-06-22T19:00:00Z') },
    { homeTeam: 'Norway',   awayTeam: 'France',  stage: 'Group I', matchDate: new Date('2026-06-26T16:00:00Z') },
    { homeTeam: 'Iraq',     awayTeam: 'Senegal', stage: 'Group I', matchDate: new Date('2026-06-26T16:00:00Z') },

    // === GROUP J: Argentina, Algeria, Austria, Jordan ===
    { homeTeam: 'Argentina', awayTeam: 'Algeria', stage: 'Group J', matchDate: new Date('2026-06-16T19:00:00Z') },
    { homeTeam: 'Austria',   awayTeam: 'Jordan',  stage: 'Group J', matchDate: new Date('2026-06-17T13:00:00Z') },
    { homeTeam: 'Argentina', awayTeam: 'Austria', stage: 'Group J', matchDate: new Date('2026-06-23T22:00:00Z') },
    { homeTeam: 'Jordan',    awayTeam: 'Algeria', stage: 'Group J', matchDate: new Date('2026-06-23T19:00:00Z') },
    { homeTeam: 'Jordan',    awayTeam: 'Argentina', stage: 'Group J', matchDate: new Date('2026-06-27T16:00:00Z') },
    { homeTeam: 'Algeria',   awayTeam: 'Austria', stage: 'Group J', matchDate: new Date('2026-06-27T16:00:00Z') },

    // === GROUP K: Portugal, Colombia, Uzbekistan, DR Congo ===
    { homeTeam: 'Portugal',   awayTeam: 'Uzbekistan', stage: 'Group K', matchDate: new Date('2026-06-17T16:00:00Z') },
    { homeTeam: 'Colombia',   awayTeam: 'DR Congo',   stage: 'Group K', matchDate: new Date('2026-06-17T22:00:00Z') },
    { homeTeam: 'Portugal',   awayTeam: 'Colombia',   stage: 'Group K', matchDate: new Date('2026-06-24T13:00:00Z') },
    { homeTeam: 'DR Congo',   awayTeam: 'Uzbekistan', stage: 'Group K', matchDate: new Date('2026-06-24T19:00:00Z') },
    { homeTeam: 'DR Congo',   awayTeam: 'Portugal',   stage: 'Group K', matchDate: new Date('2026-06-27T20:00:00Z') },
    { homeTeam: 'Uzbekistan', awayTeam: 'Colombia',   stage: 'Group K', matchDate: new Date('2026-06-27T20:00:00Z') },

    // === GROUP L: England, Croatia, Ghana, Panama ===
    { homeTeam: 'England', awayTeam: 'Panama',  stage: 'Group L', matchDate: new Date('2026-06-17T19:00:00Z') },
    { homeTeam: 'Croatia', awayTeam: 'Ghana',   stage: 'Group L', matchDate: new Date('2026-06-18T13:00:00Z') },
    { homeTeam: 'England', awayTeam: 'Croatia', stage: 'Group L', matchDate: new Date('2026-06-25T13:00:00Z') },
    { homeTeam: 'Ghana',   awayTeam: 'Panama',  stage: 'Group L', matchDate: new Date('2026-06-25T22:00:00Z') },
    { homeTeam: 'Ghana',   awayTeam: 'England', stage: 'Group L', matchDate: new Date('2026-06-28T20:00:00Z') },
    { homeTeam: 'Panama',  awayTeam: 'Croatia', stage: 'Group L', matchDate: new Date('2026-06-28T20:00:00Z') },

    // === ROUND OF 32 (will be filled in by admin as teams qualify) ===
    // === QUARTER-FINALS, SEMI-FINALS, FINAL ===
    // Placeholders for knockout rounds (teams TBD)
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Round of 16', matchDate: new Date('2026-07-01T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Round of 16', matchDate: new Date('2026-07-02T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Round of 16', matchDate: new Date('2026-07-03T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Round of 16', matchDate: new Date('2026-07-04T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Quarter-final', matchDate: new Date('2026-07-09T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Quarter-final', matchDate: new Date('2026-07-10T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Semi-final', matchDate: new Date('2026-07-14T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Semi-final', matchDate: new Date('2026-07-15T20:00:00Z') },
    { homeTeam: 'TBD', awayTeam: 'TBD', stage: 'Final',      matchDate: new Date('2026-07-19T20:00:00Z') },
  ]

  // Clear existing matches (keep users and predictions)
  await prisma.prediction.deleteMany()
  await prisma.match.deleteMany()

  for (const match of matches) {
    await prisma.match.create({ data: match })
  }

  console.log(`Seed complete! ${matches.length} matches inserted. Admin: admin@admin.com / admin123`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
