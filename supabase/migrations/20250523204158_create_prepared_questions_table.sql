-- Migration pour créer la table prepared_questions

-- Création de la table prepared_questions
CREATE TABLE IF NOT EXISTS public.prepared_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  panelist_id UUID REFERENCES public.panelists(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  category TEXT,
  difficulty VARCHAR(20) DEFAULT 'medium',
  time_estimate INTEGER DEFAULT 0,
  notes TEXT
);

-- Commentaires sur les colonnes
COMMENT ON TABLE public.prepared_questions IS 'Questions préparées pour les panels';
COMMENT ON COLUMN public.prepared_questions.id IS 'Identifiant unique de la question préparée';
COMMENT ON COLUMN public.prepared_questions.panel_id IS 'Identifiant du panel auquel appartient la question';
COMMENT ON COLUMN public.prepared_questions.panelist_id IS 'Identifiant du panéliste auquel la question est assignée';
COMMENT ON COLUMN public.prepared_questions.question IS 'Texte de la question';
COMMENT ON COLUMN public.prepared_questions.answer IS 'Réponse préparée à la question';
COMMENT ON COLUMN public.prepared_questions.order_index IS 'Ordre d''affichage de la question';
COMMENT ON COLUMN public.prepared_questions.is_visible IS 'Indique si la question est visible pour le public';
COMMENT ON COLUMN public.prepared_questions.is_answered IS 'Indique si la question a été répondue';
COMMENT ON COLUMN public.prepared_questions.created_at IS 'Date de création de la question';
COMMENT ON COLUMN public.prepared_questions.updated_at IS 'Date de dernière mise à jour de la question';
COMMENT ON COLUMN public.prepared_questions.answered_at IS 'Date à laquelle la question a été répondue';
COMMENT ON COLUMN public.prepared_questions.tags IS 'Tags associés à la question';
COMMENT ON COLUMN public.prepared_questions.category IS 'Catégorie de la question';
COMMENT ON COLUMN public.prepared_questions.difficulty IS 'Niveau de difficulté de la question (easy, medium, hard)';
COMMENT ON COLUMN public.prepared_questions.time_estimate IS 'Estimation du temps nécessaire pour répondre à la question (en secondes)';
COMMENT ON COLUMN public.prepared_questions.notes IS 'Notes privées sur la question';

-- Création des index
CREATE INDEX IF NOT EXISTS idx_prepared_questions_panel_id ON public.prepared_questions(panel_id);
CREATE INDEX IF NOT EXISTS idx_prepared_questions_panelist_id ON public.prepared_questions(panelist_id);
CREATE INDEX IF NOT EXISTS idx_prepared_questions_is_visible ON public.prepared_questions(is_visible);
CREATE INDEX IF NOT EXISTS idx_prepared_questions_is_answered ON public.prepared_questions(is_answered);
CREATE INDEX IF NOT EXISTS idx_prepared_questions_order_index ON public.prepared_questions(order_index);

-- Trigger pour mettre à jour la date de dernière modification
CREATE OR REPLACE FUNCTION update_prepared_question_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_prepared_question_updated_at ON public.prepared_questions;
CREATE TRIGGER set_prepared_question_updated_at
BEFORE UPDATE ON public.prepared_questions
FOR EACH ROW
EXECUTE FUNCTION update_prepared_question_updated_at();

-- Trigger pour mettre à jour la date de réponse
CREATE OR REPLACE FUNCTION update_prepared_question_answered_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_answered = TRUE AND (OLD.is_answered = FALSE OR OLD.is_answered IS NULL) THEN
    NEW.answered_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_prepared_question_answered_at ON public.prepared_questions;
CREATE TRIGGER set_prepared_question_answered_at
BEFORE UPDATE ON public.prepared_questions
FOR EACH ROW
WHEN (NEW.is_answered IS DISTINCT FROM OLD.is_answered)
EXECUTE FUNCTION update_prepared_question_answered_at();

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE public.prepared_questions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs authentifiés de lire les questions préparées des panels auxquels ils ont accès
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les questions préparées des panels auxquels ils ont accès"
ON public.prepared_questions
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

-- Politique pour permettre aux créateurs de panels de modifier leurs questions préparées
CREATE POLICY "Les créateurs de panels peuvent modifier leurs questions préparées"
ON public.prepared_questions
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