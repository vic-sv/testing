import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ResultForm } from '@/components/ResultForm'

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-300">← Admin</Link>
          <h1 className="text-2xl font-bold mt-1">Matches</h1>
        </div>
        <Link href="/admin/matches/new" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-sm font-medium transition-colors">
          + Add Match
        </Link>
      </div>
      <div className="space-y-3">
        {matches.length === 0 && <p className="text-slate-500">No matches yet. Add one above.</p>}
        {matches.map((match) => (
          <div key={match.id} className="bg-slate-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
                <div className="text-xs text-slate-400">
                  {match.stage} · {new Date(match.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {match.homeScore !== null && (
                  <div className="text-xs text-emerald-400 mt-1">Current result: {match.homeScore}–{match.awayScore}</div>
                )}
              </div>
              <ResultForm matchId={match.id} currentHome={match.homeScore} currentAway={match.awayScore} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
