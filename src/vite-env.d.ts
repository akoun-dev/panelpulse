/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Ajoutez d'autres variables d'environnement au besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
