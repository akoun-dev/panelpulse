import { ColumnDef } from '@tanstack/react-table'
import { Panel } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { User, Users } from 'lucide-react'

export const panelsColumns: ColumnDef<Panel>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('title')}
      </div>
    )
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-muted-foreground">
        {row.getValue('description')}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={
          status === 'active' ? 'default' :
          status === 'completed' ? 'secondary' : 'outline'
        } className="capitalize">
          {status === 'active' ? 'actif' :
           status === 'completed' ? 'complété' :
           status === 'draft' ? 'brouillon' :
           status === 'archived' ? 'archivé' : status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'userRole',
    header: 'Votre rôle',
    cell: ({ row }) => {
      const userRole = row.getValue('userRole') as string
      return (
        <div className="flex items-center gap-1">
          {userRole === 'moderator' ? (
            <>
              <Users className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Modérateur</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4 text-indigo-500" />
              <span className="text-indigo-500 font-medium">Panéliste</span>
            </>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Créé le',
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
    cell: ({ row }) => (
      <Button variant="outline" size="sm" className="px-3 py-1 h-8">
        Voir
      </Button>
    )
  }
]
