import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PredictionForm } from '@/components/PredictionForm'
import { StageBadge } from '@/components/StageBadge'
import { flag } from '@/lib/football'

export default async function PredictionsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const matches = await prisma.match.findMany({
    orderBy: { matchDate: 'asc' },
    include: { predictions: { where: { userId } } },
  })

  const now = new Date()
  const upcoming = matches.filter((m) => new Date(m.matchDate) > now)
  const past = matches.filter((m) => new Date(m.matchDate) <= now)

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl tracking-wide text-gradient-pitch sm:text-5xl">MY PREDICTIONS</h1>

      <section>
        <h2 className="mb-4 font-display text-2xl tracking-wide text-emerald-300">UPCOMING — MAKE YOUR PICKS</h2>
        {upcoming.length === 0 && <p className="text-slate-500">No upcoming matches to predict</p>}
        <div className="space-y-3">
          {upcoming.map((match) => (
            <PredictionForm key={match.id} match={match} existing={match.predictions[0] ?? null} />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-amber-300">PAST MATCHES</h2>
          <div className="space-y-3">
            {past.map((match) => {
              const pred = match.predictions[0]
              return (
                <div key={match.id} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 shadow-lg">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <StageBadge stage={match.stage} />
                    {match.homeScore !== null && (
                      <span className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-0.5 text-sm font-extrabold text-white tabular-nums">
                        {match.homeScore} – {match.awayScore}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-semibold">
                      <span className="mr-1">{flag(match.homeTeam)}</span>{match.homeTeam}
                      <span className="mx-2 text-xs text-slate-500">vs</span>
                      {match.awayTeam}<span className="ml-1">{flag(match.awayTeam)}</span>
                    </div>
                    {pred ? (
                      <div className="text-sm text-slate-400">Your pick: <span className="font-semibold text-slate-200">{pred.homeScore}–{pred.awayScore}</span></div>
                    ) : (
                      <div className="text-sm text-slate-600">No prediction</div>
                    )}
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
