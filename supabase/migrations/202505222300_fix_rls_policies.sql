-- Migration pour corriger les politiques RLS

-- Vérifier et corriger les politiques RLS sur la table profiles
DO $$
BEGIN
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Les profils sont visibles par tous les utilisateurs authentifi" ON public.profiles;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier uniquement leur propre profil" ON public.profiles;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "profiles_select_policy" 
  ON public.profiles FOR SELECT 
  USING (true);
  
  CREATE POLICY "profiles_update_policy" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
  
  CREATE POLICY "profiles_insert_policy" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
END $$;

-- Vérifier et corriger les politiques RLS sur la table user_expertise
DO $$
BEGIN
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Les expertises sont visibles par tous les utilisateurs authenti" ON public.user_expertise;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier uniquement leurs propres expe" ON public.user_expertise;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "user_expertise_select_policy" 
  ON public.user_expertise FOR SELECT 
  USING (true);
  
  CREATE POLICY "user_expertise_all_policy" 
  ON public.user_expertise FOR ALL 
  USING (auth.uid() = user_id);
END $$;

-- Vérifier et corriger les politiques RLS sur la table user_languages
DO $$
BEGIN
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Les langues sont visibles par tous les utilisateurs authentifi" ON public.user_languages;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier uniquement leurs propres lang" ON public.user_languages;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "user_languages_select_policy" 
  ON public.user_languages FOR SELECT 
  USING (true);
  
  CREATE POLICY "user_languages_all_policy" 
  ON public.user_languages FOR ALL 
  USING (auth.uid() = user_id);
END $$;

-- Vérifier et corriger les politiques RLS sur la table user_settings
DO $$
BEGIN
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir uniquement leurs propres paramèt" ON public.user_settings;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier uniquement leurs propres para" ON public.user_settings;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "user_settings_select_policy" 
  ON public.user_settings FOR SELECT 
  USING (true);
  
  CREATE POLICY "user_settings_all_policy" 
  ON public.user_settings FOR ALL 
  USING (auth.uid() = user_id);
END $$;
