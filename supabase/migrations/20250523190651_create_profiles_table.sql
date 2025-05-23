-- Création de la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajout des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.profiles IS 'Profils des utilisateurs de l''application';
COMMENT ON COLUMN public.profiles.id IS 'Identifiant unique du profil, correspondant à l''ID de l''utilisateur dans auth.users';
COMMENT ON COLUMN public.profiles.email IS 'Adresse email de l''utilisateur';
COMMENT ON COLUMN public.profiles.name IS 'Nom complet de l''utilisateur';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de l''avatar de l''utilisateur';
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur (user, admin, etc.)';
COMMENT ON COLUMN public.profiles.created_at IS 'Date de création du profil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Date de dernière mise à jour du profil';

-- Permissions RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir tous les profils
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour appeler la fonction lors de l'inscription d'un nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();