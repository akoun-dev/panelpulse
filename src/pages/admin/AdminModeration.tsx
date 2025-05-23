import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/simple-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Flag, 
  ThumbsUp, 
  MessageCircle, 
  Eye, 
  EyeOff, 
  ListFilter 
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Question } from '@/types'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

// Types pour les questions et réponses
interface Report {
  id: string
  type: 'question' | 'answer'
  contentId: string
  content: string
  reason: string
  reportedBy: string
  reportedAt: string
  status: 'pending' | 'resolved' | 'dismissed'
  panelId: string
  panelTitle: string
}

// Colonnes pour le tableau des questions
const questionsColumns: ColumnDef<Question>[] = [
  {
    accessorKey: 'text',
    header: 'Question',
    cell: ({ row }) => {
      const text = row.getValue('text') as string
      return (
        <div className="max-w-md truncate" title={text}>
          {text}
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge className={
          status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
          status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
          'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
        }>
          {status === 'approved' ? 'Approuvée' : 
           status === 'rejected' ? 'Rejetée' : 'En attente'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return date ? new Date(date).toLocaleString() : 'N/A'
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const question = row.original
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-green-600">
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  }
]

// Colonnes pour le tableau des signalements
const reportsColumns: ColumnDef<Report>[] = [
  {
    accessorKey: 'content',
    header: 'Contenu signalé',
    cell: ({ row }) => {
      const content = row.getValue('content') as string
      return (
        <div className="max-w-md truncate" title={content}>
          {content}
        </div>
      )
    }
  },
  {
    accessorKey: 'reason',
    header: 'Raison',
    cell: ({ row }) => {
      const reason = row.getValue('reason') as string
      return (
        <div className="max-w-xs truncate" title={reason}>
          {reason}
        </div>
      )
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant="outline">
          {type === 'question' ? 'Question' : 'Réponse'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge className={
          status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
          status === 'dismissed' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
          'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
        }>
          {status === 'resolved' ? 'Résolu' : 
           status === 'dismissed' ? 'Rejeté' : 'En attente'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const report = row.original
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-green-600">
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  }
]

// Données fictives pour les questions
const mockQuestions: Question[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `question-${i + 1}`,
  text: `Ceci est une question de test numéro ${i + 1} qui pourrait être posée lors d'un panel.`,
  status: i % 3 === 0 ? 'approved' : i % 3 === 1 ? 'rejected' : 'pending',
  createdAt: new Date(Date.now() - i * 3600000).toISOString()
}))

// Données fictives pour les signalements
const mockReports: Report[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `report-${i + 1}`,
  type: i % 2 === 0 ? 'question' : 'answer',
  contentId: i % 2 === 0 ? `question-${i + 1}` : `answer-${i + 1}`,
  content: `Contenu signalé ${i + 1} qui pourrait être inapproprié.`,
  reason: `Raison du signalement ${i + 1}. Ce contenu est inapproprié car...`,
  reportedBy: `user-${i % 5 + 1}`,
  reportedAt: new Date(Date.now() - i * 7200000).toISOString(),
  status: i % 3 === 0 ? 'resolved' : i % 3 === 1 ? 'dismissed' : 'pending',
  panelId: `panel-${i % 10 + 1}`,
  panelTitle: `Panel ${i % 10 + 1}`
}))

export default function AdminModeration() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<string>('questions')

  // Charger les données
  useEffect(() => {
    setLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      setQuestions(mockQuestions)
      setReports(mockReports)
      setLoading(false)
    }, 1000)
  }, [])

  // Filtrer les questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || question.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Filtrer les signalements
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Modération</h1>
          <p className="text-muted-foreground">Gérez les questions, réponses et signalements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="destructive" size="sm">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Signalements ({reports.filter(r => r.status === 'pending').length})
          </Button>
        </div>
      </div>

      <Tabs defaultValue="questions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="reports">Signalements</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {/* Filtres pour les questions */}
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
                    placeholder="Rechercher une question..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-40">
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      options={[
                        { value: 'all', label: 'Tous les statuts' },
                        { value: 'pending', label: 'En attente' },
                        { value: 'approved', label: 'Approuvée' },
                        { value: 'rejected', label: 'Rejetée' }
                      ]}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                  }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Questions
                <Badge className="ml-2">{filteredQuestions.length}</Badge>
              </CardTitle>
              <CardDescription>
                Gérez les questions soumises par les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={questionsColumns} 
                data={filteredQuestions} 
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Filtres pour les signalements */}
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
                    placeholder="Rechercher un signalement..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-40">
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      options={[
                        { value: 'all', label: 'Tous les statuts' },
                        { value: 'pending', label: 'En attente' },
                        { value: 'resolved', label: 'Résolu' },
                        { value: 'dismissed', label: 'Rejeté' }
                      ]}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                  }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des signalements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Flag className="h-5 w-5 mr-2" />
                Signalements
                <Badge className="ml-2">{filteredReports.length}</Badge>
              </CardTitle>
              <CardDescription>
                Gérez les signalements de contenu inapproprié
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={reportsColumns} 
                data={filteredReports} 
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
