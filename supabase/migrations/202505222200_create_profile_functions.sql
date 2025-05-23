-- Migration pour créer la fonction de mise à jour du profil utilisateur

-- Fonction pour mettre à jour le profil utilisateur
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
  success BOOLEAN := FALSE;
  expertise VARCHAR;
  language VARCHAR;
BEGIN
  -- Mettre à jour les informations de base du profil
  UPDATE public.profiles
  SET
    name = COALESCE(user_name, name),
    company = user_company,
    role = user_role,
    location = user_location,
    bio = user_bio,
    social_links = COALESCE(user_social_links, social_links),
    updated_at = NOW()
  WHERE id = user_id;

  -- Vérifier si la mise à jour a réussi
  IF FOUND THEN
    success := TRUE;
  ELSE
    RETURN FALSE;
  END IF;

  -- Supprimer toutes les expertises existantes
  DELETE FROM public.user_expertise
  WHERE user_id = update_user_profile.user_id;

  -- Ajouter les nouvelles expertises
  IF user_expertise IS NOT NULL AND array_length(user_expertise, 1) > 0 THEN
    FOREACH expertise IN ARRAY user_expertise
    LOOP
      INSERT INTO public.user_expertise (user_id, expertise)
      VALUES (update_user_profile.user_id, expertise);
    END LOOP;
  END IF;

  -- Supprimer toutes les langues existantes
  DELETE FROM public.user_languages
  WHERE user_id = update_user_profile.user_id;

  -- Ajouter les nouvelles langues
  IF user_languages IS NOT NULL AND array_length(user_languages, 1) > 0 THEN
    FOREACH language IN ARRAY user_languages
    LOOP
      INSERT INTO public.user_languages (user_id, language)
      VALUES (update_user_profile.user_id, language);
    END LOOP;
  END IF;

  RETURN success;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de la mise à jour du profil: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
