import Link from 'next/link'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/matches" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors block">
          <div className="text-2xl mb-2">⚽</div>
          <div className="font-semibold text-lg">Matches</div>
          <div className="text-sm text-slate-400">Add matches and enter results</div>
        </Link>
        <Link href="/admin/users" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 transition-colors block">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold text-lg">Users</div>
          <div className="text-sm text-slate-400">Manage user accounts and admin rights</div>
        </Link>
      </div>
    </div>
  )
}
