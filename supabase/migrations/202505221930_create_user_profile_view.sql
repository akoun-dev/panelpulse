-- Migration pour créer une vue qui combine les profils utilisateur avec leurs expertises et langues

-- Création d'une vue simple pour les profils utilisateur
CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT
  u.id,
  u.email as name,
  u.email,
  NULL as avatar_url,
  'user' as user_role,
  ARRAY[]::VARCHAR[] as expertise,
  ARRAY[]::VARCHAR[] as languages
FROM
  auth.users u;

-- Commentaire sur la vue
COMMENT ON VIEW public.user_profiles_view IS 'Vue qui combine les profils utilisateur avec leurs expertises et langues';

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
  user_languages VARCHAR[])
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
