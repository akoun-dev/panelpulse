-- Migration pour créer la table des paramètres utilisateur

-- Création de la table user_settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Préférences d'apparence
  theme VARCHAR(10) NOT NULL DEFAULT 'system',
  language VARCHAR(5) NOT NULL DEFAULT 'fr',
  
  -- Notifications
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  notify_new_invitations BOOLEAN NOT NULL DEFAULT true,
  notify_panel_reminders BOOLEAN NOT NULL DEFAULT true,
  notify_questions BOOLEAN NOT NULL DEFAULT true,
  
  -- Confidentialité
  profile_visibility VARCHAR(10) NOT NULL DEFAULT 'public',
  show_email BOOLEAN NOT NULL DEFAULT false,
  show_company BOOLEAN NOT NULL DEFAULT true,
  
  -- Sécurité
  two_factor_auth BOOLEAN NOT NULL DEFAULT false,
  session_timeout INTEGER NOT NULL DEFAULT 30,
  
  -- Champs système
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité sur user_id
  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

-- Création d'un index sur user_id
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Activer RLS sur la table user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Politique permettant aux utilisateurs de voir uniquement leurs propres paramètres
CREATE POLICY "Les utilisateurs peuvent voir uniquement leurs propres paramètres" 
ON public.user_settings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Politique permettant aux utilisateurs de modifier uniquement leurs propres paramètres
CREATE POLICY "Les utilisateurs peuvent modifier uniquement leurs propres paramètres" 
ON public.user_settings FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le champ updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le champ updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION update_user_settings_updated_at();
