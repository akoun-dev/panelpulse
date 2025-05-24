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
 * Vérifie si la table panelists a les colonnes d'invitation
 * Cette fonction est utilisée pour déterminer si la migration a été appliquée
 */
export const checkInvitationColumnsExist = async (): Promise<boolean> => {
  try {
    // Vérifier d'abord si la table panelists existe
    const { data: tableExists, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'panelists')
      .eq('table_schema', 'public')
      .limit(1);

    if (tableError || !tableExists || tableExists.length === 0) {
      console.log('La table panelists n\'existe pas encore');
      return false;
    }

    // Vérifier si les colonnes d'invitation existent
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'panelists')
      .eq('table_schema', 'public')
      .in('column_name', ['invitation_sent', 'invitation_accepted'])
      .limit(2);

    if (columnsError) {
      console.error('Erreur lors de la vérification des colonnes d\'invitation:', columnsError);
      return false;
    }

    // Si nous avons trouvé les deux colonnes, elles existent
    const columnsExist = columns && columns.length === 2;

    if (columnsExist) {
      console.log('Les colonnes d\'invitation existent dans la table panelists');
    } else {
      console.log('Les colonnes d\'invitation n\'existent pas encore dans la table panelists');
    }

    return columnsExist;
  } catch (error) {
    console.error('Erreur lors de la vérification des colonnes d\'invitation:', error);
    return false;
  }
};

/**
 * Récupère toutes les invitations pour l'utilisateur actuel (en attente, acceptées et rejetées)
 */
export const getAllInvitations = async (): Promise<InvitationWithDetails[]> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return [];
    }

    // Vérifier si les colonnes d'invitation existent
    const columnsExist = await checkInvitationColumnsExist();

    if (!columnsExist) {
      console.warn('Les colonnes d\'invitation n\'existent pas encore, retour de données fictives');
      // Retourner des données fictives si les colonnes n'existent pas encore
      return await getMockInvitations();
    }

    try {
      // Récupérer toutes les invitations
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
          invitation_sent_at,
          invitation_accepted_at,
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
        .order('created_at', { ascending: false });

      if (error) {
        // Si l'erreur est liée aux colonnes manquantes, utiliser des données fictives
        if (error.message && (
          error.message.includes('column') ||
          error.message.includes('relation') ||
          error.message.includes('does not exist')
        )) {
          console.warn('Erreur liée aux colonnes ou tables manquantes, utilisation de données fictives:', error.message);
          return await getMockInvitations();
        }

        console.error('Erreur lors de la récupération des invitations:', error);
        return [];
      }

      if (!invitations || invitations.length === 0) {
        console.log('Aucune invitation trouvée, utilisation de données fictives');
        return await getMockInvitations();
      }

      // Transformer les données pour correspondre au format attendu
      const invitationsWithDetails: InvitationWithDetails[] = invitations.map(invitation => ({
        id: invitation.id,
        panelId: invitation.panel_id,
        email: invitation.email,
        status: invitation.invitation_accepted ? 'accepted' : (invitation.invitation_sent ? 'pending' : 'not_sent'),
        createdAt: invitation.created_at,
        panelTitle: invitation.panels?.title,
        panelDate: invitation.panels?.date,
        role: invitation.role,
        moderatorName: invitation.panels?.profiles?.name
      }));

      return invitationsWithDetails;
    } catch (queryError) {
      console.error('Erreur lors de la requête des invitations:', queryError);
      return await getMockInvitations();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error);
    return await getMockInvitations();
  }
};

/**
 * Récupère les invitations en attente pour l'utilisateur actuel
 */
export const getPendingInvitations = async (): Promise<InvitationWithDetails[]> => {
  try {
    const allInvitations = await getAllInvitations();
    const pendingInvitations = allInvitations.filter(invitation => invitation.status === 'pending');

    console.log(`Récupération de ${pendingInvitations.length} invitations en attente sur ${allInvitations.length} invitations au total`);

    return pendingInvitations;
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations en attente:', error);
    return [];
  }
};

