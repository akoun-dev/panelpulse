-- Migration pour ajouter les colonnes manquantes à la table panelists

-- Ajout des colonnes manquantes à la table panelists
ALTER TABLE public.panelists
ADD COLUMN IF NOT EXISTS time_allocated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS expertise TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS speaking_time_history JSONB DEFAULT '[]'::jsonb;

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN public.panelists.time_allocated IS 'Temps alloué au panéliste en minutes';
COMMENT ON COLUMN public.panelists.time_used IS 'Temps utilisé par le panéliste en minutes';
COMMENT ON COLUMN public.panelists.status IS 'Statut du panéliste (inactive, active, speaking, etc.)';
COMMENT ON COLUMN public.panelists.order_index IS 'Ordre d''affichage du panéliste dans le panel';
COMMENT ON COLUMN public.panelists.is_moderator IS 'Indique si le panéliste est le modérateur du panel';
COMMENT ON COLUMN public.panelists.notes IS 'Notes privées sur le panéliste';
COMMENT ON COLUMN public.panelists.expertise IS 'Domaines d''expertise du panéliste';
COMMENT ON COLUMN public.panelists.languages IS 'Langues parlées par le panéliste';
COMMENT ON COLUMN public.panelists.social_links IS 'Liens vers les profils sociaux du panéliste';
COMMENT ON COLUMN public.panelists.avatar_url IS 'URL de l''avatar du panéliste';
COMMENT ON COLUMN public.panelists.bio IS 'Biographie du panéliste';
COMMENT ON COLUMN public.panelists.speaking_time_history IS 'Historique des temps de parole du panéliste';

-- Création d'un index sur status pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_panelists_status ON public.panelists(status);

-- Création d'un index sur is_moderator pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_panelists_is_moderator ON public.panelists(is_moderator);

-- Création d'un index sur order_index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_panelists_order_index ON public.panelists(order_index);

-- Fonction pour mettre à jour le statut d'un panéliste
CREATE OR REPLACE FUNCTION update_panelist_status(panelist_id UUID, new_status VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.panelists
  SET status = new_status,
      updated_at = NOW()
  WHERE id = panelist_id;

  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le temps utilisé par un panéliste
CREATE OR REPLACE FUNCTION update_panelist_time_used(panelist_id UUID, additional_time INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.panelists
  SET time_used = time_used + additional_time,
      updated_at = NOW()
  WHERE id = panelist_id;

  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter une entrée à l'historique des temps de parole d'un panéliste
CREATE OR REPLACE FUNCTION add_speaking_time_entry(
  panelist_id UUID,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
  current_history JSONB;
  new_entry JSONB;
BEGIN
  -- Récupérer l'historique actuel
  SELECT speaking_time_history INTO current_history
  FROM public.panelists
  WHERE id = panelist_id;

  -- Créer la nouvelle entrée
  new_entry = jsonb_build_object(
    'start_time', start_time,
    'end_time', end_time,
    'duration', duration
  );

  -- Mettre à jour l'historique
  UPDATE public.panelists
  SET speaking_time_history = COALESCE(current_history, '[]'::jsonb) || new_entry,
      time_used = time_used + duration,
      updated_at = NOW()
  WHERE id = panelist_id;

  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;