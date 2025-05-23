import { ColumnDef } from '@tanstack/react-table'
import { Invitation } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Calendar, User, MessageSquare } from 'lucide-react'

export function invitationsColumns({
  handleAccept,
  handleReject,
  navigate
}: {
  handleAccept: (id: string) => void
  handleReject: (id: string) => void
  navigate: (path: string) => void
}): ColumnDef<Invitation>[] {
  return [
    {
      accessorKey: 'panelTitle',
      header: 'Panel',
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            {row.original.panelTitle || `Panel ${row.original.panelId}`}
          </div>
          {row.original.moderatorName && (
            <div className="text-xs text-muted-foreground mt-1">
              Organisé par {row.original.moderatorName}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Votre rôle',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-500" />
          <span>{row.original.role || 'Panéliste'}</span>
        </div>
      )
    },
    {
      accessorKey: 'panelDate',
      header: 'Date du panel',
      cell: ({ row }) => {
        if (!row.original.panelDate) return <div>-</div>;

        const date = new Date(row.original.panelDate);
        const now = new Date();
        const isPast = date < now;

        return (
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isPast ? 'text-red-500' : 'text-green-500'}`} />
            <div>
              <div className={isPast ? 'text-muted-foreground line-through' : ''}>
                {date.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {date.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={
            status === 'accepted' ? 'default' :
            status === 'pending' ? 'secondary' : 'destructive'
          } className="capitalize">
            {status === 'accepted' ? 'acceptée' :
             status === 'pending' ? 'en attente' :
             status === 'rejected' ? 'refusée' : status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Reçu le',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt') as string)
        return (
          <div className="text-muted-foreground">
            {date.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 py-1"
              onClick={() => navigate(`/user/invitations/${row.original.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Détails
            </Button>

            {status === 'accepted' && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 py-1 bg-primary/10 hover:bg-primary hover:text-white"
                onClick={() => navigate(`/user/panelist/${row.original.panelId}`)}
              >
                Vue panéliste
              </Button>
            )}

            {status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 py-1"
                  onClick={() => handleAccept(row.original.id)}
                >
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 px-3 py-1"
                  onClick={() => handleReject(row.original.id)}
                >
                  Refuser
                </Button>
              </>
            )}
          </div>
        )
      }
    }
  ]
}
