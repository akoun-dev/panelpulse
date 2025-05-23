import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '@/components/ui/simple-select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  BarChart as BarChartIcon,
  LineChart,
  PieChart,
  Users,
  MessageSquare,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
  Filter,
  HelpCircle,
  ThumbsUp,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Award,
  CheckCircle,
  UserPlus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

// Types pour les données analytiques
interface AnalyticsData {
  overview: {
    totalPanels: number;
    totalUsers: number;
    totalQuestions: number;
    totalEngagements: number;
    activeUsers: number;
    averageQuestionsPerPanel: number;
    averageEngagementRate: number;
    userGrowth: number;
    panelGrowth: number;
  };
  engagementData: {
    daily: Array<{date: string; questions: number; votes: number; views: number}>;
    weekly: Array<{week: string; questions: number; votes: number; views: number}>;
    monthly: Array<{month: string; questions: number; votes: number; views: number}>;
  };
  panelAnalytics: {
    byStatus: Array<{name: string; value: number}>;
    byEngagement: Array<{name: string; questions: number; votes: number; views: number}>;
    byDuration: Array<{duration: string; count: number}>;
    topPanels: Array<{id: string; title: string; questions: number; votes: number; views: number}>;
  };
  userAnalytics: {
    byRole: Array<{name: string; value: number}>;
    byActivity: Array<{name: string; value: number}>;
    topUsers: Array<{id: string; name: string; panels: number; questions: number; votes: number}>;
    retention: Array<{date: string; rate: number}>;
  };
  trends: {
    popularTopics: Array<{topic: string; count: number; growth: number}>;
    questionTypes: Array<{type: string; count: number; percentage: number}>;
    peakTimes: Array<{time: string; activity: number}>;
    seasonality: Array<{month: string; panels: number; questions: number}>;
  };
}

