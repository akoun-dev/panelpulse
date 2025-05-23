-- Migration pour créer la table des notes du modérateur

-- Table des notes du modérateur
CREATE TABLE IF NOT EXISTS public.moderator_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  timestamp VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur la table
ALTER TABLE public.moderator_notes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les notes du modérateur
CREATE POLICY "Les créateurs peuvent voir les notes de leurs panels"
ON public.moderator_notes FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent ajouter des notes à leurs panels"
ON public.moderator_notes FOR INSERT
TO authenticated
WITH CHECK (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent modifier les notes de leurs panels"
ON public.moderator_notes FOR UPDATE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent supprimer les notes de leurs panels"
ON public.moderator_notes FOR DELETE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);
