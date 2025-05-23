-- Migration pour créer une fonction de suppression de compte

-- Fonction pour supprimer un compte utilisateur et toutes ses données associées
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN := FALSE;
BEGIN
  -- Supprimer les paramètres utilisateur
  DELETE FROM public.user_settings
  WHERE user_id = delete_user_account.user_id;
  
  -- Supprimer les expertises
  DELETE FROM public.user_expertise
  WHERE user_id = delete_user_account.user_id;
  
  -- Supprimer les langues
  DELETE FROM public.user_languages
  WHERE user_id = delete_user_account.user_id;
  
  -- Supprimer le profil
  DELETE FROM public.profiles
  WHERE id = delete_user_account.user_id;
  
  -- La suppression du compte auth.users sera gérée par l'API Supabase Auth
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de la suppression du compte: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
