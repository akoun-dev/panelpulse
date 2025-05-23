import { supabase } from './supabaseClient';

// Interface pour les paramètres utilisateur
export interface UserSettings {
  // Préférences d'apparence
  theme: 'light' | 'dark' | 'system';
  language: string;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewInvitations: boolean;
  notifyPanelReminders: boolean;
  notifyQuestions: boolean;

  // Confidentialité
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showCompany: boolean;

  // Sécurité
  twoFactorAuth: boolean;
  sessionTimeout: number; // en minutes
}

/**
 * Récupère les paramètres de l'utilisateur actuellement connecté
 */
export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Récupérer les paramètres de l'utilisateur
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la récupération des paramètres utilisateur:', error);
      return getDefaultSettings();
    }

    // Si aucun paramètre n'a été trouvé, retourner les valeurs par défaut
    if (!data) {
      return getDefaultSettings();
    }

    // Convertir les données de la base de données en objet UserSettings
    return {
      theme: data.theme || 'system',
      language: data.language || 'fr',

      // Convertir explicitement en booléens pour éviter les problèmes de type
      emailNotifications: data.email_notifications === true,
      pushNotifications: data.push_notifications === true,
      notifyNewInvitations: data.notify_new_invitations === true,
      notifyPanelReminders: data.notify_panel_reminders === true,
      notifyQuestions: data.notify_questions === true,

      profileVisibility: data.profile_visibility || 'public',
      showEmail: data.show_email === true,
      showCompany: data.show_company === true,

      twoFactorAuth: data.two_factor_auth === true,
      sessionTimeout: data.session_timeout || 30
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres utilisateur:', error);
    return getDefaultSettings();
  }
};

/**
 * Met à jour les paramètres de l'utilisateur
 */
export const updateUserSettings = async (settings: UserSettings): Promise<boolean> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Convertir l'objet UserSettings en format de base de données
    const dbSettings = {
      user_id: user.id,
      theme: settings.theme,
      language: settings.language,

      email_notifications: settings.emailNotifications,
      push_notifications: settings.pushNotifications,
      notify_new_invitations: settings.notifyNewInvitations,
      notify_panel_reminders: settings.notifyPanelReminders,
      notify_questions: settings.notifyQuestions,

      profile_visibility: settings.profileVisibility,
      show_email: settings.showEmail,
      show_company: settings.showCompany,

      two_factor_auth: settings.twoFactorAuth,
      session_timeout: settings.sessionTimeout,

      updated_at: new Date()
    };

    // Vérifier si les paramètres existent déjà
    const { data: existingSettings, error: existingError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    try {
      if (existingSettings) {
        // Mettre à jour les paramètres existants
        const { error: updateError } = await supabase
          .from('user_settings')
          .update(dbSettings)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Erreur lors de la mise à jour des paramètres:', updateError);
          throw updateError;
        }
      } else {
        // Créer de nouveaux paramètres
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert([{ ...dbSettings, created_at: new Date() }]);

        if (insertError) {
          console.error('Erreur lors de l\'insertion des paramètres:', insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des paramètres utilisateur:', error);
      throw error;
    }

    // Mettre à jour le thème dans localStorage pour la persistance côté client
    localStorage.setItem('theme', settings.theme);

    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres utilisateur:', error);
    return false;
  }
};

/**
 * Réinitialise les paramètres de l'utilisateur aux valeurs par défaut
 */
export const resetUserSettings = async (): Promise<boolean> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Obtenir les paramètres par défaut
    const defaultSettings = getDefaultSettings();

    // Mettre à jour les paramètres avec les valeurs par défaut
    return updateUserSettings(defaultSettings);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres utilisateur:', error);
    return false;
  }
};

/**
 * Retourne les paramètres par défaut
 */
export const getDefaultSettings = (): UserSettings => {
  // Définir explicitement les valeurs par défaut
  const defaultSettings: UserSettings = {
    theme: 'system',
    language: 'fr',

    // Valeurs booléennes explicites
    emailNotifications: true,
    pushNotifications: true,
    notifyNewInvitations: true,
    notifyPanelReminders: true,
    notifyQuestions: true,

    profileVisibility: 'public',
    showEmail: false,
    showCompany: true,

    twoFactorAuth: false,
    sessionTimeout: 30
  };

  // Journaliser les valeurs par défaut pour le débogage
  console.log('Paramètres par défaut:', defaultSettings);

  return defaultSettings;
};
