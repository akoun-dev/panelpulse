-- Migration pour créer les tables d'expertises et de langues

-- Création de l'extension pour les UUID si elle n'existe pas déjà
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table pour les expertises des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_expertise (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expertise VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table pour les langues parlées par les utilisateurs
CREATE TABLE IF NOT EXISTS public.user_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création d'un index sur user_id pour les tables de relation
CREATE INDEX IF NOT EXISTS idx_user_expertise_user_id ON public.user_expertise(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON public.user_languages(user_id);

-- Activer RLS sur les tables
ALTER TABLE public.user_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_languages ENABLE ROW LEVEL SECURITY;

-- Politique permettant aux utilisateurs de voir toutes les expertises
CREATE POLICY "Les expertises sont visibles par tous les utilisateurs authentifiés" 
ON public.user_expertise FOR SELECT 
TO authenticated 
USING (true);

-- Politique permettant aux utilisateurs de voir toutes les langues
CREATE POLICY "Les langues sont visibles par tous les utilisateurs authentifiés" 
ON public.user_languages FOR SELECT 
TO authenticated 
USING (true);

-- Politique permettant aux utilisateurs de modifier uniquement leurs propres expertises
CREATE POLICY "Les utilisateurs peuvent modifier uniquement leurs propres expertises" 
ON public.user_expertise FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Politique permettant aux utilisateurs de modifier uniquement leurs propres langues
CREATE POLICY "Les utilisateurs peuvent modifier uniquement leurs propres langues" 
ON public.user_languages FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);
