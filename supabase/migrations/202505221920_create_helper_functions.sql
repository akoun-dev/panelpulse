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
