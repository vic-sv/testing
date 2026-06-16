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

  const users = await prisma.user.findMany({
    include: { predictions: { include: { match: true } } },
  })

  const leaderboard = users
    .map((u) => {
      const points = u.predictions.reduce((sum, p) => sum + calcPoints(p, p.match), 0)
      const exact = u.predictions.filter(
        (p) => p.match.homeScore !== null && p.homeScore === p.match.homeScore && p.awayScore === p.match.awayScore
      ).length
      return { id: u.id, name: u.name, points, predictions: u.predictions.length, exact }
    })
    .sort((a, b) => b.points - a.points || b.exact - a.exact)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-slate-400">
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Player</th>
              <th className="py-3 px-4 text-right">Picks</th>
              <th className="py-3 px-4 text-right">Exact</th>
              <th className="py-3 px-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((u, i) => (
              <tr key={u.id} className={`border-t border-slate-700 ${u.id === currentUserId ? 'bg-emerald-900/20' : ''}`}>
                <td className="py-3 px-4 text-slate-400 font-bold">{medals[i] ?? i + 1}</td>
                <td className="py-3 px-4 font-medium">
                  {u.name}
                  {u.id === currentUserId && <span className="ml-2 text-xs text-emerald-400">(you)</span>}
                </td>
                <td className="py-3 px-4 text-right text-slate-400">{u.predictions}</td>
                <td className="py-3 px-4 text-right text-slate-400">{u.exact}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">{u.points}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-slate-500">No predictions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">Scoring: Exact score = 3 pts · Correct outcome = 1 pt</p>
    </div>
  )
}
