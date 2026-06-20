import Link from 'next/link'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Панель адміністратора</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/matches" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors block">
          <div className="text-2xl mb-2">⚽</div>
          <div className="font-semibold text-lg">Матчі</div>
          <div className="text-sm text-slate-400">Додавати матчі та вносити результати</div>
        </Link>
        <Link href="/admin/users" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors block">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold text-lg">Користувачі</div>
          <div className="text-sm text-slate-400">Керування акаунтами та правами адміністратора</div>
        </Link>
      </div>
    </div>
  )
}
