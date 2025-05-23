-- Migration pour corriger les politiques RLS de la table user_settings

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "user_settings_select_policy" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_all_policy" ON public.user_settings;
DROP POLICY IF EXISTS "service_role_can_do_anything_user_settings" ON public.user_settings;
DROP POLICY IF EXISTS "authenticated_can_insert_user_settings" ON public.user_settings;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir uniquement leurs propres paramèt" ON public.user_settings;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier uniquement leurs propres para" ON public.user_settings;

-- Créer de nouvelles politiques
-- Politique pour permettre aux utilisateurs de voir leurs propres paramètres
CREATE POLICY "users_can_view_own_settings"
ON public.user_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres paramètres
CREATE POLICY "users_can_update_own_settings"
ON public.user_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer leurs propres paramètres
CREATE POLICY "users_can_insert_own_settings"
ON public.user_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres paramètres
CREATE POLICY "users_can_delete_own_settings"
ON public.user_settings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre au service_role de tout faire
CREATE POLICY "service_role_can_do_anything"
ON public.user_settings
FOR ALL
TO service_role
USING (true);
