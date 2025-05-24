-- Migration pour ajouter les colonnes manquantes à la table panels

-- Ajout des colonnes manquantes à la table panels
ALTER TABLE public.panels
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60, -- Durée en minutes
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS access_code TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS location_details TEXT,
ADD COLUMN IF NOT EXISTS max_panelists INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN public.panels.start_time IS 'Heure de début du panel';
COMMENT ON COLUMN public.panels.end_time IS 'Heure de fin du panel';
COMMENT ON COLUMN public.panels.duration IS 'Durée prévue du panel en minutes';
COMMENT ON COLUMN public.panels.status IS 'Statut du panel (draft, scheduled, active, completed, cancelled)';
COMMENT ON COLUMN public.panels.is_public IS 'Indique si le panel est accessible publiquement';
COMMENT ON COLUMN public.panels.access_code IS 'Code d''accès pour les panels privés';
COMMENT ON COLUMN public.panels.location IS 'Lieu du panel';
COMMENT ON COLUMN public.panels.location_details IS 'Détails sur le lieu du panel';
COMMENT ON COLUMN public.panels.max_panelists IS 'Nombre maximum de panélistes autorisés';
COMMENT ON COLUMN public.panels.tags IS 'Tags associés au panel';
COMMENT ON COLUMN public.panels.category IS 'Catégorie du panel';
COMMENT ON COLUMN public.panels.banner_url IS 'URL de la bannière du panel';
COMMENT ON COLUMN public.panels.logo_url IS 'URL du logo du panel';
COMMENT ON COLUMN public.panels.color_theme IS 'Thème de couleur du panel';
COMMENT ON COLUMN public.panels.qr_code_url IS 'URL du QR code pour accéder au panel';
COMMENT ON COLUMN public.panels.is_featured IS 'Indique si le panel est mis en avant';
COMMENT ON COLUMN public.panels.is_archived IS 'Indique si le panel est archivé';
COMMENT ON COLUMN public.panels.view_count IS 'Nombre de vues du panel';
COMMENT ON COLUMN public.panels.settings IS 'Paramètres personnalisés du panel';

-- Création d'index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_panels_status ON public.panels(status);
CREATE INDEX IF NOT EXISTS idx_panels_is_public ON public.panels(is_public);
CREATE INDEX IF NOT EXISTS idx_panels_is_featured ON public.panels(is_featured);
CREATE INDEX IF NOT EXISTS idx_panels_is_archived ON public.panels(is_archived);
CREATE INDEX IF NOT EXISTS idx_panels_start_time ON public.panels(start_time);
CREATE INDEX IF NOT EXISTS idx_panels_category ON public.panels(category);

-- Fonction pour générer un code d'accès aléatoire
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_code IS NULL THEN
    NEW.access_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un code d'accès lors de l'insertion
DROP TRIGGER IF EXISTS set_panel_access_code ON public.panels;
CREATE TRIGGER set_panel_access_code
BEFORE INSERT ON public.panels
FOR EACH ROW
WHEN (NEW.access_code IS NULL)
EXECUTE FUNCTION generate_access_code();

-- Fonction pour calculer l'heure de fin en fonction de l'heure de début et de la durée
CREATE OR REPLACE FUNCTION calculate_panel_end_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL AND NEW.duration IS NOT NULL AND NEW.end_time IS NULL THEN
    NEW.end_time := NEW.start_time + (NEW.duration * INTERVAL '1 minute');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement l'heure de fin
DROP TRIGGER IF EXISTS set_panel_end_time ON public.panels;
CREATE TRIGGER set_panel_end_time
BEFORE INSERT OR UPDATE ON public.panels
FOR EACH ROW
WHEN (NEW.end_time IS NULL AND NEW.start_time IS NOT NULL)
EXECUTE FUNCTION calculate_panel_end_time();

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_panel_view_count(panel_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.panels
  SET view_count = view_count + 1
  WHERE id = panel_id;

  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;