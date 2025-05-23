import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Panel, PreparedQA, Panelist } from '@/types'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, MessageSquare, Clock, Calendar, User, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Timer } from '@/components/ui/timer'

export default function UserPanelistView() {
  const { panelId } = useParams<{ panelId: string }>()
  const navigate = useNavigate()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [currentUser, setCurrentUser] = useState<Panelist | null>(null)
  const [myQuestions, setMyQuestions] = useState<PreparedQA[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('questions')
  const [visibleAnswers, setVisibleAnswers] = useState<Record<string, boolean>>({})

  // Simuler le chargement des données
  useEffect(() => {
    setLoading(true)
    
    // Simuler un délai de chargement
    setTimeout(() => {
      // Données fictives pour le panel
      const mockPanel: Panel = {
        id: panelId || '1',
        title: 'Panel Marketing Digital',
        description: 'Discussion sur les stratégies marketing dans l\'ère numérique et les tendances émergentes pour 2025',
        status: 'active',
        createdAt: '2025-05-20T10:00:00Z',
        updatedAt: '2025-05-22T15:30:00Z',
        ownerId: 'moderator-123',
        panelists: [
          {
            id: 'current-user-id', // Simuler l'utilisateur actuel
            name: 'Sophie Martin',
            email: 'sophie@example.com',
            role: 'Directrice Innovation',
            company: 'TechCorp',
            timeAllocated: 420,
            timeUsed: 0,
            status: 'active'
          },
          {
            id: '2',
            name: 'Jean Dupont',
            email: 'jean@example.com',
            role: 'CEO',
            company: 'StartupNext',
            timeAllocated: 420,
            timeUsed: 0,
            status: 'inactive'
          }
        ],
        preparedQA: [
          {
            id: '1',
            question: 'Comment voyez-vous l\'évolution du marketing digital dans les 5 prochaines années?',
            answer: 'Nous anticipons une intégration plus profonde de l\'IA dans les stratégies marketing, avec une personnalisation accrue et une analyse prédictive plus précise. Les marques qui sauront exploiter ces technologies tout en maintenant une approche éthique auront un avantage concurrentiel significatif.',
            panelistId: 'current-user-id',
            panelistName: 'Sophie Martin',
            isVisible: false
          },
          {
            id: '2',
            question: 'Quels sont les défis éthiques majeurs liés à la collecte de données marketing?',
            answer: 'Les principaux défis concernent la transparence dans la collecte et l\'utilisation des données, le respect du consentement des utilisateurs, et la protection contre les biais algorithmiques. Il est essentiel de développer des pratiques qui respectent la vie privée tout en permettant l\'innovation.',
            panelistId: 'current-user-id',
            panelistName: 'Sophie Martin',
            isVisible: true
          },
          {
            id: '3',
            question: 'Comment mesurer efficacement le ROI des campagnes sur les réseaux sociaux?',
            answer: 'Au-delà des métriques traditionnelles comme l\'engagement, il faut établir des KPIs alignés avec les objectifs commerciaux, utiliser des outils d\'attribution multi-touch, et analyser le parcours client complet. L\'important est de relier les actions sur les réseaux sociaux à des résultats commerciaux concrets.',
            panelistId: '2', // Question pour un autre panéliste
            panelistName: 'Jean Dupont',
            isVisible: false
          }
        ]
      }
      
      setPanel(mockPanel)
      
      // Simuler l'utilisateur actuel (panéliste)
      const currentPanelist = mockPanel.panelists?.find(p => p.id === 'current-user-id') || null
      setCurrentUser(currentPanelist)
      
      // Filtrer les questions destinées à l'utilisateur actuel
      const userQuestions = mockPanel.preparedQA?.filter(qa => qa.panelistId === 'current-user-id') || []
      setMyQuestions(userQuestions)
      
      // Initialiser l'état de visibilité des réponses
      const initialVisibility: Record<string, boolean> = {}
      userQuestions.forEach(q => {
        initialVisibility[q.id] = q.isVisible || false
      })
      setVisibleAnswers(initialVisibility)
      
      setLoading(false)
    }, 800)
  }, [panelId])

  const toggleAnswerVisibility = (questionId: string) => {
    setVisibleAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/my-panels')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Vue Panéliste</h1>
        </div>
        
        <div className="py-12 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des informations du panel...</p>
        </div>
      </div>
    )
  }

  if (!panel || !currentUser) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/my-panels')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Panel non trouvé</h1>
        </div>
        
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Le panel demandé n'existe pas ou vous n'y êtes pas invité.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/user/my-panels')}
          >
            Retour à mes panels
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/my-panels')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{panel.title}</h1>
          <p className="text-muted-foreground">{panel.description}</p>
        </div>
      </div>

      {/* Informations du panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Votre rôle en tant que panéliste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Nom</div>
                <div className="font-medium">{currentUser.name}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Rôle</div>
                <div className="font-medium">{currentUser.role}, {currentUser.company}</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Temps de parole alloué</div>
              <div className="font-medium">{Math.floor(currentUser.timeAllocated / 60)} minutes</div>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-md">
              <h3 className="font-medium mb-2">Votre chronomètre</h3>
              <Timer
                speaker={{
                  timeUsed: currentUser.timeUsed || 0,
                  timeAllocated: currentUser.timeAllocated
                }}
                speakerName={currentUser.name}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Informations du panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Statut</div>
              <Badge className={
                panel.status === 'active' ? 'bg-green-100 text-green-800' :
                panel.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }>
                {panel.status === 'active' ? 'Actif' :
                 panel.status === 'completed' ? 'Terminé' :
                 panel.status === 'draft' ? 'Brouillon' :
                 panel.status === 'archived' ? 'Archivé' : panel.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">{formatDate(panel.createdAt)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Nombre de panélistes</div>
              <div className="font-medium">{panel.panelists?.length || 0} participants</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Questions préparées pour vous</div>
              <div className="font-medium">{myQuestions.length} questions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="questions">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mes questions ({myQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            Déroulement du panel
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Questions préparées pour vous</h2>
              <Badge variant="outline">
                {myQuestions.length} questions
              </Badge>
            </div>
            
            {myQuestions.length > 0 ? (
              <div className="space-y-4">
                {myQuestions.map(question => (
                  <Card key={question.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-muted/20">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{question.question}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnswerVisibility(question.id)}
                          className="h-8 w-8 p-0"
                        >
                          {visibleAnswers[question.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {visibleAnswers[question.id] ? 'Masquer la réponse' : 'Afficher la réponse'}
                          </span>
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {visibleAnswers[question.id] && (
                      <CardContent className="pt-4">
                        <div className="bg-muted/10 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-primary/10">Réponse suggérée</Badge>
                          </div>
                          <p className="text-sm">{question.answer}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune question préparée</h3>
                <p className="text-muted-foreground">
                  Aucune question n'a été préparée pour vous dans ce panel.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Déroulement du panel</h2>
              <Badge variant="outline">
                Durée totale: {panel.panelists?.reduce((total, p) => total + (p.timeAllocated || 0), 0) / 60} minutes
              </Badge>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="relative border-l-2 border-gray-200 pl-6 ml-2 space-y-6">
                  {[
                    { name: 'Introduction', duration: 5, completed: true },
                    { name: 'Présentations', duration: 10, completed: true },
                    { name: 'Discussion principale', duration: 20, completed: false, current: true },
                    { name: 'Questions du public', duration: 10, completed: false },
                    { name: 'Conclusion', duration: 5, completed: false }
                  ].map((segment, index) => {
                    // Calculer le temps cumulé jusqu'à ce segment
                    const startTime = [
                      { name: 'Introduction', duration: 5 },
                      { name: 'Présentations', duration: 10 },
                      { name: 'Discussion principale', duration: 20 },
                      { name: 'Questions du public', duration: 10 },
                      { name: 'Conclusion', duration: 5 }
                    ].slice(0, index).reduce((acc, seg) => acc + seg.duration, 0);

                    // Calculer le temps de fin
                    const endTime = startTime + segment.duration;

                    return (
                      <div key={index} className="relative">
                        {/* Indicateur de temps */}
                        <div className="absolute -left-8 top-0">
                          <div className={`w-4 h-4 rounded-full ${
                            segment.completed ? 'bg-green-500' : 
                            segment.current ? 'bg-primary' : 'bg-gray-300'
                          } flex items-center justify-center`}>
                            {segment.completed && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>

                        <div className={`p-3 rounded-md border ${
                          segment.current ? 'border-primary bg-primary/5' : 'bg-white'
                        }`}>
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{segment.name}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              segment.completed ? 'bg-green-100 text-green-800' : 
                              segment.current ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {segment.completed ? 'Terminé' : 
                               segment.current ? 'En cours' : 'À venir'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>{segment.duration} minutes</span>
                            <span>
                              {startTime} - {endTime} min
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
