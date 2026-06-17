#!/bin/bash
set -e

# World Cup 2026 Predictor — server setup script
# Run as: bash setup.sh
# Requires: Node.js 18+, npm

APP_DIR="${1:-/opt/wc2026}"
echo "Installing to $APP_DIR"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# ── package.json ──────────────────────────────────────────────────────────────
cat > package.json << 'HEREDOC'
{
  "name": "wc2026-predictor",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "seed": "node -r ts-node/register prisma/seed.ts"
  },
  "prisma": {
    "seed": "node -r ts-node/register prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.19.3",
    "bcryptjs": "^3.0.3",
    "next": "16.2.9",
    "next-auth": "^4.24.14",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "prisma": "^6.19.3",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
HEREDOC

# ── tsconfig.json ─────────────────────────────────────────────────────────────
cat > tsconfig.json << 'HEREDOC'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
HEREDOC

# ── next.config.ts ────────────────────────────────────────────────────────────
cat > next.config.ts << 'HEREDOC'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
HEREDOC

# ── postcss.config.mjs ────────────────────────────────────────────────────────
cat > postcss.config.mjs << 'HEREDOC'
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
HEREDOC

# ── .env ──────────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  cat > .env << 'HEREDOC'
DATABASE_URL="file:../dev.db"
NEXTAUTH_SECRET="change-this-to-a-random-secret-in-production"
NEXTAUTH_URL="http://localhost:3000"
HEREDOC
  echo "Created .env — edit NEXTAUTH_URL and NEXTAUTH_SECRET before going live!"
fi

# ── .gitignore ────────────────────────────────────────────────────────────────
cat > .gitignore << 'HEREDOC'
/node_modules
/.next/
/out/
.env*
dev.db
*.tsbuildinfo
next-env.d.ts
HEREDOC

# ── middleware.ts ─────────────────────────────────────────────────────────────
cat > middleware.ts << 'HEREDOC'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    if (req.nextUrl.pathname.startsWith('/admin') && !(token as any)?.isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const p = req.nextUrl.pathname
        if (p.startsWith('/predictions') || p.startsWith('/leaderboard') || p.startsWith('/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/predictions/:path*', '/leaderboard/:path*', '/admin/:path*'],
}
HEREDOC

# ── prisma/schema.prisma ──────────────────────────────────────────────────────
mkdir -p prisma
cat > prisma/schema.prisma << 'HEREDOC'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(cuid())
  name        String
  email       String       @unique
  password    String
  isAdmin     Boolean      @default(false)
  predictions Prediction[]
  createdAt   DateTime     @default(now())
}

model Match {
  id          String       @id @default(cuid())
  homeTeam    String
  awayTeam    String
  stage       String
  matchDate   DateTime
  homeScore   Int?
  awayScore   Int?
  predictions Prediction[]
}

model Prediction {
  id        String   @id @default(cuid())
  userId    String
  matchId   String
  homeScore Int
  awayScore Int
  user      User     @relation(fields: [userId], references: [id])
  match     Match    @relation(fields: [matchId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, matchId])
}
HEREDOC

# ── prisma/seed.ts ────────────────────────────────────────────────────────────
cat > prisma/seed.ts << 'HEREDOC'
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
HEREDOC

# ── lib/ ──────────────────────────────────────────────────────────────────────
mkdir -p lib

cat > lib/prisma.ts << 'HEREDOC'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
HEREDOC

cat > lib/auth.ts << 'HEREDOC'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } as any
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as any).isAdmin
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).isAdmin = token.isAdmin
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}
HEREDOC

# ── app/ ──────────────────────────────────────────────────────────────────────
mkdir -p app/api/auth/\[...nextauth\] app/api/register app/api/predictions \
         app/api/admin/result app/api/admin/matches app/api/admin/users \
         app/login app/register app/predictions app/leaderboard \
         app/admin/matches/new app/admin/users

cat > app/globals.css << 'HEREDOC'
@import "tailwindcss";
body { font-family: Arial, Helvetica, sans-serif; }
HEREDOC

cat > app/providers.tsx << 'HEREDOC'
'use client'
import { SessionProvider } from 'next-auth/react'
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
HEREDOC

cat > app/layout.tsx << 'HEREDOC'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Cup 2026 Predictions',
  description: 'Predict match scores and compete with friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-white min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-5xl">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
HEREDOC

