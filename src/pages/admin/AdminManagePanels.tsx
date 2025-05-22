import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '../../components/layout/admin/panels-columns'

export default function AdminManagePanels() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Panels</h1>
      <Card className="p-4">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Rechercher un panel..."
            className="border rounded px-3 py-2 w-full"
            onChange={(e) => console.log('Search:', e.target.value)}
          />
          <DataTable 
            columns={columns} 
            data={[]}
          />
        </div>
      </Card>
    </div>
  )
}
