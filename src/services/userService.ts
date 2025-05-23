import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

// Interface pour le profil utilisateur
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  company?: string;
  role?: string;
  location?: string;
  bio?: string;
  joined_date: string;
  panels_created: number;
  panels_participated: number;
  questions_answered: number;
  total_speaking_time: number; // en minutes
  social_links: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  expertise: string[];
  languages: string[];
  user_role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
}

// Interface pour la mise à jour du profil
export interface UserProfileUpdate {
  name?: string;
  company?: string;
  role?: string;
  location?: string;
  bio?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  expertise?: string[];
  languages?: string[];
}

/**
 * Récupère le profil de l'utilisateur actuellement connecté
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return getUserProfile(user.id);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    return null;
  }
};

/**
 * Récupère le profil d'un utilisateur par son ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles_view')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error(`Erreur lors de la récupération du profil utilisateur (ID: ${userId}):`, error);
    return null;
  }
};

/**
 * Met à jour le profil de l'utilisateur
 */
export const updateUserProfile = async (
  userId: string,
  profileData: UserProfileUpdate
): Promise<UserProfile | null> => {
  try {
    // 1. Mettre à jour les informations de base du profil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: profileData.name,
        company: profileData.company,
        role: profileData.role,
        location: profileData.location,
        bio: profileData.bio,
        social_links: profileData.social_links || {},
        updated_at: new Date()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // 2. Mettre à jour les expertises
    if (profileData.expertise) {
      // Supprimer les expertises existantes
      const { error: deleteExpertiseError } = await supabase
        .from('user_expertise')
        .delete()
        .eq('user_id', userId);

      if (deleteExpertiseError) {
        throw deleteExpertiseError;
      }

      // Ajouter les nouvelles expertises
      if (profileData.expertise.length > 0) {
        const expertiseRows = profileData.expertise.map(expertise => ({
          user_id: userId,
          expertise
        }));

        const { error: insertExpertiseError } = await supabase
          .from('user_expertise')
          .insert(expertiseRows);

        if (insertExpertiseError) {
          throw insertExpertiseError;
        }
      }
    }

    // 3. Mettre à jour les langues
    if (profileData.languages) {
      // Supprimer les langues existantes
      const { error: deleteLanguageError } = await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', userId);

      if (deleteLanguageError) {
        throw deleteLanguageError;
      }

      // Ajouter les nouvelles langues
      if (profileData.languages.length > 0) {
        const languageRows = profileData.languages.map(language => ({
          user_id: userId,
          language
        }));

        const { error: insertLanguageError } = await supabase
          .from('user_languages')
          .insert(languageRows);

        if (insertLanguageError) {
          throw insertLanguageError;
        }
      }
    }

    // Récupérer le profil mis à jour
    return getUserProfile(userId);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du profil utilisateur (ID: ${userId}):`, error);
    return null;
  }
};

/**
 * Met à jour l'avatar de l'utilisateur
 */
export const updateUserAvatar = async (
  userId: string,
  avatarFile: File
): Promise<string | null> => {
  try {
    // Générer un nom de fichier unique
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Uploader le fichier
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, avatarFile);

    if (uploadError) {
      throw uploadError;
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    // Mettre à jour le profil avec la nouvelle URL d'avatar
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'avatar (ID: ${userId}):`, error);
    return null;
  }
};

/**
 * Récupère tous les utilisateurs (pour les administrateurs)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles_view')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return data as UserProfile[];
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les utilisateurs:', error);
    return [];
  }
};

/**
 * Met à jour le rôle d'un utilisateur (pour les administrateurs)
 */
export const updateUserRole = async (
  userId: string,
  role: 'user' | 'admin' | 'moderator'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ user_role: role })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du rôle utilisateur (ID: ${userId}):`, error);
    return false;
  }
};
