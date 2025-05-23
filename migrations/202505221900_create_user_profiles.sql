-- Migration pour créer la table des profils utilisateur
-- Cette table étend les informations de base des utilisateurs de Supabase Auth

-- Création de l'extension pour les UUID si elle n'existe pas déjà
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création du type d'énumération pour les rôles utilisateur
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Création de la table des profils utilisateur
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Champs d'identification
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url TEXT,
  
  -- Informations professionnelles
  company VARCHAR(255),
  role VARCHAR(255),
  location VARCHAR(255),
  bio TEXT,
  
  -- Statistiques
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  panels_created INTEGER DEFAULT 0,
  panels_participated INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  total_speaking_time INTEGER DEFAULT 0, -- en minutes
  
  -- Liens sociaux (stockés en JSON)
  social_links JSONB DEFAULT '{}'::jsonb,
  
  -- Champs système
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_role user_role DEFAULT 'user'::user_role
);

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

-- Fonction pour mettre à jour le champ updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le champ updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les tables et les colonnes
COMMENT ON TABLE public.profiles IS 'Profils des utilisateurs de l''application PanelPulse';
COMMENT ON COLUMN public.profiles.id IS 'Référence à l''ID utilisateur dans auth.users';
COMMENT ON COLUMN public.profiles.user_role IS 'Rôle de l''utilisateur dans l''application (user, admin, moderator)';

-- Création d'une politique RLS (Row Level Security) pour les profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique permettant aux utilisateurs de voir tous les profils
CREATE POLICY "Les profils sont visibles par tous les utilisateurs authentifiés" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Politique permettant aux utilisateurs de modifier uniquement leur propre profil
CREATE POLICY "Les utilisateurs peuvent modifier uniquement leur propre profil" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Politique permettant aux administrateurs de modifier tous les profils
CREATE POLICY "Les administrateurs peuvent modifier tous les profils" 
ON public.profiles FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE user_role = 'admin'
  )
);
