-- Migration pour créer la table profiles si elle n'existe pas

-- Création de la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  company VARCHAR(255),
  role VARCHAR(255),
  location VARCHAR(255),
  bio TEXT,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  panels_created INTEGER DEFAULT 0,
  panels_participated INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  total_speaking_time INTEGER DEFAULT 0,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création d'un index sur email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Activer RLS sur la table profiles
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