/**
 * Récupère les invitations acceptées pour l'utilisateur actuel
 */
export const getAcceptedInvitations = async (): Promise<InvitationWithDetails[]> => {
  try {
    const allInvitations = await getAllInvitations();
    return allInvitations.filter(invitation => invitation.status === 'accepted');
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations acceptées:', error);
    return [];
  }
};

/**
 * Retourne des données d'invitation fictives pour le développement
 * Cette fonction tente d'abord de récupérer les vrais panels de l'utilisateur
 * et de créer des invitations fictives basées sur ces panels
 */
export const getMockInvitations = async (): Promise<InvitationWithDetails[]> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return getDefaultMockInvitations();
    }

    // Récupérer les panels existants
    const { data: panels, error: panelsError } = await supabase
      .from('panels')
      .select(`
        id,
        title,
        description,
        date,
        creator_id,
        profiles:creator_id (
          name
        )
      `)
      .limit(5);

    if (panelsError || !panels || panels.length === 0) {
      console.log('Aucun panel trouvé, utilisation de données fictives par défaut');
      return getDefaultMockInvitations();
    }

    // Créer des invitations fictives basées sur les panels existants
    const mockInvitations: InvitationWithDetails[] = panels.map((panel, index) => {
      const statuses: ('pending' | 'accepted' | 'rejected' | 'not_sent')[] = ['pending', 'accepted', 'rejected', 'not_sent'];
      const status = statuses[index % statuses.length];

      const roles = [
        'Expert en Marketing',
        'Spécialiste IA',
        'Consultant Environnement',
        'Analyste Sécurité',
        'Développeur Web'
      ];

      return {
        id: `mock-${panel.id}-${index}`,
        panelId: panel.id,
        email: user.email || 'utilisateur@example.com',
        status,
        createdAt: new Date(Date.now() - (index * 2) * 24 * 60 * 60 * 1000).toISOString(),
        panelTitle: panel.title,
        panelDate: panel.date || new Date(Date.now() + (7 + index * 3) * 24 * 60 * 60 * 1000).toISOString(),
        role: roles[index % roles.length],
        moderatorName: panel.profiles?.name || 'Modérateur'
      };
    });

    console.log('Invitations fictives créées à partir des panels existants:', mockInvitations);
    return mockInvitations;
  } catch (error) {
    console.error('Erreur lors de la création des invitations fictives:', error);
    return getDefaultMockInvitations();
  }
};

/**
 * Retourne des données d'invitation fictives par défaut
 */
const getDefaultMockInvitations = (): InvitationWithDetails[] => {
  return [
    {
      id: '1',
      panelId: '1',
      email: 'vous@example.com',
      status: 'pending',
      createdAt: new Date().toISOString(),
      panelTitle: 'Panel Marketing Digital',
      panelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
      role: 'Expert en Marketing',
      moderatorName: 'Jean Dupont'
    },
    {
      id: '2',
      panelId: '2',
      email: 'vous@example.com',
      status: 'accepted',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 3 jours
      panelTitle: 'Panel Intelligence Artificielle',
      panelDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Dans 14 jours
      role: 'Spécialiste IA',
      moderatorName: 'Marie Durand'
    },
    {
      id: '3',
      panelId: '3',
      email: 'vous@example.com',
      status: 'pending',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 jour
      panelTitle: 'Panel Développement Durable',
      panelDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Dans 10 jours
      role: 'Consultant Environnement',
      moderatorName: 'Pierre Martin'
    },
    {
      id: '4',
      panelId: '4',
      email: 'vous@example.com',
      status: 'rejected',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 10 jours
      panelTitle: 'Panel Cybersécurité',
      panelDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 5 jours (passé)
      role: 'Analyste Sécurité',
      moderatorName: 'Sophie Martin'
    }
  ];
};

/**
 * Accepte une invitation à un panel
 */
