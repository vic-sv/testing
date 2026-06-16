import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { homeTeam, awayTeam, stage, matchDate } = await req.json()
  await prisma.match.create({ data: { homeTeam, awayTeam, stage, matchDate: new Date(matchDate) } })
  return NextResponse.json({ ok: true })
}
