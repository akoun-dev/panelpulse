import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Upload,
  Calendar,
  Clock,
  Users,
  FileText,
  QrCode,
  MessageSquare,
  HelpCircle,
  Check,
  ArrowLeft,
  Layers,
  Eye,
  PanelLeft,
  PanelRight
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/simple-select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'

export default function UserCreatePanel() {
  const { toast } = useToast()
  const navigate = useNavigate()

  // États du formulaire
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState(30)
  const [panelists, setPanelists] = useState([{ name: '', email: '', role: '', company: '', timeAllocated: 5 }])
  const [segments, setSegments] = useState([
    { name: 'Introduction', duration: 5 },
    { name: 'Présentations', duration: 10 },
    { name: 'Discussion', duration: 15 },
    { name: 'Questions/Réponses', duration: 10 },
    { name: 'Conclusion', duration: 5 }
  ])
  const [resources, setResources] = useState<Array<{ name: string, type: string, file?: File }>>([])
  const [preparedQA, setPreparedQA] = useState<Array<{ question: string, answer: string, panelistId: string }>>([{ question: '', answer: '', panelistId: '' }])

  // États UI
  const [activeTab, setActiveTab] = useState("infos")
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formProgress, setFormProgress] = useState(20)
  const [showPreview, setShowPreview] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'split' | 'form' | 'preview'>('form')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showTips, setShowTips] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fonction pour basculer l'affichage de la prévisualisation
  const togglePreview = () => {
    if (layoutMode === 'preview') {
      setLayoutMode('form');
    } else if (layoutMode === 'form') {
      setLayoutMode('split');
    } else {
      setLayoutMode('preview');
    }
  }

  // Fonction pour développer/réduire une section
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  }

  // Calculer la progression du formulaire en fonction des données remplies
  useEffect(() => {
    let progress = 0;

    // Étape 1: Informations de base (25%)
    if (title.trim()) progress += 10;
    if (description.trim()) progress += 5;
    if (date) progress += 5;
    if (duration > 0) progress += 5;

    // Étape 2: Panélistes (25%)
    const validPanelists = panelists.filter(p => p.name && p.email);
    progress += Math.min(25, (validPanelists.length / Math.max(1, panelists.length)) * 25);

    // Étape 3: Structure (20%)
    const validSegments = segments.filter(s => s.name && s.duration > 0);
    progress += Math.min(20, (validSegments.length / Math.max(1, segments.length)) * 20);

    // Étape 4: Questions/Réponses (20%)
    const validQAs = preparedQA.filter(qa => qa.question && qa.panelistId);
    if (validQAs.length > 0) {
      progress += Math.min(20, (validQAs.length / preparedQA.length) * 20);
    }

    // Étape 5: Ressources (10%)
    if (resources.length > 0) {
      progress += 10;
    }

    setFormProgress(Math.min(100, Math.max(5, Math.round(progress))));
  }, [title, description, date, duration, panelists, segments, preparedQA, resources]);

  const addPanelist = () => setPanelists([...panelists, { name: '', email: '', role: '', company: '', timeAllocated: 5 }])
  const removePanelist = (index: number) => {
    const newPanelists = [...panelists]
    newPanelists.splice(index, 1)
    setPanelists(newPanelists)
  }

  const addSegment = () => setSegments([...segments, { name: '', duration: 5 }])
  const removeSegment = (index: number) => {
    const newSegments = [...segments]
    newSegments.splice(index, 1)
    setSegments(newSegments)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const fileType = file.type.split('/')[0] === 'image'
        ? 'image'
        : file.type.includes('pdf')
          ? 'pdf'
          : 'document'

      setResources([...resources, {
        name: file.name,
        type: fileType,
        file: file
      }])
    }
  }

  const removeResource = (index: number) => {
    const newResources = [...resources]
    newResources.splice(index, 1)
    setResources(newResources)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const addPreparedQA = () => setPreparedQA([...preparedQA, { question: '', answer: '', panelistId: '' }])
  const removePreparedQA = (index: number) => {
    const newPreparedQA = [...preparedQA]
    newPreparedQA.splice(index, 1)
    setPreparedQA(newPreparedQA)
  }

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    // Vérifications de base
    if (!title.trim()) return false;
    if (!date) return false;
    if (duration <= 0) return false;

    // Vérifier qu'il y a au moins un panéliste valide
    const hasValidPanelist = panelists.some(p => p.name && p.email);
    if (!hasValidPanelist) return false;

    // Vérifier qu'il y a au moins un segment valide
    const hasValidSegment = segments.some(s => s.name && s.duration > 0);
    if (!hasValidSegment) return false;

    return true;
  };

  // Passer à l'étape suivante
  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);

      // Mettre à jour l'onglet actif en fonction de l'étape
      const tabs = ["infos", "panelists", "structure", "qa", "resources"];
      setActiveTab(tabs[currentStep]);
    }
  };

  // Revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);

      // Mettre à jour l'onglet actif en fonction de l'étape
      const tabs = ["infos", "panelists", "structure", "qa", "resources"];
      setActiveTab(tabs[currentStep - 2]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires avant de créer le panel."
      });
      return;
    }

    setIsSaving(true);

    // Filtrer les questions/réponses vides et ajouter le nom du panéliste
    const filteredQA = preparedQA
      .filter(qa => qa.question.trim() !== '' && qa.panelistId !== '')
      .map(qa => {
        const panelistIndex = parseInt(qa.panelistId);
        const panelist = panelists[panelistIndex];
        return {
          ...qa,
          panelistName: panelist?.name || ''
        };
      });

    // Construire l'objet panel à envoyer à l'API
    const panelData = {
      title,
      description,
      date,
      duration,
      panelists: panelists.filter(p => p.name && p.email), // Filtrer les panélistes vides
      segments: segments.filter(s => s.name && s.duration > 0), // Filtrer les segments vides
      resources,
      preparedQA: filteredQA,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    // TODO: Implémenter l'appel API pour sauvegarder le panel
    console.log('Données du panel à enregistrer:', panelData);

    // Simuler un délai d'enregistrement
    setTimeout(() => {
      setIsSaving(false);

      toast({
        title: "Panel créé avec succès",
        description: "Votre panel a été créé et est prêt à être utilisé.",
      });

      navigate('/user/my-panels');
    }, 1500);
  };

  // Composant de prévisualisation du panel
  const PanelPreview = () => {
    // Formater la date
    const formatDate = (dateString: string) => {
      if (!dateString) return "Date non définie";
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Calculer la durée totale des segments
    const totalSegmentsDuration = segments.reduce((total, segment) => total + segment.duration, 0);

    // Vérifier si la durée des segments correspond à la durée totale du panel
    const durationMatch = totalSegmentsDuration === duration;

    return (
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-primary text-primary-foreground p-4">
          <h2 className="text-xl font-bold">{title || "Titre du panel"}</h2>
          <p className="text-sm opacity-80">{formatDate(date)}</p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="mt-1">{description || "Aucune description fournie"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Durée</h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-primary" />
              <span>{duration} minutes</span>
              {!durationMatch && (
                <span className="text-xs text-amber-500">
                  (Segments: {totalSegmentsDuration} min)
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Panélistes ({panelists.filter(p => p.name).length})</h3>
            <div className="mt-2 space-y-2">
              {panelists.filter(p => p.name).map((panelist, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted/20 rounded-md">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{panelist.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{panelist.name}</p>
                    <p className="text-xs text-muted-foreground">{panelist.role} {panelist.company ? `@ ${panelist.company}` : ''}</p>
                  </div>
                </div>
              ))}
              {panelists.filter(p => p.name).length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun panéliste ajouté</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Structure</h3>
            <div className="mt-2 relative border-l-2 border-primary/30 pl-4 space-y-3">
              {segments.filter(s => s.name).map((segment, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <div className="bg-muted/20 p-2 rounded-md">
                    <p className="font-medium">{segment.name}</p>
                    <p className="text-xs text-muted-foreground">{segment.duration} minutes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {preparedQA.filter(qa => qa.question).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Questions préparées</h3>
              <div className="mt-2 space-y-2">
                {preparedQA.filter(qa => qa.question).map((qa, index) => (
                  <div key={index} className="bg-muted/20 p-2 rounded-md">
                    <p className="font-medium">{qa.question}</p>
                    {qa.panelistId && (
                      <p className="text-xs text-primary">
                        Pour: {panelists[parseInt(qa.panelistId)]?.name || "Panéliste non spécifié"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resources.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Ressources ({resources.length})</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted/20 p-2 rounded-md">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm truncate">{resource.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              <span>Un QR code sera généré automatiquement</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* En-tête */}
      <div className="bg-primary text-primary-foreground p-4 dark:bg-gray-800 sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary-foreground"
              onClick={() => navigate('/user/my-panels')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Créer un nouveau panel</h1>
              <p className="text-primary-foreground/80 text-sm">
                Vous êtes le modérateur de ce panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium">Progression</div>
              <div className="text-xs text-primary-foreground/80">{formProgress}% complété</div>
            </div>
            <div className="w-24 hidden md:block">
              <Progress value={formProgress} className="h-2" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary-foreground"
              onClick={togglePreview}
              title={layoutMode === 'preview' ? 'Afficher le formulaire' :
                    layoutMode === 'form' ? 'Afficher la prévisualisation' :
                    'Plein écran'}
            >
              {layoutMode === 'preview' ? (
                <PanelLeft className="h-5 w-5" />
              ) : layoutMode === 'form' ? (
                <Eye className="h-5 w-5" />
              ) : (
                <PanelRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal avec mise en page adaptative */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Panneau de gauche (formulaire) - Masqué en mode prévisualisation */}
        <div className={`
          ${layoutMode === 'preview' ? 'hidden' : layoutMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}
          flex-1 flex flex-col
        `}>
          <Tabs defaultValue="infos" className="w-full flex-1 flex flex-col" onValueChange={setActiveTab}>
            {/* Navigation par onglets */}
            <div className="border-b sticky top-[73px] bg-background z-10">
              <div className="max-w-screen-xl mx-auto">
                <TabsList className="w-full rounded-none border-0 bg-transparent h-auto overflow-x-auto flex-nowrap justify-start">
                  <TabsTrigger
                    value="infos"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground px-6 py-3 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-medium">1</span>
                      </div>
                      <Calendar className="h-4 w-4" />
                      <span>Informations</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="panelists"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground px-6 py-3 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-medium">2</span>
                      </div>
                      <Users className="h-4 w-4" />
                      <span>Panélistes</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="structure"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground px-6 py-3 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-medium">3</span>
                      </div>
                      <Layers className="h-4 w-4" />
                      <span>Structure</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="qa"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground px-6 py-3 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-medium">4</span>
                      </div>
                      <MessageSquare className="h-4 w-4" />
                      <span>Questions</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground px-6 py-3 flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-medium">5</span>
                      </div>
                      <FileText className="h-4 w-4" />
                      <span>Ressources</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="md:hidden px-4 py-2">
                <Progress value={formProgress} className="h-2" />
                <div className="flex justify-between mt-1">
                  <div className="text-xs text-muted-foreground">Progression</div>
                  <div className="text-xs font-medium">{formProgress}%</div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              {/* Onglet Informations */}
          <TabsContent value="infos" className="flex-1">
            <div className="max-w-screen-xl mx-auto p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du panel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Décrivez l'objectif et le contenu de ce panel..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date et heure</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="15"
                    max="240"
                    required
                  />
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-md mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <QrCode className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">QR Code du panel</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Un QR code unique sera automatiquement généré pour ce panel. Les participants pourront le scanner pour accéder au panel et soumettre leurs questions.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Panélistes */}
          <TabsContent value="panelists" className="flex-1">
            <div className="max-w-screen-xl mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Panélistes</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez les participants qui interviendront lors de ce panel
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPanelist}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un panéliste
                </Button>
              </div>

              <div className="space-y-4">
                {panelists.map((panelist, index) => (
                  <div key={index} className="border p-4 rounded-md mb-4 bg-white shadow-sm">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Nom</Label>
                        <Input
                          value={panelist.name}
                          onChange={(e) => {
                            const newPanelists = [...panelists]
                            newPanelists[index].name = e.target.value
                            setPanelists(newPanelists)
                          }}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={panelist.email}
                          onChange={(e) => {
                            const newPanelists = [...panelists]
                            newPanelists[index].email = e.target.value
                            setPanelists(newPanelists)
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Rôle</Label>
                        <Input
                          value={panelist.role}
                          onChange={(e) => {
                            const newPanelists = [...panelists]
                            newPanelists[index].role = e.target.value
                            setPanelists(newPanelists)
                          }}
                          placeholder="ex: Directeur Marketing"
                        />
                      </div>
                      <div>
                        <Label>Organisation</Label>
                        <Input
                          value={panelist.company}
                          onChange={(e) => {
                            const newPanelists = [...panelists]
                            newPanelists[index].company = e.target.value
                            setPanelists(newPanelists)
                          }}
                          placeholder="ex: Entreprise XYZ"
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <Label>Temps de parole alloué (minutes)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={panelist.timeAllocated}
                          onChange={(e) => {
                            const newPanelists = [...panelists]
                            newPanelists[index].timeAllocated = Number(e.target.value)
                            setPanelists(newPanelists)
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removePanelist(index)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Onglet Structure */}
          <TabsContent value="structure" className="flex-1">
            <div className="max-w-screen-xl mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Structure du panel</h3>
                  <p className="text-sm text-muted-foreground">
                    Définissez les différents segments de votre panel
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSegment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter segment
                </Button>
              </div>

              <div className="space-y-4">
                {segments.map((segment, index) => (
                  <div key={index} className="border p-4 rounded-md bg-white shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nom du segment</Label>
                        <Input
                          value={segment.name}
                          onChange={(e) => {
                            const newSegments = [...segments]
                            newSegments[index].name = e.target.value
                            setSegments(newSegments)
                          }}
                          placeholder="ex: Introduction, Discussion, Q&A..."
                        />
                      </div>
                      <div>
                        <Label>Durée (min)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={segment.duration}
                            onChange={(e) => {
                              const newSegments = [...segments]
                              newSegments[index].duration = Number(e.target.value)
                              setSegments(newSegments)
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSegment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Onglet Questions/Réponses */}
          <TabsContent value="qa" className="flex-1">
            <div className="max-w-screen-xl mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Questions et réponses préparées</h3>
                  <p className="text-sm text-muted-foreground">
                    Préparez des questions et réponses à l'avance pour faciliter la discussion
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPreparedQA}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Q/R
                </Button>
              </div>

              <div className="space-y-4">
                {preparedQA.map((qa, index) => (
                  <div key={index} className="border p-4 rounded-md bg-white shadow-sm">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Question
                          </Label>
                          <Textarea
                            value={qa.question}
                            onChange={(e) => {
                              const newPreparedQA = [...preparedQA]
                              newPreparedQA[index].question = e.target.value
                              setPreparedQA(newPreparedQA)
                            }}
                            placeholder="Saisissez une question préparée..."
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Destinée à
                          </Label>
                          <div className="mt-2">
                            <Select
                              value={qa.panelistId}
                              onValueChange={(value: string) => {
                                const newPreparedQA = [...preparedQA]
                                newPreparedQA[index].panelistId = value
                                setPreparedQA(newPreparedQA)
                              }}
                              placeholder="Sélectionnez un panéliste"
                              options={panelists.map((panelist, pIndex) => ({
                                value: panelist.name ? pIndex.toString() : '',
                                label: panelist.name || 'Sélectionnez un panéliste',
                                disabled: !panelist.name
                              }))}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cette question sera visible par ce panéliste lors de sa connexion
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          Réponse
                        </Label>
                        <Textarea
                          value={qa.answer}
                          onChange={(e) => {
                            const newPreparedQA = [...preparedQA]
                            newPreparedQA[index].answer = e.target.value
                            setPreparedQA(newPreparedQA)
                          }}
                          placeholder="Saisissez une réponse préparée..."
                          className="mt-2"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePreparedQA(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {preparedQA.length === 0 && (
                  <div className="text-center py-8 border rounded-md bg-muted/10">
                    <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Aucune question/réponse préparée
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={addPreparedQA}
                    >
                      Ajouter une question/réponse
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-muted/20 p-4 rounded-md mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Pourquoi préparer des questions et réponses ?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Les questions et réponses préparées permettent de :
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Anticiper les sujets importants à aborder</li>
                  <li>Assurer une discussion fluide et structurée</li>
                  <li>Préparer les panélistes aux questions potentielles</li>
                  <li>Avoir des réponses de qualité prêtes à l'emploi</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Ressources */}
          <TabsContent value="resources" className="flex-1">
            <div className="max-w-screen-xl mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Ressources partagées</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez des documents à partager avec les panélistes
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-4">
                {resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <div key={index} className="flex items-center p-3 border rounded-md bg-white shadow-sm">
                      <div className={`mr-3 text-xl w-10 h-10 flex items-center justify-center rounded-md ${
                        resource.type === 'pdf' ? 'bg-red-50 text-red-500' :
                        resource.type === 'image' ? 'bg-green-50 text-green-500' :
                        'bg-blue-50 text-blue-500'
                      }`}>
                        {resource.type === 'pdf' ? '📄' :
                         resource.type === 'image' ? '🖼️' : '📝'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {resource.type.toUpperCase()}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-md bg-muted/10">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Aucune ressource ajoutée
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={triggerFileInput}
                    >
                      Ajouter un document
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

              {/* Boutons d'action */}
              <div className="border-t mt-auto sticky bottom-0 bg-background z-10 shadow-sm">
                <div className="max-w-screen-xl mx-auto p-4 flex justify-between md:justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/user/my-panels')}
                    className="px-6"
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-6 hidden md:flex"
                      disabled={isSaving}
                      onClick={() => {
                        // Enregistrer comme brouillon
                        toast({
                          title: "Brouillon enregistré",
                          description: "Votre panel a été sauvegardé comme brouillon."
                        });
                      }}
                    >
                      Enregistrer comme brouillon
                    </Button>
                    <Button
                      type="submit"
                      className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Créer le panel
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Tabs>
        </div>

        {/* Panneau de droite (prévisualisation) - Masqué en mode formulaire */}
        <div className={`
          ${layoutMode === 'form' ? 'hidden' : layoutMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}
          flex-1 p-6 bg-muted/10 border-l overflow-auto
        `}>
          <div className="sticky top-[80px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Prévisualisation</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={togglePreview}
              >
                {layoutMode === 'preview' ? (
                  <>
                    <PanelLeft className="h-4 w-4" />
                    <span>Afficher le formulaire</span>
                  </>
                ) : (
                  <>
                    <PanelRight className="h-4 w-4" />
                    <span>Plein écran</span>
                  </>
                )}
              </Button>
            </div>
            <PanelPreview />
          </div>
        </div>
      </div>
    </div>
  )
}
