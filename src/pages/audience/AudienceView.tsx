import { useState, useEffect } from 'react'
import { useParams, useLoaderData } from 'react-router-dom'
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
import { getPublicPanelDetails, addPublicQuestion, voteForQuestion } from '@/services/panelService'

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
    company?: string
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
  const loaderData = useLoaderData() as { panelData?: any, panelId?: string }
  const { toast } = useToast()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Charger les données du panel depuis le loader ou l'API si nécessaire
  useEffect(() => {
    const initializePanel = async () => {
      setLoading(true);

      try {
        // Vérifier si les données sont déjà disponibles via le loader
        if (loaderData?.panelData?.panel) {
          const { panel: panelData, panelists, questions, keyPoints } = loaderData.panelData;

          // Formater les questions avec le statut de vote
          const formattedQuestions = questions.map((q: any) => ({
            ...q,
            voted: false // Par défaut, l'utilisateur n'a pas encore voté
          }));

          // Construire l'objet panel complet
          const completePanel: Panel = {
            ...panelData,
            panelists: panelists || [],
            questions: formattedQuestions,
            keyPoints: keyPoints || []
          };

          setPanel(completePanel);
          setLoading(false);
          return;
        }

        // Si les données ne sont pas disponibles via le loader, les récupérer via l'API
        if (!panelId) {
          setLoading(false);
          return;
        }

        const { panel: panelData, panelists, questions, keyPoints } = await getPublicPanelDetails(panelId);

        if (!panelData) {
          toast({
            title: 'Panel non trouvé',
            description: 'Le panel demandé n\'existe pas ou a été supprimé.'
          });
          setLoading(false);
          return;
        }

        // Formater les questions avec le statut de vote
        const formattedQuestions = questions.map((q: any) => ({
          ...q,
          voted: false // Par défaut, l'utilisateur n'a pas encore voté
        }));

        // Construire l'objet panel complet
        const completePanel: Panel = {
          ...panelData,
          panelists: panelists || [],
          questions: formattedQuestions,
          keyPoints: keyPoints || []
        };

        setPanel(completePanel);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données du panel:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du panel'
        });
        setLoading(false);
      }
    };

    initializePanel();
  }, [panelId, loaderData, toast]);

  // Soumettre une nouvelle question (envoi à l'API et mise à jour de l'interface)
  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir une question'
      })
      return
    }

    if (!panelId || !panel) {
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre la question, panel non trouvé'
      })
      return
    }

    setSubmitting(true)

    try {
      // Envoyer la question à l'API
      const success = await addPublicQuestion(panelId, newQuestion, 'Anonyme')

      if (success) {
        // Créer un objet question temporaire pour l'affichage immédiat
        const newQuestionObj: PublicQuestion = {
          id: `new-${Date.now()}`,
          text: newQuestion,
          author: 'Anonyme',
          score: 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
          voted: false,
          timeAgo: 'à l\'instant'
        }

        // Mettre à jour l'interface
        setPanel({
          ...panel,
          questions: [newQuestionObj, ...panel.questions]
        })

        setNewQuestion('')

        toast({
          title: 'Question soumise',
          description: 'Votre question a été soumise avec succès et sera examinée par le modérateur',
        })
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de soumettre la question, veuillez réessayer'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la question:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission de la question'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Voter pour une question (système de vote avec possibilité d'annuler son vote)
  const handleVote = async (questionId: string) => {
    if (!panel) return;

    // Trouver la question dans le panel
    const question = panel.questions.find((q: any) => q.id === questionId);
    if (!question) return;

    // Si l'ID commence par "new-", c'est une question temporaire qui n'est pas encore en base de données
    if (questionId.startsWith('new-')) {
      toast({
        title: 'Information',
        description: 'Vous ne pouvez pas encore voter pour cette question'
      });
      return;
    }

    try {
      // Déterminer si on ajoute ou retire un vote
      const isAddingVote = !question.voted;

      // Mettre à jour l'interface immédiatement pour une meilleure expérience utilisateur
      const updatedQuestions = panel.questions.map((q: any) => {
        if (q.id === questionId) {
          return {
            ...q,
            score: isAddingVote ? q.score + 1 : q.score - 1,
            voted: isAddingVote
          };
        }
        return q;
      });

      setPanel({
        ...panel,
        questions: updatedQuestions
      });

      // Envoyer le vote à l'API
      const success = await voteForQuestion(questionId, isAddingVote);

      if (!success) {
        // En cas d'échec, revenir à l'état précédent
        const revertedQuestions = panel.questions.map((q: any) => {
          if (q.id === questionId) {
            return question;
          }
          return q;
        });

        setPanel({
          ...panel,
          questions: revertedQuestions
        });

        toast({
          title: 'Erreur',
          description: 'Impossible d\'enregistrer votre vote, veuillez réessayer'
        });
      }
    } catch (error) {
      console.error('Erreur lors du vote pour la question:', error);

      // Revenir à l'état précédent en cas d'erreur
      const revertedQuestions = panel.questions.map((q: any) => {
        if (q.id === questionId) {
          return question;
        }
        return q;
      });

      setPanel({
        ...panel,
        questions: revertedQuestions
      });

      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement de votre vote'
      });
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
                    {panel.moderator ? (panel.moderator.initials || (panel.moderator.name ? panel.moderator.name.split(' ').map(n => n[0]).join('') : 'M')) : 'M'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{panel.moderator?.name || 'Modérateur'}</div>
                    <div className="text-xs text-muted-foreground">
                      {panel.moderator?.role || 'Organisateur'}
                      {panel.moderator?.company && `, ${panel.moderator.company}`}
                    </div>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-0">
                    Créateur
                  </Badge>
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
