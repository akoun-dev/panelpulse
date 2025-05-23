import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Briefcase, MapPin, Calendar, Edit, Save, Upload, MessageSquare, Users, Plus, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Interface pour les données utilisateur
interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  company?: string
  role?: string
  location?: string
  bio?: string
  joinedDate: string
  panelsCreated: number
  panelsParticipated: number
  questionsAnswered: number
  totalSpeakingTime: number // en minutes
  expertise: string[]
  languages: string[]
  socialLinks: {
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export default function UserProfile() {
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<UserData>>({})
  const [loading, setLoading] = useState(true)

  // Charger les données utilisateur
  useEffect(() => {
    setLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      // Données fictives
      setUserData({
        id: 'user-123',
        name: 'Sophie Martin',
        email: 'sophie.martin@example.com',
        avatar: '',
        company: 'TechCorp',
        role: 'Directrice Innovation',
        location: 'Paris, France',
        bio: 'Experte en innovation et stratégies digitales avec plus de 10 ans d\'expérience dans le secteur technologique. Passionnée par l\'IA et les nouvelles technologies.',
        joinedDate: '2023-05-15',
        panelsCreated: 12,
        panelsParticipated: 8,
        questionsAnswered: 45,
        totalSpeakingTime: 320,
        expertise: ['Marketing Digital', 'Intelligence Artificielle', 'Innovation Produit', 'Stratégie Digitale'],
        languages: ['Français', 'Anglais', 'Espagnol'],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/sophiemartin',
          twitter: 'https://twitter.com/sophiemartin',
          website: 'https://sophiemartin.com'
        }
      })
      setLoading(false)
    }, 800)
  }, [])

  // Démarrer l'édition du profil
  const handleEdit = () => {
    setIsEditing(true)
    setEditedData(userData || {})
  }

  // Sauvegarder les modifications
  const handleSave = () => {
    if (userData && editedData) {
      const updatedData = { ...userData, ...editedData }
      setUserData(updatedData)
      setIsEditing(false)

      // Simuler un appel API pour sauvegarder les données
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      })
    }
  }

  // Annuler l'édition
  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({})
  }

  // Mettre à jour les données éditées
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedData(prev => ({ ...prev, [name]: value }))
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        <div className="py-12 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Impossible de charger les données du profil.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Modifier le profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                      <Upload className="h-4 w-4" />
                      <span className="sr-only">Changer la photo</span>
                    </Button>
                  )}
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <label htmlFor="name" className="text-sm font-medium">Nom</label>
                        <Input
                          id="name"
                          name="name"
                          value={editedData.name || ''}
                          onChange={handleChange}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label htmlFor="role" className="text-sm font-medium">Fonction</label>
                          <Input
                            id="role"
                            name="role"
                            value={editedData.role || ''}
                            onChange={handleChange}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="company" className="text-sm font-medium">Entreprise</label>
                          <Input
                            id="company"
                            name="company"
                            value={editedData.company || ''}
                            onChange={handleChange}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{userData.name}</h2>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{userData.role}{userData.company ? ` @ ${userData.company}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{userData.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Membre depuis {formatDate(userData.joinedDate)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">À propos</h3>
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={editedData.bio || ''}
                    onChange={handleChange}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm">{userData.bio}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        name="email"
                        value={editedData.email || ''}
                        onChange={handleChange}
                        className="flex-1"
                      />
                    ) : (
                      <span>{userData.email}</span>
                    )}
                  </div>

                  {/* Liens sociaux */}
                  {!isEditing && userData.socialLinks && Object.entries(userData.socialLinks).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex items-center gap-2">
                        <span className="capitalize text-muted-foreground">{key}:</span>
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          {value.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Votre activité sur PanelPulse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{userData.panelsCreated}</div>
                  <div className="text-sm text-muted-foreground">Panels créés</div>
                </div>

                <div className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{userData.panelsParticipated}</div>
                  <div className="text-sm text-muted-foreground">Panels participés</div>
                </div>

                <div className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{userData.questionsAnswered}</div>
                  <div className="text-sm text-muted-foreground">Questions répondues</div>
                </div>

                <div className="bg-muted/20 dark:bg-muted/10 p-4 rounded-lg text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{Math.floor(userData.totalSpeakingTime / 60)}h {userData.totalSpeakingTime % 60}m</div>
                  <div className="text-sm text-muted-foreground">Temps de parole</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expertise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expertise et compétences</CardTitle>
              <CardDescription>Vos domaines d'expertise et langues parlées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Domaines d'expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.expertise.map((item, index) => (
                    <Badge key={index} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-6">
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Langues</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-6">
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
