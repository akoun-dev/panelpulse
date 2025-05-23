import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/simple-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  XCircle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  FileText, 
  Database, 
  Shield, 
  User, 
  ListFilter 
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

// Types pour les logs
interface SystemLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  source: 'system' | 'auth' | 'database' | 'api' | 'user'
  message: string
  details?: string
}

// Colonnes pour le tableau des logs
const logsColumns: ColumnDef<SystemLog>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as string
      return new Date(timestamp).toLocaleString()
    }
  },
  {
    accessorKey: 'level',
    header: 'Niveau',
    cell: ({ row }) => {
      const level = row.getValue('level') as string
      return (
        <Badge className={
          level === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
          level === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
          level === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
        }>
          {level === 'info' ? 'Information' : 
           level === 'warning' ? 'Avertissement' : 
           level === 'error' ? 'Erreur' : 'Debug'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const source = row.getValue('source') as string
      return (
        <Badge variant="outline">
          {source === 'system' ? 'Système' : 
           source === 'auth' ? 'Authentification' : 
           source === 'database' ? 'Base de données' : 
           source === 'api' ? 'API' : 'Utilisateur'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => {
      const message = row.getValue('message') as string
      return (
        <div className="max-w-md truncate" title={message}>
          {message}
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const log = row.original
      return (
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Info className="h-4 w-4" />
        </Button>
      )
    }
  }
]

// Données fictives pour les logs
const mockLogs: SystemLog[] = Array.from({ length: 50 }).map((_, i) => {
  const levels = ['info', 'warning', 'error', 'debug'] as const
  const sources = ['system', 'auth', 'database', 'api', 'user'] as const
  const level = levels[Math.floor(Math.random() * levels.length)]
  const source = sources[Math.floor(Math.random() * sources.length)]
  
  let message = ''
  if (source === 'system') {
    message = level === 'info' 
      ? 'Système démarré avec succès' 
      : level === 'warning' 
        ? 'Utilisation élevée de la mémoire' 
        : level === 'error' 
          ? 'Erreur critique du système' 
          : 'Vérification des processus système'
  } else if (source === 'auth') {
    message = level === 'info' 
      ? 'Connexion utilisateur réussie' 
      : level === 'warning' 
        ? 'Tentative de connexion échouée' 
        : level === 'error' 
          ? 'Authentification bloquée après plusieurs échecs' 
          : 'Vérification des tokens d\'authentification'
  } else if (source === 'database') {
    message = level === 'info' 
      ? 'Sauvegarde de la base de données réussie' 
      : level === 'warning' 
        ? 'Requête lente détectée' 
        : level === 'error' 
          ? 'Échec de connexion à la base de données' 
          : 'Optimisation des index de la base de données'
  } else if (source === 'api') {
    message = level === 'info' 
      ? 'Requête API traitée avec succès' 
      : level === 'warning' 
        ? 'Limite de taux d\'API atteinte' 
        : level === 'error' 
          ? 'Échec de la requête API' 
          : 'Analyse des performances de l\'API'
  } else {
    message = level === 'info' 
      ? 'Utilisateur a créé un nouveau panel' 
      : level === 'warning' 
        ? 'Utilisateur a tenté d\'accéder à une ressource non autorisée' 
        : level === 'error' 
          ? 'Action utilisateur a échoué' 
          : 'Suivi des actions utilisateur'
  }
  
  return {
    id: `log-${i + 1}`,
    timestamp: new Date(Date.now() - i * 300000).toISOString(),
    level,
    source,
    message: `${message} (${i + 1})`,
    details: `Détails complets du log ${i + 1}: ${message}`
  }
})

export default function AdminSystemLogs() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('all')

  // Charger les données
  useEffect(() => {
    setLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      setLogs(mockLogs)
      setLoading(false)
    }, 1000)
  }, [])

  // Filtrer les logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
    const matchesSource = selectedSource === 'all' || log.source === selectedSource
    const matchesDate = !selectedDate || new Date(log.timestamp).toLocaleDateString() === new Date(selectedDate).toLocaleDateString()
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'errors' && log.level === 'error') ||
                      (activeTab === 'warnings' && log.level === 'warning') ||
                      (activeTab === 'info' && log.level === 'info')
    
    return matchesSearch && matchesLevel && matchesSource && matchesDate && matchesTab
  })

  // Télécharger les logs
  const handleDownloadLogs = () => {
    // Simuler un téléchargement
    toast({
      title: "Téléchargement des logs",
      description: "Les logs ont été téléchargés avec succès."
    })
  }

  // Effacer les logs
  const handleClearLogs = () => {
    // Simuler une suppression
    toast({
      title: "Logs effacés",
      description: "Les logs ont été effacés avec succès."
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Logs Système</h1>
          <p className="text-muted-foreground">Consultez les logs système de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearLogs}>
            <XCircle className="mr-2 h-4 w-4" />
            Effacer les logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les logs</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
          <TabsTrigger value="warnings">Avertissements</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <ListFilter className="h-5 w-5 mr-2" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les logs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="w-40">
                    <Select
                      value={selectedLevel}
                      onValueChange={setSelectedLevel}
                      options={[
                        { value: 'all', label: 'Tous les niveaux' },
                        { value: 'info', label: 'Information' },
                        { value: 'warning', label: 'Avertissement' },
                        { value: 'error', label: 'Erreur' },
                        { value: 'debug', label: 'Debug' }
                      ]}
                    />
                  </div>
                  <div className="w-40">
                    <Select
                      value={selectedSource}
                      onValueChange={setSelectedSource}
                      options={[
                        { value: 'all', label: 'Toutes les sources' },
                        { value: 'system', label: 'Système' },
                        { value: 'auth', label: 'Authentification' },
                        { value: 'database', label: 'Base de données' },
                        { value: 'api', label: 'API' },
                        { value: 'user', label: 'Utilisateur' }
                      ]}
                    />
                  </div>
                  <div className="w-40">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => {
                    setSearchTerm('')
                    setSelectedLevel('all')
                    setSelectedSource('all')
                    setSelectedDate('')
                  }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des logs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Logs système
                <Badge className="ml-2">{filteredLogs.length}</Badge>
              </CardTitle>
              <CardDescription>
                {activeTab === 'all' ? 'Tous les logs système' : 
                 activeTab === 'errors' ? 'Logs d\'erreurs système' : 
                 activeTab === 'warnings' ? 'Logs d\'avertissements système' : 
                 'Logs d\'informations système'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={logsColumns} 
                data={filteredLogs} 
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
