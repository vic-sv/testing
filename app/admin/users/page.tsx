import { prisma } from '@/lib/prisma'
import { ToggleAdminButton } from '@/components/ToggleAdminButton'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-300">← Admin</Link>
        <h1 className="text-2xl font-bold mt-1">Users</h1>
      </div>
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-slate-400">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Admin</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-700">
                <td className="py-3 px-4">{u.name}</td>
                <td className="py-3 px-4 text-slate-400">{u.email}</td>
                <td className="py-3 px-4">{u.isAdmin ? '✅' : '—'}</td>
                <td className="py-3 px-4">
                  <ToggleAdminButton userId={u.id} isAdmin={u.isAdmin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
