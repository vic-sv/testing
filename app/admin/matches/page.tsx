import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ResultForm } from '@/components/ResultForm'
import { StageBadge } from '@/components/StageBadge'
import { Flag, teamName } from '@/lib/football'
import { formatKyivDateTimeYear } from '@/lib/datetime'

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({ orderBy: { matchDate: 'asc' } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-300">← Адмін</Link>
          <h1 className="text-2xl font-bold mt-1">Матчі</h1>
        </div>
        <Link href="/admin/matches/new" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-sm font-medium transition-colors">
          + Додати матч
        </Link>
      </div>
      <div className="space-y-3">
        {matches.length === 0 && <p className="text-slate-500">Матчів ще немає. Додайте вище.</p>}
        {matches.map((match) => (
          <div key={match.id} className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <StageBadge stage={match.stage} />
                  <span className="text-xs text-slate-400">
                    {formatKyivDateTimeYear(match.matchDate)}
                  </span>
                </div>
                <div className="font-semibold">
                  <Flag country={match.homeTeam} className="mr-1.5" />{teamName(match.homeTeam)}
                  <span className="mx-2 text-xs text-slate-500">проти</span>
                  {teamName(match.awayTeam)}<Flag country={match.awayTeam} className="ml-1.5" />
                </div>
                {match.homeScore !== null && (
                  <div className="mt-1 text-xs font-semibold text-emerald-400">Поточний результат: {match.homeScore}–{match.awayScore}</div>
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
