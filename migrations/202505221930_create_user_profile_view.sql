-- Migration pour créer une vue qui combine les profils utilisateur avec leurs expertises et langues

-- Création d'une vue pour les profils utilisateur complets
CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT
  p.id,
  p.name,
  p.email,
  p.avatar_url,
  p.company,
  p.role,
  p.location,
  p.bio,
  p.joined_date,
  p.panels_created,
  p.panels_participated,
  p.questions_answered,
  p.total_speaking_time,
  p.social_links,
  p.created_at,
  p.updated_at,
  p.user_role,
  -- Agréger les expertises en tableau
  COALESCE(
    (SELECT array_agg(ue.expertise ORDER BY ue.created_at)
     FROM public.user_expertise ue
     WHERE ue.user_id = p.id),
    ARRAY[]::VARCHAR[]
  ) AS expertise,
  -- Agréger les langues en tableau
  COALESCE(
    (SELECT array_agg(ul.language ORDER BY ul.created_at)
     FROM public.user_languages ul
     WHERE ul.user_id = p.id),
    ARRAY[]::VARCHAR[]
  ) AS languages
FROM
  public.profiles p;

-- Commentaire sur la vue
COMMENT ON VIEW public.user_profiles_view IS 'Vue qui combine les profils utilisateur avec leurs expertises et langues';

-- Création d'une politique RLS pour la vue
ALTER VIEW public.user_profiles_view SECURITY INVOKER;

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
