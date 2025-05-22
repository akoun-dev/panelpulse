import { ColumnDef } from '@tanstack/react-table'
import { Invitation } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function invitationsColumns({
  handleAccept,
  handleReject
}: {
  handleAccept: (id: string) => void
  handleReject: (id: string) => void
}): ColumnDef<Invitation>[] {
  return [
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'panelId',
      header: 'Panel ID'
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge variant={
          row.getValue('status') === 'accepted' ? 'default' :
          row.getValue('status') === 'pending' ? 'secondary' : 'destructive'
        }>
          {row.getValue('status')}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Reçu le',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString()
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.getValue('status') === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleAccept(row.original.id)}
              >
                Accepter
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleReject(row.original.id)}
              >
                Refuser
              </Button>
            </>
          )}
        </div>
      )
    }
  ]
}
