'use client'
import { useState } from 'react'
import { flag, stageBadgeClasses } from '@/lib/football'

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  stage: string
  matchDate: Date
}

interface Prediction {
  id: string
  homeScore: number
  awayScore: number
}

export function PredictionForm({ match, existing }: { match: Match; existing: Prediction | null }) {
  const [home, setHome] = useState(existing?.homeScore?.toString() ?? '')
  const [away, setAway] = useState(existing?.awayScore?.toString() ?? '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    setError('')
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, homeScore: Number(home), awayScore: Number(away) }),
    })
    setLoading(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    }
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 shadow-lg transition-colors hover:border-emerald-500/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${stageBadgeClasses(match.stage)}`}>
          {match.stage}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(match.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-semibold">
            <span className="truncate"><span className="mr-1">{flag(match.homeTeam)}</span>{match.homeTeam}</span>
            <span className="shrink-0 text-xs text-slate-500">vs</span>
            <span className="truncate">{match.awayTeam}<span className="ml-1">{flag(match.awayTeam)}</span></span>
          </div>
          {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2">
          <input
            type="number" min="0" max="20" value={home} onChange={(e) => setHome(e.target.value)}
            className="w-14 rounded-lg bg-slate-900/70 px-2 py-2 text-center text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0" required
          />
          <span className="font-bold text-slate-500">–</span>
          <input
            type="number" min="0" max="20" value={away} onChange={(e) => setAway(e.target.value)}
            className="w-14 rounded-lg bg-slate-900/70 px-2 py-2 text-center text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0" required
          />
          <button type="submit" disabled={loading} className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105 disabled:opacity-50">
            {saved ? '✓ Saved' : loading ? '...' : existing ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
