import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Users,
  Send,
  ChevronUp,
  Video,
  Download
} from 'lucide-react'

// Types pour les données du panel (définition des structures de données)
interface Panelist {
  id: string
  name: string
  role: string
  company: string
  status?: 'active' | 'inactive'
}

interface PublicQuestion {
  id: string
  text: string
  author: string
  score: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  voted?: boolean
  timeAgo?: string
}

interface KeyPoint {
  title: string
  description: string
}

interface Panel {
  id: string
  title: string
  description: string
  moderator: {
    name: string
    role: string
    initials?: string
  }
  startTime: string
  endTime: string
  currentSpeaker?: Panelist
  panelists: Panelist[]
  questions: PublicQuestion[]
  keyPoints: KeyPoint[]
  viewerCount: number
}

/**
 * Vue audience pour les utilisateurs anonymes accédant via QR code
 * Permet de voir les informations du panel, soumettre des questions et voter
 *
 * Cette interface est conçue pour être simple et intuitive, avec une mise en page
 * claire qui met en évidence les informations importantes du panel et facilite
 * l'interaction des spectateurs.
 */
export default function AudienceView() {
  const { panelId } = useParams<{ panelId: string }>()
  const { toast } = useToast()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Charger les données du panel depuis l'API (simulation avec des données fictives pour le moment)
  useEffect(() => {
    const fetchPanelData = async () => {
      setLoading(true)
      try {
        // TODO: Remplacer par un appel API réel
        // Simuler un délai de chargement
        setTimeout(() => {
          // Données fictives pour le panel
          const mockPanel: Panel = {
            id: panelId || '1',
            title: 'Innovations et Défis Technologiques 2023',
            description: 'Discussion sur les avancées technologiques récentes et les défis à venir',
            moderator: {
              name: 'Philippe Laurent',
              role: 'Journaliste Tech',
              initials: 'PL'
            },
            startTime: '15:30',
            endTime: '16:15',
            currentSpeaker: {
              id: '1',
              name: 'Sophie Martin',
              role: 'Directrice Innovation',
              company: 'TechCorp',
              status: 'active'
            },
            panelists: [
              {
                id: '1',
                name: 'Sophie Martin',
                role: 'Directrice Innovation',
                company: 'TechCorp',
                status: 'active'
              },
              {
                id: '2',
                name: 'Jean Dupont',
                role: 'CEO',
                company: 'StartupNext',
                status: 'inactive'
              },
              {
                id: '3',
                name: 'Marie Leclerc',
                role: 'Directrice R&D',
                company: 'InnoLab',
                status: 'inactive'
              },
              {
                id: '4',
                name: 'Pierre Moreau',
                role: 'CTO',
                company: 'TechFuture',
                status: 'inactive'
              }
            ],
            questions: [
              {
                id: '1',
                text: 'Comment les modèles d\'innovation ouverte peuvent-ils être adaptés pour les PME avec des ressources limitées?',
                author: 'Marie D.',
                score: 38,
                status: 'approved',
                createdAt: new Date(Date.now() - 120000).toISOString(),
                voted: false,
                timeAgo: 'il y a 2 min'
              },
              {
                id: '2',
                text: 'Quels sont les défis réglementaires les plus importants pour l\'innovation dans votre secteur?',
                author: 'Thomas L.',
                score: 29,
                status: 'approved',
                createdAt: new Date(Date.now() - 300000).toISOString(),
                voted: false,
                timeAgo: 'il y a 5 min'
              },
              {
                id: '3',
                text: 'Comment l\'IA transforme-t-elle concrètement les processus d\'innovation dans vos entreprises?',
                author: 'Pierre F.',
                score: 21,
                status: 'approved',
                createdAt: new Date(Date.now() - 480000).toISOString(),
                voted: false,
                timeAgo: 'il y a 8 min'
              }
            ],
            keyPoints: [
              {
                title: 'Innovation ouverte et collaboration',
                description: 'Modèles d\'accélération et programmes partenaires'
              },
              {
                title: 'Intelligence artificielle',
                description: 'Applications dans la médecine personnalisée'
              },
              {
                title: 'Blockchain',
                description: 'Traçabilité dans l\'industrie pharmaceutique'
              },
              {
                title: 'Défis réglementaires',
                description: 'RGPD et normes sectorielles'
              }
            ],
            viewerCount: 125
          }
          setPanel(mockPanel)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Erreur lors du chargement des données du panel:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du panel'
        })
        setLoading(false)
      }
    }

    fetchPanelData()
  }, [panelId, toast])

  // Soumettre une nouvelle question (envoi à l'API et mise à jour de l'interface)
  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir une question'
      })
      return
    }

    setSubmitting(true)

    // TODO: Remplacer par un appel API réel
    setTimeout(() => {
      if (panel) {
        const newQuestionObj: PublicQuestion = {
          id: `new-${Date.now()}`,
          text: newQuestion,
          author: 'Anonyme',
          score: 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
          voted: false
        }

        setPanel({
          ...panel,
          questions: [newQuestionObj, ...panel.questions]
        })

        setNewQuestion('')
        setSubmitting(false)

        toast({
          title: 'Question soumise',
          description: 'Votre question a été soumise avec succès et sera examinée par le modérateur',
        })
      }
    }, 1000)
  }

  // Voter pour une question (système de vote avec possibilité d'annuler son vote)
  const handleVote = (questionId: string) => {
    if (panel) {
      const updatedQuestions = panel.questions.map(q => {
        if (q.id === questionId) {
          // Si déjà voté, annuler le vote
          if (q.voted) {
            return { ...q, score: q.score - 1, voted: false }
          }
          // Sinon, ajouter un vote
          return { ...q, score: q.score + 1, voted: true }
        }
        return q
      })

      setPanel({
        ...panel,
        questions: updatedQuestions
      })
    }
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du panel...</p>
        </div>
      </div>
    )
  }

  if (!panel) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg w-full">
          <h2 className="text-xl font-bold mb-2">Panel non trouvé</h2>
          <p className="text-gray-500">
            Le panel que vous recherchez n'existe pas ou n'est pas accessible.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full max-w-full">
      {/* Contenu principal pleine page sans en-tête supplémentaire */}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Colonne gauche et centrale (sur mobile, tout est empilé) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vidéo en direct - Affichage du flux vidéo du panel */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-300">
                  Diffusion vidéo en direct
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {panel.title}
                </div>
              </div>
            </div>
            <div className="p-3 text-sm text-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>Diffusion vidéo en direct</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{panel.viewerCount}</span>
              </div>
            </div>
          </div>

          {/* Intervenant actuel - Affiche le panéliste qui parle actuellement avec son temps de parole */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium mb-3">Intervenant actuel</h3>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 text-indigo-700 rounded-full h-10 w-10 flex items-center justify-center font-medium">
                {panel.currentSpeaker?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium">{panel.currentSpeaker?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {panel.currentSpeaker?.role}, {panel.currentSpeaker?.company}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="text-xs text-gray-500">4:33 / 7:00</div>
                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>



          {/* Questions du public - Système de questions/réponses interactif avec votes */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Questions du public</h3>
                <div className="text-sm text-gray-500">{panel.questions.length} questions</div>
              </div>
            </div>

            {/* Formulaire de soumission de question - Interface simple pour poser des questions */}
            <div className="p-4 border-b">
              <div className="relative">
                <Input
                  placeholder="Posez votre question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="pr-12"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={handleSubmitQuestion}
                  disabled={!newQuestion.trim() || submitting}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Les questions les plus votées seront posées aux intervenants
              </p>
            </div>

            {/* Liste des questions - Affichage des questions posées avec système de vote */}
            <div className="divide-y">
              {panel.questions.map((question) => (
                <div key={question.id} className="p-4 hover:bg-gray-50">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 h-6"
                        onClick={() => handleVote(question.id)}
                        disabled={question.voted}
                      >
                        <ChevronUp className={`h-5 w-5 ${question.voted ? 'text-indigo-600' : ''}`} />
                      </Button>
                      <span className="text-sm font-medium">{question.score}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-1">{question.text}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {question.author} • {question.timeAgo}
                        </span>
                        {question.id === '1' && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                            Sélectionnée
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite (informations du panel) - Affiche les détails et ressources du panel */}
        <div className="space-y-6">
          {/* Informations du panel */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-4">Informations du panel</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-1">TITRE</h4>
                <p className="font-medium">{panel.title}</p>
              </div>

              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-1">HORAIRE</h4>
                <p className="font-medium">{panel.startTime} - {panel.endTime}</p>
              </div>

              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-1">MODÉRATEUR</h4>
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 text-indigo-700 rounded-full h-8 w-8 flex items-center justify-center font-medium">
                    {panel.moderator.initials || panel.moderator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{panel.moderator.name}</div>
                    <div className="text-xs text-muted-foreground">{panel.moderator.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panélistes */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-4">Panélistes</h3>
            <div className="space-y-4">
              {panel.panelists.map((panelist) => (
                <div key={panelist.id} className="flex items-center gap-3">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center font-medium ${
                    panelist.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {panelist.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{panelist.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {panelist.role}, {panelist.company}
                    </div>
                  </div>
                  {panelist.status === 'active' && (
                    <Badge className="ml-auto bg-green-100 text-green-800 hover:bg-green-200 border-0">
                      Actif
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Points clés abordés */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-4">Points clés abordés</h3>
            <div className="space-y-3">
              {panel.keyPoints.map((point, index) => (
                <div key={index} className="bg-indigo-50 rounded-md p-3">
                  <h4 className="font-medium text-sm text-indigo-800 mb-1">{point.title}</h4>
                  <p className="text-xs text-indigo-700">{point.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Télécharger les ressources */}
          <Button className="w-full gap-2" variant="default">
            <Download className="h-4 w-4" />
            Télécharger les ressources
          </Button>
        </div>
      </div>
    </div>
  )
}
