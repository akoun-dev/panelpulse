// Script pour exécuter les migrations Supabase
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Créer le client Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définies.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour lire et exécuter un fichier SQL
async function executeSqlFile(filePath) {
  try {
    console.log(`Exécution de ${filePath}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Erreur lors de l'exécution de ${filePath}:`, error);
      return false;
    }
    
    console.log(`${filePath} exécuté avec succès.`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la lecture ou de l'exécution de ${filePath}:`, error);
    return false;
  }
}

// Fonction principale pour exécuter toutes les migrations
async function runMigrations() {
  console.log('Début de l\'exécution des migrations...');
  
  // Vérifier si le répertoire des migrations existe
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Le répertoire ${migrationsDir} n'existe pas.`);
    process.exit(1);
  }
  
  // Lire tous les fichiers de migration
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Trier par ordre alphabétique
  
  console.log(`Fichiers de migration trouvés: ${migrationFiles.join(', ')}`);
  
  // Créer la fonction exec_sql si elle n'existe pas déjà
  const createExecSqlFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
    RETURNS VOID AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  const { error: funcError } = await supabase.rpc('exec_sql', { 
    sql_query: createExecSqlFunction 
  }).catch(() => {
    // Si la fonction n'existe pas encore, on la crée directement
    return supabase.from('_rpc').select('*').rpc('exec', { 
      query: createExecSqlFunction 
    });
  });
  
  if (funcError) {
    console.error('Erreur lors de la création de la fonction exec_sql:', funcError);
    console.log('Tentative alternative de création de la fonction...');
    
    // Tentative alternative en utilisant une requête SQL brute
    const { error: rawError } = await supabase.from('_rpc').select('*').rpc('exec', { 
      query: createExecSqlFunction 
    });
    
    if (rawError) {
      console.error('Impossible de créer la fonction exec_sql:', rawError);
      console.error('Veuillez exécuter les migrations manuellement via l\'interface SQL de Supabase.');
      process.exit(1);
    }
  }
  
  // Exécuter chaque fichier de migration
  let success = true;
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const result = await executeSqlFile(filePath);
    if (!result) {
      success = false;
      console.error(`Échec de la migration ${file}.`);
      break;
    }
  }
  
  if (success) {
    console.log('Toutes les migrations ont été exécutées avec succès.');
  } else {
    console.error('Certaines migrations ont échoué. Veuillez vérifier les erreurs ci-dessus.');
    process.exit(1);
  }
}

// Exécuter les migrations
runMigrations().catch(error => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});
