import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Panel, Invitation } from '@/types'
import { useRecentPanels } from '@/hooks/useRecentPanels'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
  Activity,
  Bell,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight,
  Calendar as CalendarIcon,
  Timer,
  User,
  Mail
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function UserDashboard() {
  const { recentPanels, isLoading } = useRecentPanels()
  const navigate = useNavigate()
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([])
  const [upcomingPanels, setUpcomingPanels] = useState<Panel[]>([])
  const [userStats, setUserStats] = useState({
    panelsCreated: 12,
    panelsParticipated: 8,
    questionsAnswered: 45,
    totalSpeakingTime: 320, // minutes
    activeInvitations: 3,
    completionRate: 85
  })
  const [loading, setLoading] = useState(true)

  // Simuler le chargement des données
  useEffect(() => {
    setTimeout(() => {
      // Invitations en attente
      setPendingInvitations([
        {
          id: '1',
          panelId: '101',
          email: 'vous@example.com',
          status: 'pending',
          createdAt: new Date().toISOString(),
          panelTitle: 'Panel Marketing Digital',
          panelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
          role: 'Expert en Marketing',
          moderatorName: 'Jean Dupont'
        },
        {
          id: '2',
          panelId: '102',
          email: 'vous@example.com',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
          panelTitle: 'Panel Produit Innovation',
          panelDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
          role: 'Product Manager',
          moderatorName: 'Marie Leroy'
        }
      ])

      // Panels à venir
      setUpcomingPanels([
        {
          id: '201',
          title: 'Panel Intelligence Artificielle',
          description: 'Discussion sur les avancées en IA et leurs impacts',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: 'current-user-id',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Dans 2 jours
          participants: 5
        },
        {
          id: '202',
          title: 'Panel Cybersécurité',
          description: 'Tendances et meilleures pratiques en sécurité',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: 'current-user-id',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Dans 5 jours
          participants: 3
        }
      ])

      setLoading(false)
    }, 800)
  }, [])

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec bienvenue et bouton de création */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bienvenue, Sophie</h1>
          <p className="text-muted-foreground">Voici un aperçu de vos activités et panels</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/user/create-panel')}>
          <Plus className="h-4 w-4" />
          Créer un panel
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={<MessageSquare className="h-5 w-5" />}
          title="Panels créés"
          value={userStats.panelsCreated.toString()}
          description="Total de vos panels"
          trend={"+2 ce mois-ci"}
          trendUp={true}
          color="blue"
        />
        <DashboardStatCard
          icon={<Users className="h-5 w-5" />}
          title="Panels participés"
          value={userStats.panelsParticipated.toString()}
          description="En tant que panéliste"
          trend={"+1 cette semaine"}
          trendUp={true}
          color="purple"
        />
        <DashboardStatCard
          icon={<Activity className="h-5 w-5" />}
          title="Taux de complétion"
          value={`${userStats.completionRate}%`}
          description="Panels terminés"
          trend={"+5% vs mois dernier"}
          trendUp={true}
          color="green"
        />
        <DashboardStatCard
          icon={<Clock className="h-5 w-5" />}
          title="Temps de parole"
          value={`${Math.floor(userStats.totalSpeakingTime / 60)}h ${userStats.totalSpeakingTime % 60}m`}
          description="Temps total"
          trend={"+45min cette semaine"}
          trendUp={true}
          color="amber"
        />
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        {/* Onglet Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Panels récents */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>Panels récents</span>
                  <Button variant="ghost" size="sm" asChild className="text-xs">
                    <Link to="/user/my-panels" className="flex items-center gap-1">
                      Voir tous <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Chargement des panels...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPanels.length > 0 ? (
                      recentPanels.map((panel: Panel) => (
                        <PanelCard key={panel.id} panel={panel} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Vous n'avez pas encore créé de panels</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate('/user/create-panel')}
                        >
                          Créer votre premier panel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activité récente */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem
                    icon={<Bell className="h-4 w-4 text-blue-500" />}
                    title="Nouvelle invitation"
                    description="Vous avez reçu une invitation pour 'Panel Marketing Digital'"
                    time="Il y a 2 heures"
                  />
                  <ActivityItem
                    icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                    title="Panel terminé"
                    description="'Panel Produit' a été marqué comme terminé"
                    time="Hier"
                  />
                  <ActivityItem
                    icon={<MessageSquare className="h-4 w-4 text-purple-500" />}
                    title="Nouveau panel créé"
                    description="Vous avez créé 'Panel Intelligence Artificielle'"
                    time="Il y a 3 jours"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques et progression */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Progression et statistiques</CardTitle>
              <CardDescription>Aperçu de vos performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Répartition des panels</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/20 dark:bg-muted/10 p-3 rounded-md">
                      <div className="text-2xl font-bold text-green-500">5</div>
                      <div className="text-xs text-muted-foreground">Actifs</div>
                    </div>
                    <div className="bg-muted/20 dark:bg-muted/10 p-3 rounded-md">
                      <div className="text-2xl font-bold text-blue-500">4</div>
                      <div className="text-xs text-muted-foreground">Terminés</div>
                    </div>
                    <div className="bg-muted/20 dark:bg-muted/10 p-3 rounded-md">
                      <div className="text-2xl font-bold text-amber-500">3</div>
                      <div className="text-xs text-muted-foreground">Brouillons</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Questions répondues</span>
                      <span className="font-medium">{userStats.questionsAnswered}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux de participation</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Panels à venir</h3>
                  <div className="space-y-2">
                    {upcomingPanels.map(panel => (
                      <div key={panel.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/20">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{panel.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(panel.date || '')}</p>
                        </div>
                        <Badge variant="outline">{panel.participants} participants</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet À venir */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Panels à venir</CardTitle>
              <CardDescription>Vos prochains panels programmés</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Chargement des panels...</p>
                </div>
              ) : upcomingPanels.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPanels.map(panel => (
                    <div key={panel.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{panel.title}</h3>
                        <p className="text-sm text-muted-foreground">{panel.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(panel.date || '')}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{panel.participants} participants</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/user/panels/${panel.id}`}>Voir les détails</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Vous n'avez pas de panels à venir</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/user/create-panel')}
                  >
                    Planifier un panel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Invitations */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invitations en attente</CardTitle>
              <CardDescription>Invitations à participer à des panels</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Chargement des invitations...</p>
                </div>
              ) : pendingInvitations.length > 0 ? (
                <div className="space-y-4">
                  {pendingInvitations.map(invitation => (
                    <div key={invitation.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{invitation.moderatorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{invitation.panelTitle}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{invitation.moderatorName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(invitation.panelDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{invitation.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/user/invitations/${invitation.id}`}>Voir</Link>
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Accepter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Vous n'avez pas d'invitations en attente</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/user/invitations')}
                  >
                    Voir toutes les invitations
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild className="ml-auto">
                <Link to="/user/invitations" className="flex items-center gap-1">
                  Voir toutes les invitations <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardStatCard({
  icon,
  title,
  value,
  description,
  trend,
  trendUp = true,
  color = 'blue'
}: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  trend?: string
  trendUp?: boolean
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red'
}) {
  const getColorClass = () => {
    switch (color) {
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
      case 'green': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
      case 'amber': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
      case 'red': return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
      default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    }
  }

  const getTrendColor = () => {
    return trendUp
      ? 'text-green-500 dark:text-green-400'
      : 'text-red-500 dark:text-red-400'
  }

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border-none">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${getColorClass()}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{description}</p>
            {trend && (
              <p className={`text-xs font-medium ${getTrendColor()}`}>
                {trend}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function PanelCard({ panel }: { panel: Panel }) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'completed': return 'Terminé'
      case 'draft': return 'Brouillon'
      case 'archived': return 'Archivé'
      default: return status
    }
  }

  return (
    <Card className="p-3 hover:bg-accent/50 transition-colors duration-200 border-l-4 border-l-primary dark:border-l-primary/70">
      <Link to={`/user/panels/${panel.id}`} className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{panel.title}</h3>
          <p className="text-sm text-muted-foreground">{panel.description}</p>
        </div>
        <Badge variant={
          panel.status === 'active' ? 'default' :
          panel.status === 'completed' ? 'secondary' : 'outline'
        }>
          {getStatusText(panel.status)}
        </Badge>
      </Link>
    </Card>
  )
}

function ActivityItem({
  icon,
  title,
  description,
  time
}: {
  icon: React.ReactNode
  title: string
  description: string
  time: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  )
}
