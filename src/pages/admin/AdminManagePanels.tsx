import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '../../components/layout/admin/panels-columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/simple-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  MessageSquare,
  Search,
  Download,
  RefreshCw,
  ListFilter,
  BarChart,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Panel } from '@/types'

// Données fictives pour les panels
const mockPanels: Panel[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `panel-${i + 1}`,
  title: `Panel ${i + 1}`,
  description: `Description du panel ${i + 1}`,
  createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
  ownerId: `user-${i % 5 + 1}`,
  status: i % 4 === 0 ? 'draft' : i % 4 === 1 ? 'active' : i % 4 === 2 ? 'completed' : 'archived',
  panelists: Array.from({ length: Math.floor(Math.random() * 5) + 2 }).map((_, j) => ({
    id: `panelist-${i}-${j}`,
    name: `Panéliste ${j + 1}`,
    email: `panelist${j + 1}@example.com`,
    role: j === 0 ? 'Modérateur' : 'Panéliste',
    company: `Entreprise ${j + 1}`,
    timeAllocated: 600,
    timeUsed: Math.floor(Math.random() * 600)
  }))
}))

export default function AdminManagePanels() {
  const { toast } = useToast()
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isDeletePanelOpen, setIsDeletePanelOpen] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<Panel | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list')

  // Charger les données des panels
  useEffect(() => {
    setLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      setPanels(mockPanels)
      setLoading(false)
    }, 1000)
  }, [])

  // Filtrer les panels
  const filteredPanels = panels.filter(panel => {
    const matchesSearch = panel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         panel.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || panel.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Gérer la suppression d'un panel
  const handleDeletePanel = () => {
    if (!currentPanel) return

    // Simuler un appel API
    setLoading(true)
    setTimeout(() => {
      const updatedPanels = panels.filter(panel => panel.id !== currentPanel.id)
      setPanels(updatedPanels)
      setIsDeletePanelOpen(false)
      setCurrentPanel(null)
      setLoading(false)
      toast({
        title: "Panel supprimé",
        description: `Le panel "${currentPanel.title}" a été supprimé avec succès.`
      })
    }, 500)
  }

  // Obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'draft': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
      case 'completed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'archived': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
      default: return ''
    }
  }

  // Statistiques des panels
  const panelStats = {
    total: panels.length,
    active: panels.filter(p => p.status === 'active').length,
    completed: panels.filter(p => p.status === 'completed').length,
    draft: panels.filter(p => p.status === 'draft').length,
    archived: panels.filter(p => p.status === 'archived').length,
    totalPanelists: panels.reduce((acc, panel) => acc + (panel.panelists?.length || 0), 0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Panels</h1>
          <p className="text-muted-foreground">Gérez les panels de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'list' ? 'stats' : 'list')}>
            {viewMode === 'list' ? (
              <>
                <BarChart className="mr-2 h-4 w-4" />
                Voir les statistiques
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Voir la liste
              </>
            )}
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filtres et recherche */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <ListFilter className="h-5 w-5 mr-2" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un panel..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-40">
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      options={[
                        { value: 'all', label: 'Tous les statuts' },
                        { value: 'draft', label: 'Brouillon' },
                        { value: 'active', label: 'Actif' },
                        { value: 'completed', label: 'Terminé' },
                        { value: 'archived', label: 'Archivé' }
                      ]}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                  }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des panels */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Liste des panels
                <Badge className="ml-2">{filteredPanels.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredPanels}
                loading={loading}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        /* Vue statistiques */
        <div className="space-y-6">
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total des panels</p>
                    <p className="text-3xl font-bold">{panelStats.total}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Panels actifs</p>
                    <p className="text-3xl font-bold">{panelStats.active}</p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Panels terminés</p>
                    <p className="text-3xl font-bold">{panelStats.completed}</p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total panélistes</p>
                    <p className="text-3xl font-bold">{panelStats.totalPanelists}</p>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques et statistiques détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart className="h-16 w-16 text-muted-foreground/50" />
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Graphique de répartition des panels par statut</p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Actifs: {panelStats.active}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Terminés: {panelStats.completed}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span>Brouillons: {panelStats.draft}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span>Archivés: {panelStats.archived}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {panels.slice(0, 5).map((panel) => (
                    <div key={panel.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{panel.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(panel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeVariant(panel.status)}>
                        {panel.status === 'draft' ? 'Brouillon' :
                         panel.status === 'active' ? 'Actif' :
                         panel.status === 'completed' ? 'Terminé' : 'Archivé'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialogue de suppression de panel */}
      <Dialog open={isDeletePanelOpen} onOpenChange={setIsDeletePanelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le panel</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce panel ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 rounded-md bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Attention</p>
                <p className="text-sm">Toutes les données associées à ce panel seront supprimées.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePanelOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePanel}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
