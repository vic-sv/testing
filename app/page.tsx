import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Countdown } from '@/components/Countdown'
import { StageBadge } from '@/components/StageBadge'
import { Flag, teamName } from '@/lib/football'
import { formatKyivDateTime } from '@/lib/datetime'

function calcPoints(pred: { homeScore: number; awayScore: number }, match: { homeScore: number | null; awayScore: number | null }) {
  if (match.homeScore === null || match.awayScore === null) return 0
  if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) return 3
  if (Math.sign(pred.homeScore - pred.awayScore) === Math.sign(match.homeScore - match.awayScore)) return 1
  return 0
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  const now = new Date()

  const allMatches = await prisma.match.findMany({
    orderBy: { matchDate: 'asc' },
  })

  // Future matches (predictable): kickoff in the future AND no recorded result.
  const upcomingMatches = allMatches
    .filter((m) => new Date(m.matchDate) > now && m.homeScore === null)
    .slice(0, 5)

  // Past matches / results: already kicked off OR has a recorded score.
  const completedMatches = allMatches
    .filter((m) => new Date(m.matchDate) <= now || m.homeScore !== null)
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, 5)

  const users = await prisma.user.findMany({
    include: { predictions: { include: { match: true } } },
  })

  const leaderboard = users
    .map((u) => ({
      name: u.name,
      points: u.predictions.reduce((sum, p) => sum + calcPoints(p, p.match), 0),
      count: u.predictions.length,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-700 via-green-800 to-slate-900 px-6 py-12 text-center shadow-2xl shadow-emerald-900/40 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative">
          <span className="mb-4 inline-block rounded-full bg-amber-400/20 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 ring-1 ring-amber-400/30">
            ⚽ Гра прогнозів
          </span>
          <h1 className="font-display text-5xl leading-none sm:text-7xl md:text-8xl">
            <span className="text-gradient-gold drop-shadow-[0_2px_12px_rgba(245,197,24,0.35)]">WORLD CUP</span>
            <br />
            <span className="text-white">2026</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-emerald-50/90 sm:text-lg">
            Вгадуй рахунки, набирай очки, підіймайся в таблиці та перемагай друзів.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200/80">
              Відлік до старту
            </p>
            <Countdown />
          </div>

          {!session && (
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-3 text-lg font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105"
              >
                Приєднатися
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 bg-white/10 px-8 py-3 text-lg font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Увійти
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* MATCHES */}
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-emerald-300">МАЙБУТНІ МАТЧІ</h2>
          <div className="space-y-3">
            {upcomingMatches.length === 0 && <p className="text-sm text-slate-500">Немає майбутніх матчів</p>}
            {upcomingMatches.map((m) => (
              <div
                key={m.id}
                className="group rounded-2xl border border-white/5 bg-slate-800/60 p-4 shadow-lg transition-colors hover:border-emerald-500/40"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <StageBadge stage={m.stage} />
                  <span className="text-xs text-slate-400">
                    {formatKyivDateTime(m.matchDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate font-semibold">
                    <Flag country={m.homeTeam} className="mr-1.5" />{teamName(m.homeTeam)}
                  </div>
                  <span className="shrink-0 rounded-md bg-slate-900/60 px-2 py-0.5 text-xs font-bold text-slate-400">VS</span>
                  <div className="min-w-0 flex-1 truncate text-right font-semibold">
                    {teamName(m.awayTeam)}<Flag country={m.awayTeam} className="ml-1.5" />
                  </div>
                </div>
                {session && (
                  <Link href="/predictions" className="mt-2 inline-block text-xs font-semibold text-emerald-400 hover:underline">
                    Зробити прогноз →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-amber-300">ОСТАННІ РЕЗУЛЬТАТИ</h2>
          <div className="space-y-3">
            {completedMatches.length === 0 && <p className="text-sm text-slate-500">Результатів ще немає</p>}
            {completedMatches.map((m) => (
              <div key={m.id} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 shadow-lg">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <StageBadge stage={m.stage} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-amber-300/80">
                    {m.homeScore !== null ? 'Завершено' : 'Очікується результат'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate font-semibold">
                    <Flag country={m.homeTeam} className="mr-1.5" />{teamName(m.homeTeam)}
                  </div>
                  {m.homeScore !== null ? (
                    <span className="shrink-0 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1 text-base font-extrabold text-white tabular-nums">
                      {m.homeScore} – {m.awayScore}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-slate-900/60 px-2 py-0.5 text-xs font-bold text-slate-400">VS</span>
                  )}
                  <div className="min-w-0 flex-1 truncate text-right font-semibold">
                    {teamName(m.awayTeam)}<Flag country={m.awayTeam} className="ml-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* LEADERBOARD */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide text-amber-300">🏆 ТУРНІРНА ТАБЛИЦЯ</h2>
          {session && <Link href="/leaderboard" className="text-sm font-semibold text-emerald-400 hover:underline">Показати всіх →</Link>}
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-800/60 shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Ім'я</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Прогнози</th>
                <th className="px-4 py-3 text-right">Очки</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-4 py-3 text-lg">{medals[i] ?? <span className="text-slate-400">{i + 1}</span>}</td>
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="hidden px-4 py-3 text-right text-slate-400 sm:table-cell">{u.count}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">{u.points}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500">Прогнозів ще немає</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
