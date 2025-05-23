import { createClient } from '@supabase/supabase-js';

// Utilisation des variables d'environnement pour Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas définies correctement.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Définie' : 'Non définie');
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
