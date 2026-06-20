'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ResultForm({ matchId, currentHome, currentAway }: {
  matchId: string
  currentHome: number | null
  currentAway: number | null
}) {
  const router = useRouter()
  const [home, setHome] = useState(currentHome?.toString() ?? '')
  const [away, setAway] = useState(currentAway?.toString() ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/admin/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, homeScore: Number(home), awayScore: Number(away) }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Результат:</span>
      <input
        type="number" min="0" max="20" value={home} onChange={(e) => setHome(e.target.value)}
        className="w-12 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
        placeholder="0" required
      />
      <span className="text-slate-400">–</span>
      <input
        type="number" min="0" max="20" value={away} onChange={(e) => setAway(e.target.value)}
        className="w-12 bg-slate-700 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
        placeholder="0" required
      />
      <button type="submit" disabled={loading} className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-sm transition-colors disabled:opacity-50">
        {loading ? '...' : currentHome !== null ? 'Оновити' : 'Внести'}
      </button>
    </form>
  )
}
