// Script pour vérifier les tables et les données dans la base de données
import { createClient } from '@supabase/supabase-js';

// Utiliser directement les valeurs du fichier .env
const supabaseUrl = 'https://yvmwagtorsrgeacjmuha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXdhZ3RvcnNyZ2VhY2ptdWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzAxNzMsImV4cCI6MjA2MzUwNjE3M30._LiY_1pvNaaA_LzZ6PVl2x3bA48m-AXdV1bK37K4lZo';

// Créer un client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('Vérification de la base de données...');

  try {
    // Vérifier la table profiles
    console.log('\n--- Table profiles ---');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('Erreur lors de la récupération des profils:', profilesError);
    } else {
      console.log(`Nombre de profils: ${profiles.length}`);
      if (profiles.length > 0) {
        console.log('Premier profil:', JSON.stringify(profiles[0], null, 2));
      } else {
        console.log('Aucun profil trouvé');
      }
    }

    // Vérifier la table user_expertise
    console.log('\n--- Table user_expertise ---');
    const { data: expertise, error: expertiseError } = await supabase
      .from('user_expertise')
      .select('*')
      .limit(5);

    if (expertiseError) {
      console.error('Erreur lors de la récupération des expertises:', expertiseError);
    } else {
      console.log(`Nombre d'expertises: ${expertise.length}`);
      if (expertise.length > 0) {
        console.log('Première expertise:', JSON.stringify(expertise[0], null, 2));
      } else {
        console.log('Aucune expertise trouvée');
      }
    }

    // Vérifier la table user_languages
    console.log('\n--- Table user_languages ---');
    const { data: languages, error: languagesError } = await supabase
      .from('user_languages')
      .select('*')
      .limit(5);

    if (languagesError) {
      console.error('Erreur lors de la récupération des langues:', languagesError);
    } else {
      console.log(`Nombre de langues: ${languages.length}`);
      if (languages.length > 0) {
        console.log('Première langue:', JSON.stringify(languages[0], null, 2));
      } else {
        console.log('Aucune langue trouvée');
      }
    }

    // Vérifier la table user_settings
    console.log('\n--- Table user_settings ---');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(5);

    if (settingsError) {
      console.error('Erreur lors de la récupération des paramètres:', settingsError);
    } else {
      console.log(`Nombre de paramètres: ${settings.length}`);
      if (settings.length > 0) {
        console.log('Premier paramètre:', JSON.stringify(settings[0], null, 2));
      } else {
        console.log('Aucun paramètre trouvé');
      }
    }

    // Vérifier la vue user_profiles_view
    console.log('\n--- Vue user_profiles_view ---');
    const { data: profilesView, error: profilesViewError } = await supabase
      .from('user_profiles_view')
      .select('*')
      .limit(5);

    if (profilesViewError) {
      console.error('Erreur lors de la récupération des profils (vue):', profilesViewError);
    } else {
      console.log(`Nombre de profils (vue): ${profilesView.length}`);
      if (profilesView.length > 0) {
        console.log('Premier profil (vue):', JSON.stringify(profilesView[0], null, 2));
      } else {
        console.log('Aucun profil trouvé (vue)');
      }
    }

    // Vérifier la fonction update_user_profile
    console.log('\n--- Fonction update_user_profile ---');
    try {
      const { data: functionResult, error: functionError } = await supabase.rpc('update_user_profile', {
        user_id: '00000000-0000-0000-0000-000000000000', // ID fictif
        user_name: 'Test',
        user_company: 'Test Company',
        user_role: 'Test Role',
        user_location: 'Test Location',
        user_bio: 'Test Bio',
        user_social_links: { website: 'https://example.com' },
        user_expertise: ['Test Expertise'],
        user_languages: ['Test Language']
      });

      if (functionError) {
        console.error('Erreur lors de l\'appel de la fonction:', functionError);
      } else {
        console.log('Résultat de la fonction:', functionResult);
      }
    } catch (error) {
      console.error('Exception lors de l\'appel de la fonction:', error);
    }

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

// Exécuter la vérification
checkDatabase().catch(console.error);
