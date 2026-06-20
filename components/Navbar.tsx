'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const linkBase = 'rounded-lg px-3 py-2 font-medium transition-colors hover:bg-white/5 hover:text-emerald-400'

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 h-16">
        <Link href="/" onClick={close} className="flex items-center gap-2 font-display text-2xl tracking-wide">
          <span className="text-2xl">⚽</span>
          <span className="text-gradient-pitch">WC2026 PREDICTOR</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 text-sm md:flex">
          <Link href="/" className={linkBase}>Головна</Link>
          {session ? (
            <>
              <Link href="/predictions" className={linkBase}>Мої прогнози</Link>
              <Link href="/leaderboard" className={linkBase}>Турнірна таблиця</Link>
              {(session.user as any).isAdmin && (
                <Link href="/admin" className="rounded-lg px-3 py-2 font-semibold text-amber-400 transition-colors hover:bg-amber-400/10">
                  Адмін
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="ml-1 rounded-lg bg-white/5 px-3 py-2 font-medium transition-colors hover:bg-white/10"
              >
                Вийти <span className="text-slate-400">({session.user?.name})</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkBase}>Увійти</Link>
              <Link
                href="/register"
                className="ml-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105"
              >
                Реєстрація
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl hover:bg-white/5 md:hidden"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-base">
            <Link href="/" onClick={close} className={linkBase}>Головна</Link>
            {session ? (
              <>
                <Link href="/predictions" onClick={close} className={linkBase}>Мої прогнози</Link>
                <Link href="/leaderboard" onClick={close} className={linkBase}>Турнірна таблиця</Link>
                {(session.user as any).isAdmin && (
                  <Link href="/admin" onClick={close} className="rounded-lg px-3 py-2 font-semibold text-amber-400 hover:bg-amber-400/10">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { close(); signOut() }}
                  className="mt-1 rounded-lg bg-white/5 px-3 py-2 text-left font-medium hover:bg-white/10"
                >
                  Вийти ({session.user?.name})
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className={linkBase}>Увійти</Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="mt-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-center font-semibold text-white shadow-lg shadow-emerald-600/20"
                >
                  Реєстрація
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
