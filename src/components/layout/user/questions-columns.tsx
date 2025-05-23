import { ColumnDef } from '@tanstack/react-table'
import { Question } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const question = row.original
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log('Approve', question.id)}
            disabled={question.status === 'approved'}
          >
            ✓
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log('Reject', question.id)}
            disabled={question.status === 'rejected'}
          >
            ✗
          </Button>
        </div>
      )
    }
  }
]
