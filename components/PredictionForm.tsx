'use client'
import { useState } from 'react'

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
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
          <div className="text-xs text-slate-400">
            {match.stage} · {new Date(match.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
          {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="number" min="0" max="20" value={home} onChange={(e) => setHome(e.target.value)}
            className="w-14 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0" required
          />
          <span className="text-slate-400">–</span>
          <input
            type="number" min="0" max="20" value={away} onChange={(e) => setAway(e.target.value)}
            className="w-14 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0" required
          />
          <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50">
            {saved ? '✓ Saved' : loading ? '...' : existing ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
