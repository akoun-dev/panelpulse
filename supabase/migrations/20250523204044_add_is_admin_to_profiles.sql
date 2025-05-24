-- Migration pour ajouter le champ is_admin à la table profiles
-- Ce champ permettra de gérer la redirection vers l'interface administrateur

-- Ajout de la colonne is_admin à la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Commentaire sur la nouvelle colonne
COMMENT ON COLUMN public.profiles.is_admin IS 'Indique si l''utilisateur a des droits d''administrateur';

-- Création d'un index sur is_admin pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Fonction pour promouvoir un utilisateur en administrateur
CREATE OR REPLACE FUNCTION promote_to_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.profiles
  SET is_admin = TRUE
  WHERE id = user_id;

  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour révoquer les droits d'administrateur d'un utilisateur
CREATE OR REPLACE FUNCTION revoke_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.profiles
  SET is_admin = FALSE
  WHERE id = user_id;

  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique permettant uniquement aux administrateurs de promouvoir d'autres utilisateurs
CREATE POLICY "Seuls les administrateurs peuvent promouvoir d'autres utilisateurs"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = TRUE
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = TRUE
  )
);

-- Fonction pour vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status
  FROM public.profiles
  WHERE id = user_id;

  RETURN COALESCE(admin_status, FALSE);
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;