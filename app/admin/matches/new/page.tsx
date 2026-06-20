'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { stageName } from '@/lib/football'

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
        <Link href="/admin/matches" className="text-sm text-slate-400 hover:text-slate-300">← Матчі</Link>
        <h1 className="text-2xl font-bold mt-1">Додати матч</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Господарі</label>
          <input name="homeTeam" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Гості</label>
          <input name="awayTeam" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Стадія</label>
          <select name="stage" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {STAGES.map((s) => <option key={s} value={s}>{stageName(s)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Дата та час матчу</label>
          <input name="matchDate" type="datetime-local" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold transition-colors disabled:opacity-50">
          {loading ? 'Додавання...' : 'Додати матч'}
        </button>
      </form>
    </div>
  )
}
