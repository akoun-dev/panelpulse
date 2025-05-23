import { Invitation, Panel } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Users, MessageSquare, QrCode, ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UserInvitationDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      // Simuler un appel API pour récupérer les détails de l'invitation
      setTimeout(() => {
        // Données fictives pour l'invitation
        const mockInvitation: Invitation = {
          id,
          panelId: id,
          email: 'vous@example.com',
          status: id === '2' || id === '3' ? 'accepted' : id === '4' ? 'rejected' : 'pending',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          panelTitle: id === '1' ? 'Panel Marketing Digital' :
                     id === '2' ? 'Panel Produit Innovation' :
                     id === '3' ? 'Panel Intelligence Artificielle' :
                     'Panel Cybersécurité',
          panelDate: id === '4' ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() :
                    new Date(Date.now() + parseInt(id) * 2 * 24 * 60 * 60 * 1000).toISOString(),
          role: id === '1' ? 'Expert en Marketing' :
                id === '2' ? 'Product Manager' :
                id === '3' ? 'Expert en IA' :
                'Analyste Sécurité',
          moderatorName: id === '1' ? 'Jean Dupont' :
                        id === '2' ? 'Marie Leroy' :
                        id === '3' ? 'Pierre Dubois' :
                        'Sophie Martin'
        }

        setInvitation(mockInvitation)

        // Simuler un appel API pour récupérer les détails du panel
        setTimeout(() => {
          // Données fictives pour le panel
          setPanel({
            id: mockInvitation.panelId,
            title: mockInvitation.panelTitle || `Panel ${mockInvitation.panelId}`,
            description: id === '1' ? "Discussion sur les stratégies marketing dans l'ère numérique et les tendances émergentes pour 2025." :
                        id === '2' ? "Feedback sur le nouveau produit et perspectives d'évolution. Analyse des retours utilisateurs et prochaines étapes." :
                        id === '3' ? "Impact de l'IA sur les métiers du numérique. Exploration des opportunités et défis pour les professionnels." :
                        "Analyse des dernières menaces et solutions de cybersécurité pour les entreprises.",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: "user-123",
            status: id === '4' ? "completed" : "active",
            userRole: "panelist",
            panelists: [
              {
                id: 'current-user-id',
                name: 'Vous',
                email: mockInvitation.email,
                role: mockInvitation.role || 'Panéliste',
                company: 'Votre Entreprise',
                timeAllocated: 600
              },
              {
                id: 'other-panelist-1',
                name: 'Alex Martin',
                email: 'alex@example.com',
                role: 'Consultant',
                company: 'ConsultCorp',
                timeAllocated: 600
              }
            ],
            preparedQA: id === '4' ? [] : [
              {
                id: '1',
                question: id === '1' ? 'Comment voyez-vous l\'évolution du marketing digital dans les 5 prochaines années?' :
                         id === '2' ? 'Quelles fonctionnalités sont les plus demandées par les utilisateurs?' :
                         'Comment l\'IA va-t-elle transformer les métiers du développement?',
                answer: id === '1' ? 'Nous anticipons une intégration plus profonde de l\'IA dans les stratégies marketing, avec une personnalisation accrue et une analyse prédictive plus précise.' :
                       id === '2' ? 'D\'après nos études, l\'intégration avec d\'autres outils, la personnalisation de l\'interface et les fonctionnalités collaboratives sont les plus demandées.' :
                       'L\'IA va automatiser certaines tâches répétitives mais créera de nouvelles opportunités dans l\'analyse de données, l\'optimisation des algorithmes et la conception de systèmes intelligents.',
                panelistId: 'current-user-id',
                panelistName: 'Vous',
                isVisible: true
              }
            ]
          })
          setLoading(false)
        }, 300)
      }, 500)
    }
  }, [id])

  const handleAccept = () => {
    if (invitation) {
      setInvitation({...invitation, status: 'accepted'})
      // TODO: Appel API pour accepter l'invitation
      setTimeout(() => {
        navigate('/user/invitations')
      }, 1000)
    }
  }

  const handleReject = () => {
    if (invitation) {
      setInvitation({...invitation, status: 'rejected'})
      // TODO: Appel API pour refuser l'invitation
      setTimeout(() => {
        navigate('/user/invitations')
      }, 1000)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'accepted':
        return 'Acceptée'
      case 'rejected':
        return 'Refusée'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/invitations')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Détails de l'invitation</h1>
        </div>

        <div className="py-12 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des détails...</p>
        </div>
      </div>
    )
  }

  if (!invitation || !panel) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/invitations')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Invitation non trouvée</h1>
        </div>

        <div className="py-12 text-center">
          <p className="text-muted-foreground">L'invitation demandée n'existe pas ou a été supprimée.</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/user/invitations')}
          >
            Retour aux invitations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/invitations')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Détails de l'invitation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Détails de l'invitation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge className={`${getStatusColor(invitation.status)}`}>
                  {getStatusText(invitation.status)}
                </Badge>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{invitation.email}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Reçue le</span>
                <p>{formatDate(invitation.createdAt)}</p>
              </div>
            </div>

            {invitation.status === 'pending' && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Vous pouvez accepter ou refuser cette invitation pour participer au panel.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAccept}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                  >
                    Accepter l'invitation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Refuser
                  </Button>
                </div>
              </div>
            )}

            {invitation.status === 'accepted' && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Vous avez accepté cette invitation. Vous pouvez maintenant accéder à votre vue panéliste.
                </p>
                <Button
                  onClick={() => navigate(`/user/panelist/${invitation.panelId}`)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Accéder à ma vue panéliste
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Détails du panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Détails du panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Titre</span>
                <p className="font-medium">{panel.title}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="text-sm">{panel.description}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Votre rôle</span>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-indigo-500" />
                  {invitation.role || 'Panéliste'}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge variant={
                  panel.status === 'active' ? 'default' :
                  panel.status === 'completed' ? 'secondary' : 'outline'
                }>
                  {panel.status === 'active' ? 'Actif' :
                   panel.status === 'completed' ? 'Terminé' :
                   panel.status === 'draft' ? 'Brouillon' :
                   panel.status === 'archived' ? 'Archivé' : panel.status}
                </Badge>
              </div>

              {invitation.panelDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Date du panel</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{formatDate(invitation.panelDate)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Invitation créée le {formatDate(invitation.createdAt)}</span>
              </div>

              {panel.preparedQA && panel.preparedQA.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <span className="text-sm text-muted-foreground">Questions préparées pour vous</span>
                  <div className="mt-2 space-y-2">
                    {panel.preparedQA.map(qa => (
                      <div key={qa.id} className="bg-muted/20 dark:bg-muted/10 p-2 rounded-md">
                        <p className="text-sm font-medium">{qa.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-primary/10 dark:bg-primary/5 p-4 rounded-md flex items-center gap-3">
              <QrCode className="h-10 w-10 text-primary" />
              <div>
                <p className="font-medium">QR Code disponible</p>
                <p className="text-sm text-muted-foreground">
                  {invitation.status === 'accepted'
                    ? 'Vous pouvez accéder au QR code dans votre vue panéliste'
                    : 'Après acceptation, vous aurez accès au QR code du panel'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Votre rôle en tant que panéliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm grid grid-cols-1 md:grid-cols-2">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>Accès aux questions préchargées</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>Visualisation des réponses préparées</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>Suivi des questions en temps réel</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>Gestion de votre temps de parole</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
