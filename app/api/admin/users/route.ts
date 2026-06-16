import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, isAdmin } = await req.json()
  await prisma.user.update({ where: { id: userId }, data: { isAdmin } })
  return NextResponse.json({ ok: true })
}
