import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/simple-select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Shield,
  Bell,
  Database,
  Save,
  Download,
  Upload,
  RefreshCw,
  Mail,
  Globe,
  Clock,
  FileText,
  Users,
  Lock,
  Key,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export default function AdminSettings() {
  const { toast } = useToast()
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // États pour les paramètres
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'PanelPulse',
    siteDescription: 'Plateforme de gestion de panels et de questions',
    contactEmail: 'admin@panelpulse.com',
    defaultLanguage: 'fr',
    timeZone: 'Europe/Paris',
    maintenanceMode: false
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    ipBlocking: true
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    adminAlerts: true,
    userRegistrationNotifications: true,
    panelCreationNotifications: true,
    reportNotifications: true,
    emailProvider: 'smtp',
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@panelpulse.com'
  })

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 7,
    includeUploads: true,
    backupTime: '03:00'
  })

  // Gérer la sauvegarde des paramètres
  const handleSaveSettings = (tab: string) => {
    setIsSaving(true)

    // Simuler un appel API
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Paramètres sauvegardés",
        description: `Les paramètres ${tab === 'general' ? 'généraux' : tab === 'security' ? 'de sécurité' : tab === 'notifications' ? 'de notifications' : 'de sauvegarde'} ont été sauvegardés avec succès.`
      })
    }, 1000)
  }

  // Gérer la réinitialisation des paramètres
  const handleResetSettings = (tab: string) => {
    setIsResetting(true)

    // Simuler un appel API
    setTimeout(() => {
      // Réinitialiser les paramètres selon l'onglet
      if (tab === 'general') {
        setGeneralSettings({
          siteName: 'PanelPulse',
          siteDescription: 'Plateforme de gestion de panels et de questions',
          contactEmail: 'admin@panelpulse.com',
          defaultLanguage: 'fr',
          timeZone: 'Europe/Paris',
          maintenanceMode: false
        })
      } else if (tab === 'security') {
        setSecuritySettings({
          twoFactorAuth: true,
          passwordMinLength: 8,
          passwordRequireSpecialChars: true,
          passwordRequireNumbers: true,
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          ipBlocking: true
        })
      } else if (tab === 'notifications') {
        setNotificationSettings({
          emailNotifications: true,
          adminAlerts: true,
          userRegistrationNotifications: true,
          panelCreationNotifications: true,
          reportNotifications: true,
          emailProvider: 'smtp',
          smtpServer: 'smtp.example.com',
          smtpPort: '587',
          smtpUsername: 'notifications@panelpulse.com'
        })
      } else if (tab === 'backup') {
        setBackupSettings({
          autoBackup: true,
          backupFrequency: 'daily',
          backupRetention: 7,
          includeUploads: true,
          backupTime: '03:00'
        })
      }

      setIsResetting(false)
      toast({
        title: "Paramètres réinitialisés",
        description: `Les paramètres ${tab === 'general' ? 'généraux' : tab === 'security' ? 'de sécurité' : tab === 'notifications' ? 'de notifications' : 'de sauvegarde'} ont été réinitialisés avec succès.`
      })
    }, 1000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Paramètres Administrateur</h1>
          <p className="text-muted-foreground">Configurez les paramètres de la plateforme</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Général</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Sauvegarde</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Paramètres généraux */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>Configurez les paramètres généraux de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Description du site</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Langue par défaut</Label>
                  <Select
                    value={generalSettings.defaultLanguage}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, defaultLanguage: value})}
                    options={[
                      { value: 'fr', label: 'Français' },
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' },
                      { value: 'de', label: 'Deutsch' }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeZone">Fuseau horaire</Label>
                  <Select
                    value={generalSettings.timeZone}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timeZone: value})}
                    options={[
                      { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
                      { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
                      { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
                      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' }
                    ]}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le mode maintenance rendra le site inaccessible aux utilisateurs non-administrateurs
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleResetSettings('general')}
                disabled={isResetting || isSaving}
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSaveSettings('general')}
                disabled={isResetting || isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres de sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>Configurez les paramètres de sécurité de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactorAuth">Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger l'authentification à deux facteurs pour tous les utilisateurs
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Politique de mot de passe</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Longueur minimale</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min={6}
                      max={32}
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Expiration de session (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min={5}
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordRequireSpecialChars">Caractères spéciaux requis</Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger au moins un caractère spécial dans les mots de passe
                    </p>
                  </div>
                  <Switch
                    id="passwordRequireSpecialChars"
                    checked={securitySettings.passwordRequireSpecialChars}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireSpecialChars: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passwordRequireNumbers">Chiffres requis</Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger au moins un chiffre dans les mots de passe
                    </p>
                  </div>
                  <Switch
                    id="passwordRequireNumbers"
                    checked={securitySettings.passwordRequireNumbers}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireNumbers: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Protection contre les attaques</h3>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Tentatives de connexion maximales</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min={1}
                    max={10}
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ipBlocking">Blocage d'IP</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquer temporairement les adresses IP après plusieurs tentatives de connexion échouées
                    </p>
                  </div>
                  <Switch
                    id="ipBlocking"
                    checked={securitySettings.ipBlocking}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ipBlocking: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleResetSettings('security')}
                disabled={isResetting || isSaving}
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSaveSettings('security')}
                disabled={isResetting || isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres de notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de notifications</CardTitle>
              <CardDescription>Configurez les paramètres de notifications de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notifications par email</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer l'envoi de notifications par email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emailProvider">Fournisseur d'email</Label>
                    <Select
                      value={notificationSettings.emailProvider}
                      onValueChange={(value) => setNotificationSettings({...notificationSettings, emailProvider: value})}
                      options={[
                        { value: 'smtp', label: 'SMTP' },
                        { value: 'sendgrid', label: 'SendGrid' },
                        { value: 'mailchimp', label: 'Mailchimp' },
                        { value: 'mailgun', label: 'Mailgun' }
                      ]}
                    />
                  </div>
                </div>

                {notificationSettings.emailProvider === 'smtp' && (
                  <div className="space-y-4 p-4 border rounded-md">
                    <h4 className="text-sm font-medium">Configuration SMTP</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="smtpServer">Serveur SMTP</Label>
                        <Input
                          id="smtpServer"
                          value={notificationSettings.smtpServer}
                          onChange={(e) => setNotificationSettings({...notificationSettings, smtpServer: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">Port SMTP</Label>
                        <Input
                          id="smtpPort"
                          value={notificationSettings.smtpPort}
                          onChange={(e) => setNotificationSettings({...notificationSettings, smtpPort: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">Nom d'utilisateur SMTP</Label>
                      <Input
                        id="smtpUsername"
                        value={notificationSettings.smtpUsername}
                        onChange={(e) => setNotificationSettings({...notificationSettings, smtpUsername: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>

                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Tester la connexion
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Types de notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="adminAlerts">Alertes administrateur</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes pour les événements importants
                    </p>
                  </div>
                  <Switch
                    id="adminAlerts"
                    checked={notificationSettings.adminAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, adminAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="userRegistrationNotifications">Inscriptions utilisateurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications lors de l'inscription de nouveaux utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="userRegistrationNotifications"
                    checked={notificationSettings.userRegistrationNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userRegistrationNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="panelCreationNotifications">Création de panels</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications lors de la création de nouveaux panels
                    </p>
                  </div>
                  <Switch
                    id="panelCreationNotifications"
                    checked={notificationSettings.panelCreationNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, panelCreationNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reportNotifications">Signalements</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications lors de signalements de contenu
                    </p>
                  </div>
                  <Switch
                    id="reportNotifications"
                    checked={notificationSettings.reportNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, reportNotifications: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleResetSettings('notifications')}
                disabled={isResetting || isSaving}
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSaveSettings('notifications')}
                disabled={isResetting || isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres de sauvegarde */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sauvegarde</CardTitle>
              <CardDescription>Configurez les paramètres de sauvegarde de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Sauvegarde automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer les sauvegardes automatiques de la base de données
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => setBackupSettings({...backupSettings, autoBackup: checked})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                  <Select
                    value={backupSettings.backupFrequency}
                    onValueChange={(value) => setBackupSettings({...backupSettings, backupFrequency: value})}
                    options={[
                      { value: 'hourly', label: 'Toutes les heures' },
                      { value: 'daily', label: 'Quotidienne' },
                      { value: 'weekly', label: 'Hebdomadaire' },
                      { value: 'monthly', label: 'Mensuelle' }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupTime">Heure de sauvegarde</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    value={backupSettings.backupTime}
                    onChange={(e) => setBackupSettings({...backupSettings, backupTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupRetention">Durée de conservation (jours)</Label>
                <Input
                  id="backupRetention"
                  type="number"
                  min={1}
                  value={backupSettings.backupRetention}
                  onChange={(e) => setBackupSettings({...backupSettings, backupRetention: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="includeUploads">Inclure les fichiers téléchargés</Label>
                  <p className="text-sm text-muted-foreground">
                    Inclure les fichiers téléchargés dans les sauvegardes
                  </p>
                </div>
                <Switch
                  id="includeUploads"
                  checked={backupSettings.includeUploads}
                  onCheckedChange={(checked) => setBackupSettings({...backupSettings, includeUploads: checked})}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Sauvegardes manuelles</h3>

                <div className="flex flex-col md:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsBackupDialogOpen(true)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Créer une sauvegarde maintenant
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsRestoreDialogOpen(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Restaurer une sauvegarde
                  </Button>
                </div>

                <div className="p-4 border rounded-md bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">Dernières sauvegardes</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Sauvegarde quotidienne</p>
                          <p className="text-xs text-muted-foreground">2023-06-15 03:00:00</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Sauvegarde hebdomadaire</p>
                          <p className="text-xs text-muted-foreground">2023-06-11 04:00:00</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Sauvegarde manuelle</p>
                          <p className="text-xs text-muted-foreground">2023-06-10 15:30:00</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleResetSettings('backup')}
                disabled={isResetting || isSaving}
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSaveSettings('backup')}
                disabled={isResetting || isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogue de sauvegarde */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une sauvegarde</DialogTitle>
            <DialogDescription>
              Créez une sauvegarde manuelle de la base de données et des fichiers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeUploadsBackup"
                className="rounded border-gray-300"
                defaultChecked
              />
              <Label htmlFor="includeUploadsBackup">Inclure les fichiers téléchargés</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeLogsBackup"
                className="rounded border-gray-300"
                defaultChecked
              />
              <Label htmlFor="includeLogsBackup">Inclure les journaux d'activité</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupDescription">Description (optionnelle)</Label>
              <Input id="backupDescription" placeholder="Sauvegarde manuelle du 15 juin 2023" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              setIsBackupDialogOpen(false)
              toast({
                title: "Sauvegarde créée",
                description: "La sauvegarde a été créée avec succès."
              })
            }}>
              Créer la sauvegarde
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de restauration */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer une sauvegarde</DialogTitle>
            <DialogDescription>
              Restaurez une sauvegarde précédente. Attention, cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Attention</p>
                  <p className="text-sm">La restauration d'une sauvegarde remplacera toutes les données actuelles. Cette action est irréversible.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupFile">Fichier de sauvegarde</Label>
              <Input id="backupFile" type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => {
              setIsRestoreDialogOpen(false)
              toast({
                title: "Sauvegarde restaurée",
                description: "La sauvegarde a été restaurée avec succès."
              })
            }}>
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
