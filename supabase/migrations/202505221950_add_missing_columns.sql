-- Migration pour ajouter les colonnes manquantes à la table profiles

-- Ajouter la colonne name si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN name VARCHAR(255);
    END IF;
END $$;

-- Ajouter la colonne avatar_url si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Ajouter la colonne company si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'company'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN company VARCHAR(255);
    END IF;
END $$;

-- Ajouter la colonne role si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role VARCHAR(255);
    END IF;
END $$;

-- Ajouter la colonne location si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'location'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN location VARCHAR(255);
    END IF;
END $$;

-- Ajouter la colonne bio si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Ajouter la colonne joined_date si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'joined_date'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Ajouter la colonne panels_created si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'panels_created'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN panels_created INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ajouter la colonne panels_participated si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'panels_participated'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN panels_participated INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ajouter la colonne questions_answered si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'questions_answered'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN questions_answered INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ajouter la colonne total_speaking_time si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'total_speaking_time'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN total_speaking_time INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ajouter la colonne social_links si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'social_links'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Ajouter la colonne created_at si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Ajouter la colonne updated_at si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Mettre à jour le déclencheur pour remplir les colonnes name et email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si un profil existe déjà pour cet utilisateur
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;
    
    -- Tentative d'insertion avec toutes les colonnes
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            name,
            avatar_url,
            joined_date,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id, 
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'avatar_url',
            NOW(),
            NOW(),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        -- Si l'insertion échoue, essayer une insertion minimale
        BEGIN
            INSERT INTO public.profiles (id, email)
            VALUES (NEW.id, NEW.email);
        EXCEPTION WHEN OTHERS THEN
            -- Si l'insertion échoue encore, ne pas bloquer la création de l'utilisateur
            RAISE NOTICE 'Erreur lors de la création du profil: %', SQLERRM;
        END;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
