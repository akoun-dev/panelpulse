import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/simple-select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Lock, 
  Mail, 
  Shield, 
  Smartphone, 
  Save, 
  Trash2, 
  LogOut,
  Languages
} from 'lucide-react'

// Interface pour les paramètres utilisateur
interface UserSettings {
  // Préférences d'apparence
  theme: 'light' | 'dark' | 'system'
  language: string
  
  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  notifyNewInvitations: boolean
  notifyPanelReminders: boolean
  notifyQuestions: boolean
  
  // Confidentialité
  profileVisibility: 'public' | 'private' | 'contacts'
  showEmail: boolean
  showCompany: boolean
  
  // Sécurité
  twoFactorAuth: boolean
  sessionTimeout: number // en minutes
}

export default function UserSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Charger les paramètres utilisateur
  useEffect(() => {
    setLoading(true)
    // Simuler un appel API
    setTimeout(() => {
      // Données fictives
      setSettings({
        theme: 'system',
        language: 'fr',
        
        emailNotifications: true,
        pushNotifications: true,
        notifyNewInvitations: true,
        notifyPanelReminders: true,
        notifyQuestions: false,
        
        profileVisibility: 'public',
        showEmail: false,
        showCompany: true,
        
        twoFactorAuth: false,
        sessionTimeout: 30
      })
      setLoading(false)
    }, 800)
  }, [])

  // Mettre à jour un paramètre
  const updateSetting = (key: keyof UserSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value })
    }
  }

  // Sauvegarder les paramètres
  const saveSettings = () => {
    setSaving(true)
    // Simuler un appel API
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès.",
      })
    }, 1000)
  }

  // Réinitialiser les paramètres
  const resetSettings = () => {
    // Demander confirmation avant de réinitialiser
    if (confirm("Êtes-vous sûr de vouloir réinitialiser tous vos paramètres ?")) {
      setLoading(true)
      // Simuler un appel API
      setTimeout(() => {
        // Réinitialiser aux valeurs par défaut
        setSettings({
          theme: 'system',
          language: 'fr',
          
          emailNotifications: true,
          pushNotifications: true,
          notifyNewInvitations: true,
          notifyPanelReminders: true,
          notifyQuestions: true,
          
          profileVisibility: 'public',
          showEmail: false,
          showCompany: true,
          
          twoFactorAuth: false,
          sessionTimeout: 30
        })
        setLoading(false)
        toast({
          title: "Paramètres réinitialisés",
          description: "Tous vos paramètres ont été restaurés aux valeurs par défaut.",
        })
      }, 800)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <div className="py-12 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement de vos paramètres...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Impossible de charger vos paramètres.</p>
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
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            Réinitialiser
          </Button>
          <Button onClick={saveSettings} disabled={saving} className="gap-2">
            {saving ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant={settings.theme === 'light' ? 'default' : 'outline'} 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => updateSetting('theme', 'light')}
                  >
                    <Sun className="h-8 w-8" />
                    <span>Clair</span>
                  </Button>
                  
                  <Button 
                    variant={settings.theme === 'dark' ? 'default' : 'outline'} 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => updateSetting('theme', 'dark')}
                  >
                    <Moon className="h-8 w-8" />
                    <span>Sombre</span>
                  </Button>
                  
                  <Button 
                    variant={settings.theme === 'system' ? 'default' : 'outline'} 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => updateSetting('theme', 'system')}
                  >
                    <div className="flex">
                      <Sun className="h-8 w-8" />
                      <Moon className="h-8 w-8" />
                    </div>
                    <span>Système</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSetting('language', value)}
                  options={[
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'de', label: 'Deutsch' }
                  ]}
                />
                <p className="text-sm text-muted-foreground">
                  La langue utilisée dans l'interface de l'application
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez vos préférences de notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications par email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications sur votre appareil
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Types de notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyNewInvitations" className="flex-1">Nouvelles invitations</Label>
                    <Switch
                      id="notifyNewInvitations"
                      checked={settings.notifyNewInvitations}
                      onCheckedChange={(checked) => updateSetting('notifyNewInvitations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyPanelReminders" className="flex-1">Rappels de panels</Label>
                    <Switch
                      id="notifyPanelReminders"
                      checked={settings.notifyPanelReminders}
                      onCheckedChange={(checked) => updateSetting('notifyPanelReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyQuestions" className="flex-1">Nouvelles questions</Label>
                    <Switch
                      id="notifyQuestions"
                      checked={settings.notifyQuestions}
                      onCheckedChange={(checked) => updateSetting('notifyQuestions', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confidentialité</CardTitle>
              <CardDescription>Gérez la visibilité de votre profil et de vos informations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Visibilité du profil</Label>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value: 'public' | 'private' | 'contacts') => updateSetting('profileVisibility', value)}
                  options={[
                    { value: 'public', label: 'Public - Visible par tous' },
                    { value: 'contacts', label: 'Contacts - Visible par vos contacts uniquement' },
                    { value: 'private', label: 'Privé - Visible uniquement par vous' }
                  ]}
                />
              </div>
              
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium">Informations visibles</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showEmail" className="flex-1">Afficher mon email</Label>
                  <Switch
                    id="showEmail"
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompany" className="flex-1">Afficher mon entreprise</Label>
                  <Switch
                    id="showCompany"
                    checked={settings.showCompany}
                    onCheckedChange={(checked) => updateSetting('showCompany', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Gérez les paramètres de sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajoute une couche de sécurité supplémentaire à votre compte
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Expiration de session</Label>
                <Select
                  value={settings.sessionTimeout.toString()}
                  onValueChange={(value) => updateSetting('sessionTimeout', parseInt(value))}
                  options={[
                    { value: '15', label: '15 minutes' },
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '1 heure' },
                    { value: '120', label: '2 heures' },
                    { value: '240', label: '4 heures' }
                  ]}
                />
                <p className="text-sm text-muted-foreground">
                  Durée d'inactivité avant déconnexion automatique
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Actions de compte</h3>
                
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter de tous les appareils
                  </Button>
                  
                  <Button variant="destructive" className="justify-start mt-4">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
