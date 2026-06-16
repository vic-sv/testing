import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PredictionForm } from '@/components/PredictionForm'

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Predictions</h1>

      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-3">Upcoming Matches — make your picks</h2>
        {upcoming.length === 0 && <p className="text-slate-500">No upcoming matches to predict</p>}
        <div className="space-y-3">
          {upcoming.map((match) => (
            <PredictionForm key={match.id} match={match} existing={match.predictions[0] ?? null} />
          ))}
        </div>
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
                    <div>
                      <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
                      <div className="text-xs text-slate-400">{match.stage}</div>
                    </div>
                    <div className="text-right">
                      {match.homeScore !== null && (
                        <div className="text-emerald-400 font-bold">Result: {match.homeScore}–{match.awayScore}</div>
                      )}
                      {pred ? (
                        <div className="text-slate-400 text-sm">Your pick: {pred.homeScore}–{pred.awayScore}</div>
                      ) : (
                        <div className="text-slate-600 text-sm">No prediction</div>
                      )}
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
