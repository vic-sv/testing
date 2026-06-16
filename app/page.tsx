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

  const upcomingMatches = await prisma.match.findMany({
    where: { homeScore: null },
    orderBy: { matchDate: 'asc' },
    take: 5,
  })

  const completedMatches = await prisma.match.findMany({
    where: { NOT: { homeScore: null } },
    orderBy: { matchDate: 'desc' },
    take: 5,
  })

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

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-emerald-400 mb-2">World Cup 2026</h1>
        <p className="text-slate-400">Predict scores, earn points, beat your friends</p>
        {!session && (
          <div className="mt-4 flex gap-3 justify-center">
            <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-semibold transition-colors">
              Join Now
            </Link>
            <Link href="/login" className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg transition-colors">
              Login
            </Link>
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
                  <div className="text-xs text-slate-400">
                    {m.stage} · {new Date(m.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {session && (
                  <Link href="/predictions" className="text-xs text-emerald-400 hover:underline">Predict →</Link>
                )}
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
                <div className="font-medium">
                  {m.homeTeam} <span className="text-emerald-400 font-bold">{m.homeScore} – {m.awayScore}</span> {m.awayTeam}
                </div>
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
            <thead>
              <tr className="bg-slate-700 text-slate-400">
                <th className="py-2 px-4 text-left">#</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-right">Predictions</th>
                <th className="py-2 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={i} className="border-t border-slate-700">
                  <td className="py-2 px-4 text-slate-400">{i + 1}</td>
                  <td className="py-2 px-4 font-medium">{u.name}</td>
                  <td className="py-2 px-4 text-right text-slate-400">{u.count}</td>
                  <td className="py-2 px-4 text-right font-bold text-emerald-400">{u.points}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-slate-500">No predictions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