// Données fictives pour les graphiques
const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalPanels: 248,
    totalUsers: 1842,
    totalQuestions: 3756,
    totalEngagements: 15284,
    activeUsers: 876,
    averageQuestionsPerPanel: 15.2,
    averageEngagementRate: 68.4,
    userGrowth: 12.5,
    panelGrowth: 8.3
  },
  engagementData: {
    daily: Array.from({ length: 30 }).map((_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      questions: Math.floor(Math.random() * 50) + 10,
      votes: Math.floor(Math.random() * 200) + 50,
      views: Math.floor(Math.random() * 500) + 100
    })),
    weekly: Array.from({ length: 12 }).map((_, i) => ({
      week: `S${i + 1}`,
      questions: Math.floor(Math.random() * 300) + 50,
      votes: Math.floor(Math.random() * 1200) + 300,
      views: Math.floor(Math.random() * 3000) + 500
    })),
    monthly: Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(2023, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
      questions: Math.floor(Math.random() * 1200) + 200,
      votes: Math.floor(Math.random() * 5000) + 1000,
      views: Math.floor(Math.random() * 12000) + 2000
    }))
  },
  panelAnalytics: {
    byStatus: [
      { name: 'Actif', value: 86 },
      { name: 'Terminé', value: 124 },
      { name: 'Brouillon', value: 28 },
      { name: 'Archivé', value: 10 }
    ],
    byEngagement: Array.from({ length: 10 }).map((_, i) => ({
      name: `Panel ${i + 1}`,
      questions: Math.floor(Math.random() * 50) + 10,
      votes: Math.floor(Math.random() * 200) + 50,
      views: Math.floor(Math.random() * 500) + 100
    })),
    byDuration: [
      { duration: '< 30 min', count: 42 },
      { duration: '30-60 min', count: 98 },
      { duration: '1-2 heures', count: 76 },
      { duration: '> 2 heures', count: 32 }
    ],
    topPanels: Array.from({ length: 5 }).map((_, i) => ({
      id: `panel-${i + 1}`,
      title: `Panel sur ${['l\'IA', 'le Développement Durable', 'la Cybersécurité', 'le Marketing Digital', 'la Finance'][i]}`,
      questions: Math.floor(Math.random() * 50) + 20,
      votes: Math.floor(Math.random() * 300) + 100,
      views: Math.floor(Math.random() * 1000) + 200
    }))
  },
  userAnalytics: {
    byRole: [
      { name: 'Administrateurs', value: 12 },
      { name: 'Modérateurs', value: 48 },
      { name: 'Utilisateurs', value: 1782 }
    ],
    byActivity: [
      { name: 'Très actifs', value: 324 },
      { name: 'Actifs', value: 552 },
      { name: 'Occasionnels', value: 748 },
      { name: 'Inactifs', value: 218 }
    ],
    topUsers: Array.from({ length: 5 }).map((_, i) => ({
      id: `user-${i + 1}`,
      name: `Utilisateur ${i + 1}`,
      panels: Math.floor(Math.random() * 15) + 5,
      questions: Math.floor(Math.random() * 100) + 20,
      votes: Math.floor(Math.random() * 300) + 50
    })),
    retention: Array.from({ length: 12 }).map((_, i) => ({
      date: new Date(2023, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
      rate: Math.floor(Math.random() * 30) + 60
    }))
  },
  trends: {
    popularTopics: [
      { topic: 'Intelligence Artificielle', count: 86, growth: 24.5 },
      { topic: 'Développement Durable', count: 72, growth: 18.3 },
      { topic: 'Cybersécurité', count: 68, growth: 15.7 },
      { topic: 'Marketing Digital', count: 54, growth: 12.2 },
      { topic: 'Finance', count: 48, growth: 8.5 }
    ],
    questionTypes: [
      { type: 'Ouvertes', count: 2254, percentage: 60 },
      { type: 'Fermées', count: 1127, percentage: 30 },
      { type: 'Sondages', count: 375, percentage: 10 }
    ],
    peakTimes: Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}h`,
      activity: Math.floor(Math.sin(i / 24 * Math.PI * 2) * 50 + 50) + (i >= 8 && i <= 18 ? 30 : 0)
    })),
    seasonality: Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(2023, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
      panels: Math.floor(Math.random() * 30) + 10,
      questions: Math.floor(Math.random() * 300) + 100
    }))
  }
};

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminAnalytics() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('30j')
  const [engagementPeriod, setEngagementPeriod] = useState('daily')

  // Charger les données analytiques
  useEffect(() => {
    setLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData)
      setLoading(false)
    }, 1000)
  }, [timeRange])

  // Gérer l'exportation des rapports
  const handleExportReport = (format: 'pdf' | 'excel') => {
    toast({
      title: `Rapport exporté en ${format.toUpperCase()}`,
      description: `Le rapport analytique a été exporté avec succès au format ${format.toUpperCase()}.`
    })
  }

  // Données d'engagement en fonction de la période sélectionnée
  const getEngagementData = () => {
    if (!analyticsData) return []

    switch (engagementPeriod) {
      case 'daily':
        return analyticsData.engagementData.daily
      case 'weekly':
        return analyticsData.engagementData.weekly
      case 'monthly':
        return analyticsData.engagementData.monthly
      default:
        return analyticsData.engagementData.daily
    }
  }

  if (loading || !analyticsData) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord analytique</h1>
          <p className="text-muted-foreground">Analyse détaillée de l'activité de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={[
              { value: '7j', label: '7 derniers jours' },
              { value: '30j', label: '30 derniers jours' },
              { value: '90j', label: '90 derniers jours' },
              { value: '1a', label: 'Dernière année' },
              { value: 'all', label: 'Tout' }
            ]}
          />
          <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Exporter en PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Engagement</span>
          </TabsTrigger>
          <TabsTrigger value="panels" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Panels</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Tendances</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Panels</p>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.overview.totalPanels}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {analyticsData.overview.panelGrowth}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Utilisateurs</p>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.overview.totalUsers}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {analyticsData.overview.userGrowth}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.overview.totalQuestions}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {Math.round(analyticsData.overview.totalQuestions / analyticsData.overview.totalPanels * 10) / 10} par panel
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Taux d'engagement</p>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                    <ThumbsUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.overview.averageEngagementRate}%</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {analyticsData.overview.totalEngagements} interactions
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Évolution de l'activité sur les 30 derniers jours</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analyticsData.engagementData.daily}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="questions" stroke="#8884d8" fillOpacity={1} fill="url(#colorQuestions)" />
                    <Area type="monotone" dataKey="votes" stroke="#82ca9d" fillOpacity={1} fill="url(#colorVotes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des panels</CardTitle>
                <CardDescription>Distribution des panels par statut</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.panelAnalytics.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.panelAnalytics.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métriques secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Utilisateurs actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(analyticsData.overview.activeUsers / analyticsData.overview.totalUsers * 100)}% du total des utilisateurs
                </p>
                <div className="mt-4">
                  <Progress value={analyticsData.overview.activeUsers / analyticsData.overview.totalUsers * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Questions par panel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.averageQuestionsPerPanel}</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne de questions posées par panel
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Min: 3</span>
                    <span>Max: 42</span>
                  </div>
                  <Progress value={analyticsData.overview.averageQuestionsPerPanel / 42 * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Taux de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <p className="text-xs text-muted-foreground">
                  Pourcentage de visiteurs qui participent activement
                </p>
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Visiteurs</span>
                    <span>7,432</span>
                  </div>
                  <Progress value={100} className="h-1 bg-muted" />
                  <div className="flex items-center justify-between text-xs">
                    <span>Participants</span>
                    <span>1,842</span>
                  </div>
                  <Progress value={24.8} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Engagement */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Analyse de l'engagement</h2>
            <div className="flex items-center gap-2">
              <Select
                value={engagementPeriod}
                onValueChange={setEngagementPeriod}
                options={[
                  { value: 'daily', label: 'Quotidien' },
                  { value: 'weekly', label: 'Hebdomadaire' },
                  { value: 'monthly', label: 'Mensuel' }
                ]}
              />
            </div>
          </div>

          {/* Graphique d'engagement principal */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution de l'engagement</CardTitle>
              <CardDescription>
                {engagementPeriod === 'daily' ? 'Activité quotidienne' :
                 engagementPeriod === 'weekly' ? 'Activité hebdomadaire' : 'Activité mensuelle'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getEngagementData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={
                      engagementPeriod === 'daily' ? 'date' :
                      engagementPeriod === 'weekly' ? 'week' : 'month'
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="questions" name="Questions" fill="#8884d8" />
                  <Bar dataKey="votes" name="Votes" fill="#82ca9d" />
                  <Bar dataKey="views" name="Vues" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métriques d'engagement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Taux de participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76.4%</div>
                <p className="text-xs text-muted-foreground">
                  Pourcentage de panélistes qui participent activement
                </p>
                <div className="mt-4">
                  <Progress value={76.4} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Temps moyen par session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18:24</div>
                <p className="text-xs text-muted-foreground">
                  Durée moyenne des sessions utilisateur
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Min: 2:12</span>
                    <span>Max: 47:38</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Taux de réponse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84.2%</div>
                <p className="text-xs text-muted-foreground">
                  Pourcentage de questions qui reçoivent une réponse
                </p>
                <div className="mt-4 space-y-1">
                  <Progress value={84.2} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyse détaillée */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement par type de panel</CardTitle>
                <CardDescription>Comparaison des taux d'engagement selon le type de panel</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'Conférence', engagement: 72 },
                      { name: 'Table ronde', engagement: 86 },
                      { name: 'Webinaire', engagement: 64 },
                      { name: 'Formation', engagement: 78 },
                      { name: 'Débat', engagement: 92 }
                    ]}
                    margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Taux d\'engagement']} />
                    <Bar dataKey="engagement" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement par heure de la journée</CardTitle>
                <CardDescription>Répartition de l'activité selon l'heure</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.trends.peakTimes}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="activity" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top panels par engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des panels par engagement</CardTitle>
              <CardDescription>Panels avec les taux d'engagement les plus élevés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.panelAnalytics.topPanels.map((panel, index) => (
                  <div key={panel.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{panel.title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" /> {panel.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {panel.votes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {panel.views} vues
                        </span>
                      </div>
                    </div>
                    <div>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        {Math.round((panel.votes + panel.questions) / panel.views * 100)}% engagement
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Panels */}
        <TabsContent value="panels" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Analyse des panels</h2>
          </div>

          {/* Statistiques des panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Panels</p>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.overview.totalPanels}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {analyticsData.overview.panelGrowth}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Panels actifs</p>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.panelAnalytics.byStatus.find(s => s.name === 'Actif')?.value || 0}</h3>
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    {Math.round((analyticsData.panelAnalytics.byStatus.find(s => s.name === 'Actif')?.value || 0) / analyticsData.overview.totalPanels * 100)}% du total
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Durée moyenne</p>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">68 min</h3>
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    +12% vs mois dernier
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Taux de complétion</p>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">82.4%</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    +5.2%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques des panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
                <CardDescription>Distribution des panels selon leur statut</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.panelAnalytics.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.panelAnalytics.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par durée</CardTitle>
                <CardDescription>Distribution des panels selon leur durée</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.panelAnalytics.byDuration}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="duration" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Nombre de panels" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Engagement par panel */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement par panel</CardTitle>
              <CardDescription>Comparaison de l'engagement entre les panels les plus actifs</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.panelAnalytics.byEngagement}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="questions" name="Questions" fill="#8884d8" />
                  <Bar dataKey="votes" name="Votes" fill="#82ca9d" />
                  <Bar dataKey="views" name="Vues" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tendances mensuelles */}
          <Card>
            <CardHeader>
              <CardTitle>Tendances mensuelles</CardTitle>
              <CardDescription>Évolution du nombre de panels et questions par mois</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analyticsData.trends.seasonality}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="panels" name="Panels" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="questions" name="Questions" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top panels */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des panels les plus actifs</CardTitle>
              <CardDescription>Panels avec le plus grand nombre de questions et votes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.panelAnalytics.topPanels.map((panel, index) => (
                  <div key={panel.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{panel.title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" /> {panel.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {panel.votes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {panel.views} vues
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Utilisateurs */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Analyse des utilisateurs</h2>
          </div>

          {/* Statistiques des utilisateurs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Utilisateurs</p>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.overview.totalUsers}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {analyticsData.overview.userGrowth}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</p>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{analyticsData.overview.activeUsers}</h3>
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    {Math.round(analyticsData.overview.activeUsers / analyticsData.overview.totalUsers * 100)}% du total
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Nouveaux utilisateurs</p>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full">
                    <UserPlus className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">246</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    +18.5%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Taux de rétention</p>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">78.6%</h3>
                  <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    +3.2%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques des utilisateurs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par rôle</CardTitle>
                <CardDescription>Distribution des utilisateurs selon leur rôle</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.userAnalytics.byRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.userAnalytics.byRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par activité</CardTitle>
                <CardDescription>Distribution des utilisateurs selon leur niveau d'activité</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.userAnalytics.byActivity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.userAnalytics.byActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Taux de rétention */}
          <Card>
            <CardHeader>
              <CardTitle>Taux de rétention mensuel</CardTitle>
              <CardDescription>Évolution du taux de rétention des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analyticsData.userAnalytics.retention}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Taux de rétention']} />
                  <Line type="monotone" dataKey="rate" name="Taux de rétention" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des utilisateurs les plus actifs</CardTitle>
              <CardDescription>Utilisateurs avec le plus grand nombre de panels et questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.userAnalytics.topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {user.panels} panels
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" /> {user.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {user.votes} votes
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {user.panels > 10 ? 'Super actif' : user.panels > 5 ? 'Très actif' : 'Actif'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Tendances */}
        <TabsContent value="trends" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Analyse des tendances</h2>
          </div>

          {/* Sujets populaires */}
          <Card>
            <CardHeader>
              <CardTitle>Sujets populaires</CardTitle>
              <CardDescription>Les sujets les plus discutés dans les panels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.trends.popularTopics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{topic.topic}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{topic.count} panels</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-green-500 dark:text-green-400">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      {topic.growth}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Types de questions */}
          <Card>
            <CardHeader>
              <CardTitle>Types de questions</CardTitle>
              <CardDescription>Répartition des questions par type</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.trends.questionTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.trends.questionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heures de pointe */}
          <Card>
            <CardHeader>
              <CardTitle>Heures de pointe</CardTitle>
              <CardDescription>Répartition de l'activité selon l'heure de la journée</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.trends.peakTimes}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activity" name="Niveau d'activité" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Saisonnalité */}
          <Card>
            <CardHeader>
              <CardTitle>Saisonnalité</CardTitle>
              <CardDescription>Évolution de l'activité au cours de l'année</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analyticsData.trends.seasonality}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="panels" name="Panels" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="questions" name="Questions" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Prévisions */}
          <Card>
            <CardHeader>
              <CardTitle>Prévisions de croissance</CardTitle>
              <CardDescription>Projections pour les 6 prochains mois</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: 'Juil', users: 1842, panels: 248, projected: false },
                    { month: 'Août', users: 1980, panels: 270, projected: true },
                    { month: 'Sept', users: 2140, panels: 295, projected: true },
                    { month: 'Oct', users: 2320, panels: 325, projected: true },
                    { month: 'Nov', users: 2520, panels: 360, projected: true },
                    { month: 'Déc', users: 2750, panels: 400, projected: true },
                    { month: 'Jan', users: 3000, panels: 445, projected: true }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="users" name="Utilisateurs" stroke="#8884d8" strokeDasharray={(d) => d.projected ? "5 5" : "0"} />
                  <Line yAxisId="right" type="monotone" dataKey="panels" name="Panels" stroke="#82ca9d" strokeDasharray={(d) => d.projected ? "5 5" : "0"} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}