cat > app/page.tsx << 'HEREDOC'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function calcPoints(pred: { homeScore: number; awayScore: number }, match: { homeScore: number | null; awayScore: number | null }) {
  if (match.homeScore === null || match.awayScore === null) return 0
  if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) return 3
  if (Math.sign(pred.homeScore - pred.awayScore) === Math.sign(match.homeScore - match.awayScore)) return 1
  return 0
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  const upcomingMatches = await prisma.match.findMany({ where: { homeScore: null }, orderBy: { matchDate: 'asc' }, take: 5 })
  const completedMatches = await prisma.match.findMany({ where: { NOT: { homeScore: null } }, orderBy: { matchDate: 'desc' }, take: 5 })
  const users = await prisma.user.findMany({ include: { predictions: { include: { match: true } } } })
  const leaderboard = users
    .map((u) => ({ name: u.name, points: u.predictions.reduce((s, p) => s + calcPoints(p, p.match), 0), count: u.predictions.length }))
    .sort((a, b) => b.points - a.points).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-emerald-400 mb-2">World Cup 2026</h1>
        <p className="text-slate-400">Predict scores, earn points, beat your friends</p>
        {!session && (
          <div className="mt-4 flex gap-3 justify-center">
            <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-semibold transition-colors">Join Now</Link>
            <Link href="/login" className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg transition-colors">Login</Link>
          </div>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-slate-300">Upcoming Matches</h2>
          <div className="space-y-2">
            {upcomingMatches.length === 0 && <p className="text-slate-500 text-sm">No upcoming matches</p>}
            {upcomingMatches.map((m) => (
              <div key={m.id} className="bg-slate-800 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{m.homeTeam} vs {m.awayTeam}</div>
                  <div className="text-xs text-slate-400">{m.stage} · {new Date(m.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {session && <Link href="/predictions" className="text-xs text-emerald-400 hover:underline">Predict →</Link>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3 text-slate-300">Recent Results</h2>
          <div className="space-y-2">
            {completedMatches.length === 0 && <p className="text-slate-500 text-sm">No results yet</p>}
            {completedMatches.map((m) => (
              <div key={m.id} className="bg-slate-800 rounded-lg p-3">
                <div className="font-medium">{m.homeTeam} <span className="text-emerald-400 font-bold">{m.homeScore} – {m.awayScore}</span> {m.awayTeam}</div>
                <div className="text-xs text-slate-400">{m.stage}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-slate-300">Leaderboard</h2>
          {session && <Link href="/leaderboard" className="text-sm text-emerald-400 hover:underline">View all →</Link>}
        </div>
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-700 text-slate-400"><th className="py-2 px-4 text-left">#</th><th className="py-2 px-4 text-left">Name</th><th className="py-2 px-4 text-right">Predictions</th><th className="py-2 px-4 text-right">Points</th></tr></thead>
            <tbody>
              {leaderboard.map((u, i) => (<tr key={i} className="border-t border-slate-700"><td className="py-2 px-4 text-slate-400">{i + 1}</td><td className="py-2 px-4 font-medium">{u.name}</td><td className="py-2 px-4 text-right text-slate-400">{u.count}</td><td className="py-2 px-4 text-right font-bold text-emerald-400">{u.points}</td></tr>))}
              {leaderboard.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-slate-500">No predictions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
HEREDOC

cat > app/login/page.tsx << 'HEREDOC'
'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    const res = await signIn('credentials', { email: fd.get('email'), password: fd.get('password'), redirect: false })
    setLoading(false)
    if (res?.error) setError('Invalid email or password')
    else { router.push('/'); router.refresh() }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
        {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm">{error}</div>}
        <div><label className="block text-sm text-slate-400 mb-1">Email</label><input name="email" type="email" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label className="block text-sm text-slate-400 mb-1">Password</label><input name="password" type="password" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold transition-colors disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        <p className="text-center text-sm text-slate-400">No account? <Link href="/register" className="text-emerald-400 hover:underline">Register</Link></p>
      </form>
    </div>
  )
}
HEREDOC

cat > app/register/page.tsx << 'HEREDOC'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') }) })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Registration failed') }
    else router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
        {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm">{error}</div>}
        <div><label className="block text-sm text-slate-400 mb-1">Name</label><input name="name" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label className="block text-sm text-slate-400 mb-1">Email</label><input name="email" type="email" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label className="block text-sm text-slate-400 mb-1">Password</label><input name="password" type="password" required minLength={6} className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold transition-colors disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button>
        <p className="text-center text-sm text-slate-400">Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Sign in</Link></p>
      </form>
    </div>
  )
}
HEREDOC

cat > app/predictions/page.tsx << 'HEREDOC'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PredictionForm } from '@/components/PredictionForm'

export default async function PredictionsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id
  const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' }, include: { predictions: { where: { userId } } } })
  const now = new Date()
  const upcoming = matches.filter((m) => new Date(m.matchDate) > now)
  const past = matches.filter((m) => new Date(m.matchDate) <= now)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Predictions</h1>
      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-3">Upcoming Matches — make your picks</h2>
        {upcoming.length === 0 && <p className="text-slate-500">No upcoming matches to predict</p>}
        <div className="space-y-3">{upcoming.map((m) => <PredictionForm key={m.id} match={m} existing={m.predictions[0] ?? null} />)}</div>
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-300 mb-3">Past Matches</h2>
          <div className="space-y-2">
            {past.map((match) => {
              const pred = match.predictions[0]
              return (
                <div key={match.id} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div><div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div><div className="text-xs text-slate-400">{match.stage}</div></div>
                    <div className="text-right">
                      {match.homeScore !== null && <div className="text-emerald-400 font-bold">Result: {match.homeScore}–{match.awayScore}</div>}
                      {pred ? <div className="text-slate-400 text-sm">Your pick: {pred.homeScore}–{pred.awayScore}</div> : <div className="text-slate-600 text-sm">No prediction</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
HEREDOC

cat > app/leaderboard/page.tsx << 'HEREDOC'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function calcPoints(pred: { homeScore: number; awayScore: number }, match: { homeScore: number | null; awayScore: number | null }) {
  if (match.homeScore === null || match.awayScore === null) return 0
  if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) return 3
  if (Math.sign(pred.homeScore - pred.awayScore) === Math.sign(match.homeScore - match.awayScore)) return 1
  return 0
}

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  const currentUserId = (session!.user as any).id
  const users = await prisma.user.findMany({ include: { predictions: { include: { match: true } } } })
  const leaderboard = users.map((u) => {
    const points = u.predictions.reduce((s, p) => s + calcPoints(p, p.match), 0)
    const exact = u.predictions.filter((p) => p.match.homeScore !== null && p.homeScore === p.match.homeScore && p.awayScore === p.match.awayScore).length
    return { id: u.id, name: u.name, points, predictions: u.predictions.length, exact }
  }).sort((a, b) => b.points - a.points || b.exact - a.exact)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-700 text-slate-400"><th className="py-3 px-4 text-left">#</th><th className="py-3 px-4 text-left">Player</th><th className="py-3 px-4 text-right">Picks</th><th className="py-3 px-4 text-right">Exact</th><th className="py-3 px-4 text-right">Points</th></tr></thead>
          <tbody>
            {leaderboard.map((u, i) => (
              <tr key={u.id} className={`border-t border-slate-700 ${u.id === currentUserId ? 'bg-emerald-900/20' : ''}`}>
                <td className="py-3 px-4 text-slate-400 font-bold">{medals[i] ?? i + 1}</td>
                <td className="py-3 px-4 font-medium">{u.name}{u.id === currentUserId && <span className="ml-2 text-xs text-emerald-400">(you)</span>}</td>
                <td className="py-3 px-4 text-right text-slate-400">{u.predictions}</td>
                <td className="py-3 px-4 text-right text-slate-400">{u.exact}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">{u.points}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-500">No predictions yet</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">Scoring: Exact score = 3 pts · Correct outcome = 1 pt</p>
    </div>
  )
}
HEREDOC

cat > app/admin/page.tsx << 'HEREDOC'
import Link from 'next/link'
export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/matches" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors block"><div className="text-2xl mb-2">⚽</div><div className="font-semibold text-lg">Matches</div><div className="text-sm text-slate-400">Add matches and enter results</div></Link>
        <Link href="/admin/users" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors block"><div className="text-2xl mb-2">👥</div><div className="font-semibold text-lg">Users</div><div className="text-sm text-slate-400">Manage user accounts and admin rights</div></Link>
      </div>
    </div>
  )
}
HEREDOC

cat > app/admin/matches/page.tsx << 'HEREDOC'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ResultForm } from '@/components/ResultForm'

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' } })
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><Link href="/admin" className="text-sm text-slate-400 hover:text-slate-300">← Admin</Link><h1 className="text-2xl font-bold mt-1">Matches</h1></div>
        <Link href="/admin/matches/new" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-sm font-medium transition-colors">+ Add Match</Link>
      </div>
      <div className="space-y-3">
        {matches.length === 0 && <p className="text-slate-500">No matches yet.</p>}
        {matches.map((match) => (
          <div key={match.id} className="bg-slate-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
                <div className="text-xs text-slate-400">{match.stage} · {new Date(match.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                {match.homeScore !== null && <div className="text-xs text-emerald-400 mt-1">Result: {match.homeScore}–{match.awayScore}</div>}
              </div>
              <ResultForm matchId={match.id} currentHome={match.homeScore} currentAway={match.awayScore} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
HEREDOC

cat > app/admin/matches/new/page.tsx << 'HEREDOC'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STAGES = ['Group A','Group B','Group C','Group D','Group E','Group F','Group G','Group H','Round of 16','Quarter-final','Semi-final','Third place','Final']

export default function NewMatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true)
    const fd = new FormData(e.currentTarget)
    await fetch('/api/admin/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ homeTeam: fd.get('homeTeam'), awayTeam: fd.get('awayTeam'), stage: fd.get('stage'), matchDate: fd.get('matchDate') }) })
    setLoading(false); router.push('/admin/matches')
  }
  return (
    <div className="max-w-lg">
      <div className="mb-6"><Link href="/admin/matches" className="text-sm text-slate-400 hover:text-slate-300">← Matches</Link><h1 className="text-2xl font-bold mt-1">Add Match</h1></div>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
        <div><label className="block text-sm text-slate-400 mb-1">Home Team</label><input name="homeTeam" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label className="block text-sm text-slate-400 mb-1">Away Team</label><input name="awayTeam" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label className="block text-sm text-slate-400 mb-1">Stage</label><select name="stage" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">{STAGES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="block text-sm text-slate-400 mb-1">Date & Time</label><input name="matchDate" type="datetime-local" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold transition-colors disabled:opacity-50">{loading ? 'Adding...' : 'Add Match'}</button>
      </form>
    </div>
  )
}
HEREDOC

cat > app/admin/users/page.tsx << 'HEREDOC'
import { prisma } from '@/lib/prisma'
import { ToggleAdminButton } from '@/components/ToggleAdminButton'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
  return (
    <div>
      <div className="mb-6"><Link href="/admin" className="text-sm text-slate-400 hover:text-slate-300">← Admin</Link><h1 className="text-2xl font-bold mt-1">Users</h1></div>
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-700 text-slate-400"><th className="py-3 px-4 text-left">Name</th><th className="py-3 px-4 text-left">Email</th><th className="py-3 px-4 text-left">Admin</th><th className="py-3 px-4 text-left">Actions</th></tr></thead>
          <tbody>{users.map((u) => (<tr key={u.id} className="border-t border-slate-700"><td className="py-3 px-4">{u.name}</td><td className="py-3 px-4 text-slate-400">{u.email}</td><td className="py-3 px-4">{u.isAdmin ? '✅' : '—'}</td><td className="py-3 px-4"><ToggleAdminButton userId={u.id} isAdmin={u.isAdmin} /></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}
HEREDOC

# ── API routes ────────────────────────────────────────────────────────────────
cat > "app/api/auth/[...nextauth]/route.ts" << 'HEREDOC'
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
HEREDOC

cat > app/api/register/route.ts << 'HEREDOC'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { name, email, password: hashed } })
  return NextResponse.json({ ok: true })
}
HEREDOC

cat > app/api/predictions/route.ts << 'HEREDOC'
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
  if (new Date(match.matchDate) <= new Date()) return NextResponse.json({ error: 'Match already started' }, { status: 400 })
  await prisma.prediction.upsert({ where: { userId_matchId: { userId, matchId } }, update: { homeScore, awayScore }, create: { userId, matchId, homeScore, awayScore } })
  return NextResponse.json({ ok: true })
}
HEREDOC

cat > app/api/admin/result/route.ts << 'HEREDOC'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { matchId, homeScore, awayScore } = await req.json()
  await prisma.match.update({ where: { id: matchId }, data: { homeScore, awayScore } })
  return NextResponse.json({ ok: true })
}
HEREDOC

cat > app/api/admin/matches/route.ts << 'HEREDOC'
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
HEREDOC

cat > app/api/admin/users/route.ts << 'HEREDOC'
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
HEREDOC

# ── components/ ───────────────────────────────────────────────────────────────
mkdir -p components

cat > components/Navbar.tsx << 'HEREDOC'
'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export function Navbar() {
  const { data: session } = useSession()
  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-emerald-400">⚽ WC2026 Predictor</Link>
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          {session ? (
            <>
              <Link href="/predictions" className="hover:text-emerald-400 transition-colors">My Predictions</Link>
              <Link href="/leaderboard" className="hover:text-emerald-400 transition-colors">Leaderboard</Link>
              {(session.user as any).isAdmin && <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors">Admin</Link>}
              <button onClick={() => signOut()} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors">Sign out ({session.user?.name})</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
              <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
HEREDOC

cat > components/PredictionForm.tsx << 'HEREDOC'
'use client'
import { useState } from 'react'

interface Match { id: string; homeTeam: string; awayTeam: string; stage: string; matchDate: Date }
interface Prediction { id: string; homeScore: number; awayScore: number }

export function PredictionForm({ match, existing }: { match: Match; existing: Prediction | null }) {
  const [home, setHome] = useState(existing?.homeScore?.toString() ?? '')
  const [away, setAway] = useState(existing?.awayScore?.toString() ?? '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setSaved(false); setError('')
    const res = await fetch('/api/predictions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: match.id, homeScore: Number(home), awayScore: Number(away) }) })
    setLoading(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    else { const d = await res.json(); setError(d.error || 'Failed to save') }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
          <div className="text-xs text-slate-400">{match.stage} · {new Date(match.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
          {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input type="number" min="0" max="20" value={home} onChange={(e) => setHome(e.target.value)} className="w-14 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" required />
          <span className="text-slate-400">–</span>
          <input type="number" min="0" max="20" value={away} onChange={(e) => setAway(e.target.value)} className="w-14 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" required />
          <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50">{saved ? '✓ Saved' : loading ? '...' : existing ? 'Update' : 'Save'}</button>
        </form>
      </div>
    </div>
  )
}
HEREDOC

cat > components/ResultForm.tsx << 'HEREDOC'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ResultForm({ matchId, currentHome, currentAway }: { matchId: string; currentHome: number | null; currentAway: number | null }) {
  const router = useRouter()
  const [home, setHome] = useState(currentHome?.toString() ?? '')
  const [away, setAway] = useState(currentAway?.toString() ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await fetch('/api/admin/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId, homeScore: Number(home), awayScore: Number(away) }) })
    setLoading(false); router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Result:</span>
      <input type="number" min="0" max="20" value={home} onChange={(e) => setHome(e.target.value)} className="w-12 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="0" required />
      <span className="text-slate-400">–</span>
      <input type="number" min="0" max="20" value={away} onChange={(e) => setAway(e.target.value)} className="w-12 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="0" required />
      <button type="submit" disabled={loading} className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-sm transition-colors disabled:opacity-50">{loading ? '...' : currentHome !== null ? 'Update' : 'Set'}</button>
    </form>
  )
}
HEREDOC

cat > components/ToggleAdminButton.tsx << 'HEREDOC'
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ToggleAdminButton({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function toggle() {
    setLoading(true)
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, isAdmin: !isAdmin }) })
    setLoading(false); router.refresh()
  }
  return (
    <button onClick={toggle} disabled={loading} className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50">
      {loading ? '...' : isAdmin ? 'Remove admin' : 'Make admin'}
    </button>
  )
}
HEREDOC

# ── Install, migrate, seed, build ─────────────────────────────────────────────
echo ""
echo "==> Installing dependencies..."
npm install

echo ""
echo "==> Running database migration..."
npx prisma migrate dev --name init

echo ""
echo "==> Seeding database..."
npm run seed

echo ""
echo "==> Building production app..."
npm run build

echo ""
echo "======================================================"
echo " Done! App is ready at $APP_DIR"
echo ""
echo " To start:           npm start          (port 3000)"
echo " To run with PM2:    pm2 start 'npm start' --name wc2026"
echo ""
echo " Admin login:  admin@admin.com / admin123"
echo " IMPORTANT: Edit .env and set NEXTAUTH_URL to your domain"
echo "            and change NEXTAUTH_SECRET to a random string"
echo "======================================================"
