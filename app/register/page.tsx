'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Registration failed')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
        {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm">{error}</div>}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Name</label>
          <input name="name" type="text" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input name="email" type="email" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Password</label>
          <input name="password" type="password" required minLength={6} className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold transition-colors disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
