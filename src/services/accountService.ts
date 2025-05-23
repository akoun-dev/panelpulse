import { supabase } from './supabaseClient';

/**
 * Change le mot de passe de l'utilisateur actuellement connecté
 * @param currentPassword Mot de passe actuel
 * @param newPassword Nouveau mot de passe
 * @returns Un objet contenant le succès de l'opération et un message
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Vous devez être connecté pour changer votre mot de passe."
      };
    }

    // Vérifier que le mot de passe actuel est correct en essayant de se connecter
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: currentPassword
    });

    if (signInError) {
      return {
        success: false,
        message: "Le mot de passe actuel est incorrect."
      };
    }

    // Changer le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return {
        success: false,
        message: `Erreur lors du changement de mot de passe: ${updateError.message}`
      };
    }

    return {
      success: true,
      message: "Votre mot de passe a été changé avec succès."
    };
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return {
      success: false,
      message: "Une erreur est survenue lors du changement de mot de passe."
    };
  }
};

/**
 * Déconnecte l'utilisateur de tous les appareils
 * @returns Un objet contenant le succès de l'opération et un message
 */
export const signOutFromAllDevices = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Vous devez être connecté pour vous déconnecter de tous les appareils."
      };
    }

    // Déconnecter l'utilisateur de tous les appareils
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      return {
        success: false,
        message: `Erreur lors de la déconnexion: ${error.message}`
      };
    }

    return {
      success: true,
      message: "Vous avez été déconnecté de tous les appareils."
    };
  } catch (error) {
    console.error('Erreur lors de la déconnexion de tous les appareils:', error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la déconnexion de tous les appareils."
    };
  }
};

/**
 * Supprime le compte de l'utilisateur actuellement connecté
 * @param password Mot de passe de l'utilisateur pour confirmer la suppression
 * @returns Un objet contenant le succès de l'opération et un message
 */
export const deleteAccount = async (
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Vous devez être connecté pour supprimer votre compte."
      };
    }

    // Vérifier que le mot de passe est correct en essayant de se connecter
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password
    });

    if (signInError) {
      return {
        success: false,
        message: "Le mot de passe est incorrect."
      };
    }

    // Supprimer les données de l'utilisateur en utilisant la fonction SQL
    const { data: deleteResult, error: deleteDataError } = await supabase.rpc('delete_user_account', {
      user_id: user.id
    });

    if (deleteDataError) {
      console.error('Erreur lors de la suppression des données utilisateur:', deleteDataError);
      // Continuer malgré l'erreur pour essayer de supprimer le compte auth
    }

    // 5. Supprimer le compte utilisateur
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      return {
        success: false,
        message: `Erreur lors de la suppression du compte: ${deleteUserError.message}`
      };
    }

    // 6. Déconnecter l'utilisateur
    await supabase.auth.signOut();

    return {
      success: true,
      message: "Votre compte a été supprimé avec succès."
    };
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression du compte."
    };
  }
};
