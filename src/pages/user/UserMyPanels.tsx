import { DataTable } from '@/components/ui/data-table'
import { panelsColumns } from '@/components/layout/user/panels-columns'
import { Panel, PreparedQA, Panelist } from '@/types'
import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MessageSquare, Users, Eye, EyeOff, Search, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function UserMyPanels() {
  const navigate = useNavigate()
  const [panels, setPanels] = useState<Panel[]>([])
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null)
  const [activeTab, setActiveTab] = useState('panels')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Simuler les panels où l'utilisateur est modérateur et ceux où il est panéliste
  const fetchPanels = () => {
    setIsLoading(true)
    // Simuler un délai de chargement
    setTimeout(() => {
      // TODO: Remplacer par appel API
      setPanels([
        {
          id: '1',
          title: 'Panel Marketing Digital',
          description: 'Discussion sur les stratégies marketing dans l\'ère numérique',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: 'current-user-id', // L'utilisateur est le modérateur
          userRole: 'moderator',
          panelists: [
            {
              id: '1',
              name: 'Sophie Martin',
              email: 'sophie@example.com',
              role: 'Directrice Innovation',
              company: 'TechCorp',
              timeAllocated: 420
            },
            {
              id: '2',
              name: 'Jean Dupont',
              email: 'jean@example.com',
              role: 'CEO',
              company: 'StartupNext',
              timeAllocated: 420
            }
          ],
          preparedQA: [
            {
              id: '1',
              question: 'Comment voyez-vous l\'évolution du marketing digital dans les 5 prochaines années?',
              answer: 'Nous anticipons une intégration plus profonde de l\'IA dans les stratégies marketing, avec une personnalisation accrue et une analyse prédictive plus précise.',
              panelistId: '1',
              panelistName: 'Sophie Martin',
              isVisible: false
            },
            {
              id: '2',
              question: 'Quels sont les défis éthiques majeurs liés à la collecte de données marketing?',
              answer: 'Les principaux défis concernent la transparence dans la collecte et l\'utilisation des données, le respect du consentement des utilisateurs, et la protection contre les biais algorithmiques.',
              panelistId: '1',
              panelistName: 'Sophie Martin',
              isVisible: true
            },
            {
              id: '3',
              question: 'Comment mesurer efficacement le ROI des campagnes sur les réseaux sociaux?',
              answer: 'Au-delà des métriques traditionnelles comme l\'engagement, il faut établir des KPIs alignés avec les objectifs commerciaux et analyser le parcours client complet.',
              panelistId: '2',
              panelistName: 'Jean Dupont',
              isVisible: false
            }
          ]
        },
        {
          id: '2',
          title: 'Panel Produit Innovation',
          description: 'Feedback sur le nouveau produit et perspectives d\'évolution',
          status: 'completed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours avant
          updatedAt: new Date().toISOString(),
          ownerId: 'current-user-id',
          userRole: 'moderator',
          panelists: [
            {
              id: '3',
              name: 'Marie Leroy',
              email: 'marie@example.com',
              role: 'Product Manager',
              company: 'InnovTech',
              timeAllocated: 300
            }
          ],
          preparedQA: [
            {
              id: '4',
              question: 'Quelles fonctionnalités sont les plus demandées par les utilisateurs?',
              answer: 'D\'après nos études, l\'intégration avec d\'autres outils, la personnalisation de l\'interface et les fonctionnalités collaboratives sont les plus demandées.',
              panelistId: '3',
              panelistName: 'Marie Leroy',
              isVisible: true
            }
          ]
        },
        {
          id: '3',
          title: 'Panel Intelligence Artificielle',
          description: 'Impact de l\'IA sur les métiers du numérique',
          status: 'active',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours avant
          updatedAt: new Date().toISOString(),
          ownerId: 'other-user-id', // Un autre utilisateur est le modérateur
          userRole: 'panelist', // L'utilisateur actuel est panéliste
          panelists: [
            {
              id: 'current-user-id', // L'utilisateur actuel est panéliste
              name: 'Vous',
              email: 'vous@example.com',
              role: 'Expert en IA',
              company: 'VotreEntreprise',
              timeAllocated: 600
            },
            {
              id: '4',
              name: 'Pierre Dubois',
              email: 'pierre@example.com',
              role: 'Chercheur',
              company: 'Institut de Recherche',
              timeAllocated: 600
            }
          ],
          preparedQA: [
            {
              id: '5',
              question: 'Comment l\'IA va-t-elle transformer les métiers du développement?',
              answer: 'L\'IA va automatiser certaines tâches répétitives mais créera de nouvelles opportunités dans l\'analyse de données, l\'optimisation des algorithmes et la conception de systèmes intelligents.',
              panelistId: 'current-user-id',
              panelistName: 'Vous',
              isVisible: true
            },
            {
              id: '6',
              question: 'Quelles compétences seront essentielles pour les développeurs dans un monde dominé par l\'IA?',
              answer: 'La compréhension des principes de l\'IA, la capacité à travailler avec des modèles de machine learning, et les compétences en éthique et gouvernance des données seront cruciales.',
              panelistId: 'current-user-id',
              panelistName: 'Vous',
              isVisible: false
            }
          ]
        }
      ])
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    fetchPanels()
  }, [])

  const handleViewQA = (panel: Panel) => {
    setSelectedPanel(panel)
    setActiveTab('qa')
  }

  const handleRefresh = () => {
    fetchPanels()
  }

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
            </TabsList>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
              data={panels.filter(panel =>
                searchTerm === '' ||
                panel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                panel.description.toLowerCase().includes(searchTerm.toLowerCase())
              )}
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
      </Tabs>
    </div>
  )
}
