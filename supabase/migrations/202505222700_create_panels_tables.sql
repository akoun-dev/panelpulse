-- Migration pour créer les tables nécessaires à la gestion des panels

-- Table des panels
CREATE TABLE IF NOT EXISTS public.panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  qr_code_url TEXT,
  access_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des panélistes
CREATE TABLE IF NOT EXISTS public.panelists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  company VARCHAR(255),
  time_allocated INTEGER DEFAULT 5,
  invitation_sent BOOLEAN DEFAULT FALSE,
  invitation_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des segments du panel
CREATE TABLE IF NOT EXISTS public.panel_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  segment_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questions préparées
CREATE TABLE IF NOT EXISTS public.prepared_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  panelist_id UUID REFERENCES public.panelists(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des ressources du panel
CREATE TABLE IF NOT EXISTS public.panel_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questions posées pendant le panel
CREATE TABLE IF NOT EXISTS public.panel_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  panelist_id UUID REFERENCES public.panelists(id) ON DELETE SET NULL,
  asked_by VARCHAR(255),
  question TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT FALSE,
  votes INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un bucket pour les ressources des panels
INSERT INTO storage.buckets (id, name, public)
VALUES ('panel-resources', 'panel-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Activer RLS sur les tables
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panelists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepared_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_questions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les panels
CREATE POLICY "Les utilisateurs peuvent voir leurs propres panels"
ON public.panels FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent créer leurs propres panels"
ON public.panels FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres panels"
ON public.panels FOR UPDATE
TO authenticated
USING (creator_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres panels"
ON public.panels FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- Politiques RLS pour les panélistes
CREATE POLICY "Les créateurs peuvent voir les panélistes de leurs panels"
ON public.panelists FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent ajouter des panélistes à leurs panels"
ON public.panelists FOR INSERT
TO authenticated
WITH CHECK (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent modifier les panélistes de leurs panels"
ON public.panelists FOR UPDATE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent supprimer les panélistes de leurs panels"
ON public.panelists FOR DELETE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

-- Politiques similaires pour les autres tables
-- panel_segments
CREATE POLICY "Les créateurs peuvent voir les segments de leurs panels"
ON public.panel_segments FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent ajouter des segments à leurs panels"
ON public.panel_segments FOR INSERT
TO authenticated
WITH CHECK (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent modifier les segments de leurs panels"
ON public.panel_segments FOR UPDATE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent supprimer les segments de leurs panels"
ON public.panel_segments FOR DELETE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

-- prepared_questions
CREATE POLICY "Les créateurs peuvent voir les questions préparées de leurs panels"
ON public.prepared_questions FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent ajouter des questions préparées à leurs panels"
ON public.prepared_questions FOR INSERT
TO authenticated
WITH CHECK (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent modifier les questions préparées de leurs panels"
ON public.prepared_questions FOR UPDATE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent supprimer les questions préparées de leurs panels"
ON public.prepared_questions FOR DELETE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

-- panel_resources
CREATE POLICY "Les créateurs peuvent voir les ressources de leurs panels"
ON public.panel_resources FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent ajouter des ressources à leurs panels"
ON public.panel_resources FOR INSERT
TO authenticated
WITH CHECK (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent modifier les ressources de leurs panels"
ON public.panel_resources FOR UPDATE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent supprimer les ressources de leurs panels"
ON public.panel_resources FOR DELETE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

-- panel_questions
CREATE POLICY "Les créateurs peuvent voir les questions de leurs panels"
ON public.panel_questions FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Tout le monde peut ajouter des questions aux panels"
ON public.panel_questions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Les créateurs peuvent modifier les questions de leurs panels"
ON public.panel_questions FOR UPDATE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Les créateurs peuvent supprimer les questions de leurs panels"
ON public.panel_questions FOR DELETE
TO authenticated
USING (
  panel_id IN (
    SELECT id FROM public.panels WHERE creator_id = auth.uid()
  )
);
