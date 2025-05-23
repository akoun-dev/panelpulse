import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Panel as UIPanel, Panelist as UIPanelist, PreparedQA as UIPreparedQA } from '@/types';

// Types pour les panélistes
export interface Panelist {
  id?: string;
  panel_id?: string;
  name: string;
  email: string;
  role: string;
  company: string;
  time_allocated: number;
  invitation_sent?: boolean;
  invitation_accepted?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Types pour les segments
export interface PanelSegment {
  id?: string;
  panel_id?: string;
  name: string;
  duration: number;
  segment_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Types pour les questions préparées
export interface PreparedQuestion {
  id?: string;
  panel_id?: string;
  panelist_id?: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}

// Types pour les ressources
export interface PanelResource {
  id?: string;
  panel_id?: string;
  name: string;
  type: string;
  url?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
}

// Type pour le panel
export interface Panel {
  id?: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  creator_id?: string;
  status: 'draft' | 'published' | 'archived' | 'completed' | 'active';
  qr_code_url?: string;
  access_code?: string;
  created_at?: string;
  updated_at?: string;
  panelists?: Panelist[];
  segments?: PanelSegment[];
  prepared_questions?: PreparedQuestion[];
  resources?: PanelResource[];
}

// Type pour la création d'un panel
export interface PanelInput {
  title: string;
  description: string;
  date: string;
  duration: number;
  panelists: {
    name: string;
    email: string;
    role: string;
    company: string;
    timeAllocated: number;
  }[];
  segments: {
    name: string;
    duration: number;
  }[];
  preparedQA: {
    question: string;
    answer: string;
    panelistId: string;
  }[];
  resources: {
    name: string;
    type: string;
    file?: File;
  }[];
  status?: 'draft' | 'published';
}

/**
 * Crée un nouveau panel
 */
export const createPanel = async (panelData: PanelInput): Promise<{ success: boolean; panel_id?: string; message: string }> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Vous devez être connecté pour créer un panel."
      };
    }

    // Générer un code d'accès aléatoire
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Créer le panel
    const { data: panel, error: panelError } = await supabase
      .from('panels')
      .insert([{
        title: panelData.title,
        description: panelData.description,
        date: panelData.date,
        duration: panelData.duration,
        creator_id: user.id,
        status: panelData.status || 'draft',
        access_code: accessCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (panelError) {
      console.error('Erreur lors de la création du panel:', panelError);
      return {
        success: false,
        message: `Erreur lors de la création du panel: ${panelError.message}`
      };
    }

    const panelId = panel.id;

    // Ajouter les panélistes
    if (panelData.panelists && panelData.panelists.length > 0) {
      const panelistsToInsert = panelData.panelists
        .filter(p => p.name && p.email) // Filtrer les panélistes vides
        .map(p => ({
          panel_id: panelId,
          name: p.name,
          email: p.email,
          role: p.role || '',
          company: p.company || '',
          time_allocated: p.timeAllocated || 5,
          invitation_sent: false,
          invitation_accepted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (panelistsToInsert.length > 0) {
        const { error: panelistsError } = await supabase
          .from('panelists')
          .insert(panelistsToInsert);

        if (panelistsError) {
          console.error('Erreur lors de l\'ajout des panélistes:', panelistsError);
        }
      }
    }

    // Ajouter les segments
    if (panelData.segments && panelData.segments.length > 0) {
      const segmentsToInsert = panelData.segments
        .filter(s => s.name && s.duration > 0) // Filtrer les segments vides
        .map((s, index) => ({
          panel_id: panelId,
          name: s.name,
          duration: s.duration,
          segment_order: index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (segmentsToInsert.length > 0) {
        const { error: segmentsError } = await supabase
          .from('panel_segments')
          .insert(segmentsToInsert);

        if (segmentsError) {
          console.error('Erreur lors de l\'ajout des segments:', segmentsError);
        }
      }
    }

    // Récupérer les IDs des panélistes pour les questions préparées
    let panelistsMap: Record<string, string> = {};

    if (panelData.preparedQA && panelData.preparedQA.length > 0) {
      const { data: panelists, error: panelistsError } = await supabase
        .from('panelists')
        .select('id, name')
        .eq('panel_id', panelId);

      if (panelistsError) {
        console.error('Erreur lors de la récupération des panélistes:', panelistsError);
      } else if (panelists) {
        // Créer un mapping entre les noms des panélistes et leurs IDs
        panelData.panelists.forEach((p, index) => {
          const panelist = panelists.find(dbP => dbP.name === p.name);
          if (panelist) {
            panelistsMap[index.toString()] = panelist.id;
          }
        });
      }
    }

    // Ajouter les questions préparées
    if (panelData.preparedQA && panelData.preparedQA.length > 0) {
      const questionsToInsert = panelData.preparedQA
        .filter(q => q.question && q.panelistId) // Filtrer les questions vides
        .map(q => ({
          panel_id: panelId,
          panelist_id: panelistsMap[q.panelistId] || null,
          question: q.question,
          answer: q.answer || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (questionsToInsert.length > 0) {
        const { error: questionsError } = await supabase
          .from('prepared_questions')
          .insert(questionsToInsert);

        if (questionsError) {
          console.error('Erreur lors de l\'ajout des questions préparées:', questionsError);
        }
      }
    }

    // Ajouter les ressources
    if (panelData.resources && panelData.resources.length > 0) {
      for (const resource of panelData.resources) {
        if (resource.file) {
          // Générer un nom de fichier unique
          const fileExt = resource.file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `panels/${panelId}/resources/${fileName}`;

          // Uploader le fichier
          const { error: uploadError } = await supabase.storage
            .from('panel-resources')
            .upload(filePath, resource.file);

          if (uploadError) {
            console.error('Erreur lors de l\'upload du fichier:', uploadError);
            continue;
          }

          // Récupérer l'URL publique du fichier
          const { data: urlData } = await supabase.storage
            .from('panel-resources')
            .getPublicUrl(filePath);

          // Ajouter la ressource à la base de données
          const { error: resourceError } = await supabase
            .from('panel_resources')
            .insert([{
              panel_id: panelId,
              name: resource.name,
              type: resource.type,
              url: urlData.publicUrl,
              file_path: filePath,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (resourceError) {
            console.error('Erreur lors de l\'ajout de la ressource:', resourceError);
          }
        }
      }
    }

    // Générer un QR code pour le panel avec l'URL publique
    const publicUrl = `${window.location.origin}/panel/${panelId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;

    console.log("URL publique générée pour le panel:", publicUrl);

    // Mettre à jour le panel avec l'URL du QR code
    const { error: updateError } = await supabase
      .from('panels')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', panelId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du QR code:', updateError);
    }

    // Mettre à jour le compteur de panels créés pour l'utilisateur
    const { error: profileError } = await supabase.rpc('increment_panels_created', {
      user_id: user.id
    });

    if (profileError) {
      console.error('Erreur lors de la mise à jour du compteur de panels:', profileError);
    }

    return {
      success: true,
      panel_id: panelId,
      message: "Panel créé avec succès."
    };
  } catch (error) {
    console.error('Erreur lors de la création du panel:', error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création du panel."
    };
  }
};

/**
 * Récupère tous les panels de l'utilisateur (en tant que créateur ou panéliste)
 */
export const getUserPanels = async (): Promise<UIPanel[]> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return [];
    }

    // Récupérer les panels où l'utilisateur est créateur
    const { data: createdPanels, error: createdPanelsError } = await supabase
      .from('panels')
      .select(`
        id,
        title,
        description,
        date,
        duration,
        creator_id,
        status,
        qr_code_url,
        access_code,
        created_at,
        updated_at
      `)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (createdPanelsError) {
      console.error('Erreur lors de la récupération des panels créés:', createdPanelsError);
      return [];
    }

    // Récupérer les panels où l'utilisateur est panéliste
    const { data: panelistData, error: panelistError } = await supabase
      .from('panelists')
      .select(`
        id,
        panel_id,
        panels:panel_id (
          id,
          title,
          description,
          date,
          duration,
          creator_id,
          status,
          qr_code_url,
          access_code,
          created_at,
          updated_at
        )
      `)
      .eq('email', user.email);

    if (panelistError) {
      console.error('Erreur lors de la récupération des panels où l\'utilisateur est panéliste:', panelistError);
      return [];
    }

    // Extraire les panels où l'utilisateur est panéliste
    const panelistPanels = panelistData
      .filter(item => item.panels) // Filtrer les entrées nulles
      .map(item => item.panels);

    // Récupérer les panélistes pour chaque panel
    const allPanels = [...createdPanels, ...panelistPanels];
    const panelsWithDetails = await Promise.all(allPanels.map(async (panel) => {
      // Récupérer les panélistes
      const { data: panelists, error: panelistsError } = await supabase
        .from('panelists')
        .select('*')
        .eq('panel_id', panel.id);

      if (panelistsError) {
        console.error(`Erreur lors de la récupération des panélistes pour le panel ${panel.id}:`, panelistsError);
      }

      // Récupérer les questions préparées
      const { data: preparedQuestions, error: questionsError } = await supabase
        .from('prepared_questions')
        .select(`
          id,
          panel_id,
          panelist_id,
          question,
          answer,
          created_at,
          updated_at,
          panelists:panelist_id (
            id,
            name
          )
        `)
        .eq('panel_id', panel.id);

      if (questionsError) {
        console.error(`Erreur lors de la récupération des questions préparées pour le panel ${panel.id}:`, questionsError);
      }

      // Transformer les données pour correspondre au format attendu par l'UI
      const uiPanelists: UIPanelist[] = panelists?.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        company: p.company,
        timeAllocated: p.time_allocated,
        status: p.invitation_accepted ? 'active' : 'inactive'
      })) || [];

      const uiPreparedQA: UIPreparedQA[] = preparedQuestions?.map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        panelistId: q.panelist_id,
        panelistName: q.panelists?.name || 'Panéliste inconnu',
        isVisible: true // Par défaut, toutes les questions sont visibles
      })) || [];

      // Déterminer le rôle de l'utilisateur dans ce panel
      const userRole = panel.creator_id === user.id
        ? 'moderator'
        : panelistData.some(p => p.panel_id === panel.id)
          ? 'panelist'
          : undefined;

      // Convertir le panel au format attendu par l'UI
      const uiPanel: UIPanel = {
        id: panel.id,
        title: panel.title,
        description: panel.description,
        status: panel.status,
        createdAt: panel.created_at,
        updatedAt: panel.updated_at,
        ownerId: panel.creator_id,
        userRole,
        panelists: uiPanelists,
        preparedQA: uiPreparedQA
      };

      return uiPanel;
    }));

    return panelsWithDetails;
  } catch (error) {
    console.error('Erreur lors de la récupération des panels:', error);
    return [];
  }
};

/**
 * Récupère les détails d'un panel spécifique
 */
export const getPanelDetails = async (panelId: string): Promise<{
  panel: Panel | null;
  panelists: Panelist[];
  preparedQuestions: PreparedQuestion[];
  resources: PanelResource[];
  segments: PanelSegment[];
}> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return {
        panel: null,
        panelists: [],
        preparedQuestions: [],
        resources: [],
        segments: []
      };
    }

    // Récupérer le panel
    const { data: panel, error: panelError } = await supabase
      .from('panels')
      .select('*')
      .eq('id', panelId)
      .single();

    if (panelError) {
      console.error(`Erreur lors de la récupération du panel ${panelId}:`, panelError);
      return {
        panel: null,
        panelists: [],
        preparedQuestions: [],
        resources: [],
        segments: []
      };
    }

    // Récupérer les panélistes
    const { data: panelists, error: panelistsError } = await supabase
      .from('panelists')
      .select('*')
      .eq('panel_id', panelId);

    if (panelistsError) {
      console.error(`Erreur lors de la récupération des panélistes pour le panel ${panelId}:`, panelistsError);
      return {
        panel,
        panelists: [],
        preparedQuestions: [],
        resources: [],
        segments: []
      };
    }

    // Récupérer les questions préparées
    const { data: preparedQuestions, error: questionsError } = await supabase
      .from('prepared_questions')
      .select(`
        *,
        panelists:panelist_id (
          id,
          name
        )
      `)
      .eq('panel_id', panelId);

    if (questionsError) {
      console.error(`Erreur lors de la récupération des questions préparées pour le panel ${panelId}:`, questionsError);
      return {
        panel,
        panelists: panelists || [],
        preparedQuestions: [],
        resources: [],
        segments: []
      };
    }

    // Récupérer les ressources
    const { data: resources, error: resourcesError } = await supabase
      .from('panel_resources')
      .select('*')
      .eq('panel_id', panelId);

    if (resourcesError) {
      console.error(`Erreur lors de la récupération des ressources pour le panel ${panelId}:`, resourcesError);
      return {
        panel,
        panelists: panelists || [],
        preparedQuestions: preparedQuestions || [],
        resources: [],
        segments: []
      };
    }

    // Récupérer les segments
    const { data: segments, error: segmentsError } = await supabase
      .from('panel_segments')
      .select('*')
      .eq('panel_id', panelId)
      .order('segment_order', { ascending: true });

    if (segmentsError) {
      console.error(`Erreur lors de la récupération des segments pour le panel ${panelId}:`, segmentsError);
      return {
        panel,
        panelists: panelists || [],
        preparedQuestions: preparedQuestions || [],
        resources: resources || [],
        segments: []
      };
    }

    return {
      panel,
      panelists: panelists || [],
      preparedQuestions: preparedQuestions || [],
      resources: resources || [],
      segments: segments || []
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails du panel ${panelId}:`, error);
    return {
      panel: null,
      panelists: [],
      preparedQuestions: [],
      resources: [],
      segments: []
    };
  }
};

/**
 * Récupère les détails d'un panel pour modification
 */
export const getPanelForEdit = async (panelId: string): Promise<PanelInput | null> => {
  try {
    // Récupérer les détails du panel
    const {
      panel,
      panelists,
      preparedQuestions,
      resources,
      segments
    } = await getPanelDetails(panelId);

    if (!panel) {
      return null;
    }

    // Convertir les données au format attendu par le formulaire d'édition
    const panelInput: PanelInput = {
      title: panel.title,
      description: panel.description || '',
      date: panel.date,
      duration: panel.duration,
      status: panel.status as 'draft' | 'published',

      // Convertir les panélistes
      panelists: panelists.map(p => ({
        name: p.name,
        email: p.email,
        role: p.role || '',
        company: p.company || '',
        timeAllocated: p.time_allocated
      })),

      // Convertir les segments
      segments: segments.map(s => ({
        name: s.name,
        duration: s.duration
      })),

      // Convertir les questions préparées
      preparedQA: preparedQuestions.map(q => {
        // Trouver l'index du panéliste dans le tableau des panélistes
        const panelistIndex = panelists.findIndex(p => p.id === q.panelist_id);

        return {
          question: q.question,
          answer: q.answer || '',
          panelistId: panelistIndex >= 0 ? panelistIndex.toString() : ''
        };
      }),

      // Convertir les ressources (sans les fichiers)
      resources: resources.map(r => ({
        name: r.name,
        type: r.type,
        // Pas de fichier car on ne peut pas récupérer les fichiers déjà uploadés
      }))
    };

    return panelInput;
  } catch (error) {
    console.error(`Erreur lors de la récupération du panel pour modification ${panelId}:`, error);
    return null;
  }
};

/**
 * Met à jour un panel existant
 */
export const updatePanel = async (
  panelId: string,
  panelData: Partial<Panel>,
  panelistsData?: Partial<Panelist>[],
  preparedQuestionsData?: Partial<PreparedQuestion>[],
  resourcesData?: Partial<PanelResource>[],
  segmentsData?: Partial<PanelSegment>[]
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("DÉBOGAGE UPDATEPANEL - Début de la fonction updatePanel");
    console.log("DÉBOGAGE UPDATEPANEL - panelId:", panelId);
    console.log("DÉBOGAGE UPDATEPANEL - panelData:", panelData);
    console.log("DÉBOGAGE UPDATEPANEL - panelistsData:", panelistsData);
    console.log("DÉBOGAGE UPDATEPANEL - preparedQuestionsData:", preparedQuestionsData);
    console.log("DÉBOGAGE UPDATEPANEL - segmentsData:", segmentsData);

    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Vous devez être connecté pour mettre à jour un panel."
      };
    }

    // Vérifier que l'utilisateur est le créateur du panel
    const { data: panel, error: panelCheckError } = await supabase
      .from('panels')
      .select('creator_id')
      .eq('id', panelId)
      .single();

    if (panelCheckError) {
      console.error(`Erreur lors de la vérification du panel ${panelId}:`, panelCheckError);
      return {
        success: false,
        message: "Impossible de vérifier les droits d'accès au panel."
      };
    }

    if (panel.creator_id !== user.id) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à modifier ce panel."
      };
    }

    // Mettre à jour le panel
    if (Object.keys(panelData).length > 0) {
      // S'assurer que nous n'envoyons que des propriétés valides à la table panels
      const validPanelData = {
        title: panelData.title,
        description: panelData.description,
        status: panelData.status,
        duration: panelData.duration,
        date: panelData.date,
        updated_at: new Date().toISOString()
      };

      // Filtrer les propriétés undefined
      const filteredPanelData = Object.fromEntries(
        Object.entries(validPanelData).filter(([_, v]) => v !== undefined)
      );

      const { error: updateError } = await supabase
        .from('panels')
        .update(filteredPanelData)
        .eq('id', panelId);

      if (updateError) {
        console.error(`Erreur lors de la mise à jour du panel ${panelId}:`, updateError);
        return {
          success: false,
          message: `Erreur lors de la mise à jour du panel: ${updateError.message}`
        };
      }
    }

    // Mettre à jour les panélistes
    if (panelistsData && panelistsData.length > 0) {
      // 1. Récupérer tous les panélistes existants pour ce panel
      const { data: existingPanelists, error: panelistsQueryError } = await supabase
        .from('panelists')
        .select('id, email')
        .eq('panel_id', panelId);

      if (panelistsQueryError) {
        console.error(`Erreur lors de la récupération des panélistes existants:`, panelistsQueryError);
      }

      // Créer un mapping des panélistes existants par email
      const existingPanelistsMap = new Map();
      if (existingPanelists) {
        existingPanelists.forEach(p => existingPanelistsMap.set(p.email, p.id));
      }

      // 2. Traiter chaque panéliste
      for (const panelist of panelistsData) {
        // Vérifier si ce panéliste existe déjà (par email)
        const existingId = existingPanelistsMap.get(panelist.email);

        if (existingId) {
          // Mettre à jour un panéliste existant
          const { error: updateError } = await supabase
            .from('panelists')
            .update({
              ...panelist,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingId);

          if (updateError) {
            console.error(`Erreur lors de la mise à jour du panéliste ${existingId}:`, updateError);
          }

          // Supprimer cet email de la map pour suivre ceux qui ont été traités
          existingPanelistsMap.delete(panelist.email);
        } else {
          // Ajouter un nouveau panéliste
          const { error: insertError } = await supabase
            .from('panelists')
            .insert({
              ...panelist,
              panel_id: panelId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`Erreur lors de l'ajout d'un panéliste:`, insertError);
          }
        }
      }

      // 3. Supprimer les panélistes qui ne sont plus dans la liste
      // (Optionnel - décommenter si vous voulez supprimer les panélistes qui ont été retirés)
      /*
      if (existingPanelistsMap.size > 0) {
        const idsToDelete = Array.from(existingPanelistsMap.values());
        const { error: deleteError } = await supabase
          .from('panelists')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error(`Erreur lors de la suppression des panélistes:`, deleteError);
        }
      }
      */
    }

    // Mettre à jour les segments
    if (segmentsData && segmentsData.length > 0) {
      // 1. Supprimer tous les segments existants pour ce panel
      // Cette approche est plus simple car les segments n'ont pas d'identifiant naturel comme l'email pour les panélistes
      const { error: deleteError } = await supabase
        .from('panel_segments')
        .delete()
        .eq('panel_id', panelId);

      if (deleteError) {
        console.error(`Erreur lors de la suppression des segments existants:`, deleteError);
      }

      // 2. Ajouter tous les segments comme nouveaux
      const segmentsToInsert = segmentsData.map((segment, index) => ({
        ...segment,
        panel_id: panelId,
        segment_order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('panel_segments')
        .insert(segmentsToInsert);

      if (insertError) {
        console.error(`Erreur lors de l'ajout des segments:`, insertError);
      }
    }

    // Mettre à jour les questions préparées
    if (preparedQuestionsData && preparedQuestionsData.length > 0) {
      console.log("Début de la mise à jour des questions préparées pour le panel:", panelId);
      console.log("Données reçues:", preparedQuestionsData);

      // Vérifier si la table prepared_questions existe
      try {
        // Vérifier si la table existe en essayant de récupérer une ligne
        const { data: tableCheck, error: tableCheckError } = await supabase
          .from('prepared_questions')
          .select('count(*)', { count: 'exact', head: true });

        // Si la table n'existe pas, on arrête ici
        if (tableCheckError && tableCheckError.message && tableCheckError.message.includes("does not exist")) {
          console.error("ERREUR: La table prepared_questions n'existe pas ou n'est pas accessible:", tableCheckError);
          console.log("Les questions préparées ne seront pas enregistrées. Veuillez créer la table prepared_questions.");
          return {
            success: true,
            message: "Panel mis à jour avec succès (sans les questions préparées)."
          };
        }

        // 1. Récupérer toutes les questions préparées existantes pour ce panel
        const { data: existingQuestions, error: questionsQueryError } = await supabase
          .from('prepared_questions')
          .select('id, question, answer, panelist_id')
          .eq('panel_id', panelId);

        if (questionsQueryError) {
          if (questionsQueryError.message && questionsQueryError.message.includes("does not exist")) {
            console.error("ERREUR: La table prepared_questions n'existe pas ou n'est pas accessible:", questionsQueryError);
            console.log("Les questions préparées ne seront pas enregistrées. Veuillez créer la table prepared_questions.");
            return {
              success: true,
              message: "Panel mis à jour avec succès (sans les questions préparées)."
            };
          }
          console.error(`Erreur lors de la récupération des questions préparées existantes:`, questionsQueryError);
        }

        console.log("Questions préparées existantes:", existingQuestions);

        // Créer un mapping des questions existantes par ID
        const existingQuestionsMap = new Map();
        if (existingQuestions) {
          existingQuestions.forEach(q => existingQuestionsMap.set(q.id, q));
        }

        console.log("Mapping des questions existantes:", Array.from(existingQuestionsMap.entries()));

        // 2. Traiter chaque question
        for (const question of preparedQuestionsData) {
          console.log("Traitement de la question:", question);

          // Vérifier si cette question existe déjà (par ID)
          if (question.id && existingQuestionsMap.has(question.id)) {
            console.log(`Question existante trouvée avec ID ${question.id}, mise à jour...`);

            // Mettre à jour une question existante
            const updateData = {
              question: question.question,
              answer: question.answer,
              panelist_id: question.panelist_id,
              updated_at: new Date().toISOString()
            };

            console.log("Données de mise à jour:", updateData);

            const { data: updatedData, error: updateError } = await supabase
              .from('prepared_questions')
              .update(updateData)
              .eq('id', question.id)
              .select();

            if (updateError) {
              console.error(`Erreur lors de la mise à jour de la question préparée ${question.id}:`, updateError);
            } else {
              console.log("Question mise à jour avec succès:", updatedData);
            }

            // Supprimer cette question de la map pour suivre celles qui ont été traitées
            existingQuestionsMap.delete(question.id);
          } else {
            console.log("Nouvelle question, ajout...");

            // Préparer les données d'insertion
            const insertData: any = {
              question: question.question || "Question sans titre",
              answer: question.answer || "",
              panel_id: panelId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // Ajouter panelist_id seulement s'il est défini
            if (question.panelist_id) {
              insertData.panelist_id = question.panelist_id;
            }

            console.log("Données d'insertion:", insertData);

            // Insérer la question
            const { data: insertedData, error: insertError } = await supabase
              .from('prepared_questions')
              .insert(insertData)
              .select();

            if (insertError) {
              console.error(`Erreur lors de l'ajout d'une question préparée:`, insertError);

              // Essayer sans panelist_id si c'est la source de l'erreur
              if (insertError.message && insertError.message.includes('panelist_id') && question.panelist_id) {
                console.log("Tentative d'insertion sans panelist_id...");
                const fallbackData = {
                  ...insertData,
                  panelist_id: null
                };

                const { data: fallbackInsertedData, error: fallbackError } = await supabase
                  .from('prepared_questions')
                  .insert(fallbackData)
                  .select();

                if (fallbackError) {
                  console.error(`Échec de la seconde tentative d'insertion:`, fallbackError);
                } else {
                  console.log("Question ajoutée avec succès (seconde tentative):", fallbackInsertedData);
                }
              }
            } else {
              console.log("Question ajoutée avec succès:", insertedData);
            }
          }
        }

        // 3. Supprimer les questions qui ne sont plus dans la liste
        if (existingQuestionsMap.size > 0) {
          const idsToDelete = Array.from(existingQuestionsMap.keys());
          console.log("Questions à supprimer:", idsToDelete);

          const { data: deletedData, error: deleteError } = await supabase
            .from('prepared_questions')
            .delete()
            .in('id', idsToDelete)
            .select();

          if (deleteError) {
            console.error(`Erreur lors de la suppression des questions préparées:`, deleteError);
          } else {
            console.log("Questions supprimées avec succès:", deletedData);
          }
        } else {
          console.log("Aucune question à supprimer");
        }

        // Vérification finale
        const { data: finalQuestions, error: finalQueryError } = await supabase
          .from('prepared_questions')
          .select('*')
          .eq('panel_id', panelId);

        if (finalQueryError) {
          console.error(`Erreur lors de la vérification finale des questions:`, finalQueryError);
        } else {
          console.log("État final des questions préparées:", finalQuestions);
        }
      } catch (error) {
        console.error("Erreur lors de la gestion des questions préparées:", error);
        return {
          success: true,
          message: "Panel mis à jour avec succès (sans les questions préparées en raison d'une erreur)."
        };
      }




    }

    return {
      success: true,
      message: "Panel mis à jour avec succès."
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du panel:`, error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du panel."
    };
  }
};

/**
 * Type pour les questions du public
 */
export interface PanelQuestion {
  id?: string;
  panel_id?: string;
  panelist_id?: string;
  asked_by: string;
  question: string;
  status: 'pending' | 'approved' | 'rejected' | 'answered';
  is_anonymous: boolean;
  votes: number;
  answered_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type pour les notes du modérateur
 */
export interface ModeratorNote {
  id?: string;
  panel_id?: string;
  timestamp: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Récupère les questions du public pour un panel
 */
export const getPanelQuestions = async (panelId: string): Promise<PanelQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('panel_questions')
      .select('*')
      .eq('panel_id', panelId)
      .order('votes', { ascending: false });

    if (error) {
      console.error(`Erreur lors de la récupération des questions pour le panel ${panelId}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des questions pour le panel ${panelId}:`, error);
    return [];
  }
};

/**
 * Récupère les détails d'un panel public (accessible via QR code)
 * Cette fonction ne nécessite pas d'authentification
 */
export const getPublicPanelDetails = async (panelId: string): Promise<{
  panel: any | null;
  panelists: any[];
  questions: any[];
  keyPoints: any[];
}> => {
  try {
    // Récupérer le panel
    const { data: panel, error: panelError } = await supabase
      .from('panels')
      .select(`
        id,
        title,
        description,
        date,
        duration,
        status,
        qr_code_url,
        created_at,
        updated_at,
        creator_id
      `)
      .eq('id', panelId)
      .single();

    if (panelError) {
      console.error(`Erreur lors de la récupération du panel public ${panelId}:`, panelError);
      return {
        panel: null,
        panelists: [],
        questions: [],
        keyPoints: []
      };
    }

    // Récupérer les panélistes
    const { data: panelists, error: panelistsError } = await supabase
      .from('panelists')
      .select('*')
      .eq('panel_id', panelId);

    if (panelistsError) {
      console.error(`Erreur lors de la récupération des panélistes pour le panel public ${panelId}:`, panelistsError);
      return {
        panel,
        panelists: [],
        questions: [],
        keyPoints: []
      };
    }

    // Récupérer les questions du public
    const questions = await getPanelQuestions(panelId);

    // Récupérer les segments (points clés)
    const { data: segments, error: segmentsError } = await supabase
      .from('panel_segments')
      .select('*')
      .eq('panel_id', panelId);

    if (segmentsError) {
      console.error(`Erreur lors de la récupération des segments pour le panel public ${panelId}:`, segmentsError);
      return {
        panel,
        panelists: panelists || [],
        questions,
        keyPoints: []
      };
    }

    // Trouver le panéliste actif (s'il y en a un)
    const activePanelist = panelists?.find(p => p.status === 'active') || null;

    // Récupérer les informations du créateur (modérateur) du panel
    let creatorName = 'Modérateur';
    let creatorRole = 'Organisateur';
    let creatorCompany = '';
    let creatorInitials = 'M';

    if (panel.creator_id) {
      try {
        // Récupérer les informations du créateur depuis la table profiles
        const { data: creator, error: creatorError } = await supabase
          .from('profiles')
          .select('name, role, company')
          .eq('id', panel.creator_id)
          .single();

        if (!creatorError && creator) {
          creatorName = creator.name || 'Modérateur';
          creatorRole = creator.role || 'Organisateur';
          creatorCompany = creator.company || '';
          creatorInitials = creator.name ? creator.name.split(' ').map((n: string) => n[0]).join('') : 'M';
          console.log("Informations du créateur récupérées:", creator);
        } else {
          console.error("Erreur lors de la récupération du créateur:", creatorError);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du créateur:", error);
      }
    }

    // Formater les données pour l'interface publique
    const formattedPanel = {
      id: panel.id,
      title: panel.title,
      description: panel.description,
      moderator: {
        name: creatorName,
        role: creatorRole,
        company: creatorCompany,
        initials: creatorInitials
      },
      // Extraire l'heure de la date si disponible, sinon utiliser des valeurs par défaut
      startTime: panel.date ? new Date(panel.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }) : '00:00',
      endTime: panel.date && panel.duration ?
        new Date(new Date(panel.date).getTime() + panel.duration * 60000).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }) : '00:00',
      currentSpeaker: activePanelist ? {
        id: activePanelist.id,
        name: activePanelist.name,
        role: activePanelist.role,
        company: activePanelist.company,
        status: 'active'
      } : null,
      viewerCount: Math.floor(Math.random() * 150) + 50 // Simuler un nombre de spectateurs pour le moment
    };

    // Formater les panélistes
    const formattedPanelists = panelists?.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      company: p.company,
      status: p.status
    })) || [];

    // Formater les questions
    const formattedQuestions = questions.map(q => {
      // Calculer le temps écoulé depuis la création de la question
      const createdAt = q.created_at ? new Date(q.created_at) : new Date();
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

      return {
        id: q.id || '',
        text: q.question,
        author: q.asked_by,
        score: q.votes,
        status: q.status,
        createdAt: q.created_at || '',
        timeAgo: `il y a ${diffMinutes} min`
      };
    });

    // Formater les points clés
    const formattedKeyPoints = segments?.map(s => ({
      title: s.name,
      description: s.description || ''
    })) || [];

    return {
      panel: formattedPanel,
      panelists: formattedPanelists,
      questions: formattedQuestions,
      keyPoints: formattedKeyPoints
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails du panel public ${panelId}:`, error);
    return {
      panel: null,
      panelists: [],
      questions: [],
      keyPoints: []
    };
  }
};

/**
 * Ajoute une question au panel (pour l'interface publique)
 */
export const addPublicQuestion = async (panelId: string, question: string, author: string = 'Anonyme'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('panel_questions')
      .insert([{
        panel_id: panelId,
        question: question,
        asked_by: author,
        status: 'pending',
        is_anonymous: author === 'Anonyme',
        votes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error(`Erreur lors de l'ajout d'une question au panel ${panelId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'une question au panel ${panelId}:`, error);
    return false;
  }
};

/**
 * Vote pour une question
 */
export const voteForQuestion = async (questionId: string, increment: boolean = true): Promise<boolean> => {
  try {
    // Récupérer le nombre de votes actuel
    const { data, error: fetchError } = await supabase
      .from('panel_questions')
      .select('votes')
      .eq('id', questionId)
      .single();

    if (fetchError) {
      console.error(`Erreur lors de la récupération des votes pour la question ${questionId}:`, fetchError);
      return false;
    }

    const currentVotes = data?.votes || 0;
    const newVotes = increment ? currentVotes + 1 : currentVotes - 1;

    // Mettre à jour le nombre de votes
    const { error: updateError } = await supabase
      .from('panel_questions')
      .update({ votes: newVotes, updated_at: new Date().toISOString() })
      .eq('id', questionId);

    if (updateError) {
      console.error(`Erreur lors de la mise à jour des votes pour la question ${questionId}:`, updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Erreur lors du vote pour la question ${questionId}:`, error);
    return false;
  }
};

/**
 * Ajoute une question au panel
 */
export const addPanelQuestion = async (question: Omit<PanelQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; question_id?: string; message: string }> => {
  try {
    const { data, error } = await supabase
      .from('panel_questions')
      .insert({
        ...question,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error(`Erreur lors de l'ajout d'une question:`, error);
      return {
        success: false,
        message: `Erreur lors de l'ajout de la question: ${error.message}`
      };
    }

    return {
      success: true,
      question_id: data.id,
      message: "Question ajoutée avec succès."
    };
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'une question:`, error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'ajout de la question."
    };
  }
};

/**
 * Met à jour le statut d'une question
 */
export const updateQuestionStatus = async (questionId: string, status: 'pending' | 'approved' | 'rejected' | 'answered'): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from('panel_questions')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'answered' ? { answered_at: new Date().toISOString() } : {})
      })
      .eq('id', questionId);

    if (error) {
      console.error(`Erreur lors de la mise à jour du statut de la question ${questionId}:`, error);
      return {
        success: false,
        message: `Erreur lors de la mise à jour du statut: ${error.message}`
      };
    }

    return {
      success: true,
      message: "Statut de la question mis à jour avec succès."
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la question ${questionId}:`, error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du statut."
    };
  }
};

/**
 * Récupère les notes du modérateur pour un panel
 */
export const getModeratorNotes = async (panelId: string): Promise<ModeratorNote[]> => {
  try {
    const { data, error } = await supabase
      .from('moderator_notes')
      .select('*')
      .eq('panel_id', panelId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Erreur lors de la récupération des notes pour le panel ${panelId}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des notes pour le panel ${panelId}:`, error);
    return [];
  }
};

/**
 * Ajoute une note de modérateur
 */
export const addModeratorNote = async (note: Omit<ModeratorNote, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; note_id?: string; message: string }> => {
  try {
    const { data, error } = await supabase
      .from('moderator_notes')
      .insert({
        ...note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error(`Erreur lors de l'ajout d'une note:`, error);
      return {
        success: false,
        message: `Erreur lors de l'ajout de la note: ${error.message}`
      };
    }

    return {
      success: true,
      note_id: data.id,
      message: "Note ajoutée avec succès."
    };
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'une note:`, error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'ajout de la note."
    };
  }
};

/**
 * Met à jour une question préparée
 */
export const updatePreparedQuestion = async (questionId: string, panelist_id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from('prepared_questions')
      .update({
        panelist_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (error) {
      console.error(`Erreur lors de la mise à jour de la question préparée ${questionId}:`, error);
      return {
        success: false,
        message: `Erreur lors de la mise à jour de la question: ${error.message}`
      };
    }

    return {
      success: true,
      message: "Question mise à jour avec succès."
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la question préparée ${questionId}:`, error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour de la question."
    };
  }
};

/**
 * Supprime un panel et toutes ses données associées
 */
export const deletePanel = async (panelId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Vous devez être connecté pour supprimer un panel."
      };
    }

    // Vérifier que l'utilisateur est le créateur du panel
    const { data: panel, error: panelCheckError } = await supabase
      .from('panels')
      .select('creator_id')
      .eq('id', panelId)
      .single();

    if (panelCheckError) {
      console.error(`Erreur lors de la vérification du panel ${panelId}:`, panelCheckError);
      return {
        success: false,
        message: "Impossible de vérifier les droits d'accès au panel."
      };
    }

    if (panel.creator_id !== user.id) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer ce panel."
      };
    }

    // Supprimer les ressources du stockage
    const { data: resources, error: resourcesError } = await supabase
      .from('panel_resources')
      .select('file_path')
      .eq('panel_id', panelId);

    if (!resourcesError && resources && resources.length > 0) {
      // Supprimer chaque fichier du stockage
      for (const resource of resources) {
        if (resource.file_path) {
          const { error: deleteStorageError } = await supabase.storage
            .from('panel-resources')
            .remove([resource.file_path]);

          if (deleteStorageError) {
            console.error(`Erreur lors de la suppression du fichier ${resource.file_path}:`, deleteStorageError);
          }
        }
      }
    }

    // Supprimer les données associées au panel
    // Note: Nous utilisons des suppressions en cascade dans la base de données,
    // mais nous les faisons explicitement ici pour être sûr

    // 1. Supprimer les questions du public
    const { error: questionsError } = await supabase
      .from('panel_questions')
      .delete()
      .eq('panel_id', panelId);

    if (questionsError) {
      console.error(`Erreur lors de la suppression des questions du panel ${panelId}:`, questionsError);
    }

    // 2. Supprimer les notes du modérateur
    const { error: notesError } = await supabase
      .from('moderator_notes')
      .delete()
      .eq('panel_id', panelId);

    if (notesError) {
      console.error(`Erreur lors de la suppression des notes du panel ${panelId}:`, notesError);
    }

    // 3. Supprimer les ressources
    const { error: resourcesDeleteError } = await supabase
      .from('panel_resources')
      .delete()
      .eq('panel_id', panelId);

    if (resourcesDeleteError) {
      console.error(`Erreur lors de la suppression des ressources du panel ${panelId}:`, resourcesDeleteError);
    }

    // 4. Supprimer les questions préparées
    const { error: preparedQuestionsError } = await supabase
      .from('prepared_questions')
      .delete()
      .eq('panel_id', panelId);

    if (preparedQuestionsError) {
      console.error(`Erreur lors de la suppression des questions préparées du panel ${panelId}:`, preparedQuestionsError);
    }

    // 5. Supprimer les segments
    const { error: segmentsError } = await supabase
      .from('panel_segments')
      .delete()
      .eq('panel_id', panelId);

    if (segmentsError) {
      console.error(`Erreur lors de la suppression des segments du panel ${panelId}:`, segmentsError);
    }

    // 6. Supprimer les panélistes
    const { error: panelistsError } = await supabase
      .from('panelists')
      .delete()
      .eq('panel_id', panelId);

    if (panelistsError) {
      console.error(`Erreur lors de la suppression des panélistes du panel ${panelId}:`, panelistsError);
    }

    // 7. Finalement, supprimer le panel lui-même
    const { error: panelDeleteError } = await supabase
      .from('panels')
      .delete()
      .eq('id', panelId);

    if (panelDeleteError) {
      console.error(`Erreur lors de la suppression du panel ${panelId}:`, panelDeleteError);
      return {
        success: false,
        message: `Erreur lors de la suppression du panel: ${panelDeleteError.message}`
      };
    }

    return {
      success: true,
      message: "Panel supprimé avec succès."
    };
  } catch (error) {
    console.error(`Erreur lors de la suppression du panel ${panelId}:`, error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression du panel."
    };
  }
};
