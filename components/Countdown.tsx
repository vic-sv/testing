'use client'
import { useEffect, useState } from 'react'

// World Cup 2026 opening match.
const KICKOFF = new Date('2026-06-11T00:00:00Z').getTime()

function diff() {
  const ms = KICKOFF - Date.now()
  if (ms <= 0) return null
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-slate-900/40 px-3 py-2 backdrop-blur-sm sm:px-5 sm:py-3">
      <span className="font-display text-3xl font-bold leading-none text-white tabular-nums sm:text-4xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/70 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export function Countdown() {
  // Start null to keep server/client markup identical, then hydrate.
  const [t, setT] = useState<ReturnType<typeof diff> | undefined>(undefined)

  useEffect(() => {
    setT(diff())
    const id = setInterval(() => setT(diff()), 1000)
    return () => clearInterval(id)
  }, [])

  if (t === undefined) {
    // Pre-hydration placeholder (keeps height stable, avoids mismatch).
    return <div className="h-[72px]" aria-hidden />
  }

  if (t === null) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900/40 px-5 py-3 backdrop-blur-sm">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        <span className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Турнір НАЖИВО!
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <Unit value={t.days} label="Дні" />
      <Unit value={t.hours} label="Год" />
      <Unit value={t.minutes} label="Хв" />
      <Unit value={t.seconds} label="Сек" />
    </div>
  )
}
