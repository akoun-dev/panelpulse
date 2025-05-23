-- Migration pour créer des fonctions d'aide pour gérer les expertises et les langues des utilisateurs

-- Fonction pour ajouter une expertise à un utilisateur
CREATE OR REPLACE FUNCTION public.add_user_expertise(
  user_id UUID,
  expertise_name VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
  expertise_id UUID;
BEGIN
  -- Vérifier si l'expertise existe déjà pour cet utilisateur
  SELECT id INTO expertise_id
  FROM public.user_expertise
  WHERE user_id = add_user_expertise.user_id
  AND LOWER(expertise) = LOWER(expertise_name);
  
  -- Si l'expertise n'existe pas, l'ajouter
  IF expertise_id IS NULL THEN
    INSERT INTO public.user_expertise (user_id, expertise)
    VALUES (add_user_expertise.user_id, expertise_name)
    RETURNING id INTO expertise_id;
  END IF;
  
  RETURN expertise_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer une expertise d'un utilisateur
CREATE OR REPLACE FUNCTION public.remove_user_expertise(
  user_id UUID,
  expertise_name VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  DELETE FROM public.user_expertise
  WHERE user_id = remove_user_expertise.user_id
  AND LOWER(expertise) = LOWER(expertise_name);
  
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  
  RETURN rows_deleted > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter une langue à un utilisateur
CREATE OR REPLACE FUNCTION public.add_user_language(
  user_id UUID,
  language_name VARCHAR(100)
)
RETURNS UUID AS $$
DECLARE
  language_id UUID;
BEGIN
  -- Vérifier si la langue existe déjà pour cet utilisateur
  SELECT id INTO language_id
  FROM public.user_languages
  WHERE user_id = add_user_language.user_id
  AND LOWER(language) = LOWER(language_name);
  
  -- Si la langue n'existe pas, l'ajouter
  IF language_id IS NULL THEN
    INSERT INTO public.user_languages (user_id, language)
    VALUES (add_user_language.user_id, language_name)
    RETURNING id INTO language_id;
  END IF;
  
  RETURN language_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer une langue d'un utilisateur
CREATE OR REPLACE FUNCTION public.remove_user_language(
  user_id UUID,
  language_name VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  DELETE FROM public.user_languages
  WHERE user_id = remove_user_language.user_id
  AND LOWER(language) = LOWER(language_name);
  
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  
  RETURN rows_deleted > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir toutes les expertises d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_expertise(user_id UUID)
RETURNS TABLE (expertise VARCHAR(255)) AS $$
BEGIN
  RETURN QUERY
  SELECT ue.expertise
  FROM public.user_expertise ue
  WHERE ue.user_id = get_user_expertise.user_id
  ORDER BY ue.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir toutes les langues d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_languages(user_id UUID)
RETURNS TABLE (language VARCHAR(100)) AS $$
BEGIN
  RETURN QUERY
  SELECT ul.language
  FROM public.user_languages ul
  WHERE ul.user_id = get_user_languages.user_id
  ORDER BY ul.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le profil utilisateur complet
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id UUID,
  user_name VARCHAR(255),
  user_company VARCHAR(255),
  user_role VARCHAR(255),
  user_location VARCHAR(255),
  user_bio TEXT,
  user_social_links JSONB,
  user_expertise VARCHAR[],
  user_languages VARCHAR[]
)
RETURNS BOOLEAN AS $$
DECLARE
  expertise_item VARCHAR;
  language_item VARCHAR;
BEGIN
  -- Mettre à jour les informations de base du profil
  UPDATE public.profiles
  SET
    name = user_name,
    company = user_company,
    role = user_role,
    location = user_location,
    bio = user_bio,
    social_links = user_social_links,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Supprimer toutes les expertises existantes
  DELETE FROM public.user_expertise
  WHERE user_id = update_user_profile.user_id;
  
  -- Ajouter les nouvelles expertises
  IF user_expertise IS NOT NULL THEN
    FOREACH expertise_item IN ARRAY user_expertise
    LOOP
      PERFORM public.add_user_expertise(user_id, expertise_item);
    END LOOP;
  END IF;
  
  -- Supprimer toutes les langues existantes
  DELETE FROM public.user_languages
  WHERE user_id = update_user_profile.user_id;
  
  -- Ajouter les nouvelles langues
  IF user_languages IS NOT NULL THEN
    FOREACH language_item IN ARRAY user_languages
    LOOP
      PERFORM public.add_user_language(user_id, language_item);
    END LOOP;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
