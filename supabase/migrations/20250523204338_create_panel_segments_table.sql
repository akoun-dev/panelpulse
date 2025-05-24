-- Migration pour créer la table panel_segments

-- Création de la table panel_segments
CREATE TABLE IF NOT EXISTS public.panel_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0, -- Durée en minutes
  order_index INTEGER DEFAULT 0,
  type VARCHAR(50) DEFAULT 'discussion', -- discussion, qa, presentation, break, etc.
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed, skipped
  is_visible BOOLEAN DEFAULT TRUE,
  panelist_id UUID REFERENCES public.panelists(id) ON DELETE SET NULL, -- Panéliste principal pour ce segment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  color TEXT,
  icon TEXT,
  notes TEXT,
  resources JSONB DEFAULT '[]'::jsonb
);

-- Commentaires sur les colonnes
COMMENT ON TABLE public.panel_segments IS 'Segments temporels des panels';
COMMENT ON COLUMN public.panel_segments.id IS 'Identifiant unique du segment';
COMMENT ON COLUMN public.panel_segments.panel_id IS 'Identifiant du panel auquel appartient le segment';
COMMENT ON COLUMN public.panel_segments.title IS 'Titre du segment';
COMMENT ON COLUMN public.panel_segments.description IS 'Description du segment';
COMMENT ON COLUMN public.panel_segments.start_time IS 'Heure de début du segment';
COMMENT ON COLUMN public.panel_segments.end_time IS 'Heure de fin du segment';
COMMENT ON COLUMN public.panel_segments.duration IS 'Durée prévue du segment en minutes';
COMMENT ON COLUMN public.panel_segments.order_index IS 'Ordre d''affichage du segment';
COMMENT ON COLUMN public.panel_segments.type IS 'Type de segment (discussion, qa, presentation, break, etc.)';
COMMENT ON COLUMN public.panel_segments.status IS 'Statut du segment (pending, active, completed, skipped)';
COMMENT ON COLUMN public.panel_segments.is_visible IS 'Indique si le segment est visible pour le public';
COMMENT ON COLUMN public.panel_segments.panelist_id IS 'Panéliste principal pour ce segment';
COMMENT ON COLUMN public.panel_segments.created_at IS 'Date de création du segment';
COMMENT ON COLUMN public.panel_segments.updated_at IS 'Date de dernière mise à jour du segment';
COMMENT ON COLUMN public.panel_segments.color IS 'Couleur associée au segment';
COMMENT ON COLUMN public.panel_segments.icon IS 'Icône associée au segment';
COMMENT ON COLUMN public.panel_segments.notes IS 'Notes privées sur le segment';
COMMENT ON COLUMN public.panel_segments.resources IS 'Ressources associées au segment';

-- Création des index
CREATE INDEX IF NOT EXISTS idx_panel_segments_panel_id ON public.panel_segments(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_segments_panelist_id ON public.panel_segments(panelist_id);
CREATE INDEX IF NOT EXISTS idx_panel_segments_status ON public.panel_segments(status);
CREATE INDEX IF NOT EXISTS idx_panel_segments_type ON public.panel_segments(type);
CREATE INDEX IF NOT EXISTS idx_panel_segments_order_index ON public.panel_segments(order_index);

-- Trigger pour mettre à jour la date de dernière modification
CREATE OR REPLACE FUNCTION update_panel_segment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_panel_segment_updated_at ON public.panel_segments;
CREATE TRIGGER set_panel_segment_updated_at
BEFORE UPDATE ON public.panel_segments
FOR EACH ROW
EXECUTE FUNCTION update_panel_segment_updated_at();

-- Fonction pour calculer l'heure de fin en fonction de l'heure de début et de la durée
CREATE OR REPLACE FUNCTION calculate_segment_end_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL AND NEW.duration IS NOT NULL AND NEW.end_time IS NULL THEN
    NEW.end_time := NEW.start_time + (NEW.duration * INTERVAL '1 minute');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement l'heure de fin
DROP TRIGGER IF EXISTS set_segment_end_time ON public.panel_segments;
CREATE TRIGGER set_segment_end_time
BEFORE INSERT OR UPDATE ON public.panel_segments
FOR EACH ROW
WHEN (NEW.end_time IS NULL AND NEW.start_time IS NOT NULL)
EXECUTE FUNCTION calculate_segment_end_time();

-- Fonction pour calculer la durée en fonction de l'heure de début et de fin
CREATE OR REPLACE FUNCTION calculate_segment_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL AND NEW.duration = 0 THEN
    NEW.duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement la durée
DROP TRIGGER IF EXISTS set_segment_duration ON public.panel_segments;
CREATE TRIGGER set_segment_duration
BEFORE INSERT OR UPDATE ON public.panel_segments
FOR EACH ROW
WHEN (NEW.duration = 0 AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL)
EXECUTE FUNCTION calculate_segment_duration();

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE public.panel_segments ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs authentifiés de lire les segments des panels auxquels ils ont accès
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les segments des panels auxquels ils ont accès"
ON public.panel_segments
FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT p.id FROM public.panels p
    WHERE p.creator_id = auth.uid()
    OR auth.uid() IN (
      SELECT panelist_id FROM public.panelists
      WHERE panel_id = p.id
    )
  )
);

-- Politique pour permettre aux créateurs de panels de modifier leurs segments
CREATE POLICY "Les créateurs de panels peuvent modifier leurs segments"
ON public.panel_segments
FOR ALL
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels
    WHERE creator_id = auth.uid()
  )
)
WITH CHECK (
  panel_id IN (
    SELECT id FROM public.panels
    WHERE creator_id = auth.uid()
  )
);