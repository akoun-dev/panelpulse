import { DataTable } from '@/components/ui/data-table'
import { panelsColumns } from '@/components/layout/user/panels-columns'
import { invitationsColumns } from '@/components/layout/user/invitations-columns'
import { Panel, PreparedQA, Panelist, Invitation } from '@/types'
import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MessageSquare, Users, Eye, EyeOff, Search, RefreshCw, Mail } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserPanels } from '@/services/panelService'
import { getAllInvitations, acceptInvitation, rejectInvitation } from '@/services/invitationService'
import { useToast } from '@/components/ui/use-toast'

export default function UserMyPanels() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [panels, setPanels] = useState<Panel[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null)
  const [activeTab, setActiveTab] = useState('panels')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false)

  // Récupérer les panels de l'utilisateur depuis Supabase
  const fetchPanels = async () => {
    setIsLoading(true)
    try {
      const userPanels = await getUserPanels()
      setPanels(userPanels)
    } catch (error) {
      console.error('Erreur lors de la récupération des panels:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos panels. Veuillez réessayer.",
        variant: "destructive" as any
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Récupérer les invitations de l'utilisateur
  const fetchInvitations = async () => {
    setIsLoadingInvitations(true)
    try {
      const userInvitations = await getAllInvitations()
      setInvitations(userInvitations)
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos invitations. Veuillez réessayer.",
        variant: "destructive" as any
      })
    } finally {
      setIsLoadingInvitations(false)
    }
  }

  // Accepter une invitation
  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const success = await acceptInvitation(invitationId)
      if (success) {
        // Mettre à jour l'état local
        setInvitations(invitations.map(inv =>
          inv.id === invitationId ? {...inv, status: 'accepted'} : inv
        ))

        toast({
          title: "Invitation acceptée",
          description: "Vous avez accepté l'invitation avec succès.",
        })

        // Rafraîchir les panels pour inclure le nouveau panel
        fetchPanels()
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'accepter l'invitation. Veuillez réessayer.",
          variant: "destructive" as any
        })
      }
    } catch (error) {
      console.error(`Erreur lors de l'acceptation de l'invitation ${invitationId}:`, error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'acceptation de l'invitation.",
        variant: "destructive" as any
      })
    }
  }

  // Rejeter une invitation
  const handleRejectInvitation = async (invitationId: string) => {
    try {
      const success = await rejectInvitation(invitationId)
      if (success) {
        // Mettre à jour l'état local
        setInvitations(invitations.map(inv =>
          inv.id === invitationId ? {...inv, status: 'rejected'} : inv
        ))

        toast({
          title: "Invitation rejetée",
          description: "Vous avez rejeté l'invitation.",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de rejeter l'invitation. Veuillez réessayer.",
          variant: "destructive" as any
        })
      }
    } catch (error) {
      console.error(`Erreur lors du rejet de l'invitation ${invitationId}:`, error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet de l'invitation.",
        variant: "destructive" as any
      })
    }
  }

  useEffect(() => {
    fetchPanels()
    fetchInvitations()
  }, [])

  const handleViewQA = (panel: Panel) => {
    setSelectedPanel(panel)
    setActiveTab('qa')
  }

  const handleRefresh = () => {
    fetchPanels()
    fetchInvitations()
  }

  // Utiliser les colonnes d'invitation existantes
  const invitationsColumnsConfig = invitationsColumns({
    handleAccept: handleAcceptInvitation,
    handleReject: handleRejectInvitation,
    navigate
  })

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Mes Panels</h1>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="panels" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                Tous les panels
              </TabsTrigger>
              <TabsTrigger value="qa" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                Questions/Réponses
              </TabsTrigger>
              <TabsTrigger value="invitations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                Invitations
                {invitations.filter(inv => inv.status === 'pending').length > 0 && (
                  <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
                    {invitations.filter(inv => inv.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading || isLoadingInvitations}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading || isLoadingInvitations ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => navigate('/user/create-panel')} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span>Créer un panel</span>
            </Button>
          </div>
        </div>

        <TabsContent value="panels" className="mt-0">
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un panel..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-md">
            <DataTable
              columns={panelsColumns.map(col => {
                if (col.id === 'actions') {
                  return {
                    ...col,
                    cell: ({ row }: { row: { original: Panel } }) => {
                      const panel = row.original
                      return (
                        <div className="flex gap-2 justify-end">
                          {panel.preparedQA && panel.preparedQA.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewQA(panel)}
                              className="h-8 px-3 py-1"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Q/R ({panel.preparedQA.length})
                            </Button>
                          )}

                          {panel.userRole === 'panelist' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/user/panelist/${panel.id}`)}
                              className="h-8 px-3 py-1 bg-primary/10 hover:bg-primary hover:text-white"
                            >
                              Vue panéliste
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/user/panels/${panel.id}`)}
                            className="h-8 px-3 py-1 hover:bg-primary hover:text-primary-foreground"
                          >
                            {panel.userRole === 'moderator' ? 'Gérer' : 'Voir'}
                          </Button>
                        </div>
                      )
                    }
                  } as ColumnDef<Panel>
                }
                return col
              })}
              data={panels.filter(panel => {
                if (!searchTerm) return true;

                const searchLower = searchTerm.toLowerCase();
                return (
                  (panel.title?.toLowerCase().includes(searchLower) || false) ||
                  (panel.description?.toLowerCase().includes(searchLower) || false) ||
                  (panel.panelists?.some(p =>
                    (p.name?.toLowerCase().includes(searchLower) || false) ||
                    (p.role?.toLowerCase().includes(searchLower) || false) ||
                    (p.company?.toLowerCase().includes(searchLower) || false)
                  ) || false)
                );
              })}
            />
          </div>
        </TabsContent>

        <TabsContent value="qa" className="mt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {selectedPanel ? `Questions pour "${selectedPanel.title}"` : 'Toutes les questions préparées'}
              </h2>
              {selectedPanel && (
                <Badge variant="outline" className="ml-2">
                  {selectedPanel.preparedQA?.length || 0} questions
                </Badge>
              )}
            </div>
            {selectedPanel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPanel(null)}
              >
                Voir tous les panels
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(selectedPanel ? [selectedPanel] : panels).map(panel => (
              panel.preparedQA && panel.preparedQA.length > 0 ? (
                <div key={panel.id}>
                  {!selectedPanel && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">{panel.title}</h3>
                      <p className="text-sm text-muted-foreground">{panel.description}</p>
                    </div>
                  )}

                  {panel.preparedQA.map(qa => (
                    <Card key={qa.id} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{qa.question}</CardTitle>
                          <Badge className="ml-2 bg-primary/10 text-primary">
                            Pour {qa.panelistName}
                          </Badge>
                        </div>
                        <CardDescription>
                          {panel.panelists?.find(p => p.id === qa.panelistId)?.role || ''},
                          {panel.panelists?.find(p => p.id === qa.panelistId)?.company || ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{qa.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null
            ))}

            {(selectedPanel ? selectedPanel.preparedQA?.length === 0 : panels.every(p => !p.preparedQA || p.preparedQA.length === 0)) && (
              <div className="col-span-2 text-center py-12 bg-muted/10 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune question préparée</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore préparé de questions pour vos panels.
                </p>
                <Button onClick={() => navigate('/user/create-panel')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Créer un panel avec des questions
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Mes Invitations
              {invitations.filter(inv => inv.status === 'pending').length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {invitations.filter(inv => inv.status === 'pending').length} en attente
                </Badge>
              )}
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-md">
            <DataTable
              columns={invitationsColumnsConfig}
              data={invitations}
            />

            {invitations.length === 0 && (
              <div className="text-center py-12 bg-muted/10 rounded-lg">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune invitation</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore reçu d'invitations à des panels.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
