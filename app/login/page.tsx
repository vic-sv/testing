'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
        {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm">{error}</div>}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input name="email" type="email" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Password</label>
          <input name="password" type="password" required className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold transition-colors disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-slate-400">
          No account? <Link href="/register" className="text-emerald-400 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}
