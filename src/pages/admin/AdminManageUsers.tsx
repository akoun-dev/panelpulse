import { DataTable } from '../../components/ui/data-table'
import { columns, User } from '@/components/layout/admin/users-columns'

export default function AdminManageUsers() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>
      <DataTable columns={columns} data={[]} />
    </div>
  )
}
