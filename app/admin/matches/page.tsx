import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ResultForm } from '@/components/ResultForm'
import { StageBadge } from '@/components/StageBadge'
import { flag } from '@/lib/football'

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
          <div key={match.id} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <StageBadge stage={match.stage} />
                  <span className="text-xs text-slate-400">
                    {new Date(match.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="font-semibold">
                  <span className="mr-1">{flag(match.homeTeam)}</span>{match.homeTeam}
                  <span className="mx-2 text-xs text-slate-500">vs</span>
                  {match.awayTeam}<span className="ml-1">{flag(match.awayTeam)}</span>
                </div>
                {match.homeScore !== null && (
                  <div className="mt-1 text-xs font-semibold text-emerald-400">Current result: {match.homeScore}–{match.awayScore}</div>
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
