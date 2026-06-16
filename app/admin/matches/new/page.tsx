'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STAGES = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Round of 16', 'Quarter-final', 'Semi-final', 'Third place', 'Final']

export default function NewMatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await fetch('/api/admin/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeTeam: fd.get('homeTeam'),
        awayTeam: fd.get('awayTeam'),
        stage: fd.get('stage'),
        matchDate: fd.get('matchDate'),
      }),
    })
    setLoading(false)
    router.push('/admin/matches')
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/admin/matches" className="text-sm text-slate-400 hover:text-slate-300">← Matches</Link>
        <h1 className="text-2xl font-bold mt-1">Add Match</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Home Team</label>
          <input name="homeTeam" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Away Team</label>
          <input name="awayTeam" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stage</label>
          <select name="stage" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Match Date & Time</label>
          <input name="matchDate" type="datetime-local" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold transition-colors disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Match'}
        </button>
      </form>
    </div>
  )
}
