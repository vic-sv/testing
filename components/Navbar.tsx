'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-emerald-400">
          ⚽ WC2026 Predictor
        </Link>
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          {session ? (
            <>
              <Link href="/predictions" className="hover:text-emerald-400 transition-colors">My Predictions</Link>
              <Link href="/leaderboard" className="hover:text-emerald-400 transition-colors">Leaderboard</Link>
              {(session.user as any).isAdmin && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors">Admin</Link>
              )}
              <button
                onClick={() => signOut()}
                className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors"
              >
                Sign out ({session.user?.name})
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
              <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
