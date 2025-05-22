import { ColumnDef } from '@tanstack/react-table'
import { Question } from '@/types'
import { Badge } from '@/components/ui/badge'

export const questionsColumns: ColumnDef<Question>[] = [
  {
    accessorKey: 'text',
    header: 'Question',
    cell: ({ row }) => (
      <div className="max-w-xs truncate">
        {row.getValue('text')}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={
        row.getValue('status') === 'approved' ? 'default' :
        row.getValue('status') === 'pending' ? 'secondary' : 'destructive'
      }>
        {row.getValue('status')}
      </Badge>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => row.getValue('createdAt') || '-'
  }
]
