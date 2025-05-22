import { ColumnDef } from '@tanstack/react-table'
import { Panel } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export const panelsColumns: ColumnDef<Panel>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <Link to={`/panel/${row.original.id}`} className="font-medium text-primary">
        {row.getValue('title')}
      </Link>
    )
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="max-w-xs truncate">
        {row.getValue('description')}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={
        row.getValue('status') === 'active' ? 'default' :
        row.getValue('status') === 'completed' ? 'secondary' : 'outline'
      }>
        {row.getValue('status')}
      </Badge>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Créé le',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString()
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/panel/${row.original.id}`}>
          Voir
        </Link>
      </Button>
    )
  }
]
