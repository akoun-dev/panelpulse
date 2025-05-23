import { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { PanelSession, Panelist, PublicQuestion, SharedResource, ModeratorNote } from '@/types/panel'

// Interface pour les questions et réponses préparées
interface PreparedQA {
  id: string
  question: string
  answer: string
  isVisible: boolean
  panelistId: string // ID du panéliste à qui la question est destinée
  panelistName: string // Nom du panéliste pour l'affichage
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Timer } from '@/components/ui/timer'
import { QRCodeGenerator } from '@/components/ui/qrcode'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock, Users, MessageSquare, FileText, Play, Pause, Mic, MicOff, HelpCircle, Eye, EyeOff } from 'lucide-react'

export default function UserPanelDetails() {
  const { panelId } = useLoaderData() as { panelId: string }
  const navigate = useNavigate()
  const [panel, setPanel] = useState<PanelSession | null>(null)
  const [panelists, setPanelists] = useState<Panelist[]>([])
  const [questions, setQuestions] = useState<PublicQuestion[]>([])
  const [resources, setResources] = useState<SharedResource[]>([])
  const [notes, setNotes] = useState<ModeratorNote[]>([])
  const [preparedQA, setPreparedQA] = useState<PreparedQA[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load mock data
  useEffect(() => {
    setLoading(true)
    // Simuler un délai de chargement
    setTimeout(() => {
      // TODO: Replace with API calls
      setPanel({
        id: panelId,
        title: 'Panel Marketing Digital',
        description: 'Discussion sur les stratégies marketing dans l\'ère numérique et les tendances émergentes pour 2025',
        status: 'active',
        duration: 45,
        segments: [
          { name: 'Introduction', duration: 5, completed: true },
          { name: 'Présentations', duration: 15, completed: true },
          { name: 'Discussion', duration: 15, completed: false },
          { name: 'Q&A', duration: 7, completed: false },
          { name: 'Conclusion', duration: 3, completed: false }
        ],
        createdAt: '2025-05-20T10:00:00Z',
        updatedAt: '2025-05-22T15:30:00Z'
      })

      setPanelists([
        {
          id: '1',
          name: 'Sophie Martin',
          role: 'Directrice Innovation',
          company: 'TechCorp',
          timeAllocated: 420,
          timeUsed: 263,
          status: 'active'
        },
        {
          id: '2',
          name: 'Jean Dupont',
          role: 'CEO',
          company: 'StartupNext',
          timeAllocated: 420,
          timeUsed: 0,
          status: 'inactive'
        }
      ])

      setQuestions([
        {
          id: '1',
          text: 'Comment voyez-vous l\'évolution du secteur marketing digital dans les 5 prochaines années?',
          author: 'Marie D.',
          score: 24,
          status: 'approved',
          createdAt: '2025-05-22T14:20:00Z'
        },
        {
          id: '2',
          text: 'Quels sont les outils d\'IA que vous recommandez pour optimiser les campagnes marketing?',
          author: 'Thomas L.',
          score: 18,
          status: 'pending',
          createdAt: '2025-05-22T14:25:00Z'
        }
      ])

      setResources([
        {
          id: '1',
          name: 'Présentation Marketing 2025.pdf',
          type: 'pdf',
          description: '12 slides - Tendances marketing',
          url: '#'
        },
        {
          id: '2',
          name: 'Statistiques sectorielles.xlsx',
          type: 'document',
          description: 'Données de marché Q1-Q2 2025',
          url: '#'
        }
      ])

      setNotes([
        {
          id: '1',
          timestamp: '15:30',
          content: 'Sophie évoque les nouveaux modèles d\'innovation basés sur l\'IA générative'
        },
        {
          id: '2',
          timestamp: '15:45',
          content: 'Discussion sur l\'éthique des données marketing - point important à développer'
        }
      ])

      // Questions et réponses préparées
      setPreparedQA([
        {
          id: '1',
          question: 'Comment voyez-vous l\'évolution du marketing digital dans les 5 prochaines années?',
          answer: 'Nous anticipons une intégration plus profonde de l\'IA dans les stratégies marketing, avec une personnalisation accrue et une analyse prédictive plus précise. Les marques qui sauront exploiter ces technologies tout en maintenant une approche éthique auront un avantage concurrentiel significatif.',
          isVisible: false,
          panelistId: '1',
          panelistName: 'Sophie Martin'
        },
        {
          id: '2',
          question: 'Quels sont les défis éthiques majeurs liés à la collecte de données marketing?',
          answer: 'Les principaux défis concernent la transparence dans la collecte et l\'utilisation des données, le respect du consentement des utilisateurs, et la protection contre les biais algorithmiques. Il est essentiel de développer des pratiques qui respectent la vie privée tout en permettant l\'innovation.',
          isVisible: true,
          panelistId: '1',
          panelistName: 'Sophie Martin'
        },
        {
          id: '3',
          question: 'Comment mesurer efficacement le ROI des campagnes sur les réseaux sociaux?',
          answer: 'Au-delà des métriques traditionnelles comme l\'engagement, il faut établir des KPIs alignés avec les objectifs commerciaux, utiliser des outils d\'attribution multi-touch, et analyser le parcours client complet. L\'important est de relier les actions sur les réseaux sociaux à des résultats commerciaux concrets.',
          isVisible: false,
          panelistId: '2',
          panelistName: 'Jean Dupont'
        }
      ])

      setLoading(false)
    }, 800)
  }, [panelId])

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, {
        id: Date.now().toString(),
        text: newQuestion,
        author: 'Vous',
        score: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      }])
      setNewQuestion('')
    }
  }

  const handleApproveQuestion = (id: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === id ? {...q, status: 'approved'} : q
      )
    )
  }

  const toggleRecording = () => setIsRecording(!isRecording)
  const toggleTranscription = () => setIsTranscribing(!isTranscribing)

  const toggleQAVisibility = (id: string) => {
    setPreparedQA(prev =>
      prev.map(qa =>
        qa.id === id ? {...qa, isVisible: !qa.isVisible} : qa
      )
    )
  }

  const handleSavePanel = async () => {
    try {
      // TODO: Implémenter l'appel API pour sauvegarder
      console.log('Sauvegarde du panel:', {
        panel,
        panelists,
        questions,
        resources,
        notes,
        preparedQA
      })
      alert('Panel sauvegardé avec succès!')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/my-panels')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Détails du panel</h1>
        </div>

        <div className="py-12 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des détails du panel...</p>
        </div>
      </div>
    )
  }

  if (!panel) {
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
          <p className="text-muted-foreground">Le panel demandé n'existe pas ou a été supprimé.</p>
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
      {/* Header */}
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

      {/* Statut et actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Badge className={
            panel.status === 'active'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
            panel.status === 'completed'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
            panel.status === 'draft'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }>
            {panel.status === 'active' ? 'Actif' :
             panel.status === 'completed' ? 'Terminé' :
             panel.status === 'draft' ? 'Brouillon' :
             panel.status === 'archived' ? 'Archivé' : panel.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Créé le {new Date(panel.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSavePanel}>
            Sauvegarder
          </Button>
          <QRCodeGenerator panelId={panel.id} size={100} />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chronomètre principal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Chronomètre principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timer
                speaker={{
                  timeUsed: 0,
                  timeAllocated: panel.duration * 60 // Convertir minutes en secondes
                }}
                isMainTimer={true}
              />
              <div className="flex justify-center gap-3 mt-4">
                <Button variant={isRecording ? "destructive" : "outline"} onClick={toggleRecording}>
                  {isRecording ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isRecording ? 'Arrêter' : 'Démarrer'}
                </Button>
                <Button variant={isTranscribing ? "default" : "outline"} onClick={toggleTranscription}>
                  {isTranscribing ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  Transcription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Panélistes et leurs chronomètres */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Chronomètres des panélistes
              </CardTitle>
              <CardDescription>
                Suivez le temps de parole de chaque intervenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {panelists.map(panelist => (
                  <div key={panelist.id} className={`border dark:border-gray-700 rounded-md p-4 ${
                    panelist.status === 'active' ? 'border-primary dark:border-primary/70' : ''
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">{panelist.name}</p>
                        <p className="text-sm text-muted-foreground">{panelist.role}, {panelist.company}</p>
                      </div>
                      <Badge variant={panelist.status === 'active' ? 'default' : 'outline'}>
                        {panelist.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <Timer
                      speaker={{
                        timeUsed: panelist.timeUsed,
                        timeAllocated: panelist.timeAllocated
                      }}
                      speakerName={panelist.name}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Questions du public */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Questions du public
              </CardTitle>
              <CardDescription>
                Gérez les questions soumises par l'audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ajouter une question..."
                />
                <Button onClick={handleAddQuestion}>Ajouter</Button>
              </div>

              <div className="space-y-3">
                {questions.length > 0 ? (
                  questions.map(question => (
                    <div key={question.id} className="border-l-4 border-primary dark:border-primary/70 pl-4 py-2">
                      <p>{question.text}</p>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {question.author} • 🌤 {question.score}
                          </span>
                          <Badge variant={question.status === 'approved' ? 'default' : 'outline'}>
                            {question.status === 'approved' ? 'Approuvée' : 'En attente'}
                          </Badge>
                        </div>
                        {question.status !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveQuestion(question.id)}
                          >
                            Approuver
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Aucune question n'a encore été soumise
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Structure du panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Structure du panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/20 dark:bg-muted/10 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Durée totale</p>
                  <p className="font-medium text-xl">{panel.duration} minutes</p>
                </div>
                <div className="space-y-1 bg-muted/20 dark:bg-muted/10 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Panélistes</p>
                  <p className="font-medium text-xl">{panelists.length} participants</p>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Timeline des segments</h3>
                  <span className="text-sm text-muted-foreground">
                    Progression: {panel.segments.filter(s => s.completed).length}/{panel.segments.length}
                  </span>
                </div>

                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-6 ml-2 space-y-6">
                  {panel.segments.map((segment, index) => {
                    // Calculer le temps cumulé jusqu'à ce segment
                    const startTime = panel.segments
                      .slice(0, index)
                      .reduce((acc, seg) => acc + seg.duration, 0);

                    // Calculer le temps de fin
                    const endTime = startTime + segment.duration;

                    return (
                      <div key={index} className="relative">
                        {/* Indicateur de temps */}
                        <div className="absolute -left-8 top-0">
                          <div className={`w-4 h-4 rounded-full ${
                            segment.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          } flex items-center justify-center`}>
                            {segment.completed && (
                              <div className="w-2 h-2 bg-white dark:bg-gray-200 rounded-full" />
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md border dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{segment.name}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              segment.completed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {segment.completed ? 'Terminé' : 'À venir'}
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
              </div>
            </CardContent>
          </Card>

          {/* Questions et réponses préparées */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Questions et réponses préparées
              </CardTitle>
              <CardDescription>
                Questions préparées à l'avance pour faciliter la discussion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preparedQA.length > 0 ? (
                <div className="space-y-4">
                  {preparedQA.map(qa => (
                    <div key={qa.id} className="border rounded-md overflow-hidden">
                      <div className="p-3 bg-muted/20">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{qa.question}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleQAVisibility(qa.id)}
                            className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                          >
                            {qa.isVisible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {qa.isVisible ? 'Masquer la réponse' : 'Afficher la réponse'}
                            </span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10">
                            Pour {qa.panelistName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {panelists.find(p => p.id === qa.panelistId)?.role || ''}
                          </span>
                        </div>
                      </div>

                      {qa.isVisible && (
                        <div className="p-3 border-t">
                          <p className="text-sm">{qa.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucune question/réponse préparée pour ce panel
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ressources partagées */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Ressources partagées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resources.length > 0 ? (
                <div className="space-y-3">
                  {resources.map(resource => {
                    // Déterminer l'icône en fonction du type de fichier
                    let icon = '📄';
                    let bgColor = 'bg-blue-50';
                    let textColor = 'text-blue-500';

                    if (resource.type === 'pdf') {
                      icon = '📄';
                      bgColor = 'bg-red-50';
                      textColor = 'text-red-500';
                    } else if (resource.type === 'image') {
                      icon = '🖼️';
                      bgColor = 'bg-green-50';
                      textColor = 'text-green-500';
                    } else if (resource.type === 'document') {
                      icon = '📝';
                      bgColor = 'bg-blue-50';
                      textColor = 'text-blue-500';
                    } else if (resource.type === 'link') {
                      icon = '🔗';
                      bgColor = 'bg-purple-50';
                      textColor = 'text-purple-500';
                    }

                    return (
                      <div key={resource.id} className="flex items-center p-3 border rounded-md hover:bg-muted/10 transition-colors">
                        <div className={`mr-3 text-xl w-10 h-10 flex items-center justify-center rounded-md ${bgColor} ${textColor}`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-muted-foreground">{resource.description}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Télécharger</span>
                            ⬇️
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Supprimer</span>
                            🗑️
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucune ressource partagée pour ce panel
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes du modérateur */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Notes du modérateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-muted/20">
                          {note.timestamp}
                        </Badge>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucune note n'a été ajoutée
                </div>
              )}

              <div className="pt-3 border-t mt-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Ajouter une note</h3>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Nouvelle note..." />
                  <Button>Ajouter</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
