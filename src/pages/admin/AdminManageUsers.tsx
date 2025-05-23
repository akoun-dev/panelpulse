import { useState, useEffect } from 'react'
import { DataTable } from '../../components/ui/data-table'
import { columns, User } from '@/components/layout/admin/users-columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/simple-select'
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Download,
  RefreshCw,
  PieChart,
  ListFilter
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

// Données fictives pour les utilisateurs
const mockUsers: User[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `user-${i + 1}`,
  name: `Utilisateur ${i + 1}`,
  email: `utilisateur${i + 1}@example.com`,
  role: i % 5 === 0 ? 'admin' : 'user',
  created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
}))

export default function AdminManageUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user'
  })

  // Charger les données des utilisateurs
  useEffect(() => {
    setLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole

    return matchesSearch && matchesRole
  })

  // Gérer l'ajout d'un utilisateur
  const handleAddUser = () => {
    // Simuler un appel API
    setLoading(true)
    setTimeout(() => {
      const newUserData: User = {
        id: `user-${users.length + 1}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as 'admin' | 'user',
        created_at: new Date().toISOString()
      }
      setUsers([newUserData, ...users])
      setIsAddUserOpen(false)
      setNewUser({
        name: '',
        email: '',
        role: 'user'
      })
      setLoading(false)
      toast({
        title: "Utilisateur ajouté",
        description: `L'utilisateur ${newUserData.name} a été ajouté avec succès.`
      })
    }, 500)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
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
                placeholder="Rechercher un utilisateur..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  options={[
                    { value: 'all', label: 'Tous les rôles' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'user', label: 'Utilisateur' }
                  ]}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => {
                setSearchTerm('')
                setSelectedRole('all')
              }}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Liste des utilisateurs
            <Badge className="ml-2">{filteredUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Dialogue d'ajout d'utilisateur */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur sur la plateforme.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="Nom de l'utilisateur"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'Utilisateur' }
                ]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.email}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
