import { supabase } from './supabaseClient';
import { Invitation } from '@/types';

/**
 * Interface pour les invitations avec des informations supplémentaires
 */
export interface InvitationWithDetails extends Invitation {
  panelTitle?: string;
  panelDate?: string;
  role?: string;
  moderatorName?: string;
}

/**
 * Récupère les invitations en attente pour l'utilisateur actuel
 */
export const getPendingInvitations = async (): Promise<InvitationWithDetails[]> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return [];
    }

    // Récupérer les invitations en attente
    const { data: invitations, error } = await supabase
      .from('panelists')
      .select(`
        id,
        panel_id,
        email,
        name,
        role,
        company,
        invitation_sent,
        invitation_accepted,
        created_at,
        updated_at,
        panels:panel_id (
          id,
          title,
          description,
          date,
          creator_id,
          profiles:creator_id (
            name
          )
        )
      `)
      .eq('email', user.email)
      .eq('invitation_accepted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      return [];
    }

    // Transformer les données pour correspondre au format attendu
    const invitationsWithDetails: InvitationWithDetails[] = invitations.map(invitation => ({
      id: invitation.id,
      panelId: invitation.panel_id,
      email: invitation.email,
      status: invitation.invitation_accepted ? 'accepted' : 'pending',
      createdAt: invitation.created_at,
      panelTitle: invitation.panels?.title,
      panelDate: invitation.panels?.date,
      role: invitation.role,
      moderatorName: invitation.panels?.profiles?.name
    }));

    return invitationsWithDetails;
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error);
    return [];
  }
};

/**
 * Accepte une invitation à un panel
 */
export const acceptInvitation = async (invitationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('panelists')
      .update({ invitation_accepted: true })
      .eq('id', invitationId);

    if (error) {
      console.error(`Erreur lors de l'acceptation de l'invitation ${invitationId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Erreur lors de l'acceptation de l'invitation ${invitationId}:`, error);
    return false;
  }
};

/**
 * Refuse une invitation à un panel
 */
export const declineInvitation = async (invitationId: string): Promise<boolean> => {
  try {
    // Pour refuser, on supprime simplement l'entrée du panéliste
    const { error } = await supabase
      .from('panelists')
      .delete()
      .eq('id', invitationId);

    if (error) {
      console.error(`Erreur lors du refus de l'invitation ${invitationId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Erreur lors du refus de l'invitation ${invitationId}:`, error);
    return false;
  }
};
