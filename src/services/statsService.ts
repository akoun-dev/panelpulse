import { supabase } from './supabaseClient';

/**
 * Interface pour les statistiques utilisateur
 */
export interface UserStats {
  panelsCreated: number;
  panelsParticipated: number;
  questionsAnswered: number;
  totalSpeakingTime: number; // en minutes
  activeInvitations: number;
  completionRate: number; // pourcentage
}

/**
 * Interface pour la répartition des panels
 */
export interface PanelDistribution {
  active: number;
  completed: number;
  draft: number;
}

/**
 * Récupère les statistiques de l'utilisateur actuel
 */
export const getUserStats = async (): Promise<UserStats | null> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return null;
    }

    // Récupérer le profil utilisateur qui contient les statistiques de base
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('panels_created, panels_participated, questions_answered, total_speaking_time')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return null;
    }

    // Récupérer le nombre d'invitations actives
    const { count: activeInvitations, error: invitationsError } = await supabase
      .from('panelists')
      .select('*', { count: 'exact', head: true })
      .eq('email', user.email)
      .eq('invitation_accepted', false);

    if (invitationsError) {
      console.error('Erreur lors de la récupération des invitations:', invitationsError);
      return null;
    }

    // Calculer le taux de complétion (panels terminés / panels créés)
    const { count: completedPanels, error: completedError } = await supabase
      .from('panels')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .eq('status', 'completed');

    if (completedError) {
      console.error('Erreur lors de la récupération des panels terminés:', completedError);
      return null;
    }

    // Calculer le taux de complétion
    const completionRate = profile.panels_created > 0
      ? Math.round((completedPanels / profile.panels_created) * 100)
      : 0;

    return {
      panelsCreated: profile.panels_created || 0,
      panelsParticipated: profile.panels_participated || 0,
      questionsAnswered: profile.questions_answered || 0,
      totalSpeakingTime: profile.total_speaking_time || 0,
      activeInvitations: activeInvitations || 0,
      completionRate
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
};

/**
 * Récupère la répartition des panels de l'utilisateur par statut
 */
export const getPanelDistribution = async (): Promise<PanelDistribution | null> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return null;
    }

    // Récupérer le nombre de panels actifs
    const { count: activePanels, error: activeError } = await supabase
      .from('panels')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .eq('status', 'active');

    if (activeError) {
      console.error('Erreur lors de la récupération des panels actifs:', activeError);
      return null;
    }

    // Récupérer le nombre de panels terminés
    const { count: completedPanels, error: completedError } = await supabase
      .from('panels')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .eq('status', 'completed');

    if (completedError) {
      console.error('Erreur lors de la récupération des panels terminés:', completedError);
      return null;
    }

    // Récupérer le nombre de panels en brouillon
    const { count: draftPanels, error: draftError } = await supabase
      .from('panels')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .eq('status', 'draft');

    if (draftError) {
      console.error('Erreur lors de la récupération des panels en brouillon:', draftError);
      return null;
    }

    return {
      active: activePanels || 0,
      completed: completedPanels || 0,
      draft: draftPanels || 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la répartition des panels:', error);
    return null;
  }
};
