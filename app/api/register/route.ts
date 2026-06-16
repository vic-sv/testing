import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  }
  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { name, email, password: hashed } })
  return NextResponse.json({ ok: true })
}
