import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Mail, Briefcase, MapPin, Calendar, Edit, Save, Upload, MessageSquare, Users, Plus, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import {
  getCurrentUserProfile,
  updateUserProfile,
  updateUserAvatar,
  UserProfileUpdate
} from '@/services/userService'

// Interface pour les données utilisateur adaptée à partir du service
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

  // Référence pour le champ de téléchargement d'avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Charger les données utilisateur depuis Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const profile = await getCurrentUserProfile();

        if (profile) {
          // Convertir le format du profil Supabase au format attendu par le composant
          setUserData({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar_url,
            company: profile.company,
            role: profile.role,
            location: profile.location,
            bio: profile.bio,
            joinedDate: profile.joined_date,
            panelsCreated: profile.panels_created,
            panelsParticipated: profile.panels_participated,
            questionsAnswered: profile.questions_answered,
            totalSpeakingTime: profile.total_speaking_time,
            expertise: profile.expertise || [],
            languages: profile.languages || [],
            socialLinks: profile.social_links || {}
          });
        } else {
          // Afficher un message d'erreur si le profil n'a pas pu être chargé
          toast({
            title: "Erreur",
            description: "Impossible de charger votre profil. Veuillez réessayer.",
            variant: "destructive" as any
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement de votre profil.",
          variant: "destructive" as any
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user, toast]);

  // Démarrer l'édition du profil
  const handleEdit = () => {
    setIsEditing(true)
    setEditedData(userData || {})
  }

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (userData && editedData) {
      try {
        // Préparer les données pour la mise à jour
        const updateData: UserProfileUpdate = {
          name: editedData.name,
          company: editedData.company,
          role: editedData.role,
          location: editedData.location,
          bio: editedData.bio,
          social_links: editedData.socialLinks,
          expertise: editedData.expertise,
          languages: editedData.languages
        };

        // Appeler le service pour mettre à jour le profil
        const updatedProfile = await updateUserProfile(userData.id, updateData);

        if (updatedProfile) {
          // Convertir le format du profil Supabase au format attendu par le composant
          setUserData({
            id: updatedProfile.id,
            name: updatedProfile.name,
            email: updatedProfile.email,
            avatar: updatedProfile.avatar_url,
            company: updatedProfile.company,
            role: updatedProfile.role,
            location: updatedProfile.location,
            bio: updatedProfile.bio,
            joinedDate: updatedProfile.joined_date,
            panelsCreated: updatedProfile.panels_created,
            panelsParticipated: updatedProfile.panels_participated,
            questionsAnswered: updatedProfile.questions_answered,
            totalSpeakingTime: updatedProfile.total_speaking_time,
            expertise: updatedProfile.expertise || [],
            languages: updatedProfile.languages || [],
            socialLinks: updatedProfile.social_links || {}
          });

          setIsEditing(false);

          toast({
            title: "Profil mis à jour",
            description: "Vos informations ont été enregistrées avec succès."
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
            variant: "destructive" as any
          });
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour de votre profil.",
          variant: "destructive" as any
        });
      }
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

  // Gérer le téléchargement d'avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userData) {
      const file = e.target.files[0];

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier non valide",
          description: "Veuillez sélectionner une image (JPG, PNG, etc.).",
          variant: "destructive" as any
        });
        return;
      }

      // Vérifier la taille du fichier (max 2 Mo)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille de l'image ne doit pas dépasser 2 Mo.",
          variant: "destructive" as any
        });
        return;
      }

      try {
        // Télécharger l'avatar
        const avatarUrl = await updateUserAvatar(userData.id, file);

        if (avatarUrl) {
          // Mettre à jour l'avatar dans les données utilisateur
          setUserData(prev => prev ? { ...prev, avatar: avatarUrl } : null);

          toast({
            title: "Avatar mis à jour",
            description: "Votre photo de profil a été mise à jour avec succès."
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour votre photo de profil. Veuillez réessayer.",
            variant: "destructive" as any
          });
        }
      } catch (error) {
        console.error("Erreur lors du téléchargement de l'avatar:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du téléchargement de votre photo de profil.",
          variant: "destructive" as any
        });
      }
    }
  }

  // Déclencher le dialogue de sélection de fichier
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                        onClick={triggerFileInput}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">Changer la photo</span>
                      </Button>
                    </>
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
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editedData.expertise?.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            onClick={() => {
                              const newExpertise = [...(editedData.expertise || [])];
                              newExpertise.splice(index, 1);
                              setEditedData(prev => ({ ...prev, expertise: newExpertise }));
                            }}
                            className="ml-1 rounded-full hover:bg-primary/20 p-1"
                          >
                            <span className="sr-only">Supprimer</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nouvelle expertise"
                        className="max-w-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const newExpertise = [...(editedData.expertise || []), e.currentTarget.value.trim()];
                            setEditedData(prev => ({ ...prev, expertise: newExpertise }));
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const newExpertise = [...(editedData.expertise || []), input.value.trim()];
                            setEditedData(prev => ({ ...prev, expertise: newExpertise }));
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userData.expertise.map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                    {userData.expertise.length === 0 && (
                      <span className="text-sm text-muted-foreground">Aucune expertise ajoutée</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Langues</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editedData.languages?.map((language, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {language}
                          <button
                            onClick={() => {
                              const newLanguages = [...(editedData.languages || [])];
                              newLanguages.splice(index, 1);
                              setEditedData(prev => ({ ...prev, languages: newLanguages }));
                            }}
                            className="ml-1 rounded-full hover:bg-muted p-1"
                          >
                            <span className="sr-only">Supprimer</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nouvelle langue"
                        className="max-w-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const newLanguages = [...(editedData.languages || []), e.currentTarget.value.trim()];
                            setEditedData(prev => ({ ...prev, languages: newLanguages }));
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const newLanguages = [...(editedData.languages || []), input.value.trim()];
                            setEditedData(prev => ({ ...prev, languages: newLanguages }));
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userData.languages.map((language, index) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                    {userData.languages.length === 0 && (
                      <span className="text-sm text-muted-foreground">Aucune langue ajoutée</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
