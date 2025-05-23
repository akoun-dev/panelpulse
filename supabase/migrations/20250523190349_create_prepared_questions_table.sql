-- Création de la table prepared_questions
CREATE TABLE IF NOT EXISTS public.prepared_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
    panelist_id UUID REFERENCES public.panelists(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajout des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS prepared_questions_panel_id_idx ON public.prepared_questions(panel_id);
CREATE INDEX IF NOT EXISTS prepared_questions_panelist_id_idx ON public.prepared_questions(panelist_id);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.prepared_questions IS 'Questions préparées à l''avance pour les panels';
COMMENT ON COLUMN public.prepared_questions.id IS 'Identifiant unique de la question préparée';
COMMENT ON COLUMN public.prepared_questions.panel_id IS 'Identifiant du panel auquel cette question est associée';
COMMENT ON COLUMN public.prepared_questions.panelist_id IS 'Identifiant du panéliste auquel cette question est assignée';
COMMENT ON COLUMN public.prepared_questions.question IS 'Texte de la question préparée';
COMMENT ON COLUMN public.prepared_questions.answer IS 'Réponse préparée à la question';
COMMENT ON COLUMN public.prepared_questions.created_at IS 'Date de création de la question';
COMMENT ON COLUMN public.prepared_questions.updated_at IS 'Date de dernière mise à jour de la question';

-- Permissions RLS (Row Level Security)
ALTER TABLE public.prepared_questions ENABLE ROW LEVEL SECURITY;

-- Politique pour les créateurs de panels (peuvent tout faire)
CREATE POLICY "Les créateurs de panels peuvent gérer leurs questions préparées"
    ON public.prepared_questions
    USING (
        panel_id IN (
            SELECT id FROM public.panels WHERE creator_id = auth.uid()
        )
    );

-- Politique pour les panélistes (peuvent voir leurs questions assignées)
CREATE POLICY "Les panélistes peuvent voir leurs questions assignées"
    ON public.prepared_questions
    FOR SELECT
    USING (
        panelist_id IN (
            SELECT id FROM public.panelists WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );