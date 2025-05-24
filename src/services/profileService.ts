import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

/**
 * Service pour gérer les profils utilisateurs
 */

/**
 * Récupère le profil de l'utilisateur actuel
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return null;
    }

    // Récupérer le profil de l'utilisateur
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
};

/**
 * Vérifie si la colonne is_admin existe dans la table profiles
 */
export const checkIsAdminColumnExists = async (): Promise<boolean> => {
  try {
    // Vérifier si la colonne is_admin existe
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
      .eq('column_name', 'is_admin')
      .limit(1);

    if (error) {
      console.error('Erreur lors de la vérification de la colonne is_admin:', error);
      return false;
    }

    return columns && columns.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de la colonne is_admin:', error);
    return false;
  }
};

/**
 * Vérifie si l'utilisateur actuel est administrateur
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    // Vérifier si la colonne is_admin existe
    const columnExists = await checkIsAdminColumnExists();

    if (!columnExists) {
      console.log('La colonne is_admin n\'existe pas encore dans la table profiles');

      // Vérifier si l'utilisateur est un administrateur par défaut (basé sur l'email)
      const profile = await getCurrentUserProfile();

      if (!profile) return false;

      // Liste des emails d'administrateurs par défaut
      const adminEmails = [
        'admin@example.com',
        'admin@panelpulse.com',
        'admin@panel-pulse.com'
      ];

      return adminEmails.includes(profile.email);
    }

    // Si la colonne existe, vérifier la valeur
    const profile = await getCurrentUserProfile();
    return profile?.is_admin || false;
  } catch (error) {
    console.error('Erreur lors de la vérification des droits d\'administrateur:', error);
    return false;
  }
};

/**
 * Met à jour le profil de l'utilisateur actuel
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Utilisateur non connecté');
      return null;
    }

    // Mettre à jour le profil
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return null;
    }

    return updatedProfile;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return null;
  }
};

/**
 * Récupère le profil d'un utilisateur par son ID
 */
export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du profil de l'utilisateur ${userId}:`, error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error(`Erreur lors de la récupération du profil de l'utilisateur ${userId}:`, error);
    return null;
  }
};

/**
 * Récupère tous les profils administrateurs
 */
export const getAdminProfiles = async (): Promise<UserProfile[]> => {
  try {
    // Vérifier d'abord si l'utilisateur actuel est administrateur
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      console.error('Accès non autorisé: seuls les administrateurs peuvent voir la liste des administrateurs');
      return [];
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des profils administrateurs:', error);
      return [];
    }

    return profiles || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des profils administrateurs:', error);
    return [];
  }
};

/**
 * Promeut un utilisateur en administrateur
 * Seuls les administrateurs peuvent promouvoir d'autres utilisateurs
 */
export const promoteToAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Vérifier d'abord si l'utilisateur actuel est administrateur
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      console.error('Accès non autorisé: seuls les administrateurs peuvent promouvoir d\'autres utilisateurs');
      return false;
    }

    // Vérifier si la colonne is_admin existe
    const columnExists = await checkIsAdminColumnExists();

    if (!columnExists) {
      console.log('La colonne is_admin n\'existe pas encore, impossible de promouvoir l\'utilisateur');
      return false;
    }

    try {
      // Essayer d'utiliser la fonction RPC si elle existe
      const { data, error } = await supabase
        .rpc('promote_to_admin', { user_id: userId });

      if (!error) {
        return data || false;
      }

      // Si la fonction RPC n'existe pas, mettre à jour directement
      if (error.message && error.message.includes('function') && error.message.includes('does not exist')) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userId);

        if (updateError) {
          console.error(`Erreur lors de la mise à jour directe de l'utilisateur ${userId}:`, updateError);
          return false;
        }

        return true;
      }

      console.error(`Erreur lors de la promotion de l'utilisateur ${userId} en administrateur:`, error);
      return false;
    } catch (rpcError) {
      console.error(`Erreur lors de l'appel RPC pour promouvoir l'utilisateur ${userId}:`, rpcError);

      // Fallback: mettre à jour directement
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userId);

        if (updateError) {
          console.error(`Erreur lors de la mise à jour directe de l'utilisateur ${userId}:`, updateError);
          return false;
        }

        return true;
      } catch (updateError) {
        console.error(`Erreur lors de la mise à jour directe de l'utilisateur ${userId}:`, updateError);
        return false;
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la promotion de l'utilisateur ${userId} en administrateur:`, error);
    return false;
  }
};

/**
 * Révoque les droits d'administrateur d'un utilisateur
 * Seuls les administrateurs peuvent révoquer les droits d'autres utilisateurs
 */
export const revokeAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Vérifier d'abord si l'utilisateur actuel est administrateur
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      console.error('Accès non autorisé: seuls les administrateurs peuvent révoquer les droits d\'autres utilisateurs');
      return false;
    }

    // Vérifier si la colonne is_admin existe
    const columnExists = await checkIsAdminColumnExists();

    if (!columnExists) {
      console.log('La colonne is_admin n\'existe pas encore, impossible de révoquer les droits de l\'utilisateur');
      return false;
    }

    try {
      // Essayer d'utiliser la fonction RPC si elle existe
      const { data, error } = await supabase
        .rpc('revoke_admin', { user_id: userId });

      if (!error) {
        return data || false;
      }

      // Si la fonction RPC n'existe pas, mettre à jour directement
      if (error.message && error.message.includes('function') && error.message.includes('does not exist')) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: false })
          .eq('id', userId);

        if (updateError) {
          console.error(`Erreur lors de la mise à jour directe de l'utilisateur ${userId}:`, updateError);
          return false;
        }

        return true;
      }

      console.error(`Erreur lors de la révocation des droits d'administrateur de l'utilisateur ${userId}:`, error);
      return false;
    } catch (rpcError) {
      console.error(`Erreur lors de l'appel RPC pour révoquer les droits de l'utilisateur ${userId}:`, rpcError);

      // Fallback: mettre à jour directement
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: false })
          .eq('id', userId);

        if (updateError) {
          console.error(`Erreur lors de la mise à jour directe de l'utilisateur ${userId}:`, updateError);
          return false;
        }

        return true;
      } catch (updateError) {
        console.error(`Erreur lors de la mise à jour directe de l'utilisateur ${userId}:`, updateError);
        return false;
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la révocation des droits d'administrateur de l'utilisateur ${userId}:`, error);
    return false;
  }
};
