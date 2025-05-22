import { ColumnDef } from '@tanstack/react-table'
import { Panel } from '@/types'

export const columns: ColumnDef<Panel>[] = [
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorKey: "createdAt",
    header: "Date création",
    cell: ({ row }) => new Date(row.getValue("createdAt") as string).toLocaleDateString(),
  },
  {
    accessorKey: "members",
    header: "Membres",
    cell: ({ row }) => (row.getValue("members") as any[]).length,
  },
  {
    accessorKey: "status",
    header: "Statut",
  },
]
