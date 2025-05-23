-- Migration pour corriger les politiques RLS pour l'insertion

-- Désactiver temporairement RLS pour les tables concernées
ALTER TABLE public.user_expertise DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_languages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS pour les tables concernées
ALTER TABLE public.user_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Créer des politiques pour permettre l'insertion par le service_role
CREATE POLICY "service_role_can_do_anything_user_expertise"
ON public.user_expertise
FOR ALL
TO service_role
USING (true);

CREATE POLICY "service_role_can_do_anything_user_languages"
ON public.user_languages
FOR ALL
TO service_role
USING (true);

CREATE POLICY "service_role_can_do_anything_user_settings"
ON public.user_settings
FOR ALL
TO service_role
USING (true);

-- Créer des politiques pour permettre l'insertion par les utilisateurs authentifiés
CREATE POLICY "authenticated_can_insert_user_expertise"
ON public.user_expertise
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_user_languages"
ON public.user_languages
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_user_settings"
ON public.user_settings
FOR INSERT
TO authenticated
WITH CHECK (true);
