import { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { PanelSession, Panelist as UIPanelist, PublicQuestion, SharedResource } from '@/types/panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Timer } from '@/components/ui/timer'
import { QRCodeGenerator } from '@/components/ui/qrcode'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select } from '@/components/ui/simple-select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Clock, Users, MessageSquare, FileText, Play, Pause, Mic, MicOff, HelpCircle, Eye, EyeOff, Save, Edit, Trash2, AlertTriangle, Plus, X, Mail, UserPlus, Bell } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  getPanelDetails,
  updatePanel,
  getPanelQuestions,
  addPanelQuestion,
  updateQuestionStatus,
  getModeratorNotes,
  addModeratorNote,
  deletePanel,
  ModeratorNote
} from '@/services/panelService'

// Interface pour les questions et réponses préparées avec visibilité
interface PreparedQA {
  id: string
  question: string
  answer: string
  isVisible: boolean
  panelistId: string // ID du panéliste à qui la question est destinée
  panelistName: string // Nom du panéliste pour l'affichage
}

export default function UserPanelDetails() {
  const { panelId } = useLoaderData() as { panelId: string }
  const navigate = useNavigate()
  const { toast } = useToast()

  // Fonction utilitaire pour afficher les toasts d'erreur
  const showErrorToast = (title: string, description: string) => {
    toast({
      title,
      description
    })
  }

  // États pour les données du panel
  const [panel, setPanel] = useState<PanelSession | null>(null)
  const [panelists, setPanelists] = useState<UIPanelist[]>([])
  const [questions, setQuestions] = useState<PublicQuestion[]>([])
  const [resources, setResources] = useState<SharedResource[]>([])
  const [notes, setNotes] = useState<ModeratorNote[]>([])
  const [preparedQA, setPreparedQA] = useState<PreparedQA[]>([])
  const [segments, setSegments] = useState<{name: string, duration: number, completed: boolean}[]>([])

  // États pour l'interface utilisateur
  const [newQuestion, setNewQuestion] = useState('')
  const [newNote, setNewNote] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // États pour la gestion des invitations
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('panelist')
  const [inviteSending, setInviteSending] = useState(false)

  // Charger les données du panel depuis Supabase
  useEffect(() => {
    const fetchPanelData = async () => {
      setLoading(true);
      try {
        // Récupérer les détails du panel
        const {
          panel: panelData,
          panelists: panelistsData,
          preparedQuestions: preparedQuestionsData,
          resources: resourcesData,
          segments: segmentsData
        } = await getPanelDetails(panelId);

        if (!panelData) {
          toast({
            title: "Panel non trouvé",
            description: "Le panel demandé n'existe pas ou a été supprimé."
          });
          setLoading(false);
          return;
        }

        // Récupérer les questions du public
        const questionsData = await getPanelQuestions(panelId);

        // Récupérer les notes du modérateur
        const notesData = await getModeratorNotes(panelId);

        // Convertir les données au format attendu par l'UI
        const uiPanel: PanelSession = {
          id: panelData.id || '',
          title: panelData.title || '',
          description: panelData.description || '',
          status: panelData.status || 'draft',
          duration: panelData.duration || 0,
          segments: segmentsData.map(segment => ({
            name: segment.name,
            duration: segment.duration,
            completed: false // Par défaut, aucun segment n'est complété
          })),
          createdAt: panelData.created_at || '',
          updatedAt: panelData.updated_at || ''
        };

        const uiPanelists: UIPanelist[] = panelistsData.map(panelist => ({
          id: panelist.id || '',
          name: panelist.name || '',
          role: panelist.role || '',
          company: panelist.company || '',
          timeAllocated: panelist.time_allocated || 0,
          timeUsed: 0, // Par défaut, aucun temps n'a été utilisé
          status: panelist.invitation_accepted ? 'active' : 'inactive'
        }));

        console.log("Questions préparées chargées depuis la base de données:", preparedQuestionsData);

        // Vérifier s'il y a des IDs en double dans les questions préparées
        const idCounts: Record<string, number> = {};
        preparedQuestionsData.forEach(question => {
          if (question.id) {
            idCounts[question.id] = (idCounts[question.id] || 0) + 1;
          }
        });

        const duplicateIds = Object.entries(idCounts)
          .filter(([_, count]) => count > 1)
          .map(([id, count]) => ({ id, count }));

        if (duplicateIds.length > 0) {
          console.error("ATTENTION: Des IDs en double ont été détectés dans les questions préparées chargées:", duplicateIds);
        }

        const uiPreparedQA: PreparedQA[] = preparedQuestionsData.map((question, index) => {
          // Trouver le panéliste correspondant
          const panelist = panelistsData.find(p => p.id === question.panelist_id);

          // S'assurer que l'ID est défini
          if (!question.id) {
            console.error("Question préparée sans ID:", question);
          }

          // Générer un ID temporaire unique si nécessaire
          let questionId = question.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`;

          // Si cet ID est en double et ce n'est pas la première occurrence, générer un nouvel ID temporaire
          if (duplicateIds.some(dup => dup.id === questionId)) {
            // On ne modifie que les occurrences suivantes pour préserver l'ID original pour la première occurrence
            const occurrenceCount = preparedQuestionsData
              .slice(0, index)
              .filter(q => q.id === questionId)
              .length;

            if (occurrenceCount > 0) {
              const newId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`;
              console.log(`Correction d'un ID en double lors du chargement: ${questionId} -> ${newId}`);
              questionId = newId;
            }
          }

          const preparedQA = {
            id: questionId, // ID unique
            question: question.question || '',
            answer: question.answer || '',
            isVisible: false, // Par défaut, les réponses ne sont pas visibles
            panelistId: question.panelist_id || '',
            panelistName: panelist?.name || 'Panéliste inconnu'
          };

          console.log("Question préparée transformée pour l'UI:", preparedQA);
          return preparedQA;
        });

        const uiResources: SharedResource[] = resourcesData.map(resource => ({
          id: resource.id || '',
          name: resource.name || '',
          type: (resource.type || 'document') as 'pdf' | 'image' | 'document' | 'link',
          description: '',
          url: resource.url || ''
        }));

        const uiQuestions: PublicQuestion[] = questionsData.map(question => ({
          id: question.id || '',
          text: question.question || '',
          author: question.asked_by || '',
          score: question.votes || 0,
          status: question.status || 'pending',
          createdAt: question.created_at || ''
        }));

        // Mettre à jour les états
        setPanel(uiPanel);
        setPanelists(uiPanelists);
        setPreparedQA(uiPreparedQA);
        setResources(uiResources);
        setQuestions(uiQuestions);
        setNotes(notesData);
        setSegments(uiPanel.segments || []);

      } catch (error) {
        console.error('Erreur lors du chargement des données du panel:', error);
        showErrorToast(
          "Erreur",
          "Une erreur est survenue lors du chargement des données du panel."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPanelData();
  }, [panelId, toast]);

  // Effet pour vérifier l'unicité des IDs après le chargement des données
  useEffect(() => {
    // Ne pas vérifier pendant le chargement initial
    if (!loading && preparedQA.length > 0) {
      console.log("Vérification de l'unicité des IDs après chargement des données");
      checkQAIdsUniqueness();
    }
  }, [loading, preparedQA.length]);

  // Ajouter une question
  const handleAddQuestion = async () => {
    if (newQuestion.trim()) {
      try {
        const result = await addPanelQuestion({
          panel_id: panelId,
          question: newQuestion,
          asked_by: 'Vous',
          status: 'pending',
          is_anonymous: false,
          votes: 0
        });

        if (result.success) {
          // Ajouter la question à l'état local
          setQuestions([...questions, {
            id: result.question_id || Date.now().toString(),
            text: newQuestion,
            author: 'Vous',
            score: 0,
            status: 'pending',
            createdAt: new Date().toISOString()
          }]);

          toast({
            title: "Question ajoutée",
            description: "Votre question a été ajoutée avec succès."
          });
        } else {
          showErrorToast("Erreur", result.message);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la question:', error);
        showErrorToast(
          "Erreur",
          "Une erreur est survenue lors de l'ajout de la question."
        );
      } finally {
        setNewQuestion('');
      }
    }
  };

  // Approuver une question
  const handleApproveQuestion = async (id: string) => {
    try {
      const result = await updateQuestionStatus(id, 'approved');

      if (result.success) {
        // Mettre à jour l'état local
        setQuestions(prev =>
          prev.map(q =>
            q.id === id ? {...q, status: 'approved'} : q
          )
        );

        toast({
          title: "Question approuvée",
          description: "La question a été approuvée avec succès."
        });
      } else {
        showErrorToast("Erreur", result.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la question:', error);
      showErrorToast("Erreur", "Une erreur est survenue lors de l'approbation de la question.");
    }
  };

  // Ajouter une note
  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const result = await addModeratorNote({
          panel_id: panelId,
          timestamp: currentTime,
          content: newNote
        });

        if (result.success) {
          // Ajouter la note à l'état local
          setNotes([...notes, {
            id: result.note_id || Date.now().toString(),
            timestamp: currentTime,
            content: newNote,
            panel_id: panelId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

          toast({
            title: "Note ajoutée",
            description: "Votre note a été ajoutée avec succès."
          });
        } else {
          showErrorToast("Erreur", result.message);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la note:', error);
        showErrorToast("Erreur", "Une erreur est survenue lors de l'ajout de la note.");
      } finally {
        setNewNote('');
      }
    }
  };

  // Contrôles du chronomètre
  const toggleRecording = () => setIsRecording(!isRecording);
  const toggleTranscription = () => setIsTranscribing(!isTranscribing);

  // Contrôles des questions préparées
  const toggleQAVisibility = (id: string) => {
    console.log(`Basculement de la visibilité pour la question avec ID: ${id}`);

    setPreparedQA(prev => {
      // Créer une nouvelle liste avec la visibilité mise à jour
      const updated = prev.map(qa => {
        if (qa.id === id) {
          console.log(`Question trouvée, basculement de la visibilité pour: "${qa.question}"`);
          return {...qa, isVisible: !qa.isVisible};
        }
        return qa;
      });

      // Vérifier que la mise à jour a bien été effectuée
      const updatedQuestion = updated.find(qa => qa.id === id);
      console.log(`Visibilité après mise à jour: ${updatedQuestion?.isVisible ? 'visible' : 'cachée'}`);

      return updated;
    });
  };

  // Fonction pour vérifier l'unicité des IDs des questions préparées
  const checkQAIdsUniqueness = () => {
    // Créer un objet pour compter les occurrences de chaque ID
    const idCounts: Record<string, number> = {};

    // Compter les occurrences de chaque ID
    preparedQA.forEach(qa => {
      if (qa.id) {
        idCounts[qa.id] = (idCounts[qa.id] || 0) + 1;
      }
    });

    // Vérifier s'il y a des IDs en double
    const duplicateIds = Object.entries(idCounts)
      .filter(([_, count]) => count > 1)
      .map(([id, count]) => ({ id, count }));

    if (duplicateIds.length > 0) {
      console.error("ATTENTION: Des IDs en double ont été détectés dans les questions préparées:", duplicateIds);

      // Corriger les IDs en double en générant de nouveaux IDs temporaires
      const updatedQA = [...preparedQA];
      const seenIds = new Set<string>();

      for (let i = 0; i < updatedQA.length; i++) {
        const qa = updatedQA[i];

        if (qa.id && seenIds.has(qa.id)) {
          // Cet ID a déjà été vu, générer un nouvel ID temporaire
          const newTempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`;
          console.log(`Correction d'un ID en double: ${qa.id} -> ${newTempId} pour la question: "${qa.question}"`);
          updatedQA[i] = { ...qa, id: newTempId };
        } else if (qa.id) {
          // Ajouter cet ID à l'ensemble des IDs vus
          seenIds.add(qa.id);
        }
      }

      // Mettre à jour l'état avec les IDs corrigés
      setPreparedQA(updatedQA);
      return false;
    }

    return true;
  };

  // Ajouter une nouvelle question préparée
  const handleAddPreparedQuestion = () => {
    // Vérifier l'unicité des IDs avant d'ajouter une nouvelle question
    checkQAIdsUniqueness();

    // Créer un ID temporaire unique pour identifier cette question dans l'interface
    // Cet ID sera remplacé par l'ID généré par la base de données lors de la sauvegarde
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    console.log("Ajout d'une nouvelle question avec ID temporaire:", tempId);

    // Ajouter la nouvelle question à l'état local
    setPreparedQA(prev => [
      ...prev,
      {
        id: tempId, // ID temporaire unique
        question: "Nouvelle question",
        answer: "Réponse à préparer",
        isVisible: false,
        panelistId: panelists.length > 0 ? panelists[0].id : '',
        panelistName: panelists.length > 0 ? panelists[0].name : 'Panéliste inconnu'
      }
    ]);

    // Activer le mode édition si ce n'est pas déjà le cas
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  // Supprimer une question préparée
  const handleDeletePreparedQuestion = (id: string) => {
    // Supprimer la question de l'état local
    setPreparedQA(prev => prev.filter(qa => qa.id !== id));
  };

  // Sauvegarder les modifications du panel
  const handleSavePanel = async () => {
    if (!panel) return;

    // Vérifier l'unicité des IDs avant de sauvegarder
    const idsAreUnique = checkQAIdsUniqueness();
    if (!idsAreUnique) {
      console.log("Correction des IDs en double effectuée, poursuite de la sauvegarde...");
    }

    setSaving(true);

    try {
      // Convertir les données de l'UI au format attendu par l'API
      // Extraire uniquement les propriétés qui existent dans la table panels
      const panelData = {
        title: panel.title,
        description: panel.description,
        status: panel.status,
        duration: panel.duration
        // Ne pas inclure updated_at, il sera ajouté par la fonction updatePanel
      };

      // Préparer les données des segments
      const segmentsData = segments.map(segment => ({
        name: segment.name,
        duration: segment.duration
      }));

      // Préparer les données des panélistes
      const panelistsData = panelists.map(panelist => ({
        id: panelist.id,
        name: panelist.name,
        role: panelist.role,
        company: panelist.company,
        time_allocated: panelist.timeAllocated
      }));

      // Préparer les données des questions préparées
      console.log("DÉBOGAGE - Questions préparées avant transformation:", preparedQA);

      // Vérifier si nous avons des questions préparées
      if (preparedQA.length === 0) {
        console.warn("DÉBOGAGE - Aucune question préparée à enregistrer");
      }

      const preparedQuestionsData = preparedQA.map(qa => {
        // Vérifier si l'ID est un ID temporaire ou un ID valide de la base de données
        const isTempId = qa.id && qa.id.startsWith('temp-');
        const hasValidId = qa.id && qa.id.trim() !== '' && !isTempId;

        // Vérifier si le panelist_id est valide
        const hasPanelistId = qa.panelistId && qa.panelistId.trim() !== '';

        if (!hasPanelistId) {
          console.warn(`DÉBOGAGE - Question sans panelist_id valide: ${qa.question}`);
        }

        // Pour le débogage
        if (isTempId) {
          console.log(`DÉBOGAGE - Question avec ID temporaire: ${qa.id}, question: ${qa.question}`);
        } else if (hasValidId) {
          console.log(`DÉBOGAGE - Question avec ID valide: ${qa.id}, question: ${qa.question}`);
        } else {
          console.log(`DÉBOGAGE - Question sans ID: question: ${qa.question}`);
        }

        const result = {
          // Ne pas inclure l'ID pour les nouvelles questions ou les questions avec ID temporaire
          ...(hasValidId ? { id: qa.id } : {}),
          question: qa.question || "Question sans titre",
          answer: qa.answer || "",
          // Inclure le panelist_id seulement s'il est valide
          ...(hasPanelistId ? { panelist_id: qa.panelistId } : {})
        };

        console.log("DÉBOGAGE - Question transformée:", result);
        return result;
      });

      console.log("DÉBOGAGE - Questions préparées après transformation:", preparedQuestionsData);

      // Mettre à jour le panel avec toutes les données associées
      console.log("DÉBOGAGE - Appel de updatePanel avec les données suivantes:");
      console.log("DÉBOGAGE - panelId:", panelId);
      console.log("DÉBOGAGE - panelData:", panelData);
      console.log("DÉBOGAGE - panelistsData:", panelistsData);
      console.log("DÉBOGAGE - preparedQuestionsData:", preparedQuestionsData);
      console.log("DÉBOGAGE - segmentsData:", segmentsData);

      const result = await updatePanel(
        panelId,
        panelData,
        panelistsData,
        preparedQuestionsData,
        [], // Pas de ressources à mettre à jour pour l'instant
        segmentsData
      );

      if (result.success) {
        toast({
          title: "Panel sauvegardé",
          description: "Le panel a été sauvegardé avec succès."
        });
      } else {
        showErrorToast("Erreur", result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panel:', error);
      showErrorToast("Erreur", "Une erreur est survenue lors de la sauvegarde du panel.");
    } finally {
      setSaving(false);
    }
  };

  // Gérer l'invitation des participants
  const handleInviteParticipant = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide."
      });
      return;
    }

    setInviteSending(true);

    try {
      // Vérifier si l'utilisateur est déjà inscrit
      const isRegistered = true; // Simuler une vérification - à remplacer par un appel API réel

      if (isRegistered) {
        // Envoyer une notification à l'utilisateur inscrit
        toast({
          title: "Notification envoyée",
          description: `Une notification a été envoyée à ${inviteEmail} pour participer au panel.`
        });
      } else {
        // Envoyer une invitation à s'inscrire
        toast({
          title: "Invitation envoyée",
          description: `Une invitation a été envoyée à ${inviteEmail} pour s'inscrire et participer au panel.`
        });
      }

      // Réinitialiser le formulaire
      setInviteEmail('');
      setInviteName('');
      setShowInviteDialog(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'invitation."
      });
    } finally {
      setInviteSending(false);
    }
  };

  // Gérer la notification des participants
  const handleNotifyParticipants = () => {
    toast({
      title: "Notifications envoyées",
      description: "Tous les participants ont été notifiés du panel."
    });
  };

  // Supprimer le panel
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeletePanel = async () => {
    if (!panel || !panelId) return;

    setIsDeleting(true);

    try {
      // Appeler le service pour supprimer le panel
      const result = await deletePanel(panelId);

      if (result.success) {
        toast({
          title: "Panel supprimé",
          description: "Le panel a été supprimé avec succès."
        });
        // Rediriger vers la liste des panels
        navigate('/user/my-panels');
      } else {
        showErrorToast("Erreur", result.message);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du panel:', error);
      showErrorToast("Erreur", "Une erreur est survenue lors de la suppression du panel.");
    } finally {
      setIsDeleting(false);
    }
  };

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
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={panel.title}
                onChange={(e) => setPanel({...panel, title: e.target.value})}
                className="text-xl font-bold"
                placeholder="Titre du panel"
              />
              <Input
                value={panel.description}
                onChange={(e) => setPanel({...panel, description: e.target.value})}
                className="text-muted-foreground"
                placeholder="Description du panel"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={panel.duration}
                  onChange={(e) => setPanel({...panel, duration: parseInt(e.target.value) || 0})}
                  className="w-24"
                  min={1}
                  max={240}
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{panel.title}</h1>
              <p className="text-muted-foreground">{panel.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statut et actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <select
              value={panel.status}
              onChange={(e) => setPanel({...panel, status: e.target.value as any})}
              className="border rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800"
            >
              <option value="draft">Brouillon</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="archived">Archivé</option>
              <option value="published">Publié</option>
            </select>
          ) : (
            <Badge className={
              panel.status === 'active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              panel.status === 'completed'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
              panel.status === 'draft'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
              panel.status === 'published'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }>
              {panel.status === 'active' ? 'Actif' :
               panel.status === 'completed' ? 'Terminé' :
               panel.status === 'draft' ? 'Brouillon' :
               panel.status === 'published' ? 'Publié' :
               panel.status === 'archived' ? 'Archivé' : panel.status}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Créé le {new Date(panel.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <Button
              variant="outline"
              onClick={() => {
                handleSavePanel();
                setIsEditing(false);
              }}
              disabled={saving}
              className="gap-2"
            >
              {saving && (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              )}
              <Save className="h-4 w-4 mr-1" />
              Sauvegarder
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/user/panels/${panel.id}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
              <QRCodeGenerator
                panelId={panel.id}
                size={100}
                urlPrefix="panel/"
              />
            </>
          )}
        </div>

        {/* Boîte de dialogue de confirmation de suppression */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce panel ? Cette action est irréversible et supprimera toutes les données associées.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePanel}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting && (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                )}
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Boîte de dialogue d'invitation */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Inviter un participant
              </DialogTitle>
              <DialogDescription>
                Invitez un participant à rejoindre ce panel. S'il est déjà inscrit, il recevra une notification, sinon il recevra une invitation à s'inscrire.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom (optionnel)</Label>
                <Input
                  id="name"
                  placeholder="Nom du participant"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={inviteRole}
                  onValueChange={setInviteRole}
                  options={[
                    { value: 'panelist', label: 'Panéliste' },
                    { value: 'moderator', label: 'Modérateur' },
                    { value: 'observer', label: 'Observateur' }
                  ]}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleInviteParticipant}
                disabled={inviteSending || !inviteEmail.trim()}
                className="gap-2"
              >
                {inviteSending && (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                )}
                Inviter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Chronomètres des panélistes
                  </CardTitle>
                  <CardDescription>
                    Suivez le temps de parole de chaque intervenant
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInviteDialog(true)}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Inviter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNotifyParticipants}
                    className="gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Notifier
                  </Button>
                </div>
              </div>
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
            <CardFooter className="border-t pt-4">
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {panelists.length} panélistes au total
                </p>
                <p className="text-sm text-muted-foreground">
                  {panelists.filter(p => p.status === 'active').length} actifs
                </p>
              </div>
            </CardFooter>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                />
                <Button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Questions et réponses préparées
                  </CardTitle>
                  <CardDescription>
                    Questions préparées à l'avance pour faciliter la discussion
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddPreparedQuestion}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          handleSavePanel();
                          // Ne pas désactiver le mode édition ici pour permettre de continuer à éditer
                        }}
                        disabled={saving}
                        className="gap-2"
                      >
                        {saving ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Sauvegarder
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Recharger les données du panel pour annuler les modifications
                          setIsEditing(false);
                          window.location.reload(); // Méthode simple pour recharger les données
                        }}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Annuler
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {preparedQA.length > 0 ? (
                <div className="space-y-4">
                  {preparedQA.map(qa => (
                    <div key={qa.id} className="border rounded-md overflow-hidden">
                      <div className="p-3 bg-muted/20">
                        <div className="flex justify-between items-center mb-2">
                          {isEditing ? (
                            <div className="flex-1 mr-2">
                              <Input
                                value={qa.question}
                                onChange={(e) => {
                                  // Utiliser l'ID pour identifier la question à mettre à jour
                                  console.log(`Mise à jour de la question avec ID: ${qa.id}`);
                                  setPreparedQA(prev => {
                                    // Créer une nouvelle liste avec la question mise à jour
                                    const updated = prev.map(q => {
                                      if (q.id === qa.id) {
                                        console.log(`Question trouvée, mise à jour de: "${q.question}" à "${e.target.value}"`);
                                        return {...q, question: e.target.value};
                                      }
                                      return q;
                                    });

                                    // Vérifier que la mise à jour a bien été effectuée
                                    const updatedQuestion = updated.find(q => q.id === qa.id);
                                    console.log(`Question après mise à jour: ${updatedQuestion?.question}`);

                                    return updated;
                                  });
                                }}
                                className="font-medium"
                                placeholder="Question"
                              />
                            </div>
                          ) : (
                            <h4 className="font-medium">{qa.question}</h4>
                          )}
                          <div className="flex items-center gap-1">
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePreparedQuestion(qa.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Supprimer la question</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQAVisibility(qa.id)}
                              className="h-8 w-8 p-0"
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
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="w-full">
                              <Label htmlFor={`panelist-${qa.id}`} className="text-xs mb-1 block">
                                Destinée à:
                              </Label>
                              <Select
                                value={qa.panelistId}
                                onValueChange={(value: string) => {
                                  // Trouver le panéliste sélectionné
                                  const selectedPanelist = panelists.find(p => p.id === value);
                                  console.log(`Changement de panéliste pour la question avec ID: ${qa.id}`);
                                  console.log(`Nouveau panéliste sélectionné: ${selectedPanelist?.name || 'Inconnu'} (ID: ${value})`);

                                  setPreparedQA(prev => {
                                    // Créer une nouvelle liste avec le panéliste mis à jour
                                    const updated = prev.map(q => {
                                      if (q.id === qa.id) {
                                        console.log(`Question trouvée, mise à jour du panéliste pour: "${q.question}"`);
                                        return {
                                          ...q,
                                          panelistId: value,
                                          panelistName: selectedPanelist?.name || 'Panéliste inconnu'
                                        };
                                      }
                                      return q;
                                    });

                                    // Vérifier que la mise à jour a bien été effectuée
                                    const updatedQuestion = updated.find(q => q.id === qa.id);
                                    console.log(`Panéliste après mise à jour: ${updatedQuestion?.panelistName}`);

                                    return updated;
                                  });
                                }}
                                placeholder="Sélectionnez un panéliste"
                                options={panelists.map(panelist => ({
                                  value: panelist.id,
                                  label: panelist.name,
                                  disabled: false
                                }))}
                              />
                            </div>
                          ) : (
                            <>
                              <Badge variant="outline" className="bg-primary/10">
                                Pour {qa.panelistName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {panelists.find(p => p.id === qa.panelistId)?.role || ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {qa.isVisible && (
                        <div className="p-3 border-t">
                          {isEditing ? (
                            <Textarea
                              value={qa.answer}
                              onChange={(e) => {
                                // Utiliser l'ID pour identifier la question à mettre à jour
                                console.log(`Mise à jour de la réponse pour la question avec ID: ${qa.id}`);
                                setPreparedQA(prev => {
                                  // Créer une nouvelle liste avec la réponse mise à jour
                                  const updated = prev.map(q => {
                                    if (q.id === qa.id) {
                                      console.log(`Réponse trouvée, mise à jour pour la question: "${q.question}"`);
                                      return {...q, answer: e.target.value};
                                    }
                                    return q;
                                  });

                                  // Vérifier que la mise à jour a bien été effectuée
                                  const updatedQuestion = updated.find(q => q.id === qa.id);
                                  console.log(`Réponse après mise à jour pour la question: ${updatedQuestion?.question}`);

                                  return updated;
                                });
                              }}
                              className="text-sm min-h-[100px]"
                              placeholder="Réponse préparée"
                            />
                          ) : (
                            <p className="text-sm">{qa.answer}</p>
                          )}
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
                  <Input
                    placeholder="Nouvelle note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
