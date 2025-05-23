import { supabase } from './supabaseClient';

/**
 * Interface pour une activité
 */
export interface Activity {
  id: string;
  type: 'invitation' | 'panel_created' | 'panel_completed' | 'question_answered';
  title: string;
  description: string;
  time: string; // ISO date string
  relatedId?: string; // ID du panel ou de l'invitation
}

/**
 * Récupère les activités récentes de l'utilisateur
 */
export const getRecentActivities = async (limit: number = 5): Promise<Activity[]> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return [];
    }

    // Tableau pour stocker toutes les activités
    const activities: Activity[] = [];

    // 1. Récupérer les invitations récentes
    const { data: invitations, error: invitationsError } = await supabase
      .from('panelists')
      .select(`
        id,
        panel_id,
        created_at,
        panels:panel_id (
          title
        )
      `)
      .eq('email', user.email)
      .eq('invitation_accepted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (invitationsError) {
      console.error('Erreur lors de la récupération des invitations:', invitationsError);
    } else if (invitations) {
      invitations.forEach(invitation => {
        activities.push({
          id: `invitation-${invitation.id}`,
          type: 'invitation',
          title: 'Nouvelle invitation',
          description: `Vous avez reçu une invitation pour '${invitation.panels?.title || 'Panel'}'`,
          time: invitation.created_at,
          relatedId: invitation.id
        });
      });
    }

    // 2. Récupérer les panels récemment créés
    const { data: createdPanels, error: createdPanelsError } = await supabase
      .from('panels')
      .select('id, title, created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (createdPanelsError) {
      console.error('Erreur lors de la récupération des panels créés:', createdPanelsError);
    } else if (createdPanels) {
      createdPanels.forEach(panel => {
        activities.push({
          id: `panel-created-${panel.id}`,
          type: 'panel_created',
          title: 'Nouveau panel créé',
          description: `Vous avez créé '${panel.title}'`,
          time: panel.created_at,
          relatedId: panel.id
        });
      });
    }

    // 3. Récupérer les panels récemment terminés
    const { data: completedPanels, error: completedPanelsError } = await supabase
      .from('panels')
      .select('id, title, updated_at')
      .eq('creator_id', user.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (completedPanelsError) {
      console.error('Erreur lors de la récupération des panels terminés:', completedPanelsError);
    } else if (completedPanels) {
      completedPanels.forEach(panel => {
        activities.push({
          id: `panel-completed-${panel.id}`,
          type: 'panel_completed',
          title: 'Panel terminé',
          description: `'${panel.title}' a été marqué comme terminé`,
          time: panel.updated_at,
          relatedId: panel.id
        });
      });
    }

    // Trier toutes les activités par date (la plus récente en premier)
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Erreur lors de la récupération des activités récentes:', error);
    return [];
  }
};
