-- Migration pour créer un déclencheur qui crée automatiquement un profil utilisateur
-- lorsqu'un nouvel utilisateur s'inscrit via Supabase Auth

-- Fonction pour créer un profil utilisateur après l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer un nouveau profil avec les informations de base de l'utilisateur
  INSERT INTO public.profiles (
    id,
    name,
    email,
    avatar_url,
    user_role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    -- Attribuer le rôle 'user' par défaut, sauf si spécifié autrement dans les métadonnées
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'moderator' THEN 'moderator'::user_role
      ELSE 'user'::user_role
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur qui s'exécute après l'insertion d'un nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour l'email du profil lorsque l'email de l'utilisateur change
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour l'email dans le profil si l'email de l'utilisateur change
  IF NEW.email <> OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur qui s'exécute après la mise à jour d'un utilisateur
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (NEW.email IS DISTINCT FROM OLD.email)
EXECUTE FUNCTION public.handle_user_email_change();
