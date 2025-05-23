-- Migration pour créer ou mettre à jour la vue des profils utilisateurs

-- Vérifier si la vue existe déjà
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'user_profiles_view') THEN
    -- Supprimer la vue existante
    DROP VIEW public.user_profiles_view;
  END IF;
END $$;

-- Créer la vue
CREATE VIEW public.user_profiles_view AS
SELECT
  p.id,
  p.email,
  p.name,
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
  COALESCE(
    (SELECT array_agg(ue.expertise) FROM public.user_expertise ue WHERE ue.user_id = p.id),
    ARRAY[]::VARCHAR[]
  ) AS expertise,
  COALESCE(
    (SELECT array_agg(ul.language) FROM public.user_languages ul WHERE ul.user_id = p.id),
    ARRAY[]::VARCHAR[]
  ) AS languages,
  'user'::VARCHAR AS user_role
FROM
  public.profiles p;

-- La sécurité est définie au niveau de la table profiles
-- Les vues héritent des politiques RLS des tables sous-jacentes
