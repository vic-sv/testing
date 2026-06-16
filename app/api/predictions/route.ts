import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { matchId, homeScore, awayScore } = await req.json()

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  if (new Date(match.matchDate) <= new Date()) {
    return NextResponse.json({ error: 'Match already started' }, { status: 400 })
  }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: { homeScore, awayScore },
    create: { userId, matchId, homeScore, awayScore },
  })

  return NextResponse.json({ ok: true })
}
