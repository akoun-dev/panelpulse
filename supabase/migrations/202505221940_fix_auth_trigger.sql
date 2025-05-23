-- Migration pour corriger le déclencheur de création de profil utilisateur

-- Suppression du déclencheur existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Suppression de la fonction existante
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Création d'une nouvelle fonction simplifiée pour créer un profil utilisateur après l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si un profil existe déjà pour cet utilisateur
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Tentative d'insertion avec gestion d'erreur
    BEGIN
        INSERT INTO public.profiles (id, email)
        VALUES (NEW.id, NEW.email);
    EXCEPTION WHEN OTHERS THEN
        -- Si l'insertion échoue, ne pas bloquer la création de l'utilisateur
        RAISE NOTICE 'Erreur lors de la création du profil: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Création du nouveau déclencheur
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour l'email du profil lorsque l'email de l'utilisateur change
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la colonne email existe dans la table profiles
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        -- Mettre à jour l'email dans le profil si l'email de l'utilisateur change
        IF NEW.email <> OLD.email THEN
            UPDATE public.profiles
            SET email = NEW.email
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, ne pas bloquer la mise à jour de l'utilisateur
    RAISE NOTICE 'Erreur lors de la mise à jour de l''email pour l''utilisateur %: %', NEW.id, SQLERRM;
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
