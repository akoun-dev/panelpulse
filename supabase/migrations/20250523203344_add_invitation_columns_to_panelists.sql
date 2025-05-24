-- Ajout des colonnes d'invitation à la table panelists
ALTER TABLE public.panelists
ADD COLUMN IF NOT EXISTS invitation_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS invitation_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMP WITH TIME ZONE;

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN public.panelists.invitation_sent IS 'Indique si l''invitation a été envoyée au panéliste';
COMMENT ON COLUMN public.panelists.invitation_accepted IS 'Indique si l''invitation a été acceptée par le panéliste';
COMMENT ON COLUMN public.panelists.invitation_token IS 'Token unique pour l''invitation';
COMMENT ON COLUMN public.panelists.invitation_sent_at IS 'Date et heure d''envoi de l''invitation';
COMMENT ON COLUMN public.panelists.invitation_accepted_at IS 'Date et heure d''acceptation de l''invitation';

-- Ajout d'un index pour améliorer les performances des requêtes sur les invitations
CREATE INDEX IF NOT EXISTS panelists_invitation_status_idx ON public.panelists(invitation_sent, invitation_accepted);

-- Fonction pour générer un token d'invitation unique
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invitation_token := encode(gen_random_bytes(20), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un token d'invitation lors de l'insertion
DROP TRIGGER IF EXISTS set_invitation_token ON public.panelists;
CREATE TRIGGER set_invitation_token
BEFORE INSERT ON public.panelists
FOR EACH ROW
WHEN (NEW.invitation_token IS NULL)
EXECUTE FUNCTION generate_invitation_token();

-- Fonction pour mettre à jour la date d'envoi de l'invitation
CREATE OR REPLACE FUNCTION update_invitation_sent_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_sent = TRUE AND (OLD.invitation_sent = FALSE OR OLD.invitation_sent IS NULL) THEN
    NEW.invitation_sent_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement la date d'envoi de l'invitation
DROP TRIGGER IF EXISTS set_invitation_sent_at ON public.panelists;
CREATE TRIGGER set_invitation_sent_at
BEFORE UPDATE ON public.panelists
FOR EACH ROW
EXECUTE FUNCTION update_invitation_sent_at();

-- Fonction pour mettre à jour la date d'acceptation de l'invitation
CREATE OR REPLACE FUNCTION update_invitation_accepted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_accepted = TRUE AND (OLD.invitation_accepted = FALSE OR OLD.invitation_accepted IS NULL) THEN
    NEW.invitation_accepted_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement la date d'acceptation de l'invitation
DROP TRIGGER IF EXISTS set_invitation_accepted_at ON public.panelists;
CREATE TRIGGER set_invitation_accepted_at
BEFORE UPDATE ON public.panelists
FOR EACH ROW
EXECUTE FUNCTION update_invitation_accepted_at();