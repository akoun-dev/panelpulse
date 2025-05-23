import { supabase } from './supabaseClient';
import { Panel } from '@/types';

/**
 * Interface pour les panels à venir avec des informations supplémentaires
 */
export interface UpcomingPanel extends Panel {
  date?: string;
  participants?: number;
}

/**
 * Récupère les panels à venir pour l'utilisateur actuel
 */
export const getUpcomingPanels = async (): Promise<UpcomingPanel[]> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return [];
    }

    // Date actuelle
    const now = new Date().toISOString();

    // Récupérer les panels à venir créés par l'utilisateur
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
        created_at,
        updated_at
      `)
      .eq('creator_id', user.id)
      .gt('date', now)
      .order('date', { ascending: true });

    if (createdPanelsError) {
      console.error('Erreur lors de la récupération des panels à venir:', createdPanelsError);
      return [];
    }

    // Récupérer les panels à venir où l'utilisateur est panéliste
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
          created_at,
          updated_at
        )
      `)
      .eq('email', user.email)
      .eq('invitation_accepted', true);

    if (panelistError) {
      console.error('Erreur lors de la récupération des panels où l\'utilisateur est panéliste:', panelistError);
      return [];
    }

    // Extraire les panels où l'utilisateur est panéliste
    const panelistPanels = panelistData
      .filter(item => item.panels && new Date(item.panels.date) > new Date())
      .map(item => item.panels);

    // Combiner les panels
    const allPanels = [...createdPanels, ...panelistPanels];

    // Récupérer le nombre de participants pour chaque panel
    const upcomingPanels = await Promise.all(allPanels.map(async (panel) => {
      // Récupérer le nombre de panélistes
      const { count: participantsCount, error: countError } = await supabase
        .from('panelists')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel.id);

      if (countError) {
        console.error(`Erreur lors de la récupération du nombre de participants pour le panel ${panel.id}:`, countError);
      }

      return {
        id: panel.id,
        title: panel.title,
        description: panel.description,
        status: panel.status,
        createdAt: panel.created_at,
        updatedAt: panel.updated_at,
        ownerId: panel.creator_id,
        date: panel.date,
        participants: participantsCount || 0
      };
    }));

    // Trier par date
    return upcomingPanels.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des panels à venir:', error);
    return [];
  }
};