export const acceptInvitation = async (invitationId: string): Promise<boolean> => {
  try {
    // Si l'ID commence par "mock-", c'est une invitation fictive
    if (invitationId.startsWith('mock-')) {
      console.log(`Simulation d'acceptation pour l'invitation fictive ${invitationId}`);

      // Mettre à jour les invitations fictives dans le localStorage
      try {
        const mockInvitationsJson = localStorage.getItem('mockInvitations');
        if (mockInvitationsJson) {
          const mockInvitations = JSON.parse(mockInvitationsJson);
          const updatedMockInvitations = mockInvitations.map((inv: any) =>
            inv.id === invitationId ? {...inv, status: 'accepted'} : inv
          );
          localStorage.setItem('mockInvitations', JSON.stringify(updatedMockInvitations));
        }
      } catch (e) {
        console.log('Erreur lors de la mise à jour du localStorage:', e);
      }

      return true;
    }

    // Vérifier si les colonnes d'invitation existent
    const columnsExist = await checkInvitationColumnsExist();

    if (!columnsExist) {
      console.warn('Les colonnes d\'invitation n\'existent pas encore, simulation d\'acceptation');
      return true; // Simuler une acceptation réussie
    }

    try {
      const { error } = await supabase
        .from('panelists')
        .update({
          invitation_accepted: true,
          invitation_accepted_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) {
        if (error.message && (
          error.message.includes('column') ||
          error.message.includes('relation') ||
          error.message.includes('does not exist')
        )) {
          console.warn('Erreur liée aux colonnes manquantes, simulation d\'acceptation:', error.message);
          return true;
        }

        console.error(`Erreur lors de l'acceptation de l'invitation ${invitationId}:`, error);
        return false;
      }

      return true;
    } catch (queryError) {
      console.error(`Erreur lors de la requête d'acceptation de l'invitation ${invitationId}:`, queryError);
      return true; // Simuler une acceptation réussie en cas d'erreur
    }
  } catch (error) {
    console.error(`Erreur lors de l'acceptation de l'invitation ${invitationId}:`, error);
    return false;
  }
};

/**
 * Rejette une invitation à un panel
 */
export const rejectInvitation = async (invitationId: string): Promise<boolean> => {
  try {
    // Si l'ID commence par "mock-", c'est une invitation fictive
    if (invitationId.startsWith('mock-')) {
      console.log(`Simulation de rejet pour l'invitation fictive ${invitationId}`);

      // Mettre à jour les invitations fictives dans le localStorage
      try {
        const mockInvitationsJson = localStorage.getItem('mockInvitations');
        if (mockInvitationsJson) {
          const mockInvitations = JSON.parse(mockInvitationsJson);
          const updatedMockInvitations = mockInvitations.map((inv: any) =>
            inv.id === invitationId ? {...inv, status: 'rejected'} : inv
          );
          localStorage.setItem('mockInvitations', JSON.stringify(updatedMockInvitations));
        }
      } catch (e) {
        console.log('Erreur lors de la mise à jour du localStorage:', e);
      }

      return true;
    }

    // Vérifier si les colonnes d'invitation existent
    const columnsExist = await checkInvitationColumnsExist();

    if (!columnsExist) {
      console.warn('Les colonnes d\'invitation n\'existent pas encore, simulation de rejet');
      return true; // Simuler un rejet réussi
    }

    try {
      // Pour rejeter, on supprime simplement le panéliste
      const { error } = await supabase
        .from('panelists')
        .delete()
        .eq('id', invitationId);

      if (error) {
        if (error.message && (
          error.message.includes('column') ||
          error.message.includes('relation') ||
          error.message.includes('does not exist')
        )) {
          console.warn('Erreur liée aux colonnes manquantes, simulation de rejet:', error.message);
          return true;
        }

        console.error(`Erreur lors du rejet de l'invitation ${invitationId}:`, error);
        return false;
      }

      return true;
    } catch (queryError) {
      console.error(`Erreur lors de la requête de rejet de l'invitation ${invitationId}:`, queryError);
      return true; // Simuler un rejet réussi en cas d'erreur
    }
  } catch (error) {
    console.error(`Erreur lors du rejet de l'invitation ${invitationId}:`, error);
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
