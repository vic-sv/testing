'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ToggleAdminButton({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isAdmin: !isAdmin }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={toggle} disabled={loading} className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50">
      {loading ? '...' : isAdmin ? 'Remove admin' : 'Make admin'}
    </button>
  )
}
