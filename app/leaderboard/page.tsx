import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function calcPoints(pred: { homeScore: number; awayScore: number }, match: { homeScore: number | null; awayScore: number | null }) {
  if (match.homeScore === null || match.awayScore === null) return 0
  if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) return 3
  if (Math.sign(pred.homeScore - pred.awayScore) === Math.sign(match.homeScore - match.awayScore)) return 1
  return 0
}

const PODIUM = [
  { medal: '🥈', ring: 'ring-slate-300/40', glow: 'from-slate-400/20', order: 'order-1 sm:mt-8', h: 'h-28' },
  { medal: '🥇', ring: 'ring-amber-400/60', glow: 'from-amber-400/30', order: 'order-2 sm:order-2', h: 'h-36' },
  { medal: '🥉', ring: 'ring-amber-700/50', glow: 'from-amber-700/20', order: 'order-3 sm:mt-12', h: 'h-24' },
]

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

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  // Podium visual order: silver, gold, bronze.
  const podiumOrder = [top3[1], top3[0], top3[2]]

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl tracking-wide text-gradient-gold sm:text-5xl">🏆 ТУРНІРНА ТАБЛИЦЯ</h1>

      {top3.length > 0 && (
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
          {podiumOrder.map((u, idx) => {
            if (!u) return <div key={idx} className={PODIUM[idx].order} />
            const p = PODIUM[idx]
            const isYou = u.id === currentUserId
            return (
              <div key={u.id} className={`flex flex-col items-center ${p.order}`}>
                <div className="mb-2 text-3xl sm:text-4xl">{p.medal}</div>
                <div className={`w-full rounded-2xl bg-gradient-to-b ${p.glow} to-slate-800/80 p-3 text-center ring-2 ${p.ring} ${isYou ? 'outline outline-2 outline-emerald-400' : ''}`}>
                  <div className="truncate font-bold sm:text-lg">{u.name}</div>
                  {isYou && <div className="text-[10px] font-semibold uppercase text-emerald-400">Ви</div>}
                  <div className="mt-1 font-display text-3xl text-amber-300 sm:text-4xl">{u.points}</div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">очки</div>
                  <div className={`mt-2 ${p.h} rounded-t-lg bg-gradient-to-b from-emerald-600/60 to-emerald-900/60`} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-800/60 shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Гравець</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Прогнози</th>
                <th className="px-4 py-3 text-right">Точні</th>
                <th className="px-4 py-3 text-right">Очки</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((u, i) => (
                <tr key={u.id} className={`border-t border-white/5 ${u.id === currentUserId ? 'bg-emerald-500/10' : ''}`}>
                  <td className="px-4 py-3 font-bold text-slate-400">{i + 4}</td>
                  <td className="px-4 py-3 font-semibold">
                    {u.name}
                    {u.id === currentUserId && <span className="ml-2 text-xs text-emerald-400">(ви)</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-slate-400 sm:table-cell">{u.predictions}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{u.exact}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">{u.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {leaderboard.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-slate-800/60 py-10 text-center text-slate-500">
          Прогнозів ще немає — станьте першим у таблиці!
        </div>
      )}

      <p className="text-xs text-slate-500">Нарахування: Точний рахунок = 3 очки · Правильний результат = 1 очко</p>
    </div>
  )
}
