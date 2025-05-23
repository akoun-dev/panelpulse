// Script pour mettre à jour le profil utilisateur directement en base de données
import { createClient } from '@supabase/supabase-js';

// Utiliser directement les valeurs du fichier .env
const supabaseUrl = 'https://yvmwagtorsrgeacjmuha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXdhZ3RvcnNyZ2VhY2ptdWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzAxNzMsImV4cCI6MjA2MzUwNjE3M30._LiY_1pvNaaA_LzZ6PVl2x3bA48m-AXdV1bK37K4lZo';

// Créer un client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ID de l'utilisateur à mettre à jour
const userId = '62dd1794-785f-4f6d-bb91-993e35d3ffde';

async function updateProfile() {
  console.log('Mise à jour du profil utilisateur...');

  try {
    // Utiliser la fonction update_user_profile
    console.log('\n--- Utilisation de la fonction update_user_profile ---');
    const { data: functionResult, error: functionError } = await supabase.rpc('update_user_profile', {
      user_id: userId,
      user_name: 'ABOA AKOUN BERNARD',
      user_company: 'Augment Code',
      user_role: 'Développeur',
      user_location: 'Abidjan, Côte d\'Ivoire',
      user_bio: 'Développeur passionné par les technologies web et mobile.',
      user_social_links: {
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/example',
        twitter: 'https://twitter.com/example'
      },
      user_expertise: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      user_languages: ['Français', 'Anglais']
    });

    if (functionError) {
      console.error('Erreur lors de l\'appel de la fonction update_user_profile:', functionError);
    } else {
      console.log('Résultat de la fonction update_user_profile:', functionResult);
    }

    // Ajouter des paramètres utilisateur
    console.log('\n--- Ajout de paramètres utilisateur ---');

    // Vérifier si les paramètres existent déjà
    const { data: existingSettings, error: existingSettingsError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSettingsError) {
      console.error('Erreur lors de la vérification des paramètres existants:', existingSettingsError);
    } else {
      if (existingSettings) {
        // Mettre à jour les paramètres existants
        const { data: updateSettingsResult, error: updateSettingsError } = await supabase
          .from('user_settings')
          .update({
            theme: 'dark',
            language: 'fr',
            email_notifications: true,
            push_notifications: true,
            notify_new_invitations: true,
            notify_panel_reminders: true,
            notify_questions: true,
            profile_visibility: 'public',
            show_email: false,
            show_company: true,
            two_factor_auth: false,
            session_timeout: 30,
            updated_at: new Date()
          })
          .eq('user_id', userId);

        if (updateSettingsError) {
          console.error('Erreur lors de la mise à jour des paramètres utilisateur:', updateSettingsError);
        } else {
          console.log('Paramètres utilisateur mis à jour avec succès');
        }
      } else {
        // Insérer de nouveaux paramètres
        const { data: insertSettingsResult, error: insertSettingsError } = await supabase
          .from('user_settings')
          .insert([{
            user_id: userId,
            theme: 'dark',
            language: 'fr',
            email_notifications: true,
            push_notifications: true,
            notify_new_invitations: true,
            notify_panel_reminders: true,
            notify_questions: true,
            profile_visibility: 'public',
            show_email: false,
            show_company: true,
            two_factor_auth: false,
            session_timeout: 30
          }]);

        if (insertSettingsError) {
          console.error('Erreur lors de l\'ajout des paramètres utilisateur:', insertSettingsError);
        } else {
          console.log('Paramètres utilisateur ajoutés avec succès');
        }
      }
    }

    // Vérifier le profil mis à jour
    console.log('\n--- Vérification du profil mis à jour ---');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles_view')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil mis à jour:', profileError);
    } else {
      console.log('Profil mis à jour:', JSON.stringify(profile, null, 2));
    }

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

// Exécuter la mise à jour
updateProfile().catch(console.error);
