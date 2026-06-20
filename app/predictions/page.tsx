import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PredictionForm } from '@/components/PredictionForm'
import { StageBadge } from '@/components/StageBadge'
import { Flag, teamName } from '@/lib/football'

export default async function PredictionsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const matches = await prisma.match.findMany({
    orderBy: { matchDate: 'asc' },
    include: { predictions: { where: { userId } } },
  })

  const now = new Date()
  // Predictable: kickoff strictly in the future AND no recorded result yet.
  const upcoming = matches.filter(
    (m) => new Date(m.matchDate) > now && m.homeScore === null
  )
  // Everything else (already started, in the past, or has a result).
  const past = matches.filter(
    (m) => !(new Date(m.matchDate) > now && m.homeScore === null)
  )

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl tracking-wide text-gradient-pitch sm:text-5xl">МОЇ ПРОГНОЗИ</h1>

      <section>
        <h2 className="mb-4 font-display text-2xl tracking-wide text-emerald-300">МАЙБУТНІ — ЗРОБІТЬ ПРОГНОЗ</h2>
        {upcoming.length === 0 && <p className="text-slate-500">Немає майбутніх матчів для прогнозу</p>}
        <div className="space-y-3">
          {upcoming.map((match) => (
            <PredictionForm key={match.id} match={match} existing={match.predictions[0] ?? null} />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-wide text-amber-300">МИНУЛІ МАТЧІ</h2>
          <div className="space-y-3">
            {past.map((match) => {
              const pred = match.predictions[0]
              return (
                <div key={match.id} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 shadow-lg">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <StageBadge stage={match.stage} />
                    {match.homeScore !== null ? (
                      <span className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-0.5 text-sm font-extrabold text-white tabular-nums">
                        {match.homeScore} – {match.awayScore}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-300/80">Очікується результат</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-semibold">
                      <Flag country={match.homeTeam} className="mr-1.5" />{teamName(match.homeTeam)}
                      <span className="mx-2 text-xs text-slate-500">проти</span>
                      {teamName(match.awayTeam)}<Flag country={match.awayTeam} className="ml-1.5" />
                    </div>
                    {pred ? (
                      <div className="text-sm text-slate-400">Ваш прогноз: <span className="font-semibold text-slate-200">{pred.homeScore}–{pred.awayScore}</span></div>
                    ) : (
                      <div className="text-sm text-slate-600">Без прогнозу</div>
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
