-- Création de la table panels
CREATE TABLE IF NOT EXISTS public.panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    qr_code_url TEXT,
    access_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajout des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS panels_creator_id_idx ON public.panels(creator_id);
CREATE INDEX IF NOT EXISTS panels_status_idx ON public.panels(status);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.panels IS 'Panels créés par les utilisateurs';
COMMENT ON COLUMN public.panels.id IS 'Identifiant unique du panel';
COMMENT ON COLUMN public.panels.title IS 'Titre du panel';
COMMENT ON COLUMN public.panels.description IS 'Description du panel';
COMMENT ON COLUMN public.panels.date IS 'Date et heure du panel';
COMMENT ON COLUMN public.panels.duration IS 'Durée du panel en minutes';
COMMENT ON COLUMN public.panels.creator_id IS 'Identifiant de l''utilisateur qui a créé le panel';
COMMENT ON COLUMN public.panels.status IS 'Statut du panel (draft, published, archived, etc.)';
COMMENT ON COLUMN public.panels.qr_code_url IS 'URL du QR code pour accéder au panel';
COMMENT ON COLUMN public.panels.access_code IS 'Code d''accès pour rejoindre le panel';
COMMENT ON COLUMN public.panels.created_at IS 'Date de création du panel';
COMMENT ON COLUMN public.panels.updated_at IS 'Date de dernière mise à jour du panel';

-- Permissions RLS (Row Level Security)
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres panels
CREATE POLICY "Les utilisateurs peuvent voir leurs propres panels"
    ON public.panels
    FOR SELECT
    USING (creator_id = auth.uid());

-- Politique pour permettre aux utilisateurs de modifier leurs propres panels
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres panels"
    ON public.panels
    FOR UPDATE
    USING (creator_id = auth.uid());

-- Politique pour permettre aux utilisateurs de supprimer leurs propres panels
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres panels"
    ON public.panels
    FOR DELETE
    USING (creator_id = auth.uid());

-- Politique pour permettre aux utilisateurs de créer des panels
CREATE POLICY "Les utilisateurs peuvent créer des panels"
    ON public.panels
    FOR INSERT
    WITH CHECK (creator_id = auth.uid());

-- Création de la table panelists
CREATE TABLE IF NOT EXISTS public.panelists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT,
    company TEXT,
    time_allocated INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajout des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS panelists_panel_id_idx ON public.panelists(panel_id);
CREATE INDEX IF NOT EXISTS panelists_email_idx ON public.panelists(email);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.panelists IS 'Panélistes participant aux panels';
COMMENT ON COLUMN public.panelists.id IS 'Identifiant unique du panéliste';
COMMENT ON COLUMN public.panelists.panel_id IS 'Identifiant du panel auquel ce panéliste est associé';
COMMENT ON COLUMN public.panelists.name IS 'Nom du panéliste';
COMMENT ON COLUMN public.panelists.email IS 'Email du panéliste';
COMMENT ON COLUMN public.panelists.role IS 'Rôle du panéliste dans le panel';
COMMENT ON COLUMN public.panelists.company IS 'Entreprise ou organisation du panéliste';
COMMENT ON COLUMN public.panelists.time_allocated IS 'Temps alloué au panéliste en minutes';
COMMENT ON COLUMN public.panelists.created_at IS 'Date de création du panéliste';
COMMENT ON COLUMN public.panelists.updated_at IS 'Date de dernière mise à jour du panéliste';

-- Permissions RLS (Row Level Security)
ALTER TABLE public.panelists ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux créateurs de panels de gérer leurs panélistes
CREATE POLICY "Les créateurs de panels peuvent gérer leurs panélistes"
    ON public.panelists
    USING (
        panel_id IN (
            SELECT id FROM public.panels WHERE creator_id = auth.uid()
        )
    );

-- Politique pour permettre aux panélistes de voir leurs propres informations
CREATE POLICY "Les panélistes peuvent voir leurs propres informations"
    ON public.panelists
    FOR SELECT
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );