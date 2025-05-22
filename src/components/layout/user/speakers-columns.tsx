import { ColumnDef } from '@tanstack/react-table'
import { Speaker } from '@/types'
import { Progress } from '@/components/ui/progress'

export const speakersColumns: ColumnDef<Speaker>[] = [
  {
    accessorKey: 'name',
    header: 'Nom'
  },
  {
    accessorKey: 'role',
    header: 'Rôle'
  },
  {
    accessorKey: 'timeUsed',
    header: 'Temps utilisé',
    cell: ({ row }) => {
      const timeUsed = row.getValue('timeUsed') as number
      const maxTime = 300 // 5 minutes en secondes
      return (
        <div className="flex items-center gap-2">
          <Progress value={(timeUsed / maxTime) * 100} className="w-full" />
          <span className="text-sm text-gray-500">
            {Math.floor(timeUsed / 60)}m {timeUsed % 60}s
          </span>
        </div>
      )
    }
  }
]
