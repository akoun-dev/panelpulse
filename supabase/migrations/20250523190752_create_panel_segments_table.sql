-- Création de la table panel_segments
CREATE TABLE IF NOT EXISTS public.panel_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    segment_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajout des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS panel_segments_panel_id_idx ON public.panel_segments(panel_id);
CREATE INDEX IF NOT EXISTS panel_segments_order_idx ON public.panel_segments(segment_order);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.panel_segments IS 'Segments des panels';
COMMENT ON COLUMN public.panel_segments.id IS 'Identifiant unique du segment';
COMMENT ON COLUMN public.panel_segments.panel_id IS 'Identifiant du panel auquel ce segment est associé';
COMMENT ON COLUMN public.panel_segments.name IS 'Nom du segment';
COMMENT ON COLUMN public.panel_segments.duration IS 'Durée du segment en minutes';
COMMENT ON COLUMN public.panel_segments.segment_order IS 'Ordre du segment dans le panel';
COMMENT ON COLUMN public.panel_segments.created_at IS 'Date de création du segment';
COMMENT ON COLUMN public.panel_segments.updated_at IS 'Date de dernière mise à jour du segment';

-- Permissions RLS (Row Level Security)
ALTER TABLE public.panel_segments ENABLE ROW LEVEL SECURITY;

-- Politique pour les créateurs de panels (peuvent tout faire)
CREATE POLICY "Les créateurs de panels peuvent gérer leurs segments"
    ON public.panel_segments
    USING (
        panel_id IN (
            SELECT id FROM public.panels WHERE creator_id = auth.uid()
        )
    );