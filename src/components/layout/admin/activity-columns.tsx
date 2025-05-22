import { ColumnDef } from '@tanstack/react-table'
import { Activity } from '@/types'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "timestamp",
    header: "Date/Heure",
    cell: ({ row }) => format(new Date(row.getValue("timestamp")), 'PPpp', { locale: fr })
  },
  {
    accessorKey: "user",
    header: "Utilisateur",
    cell: ({ row }) => (row.getValue("user") as {name: string})?.name || 'Système'
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className={
        row.getValue("type") === 'create' ? 'bg-green-100 text-green-800' :
        row.getValue("type") === 'update' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-red-100 text-red-800'
      }>
        {row.getValue("type")}
      </Badge>
    )
  },
  {
    accessorKey: "action",
    header: "Action"
  },
  {
    accessorKey: "target",
    header: "Cible"
  }
]
