import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '../../components/layout/admin/activity-columns'
import { DateRangePicker } from '../../components/ui/date-range-picker'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { Activity } from '@/types'
import { DateRange } from 'react-day-picker'

export default function AdminActivityLog() {
  const activities: Activity[] = [] // À remplacer par les données de l'API

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Journal d'Activité</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <DateRangePicker 
            className="w-full md:w-auto"
            onChange={(range: DateRange | undefined) => console.log('Date range selected:', range)}
          />
          <input
            placeholder="Rechercher par utilisateur..."
            className="border rounded px-3 py-2 flex-1"
          />
          <select className="border rounded px-3 py-2">
            <option value="">Tous les types</option>
            <option value="create">Création</option>
            <option value="update">Modification</option>
            <option value="delete">Suppression</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={activities}
        />
      </Card>
    </div>
  )
}
