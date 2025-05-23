import { ColumnDef } from '@tanstack/react-table'
import { Panel } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'

export const columns: ColumnDef<Panel>[] = [
  {
    accessorKey: "title",
    header: "Titre",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium">{title}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date création",
    cell: ({ row }) => new Date(row.getValue("createdAt") as string).toLocaleDateString(),
  },
  {
    accessorKey: "panelists",
    header: "Panélistes",
    cell: ({ row }) => {
      const panelists = row.getValue("panelists");
      return panelists ? (panelists as any[]).length : 0;
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      // Définir les styles et le texte en fonction du statut
      let badgeClass = "";
      let statusText = "";

      switch (status) {
        case "active":
          badgeClass = "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
          statusText = "Actif";
          break;
        case "draft":
          badgeClass = "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
          statusText = "Brouillon";
          break;
        case "completed":
          badgeClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
          statusText = "Terminé";
          break;
        case "archived":
          badgeClass = "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
          statusText = "Archivé";
          break;
        default:
          badgeClass = "";
          statusText = status;
      }

      return <Badge className={badgeClass}>{statusText}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const panel = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Voir">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Modifier">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
]
