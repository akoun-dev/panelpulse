-- Migration pour ajouter la colonne role et définir les valeurs par défaut
-- Vérifier si la colonne role existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Optionnel : Créer un enum pour les rôles si votre SGBD le supporte
-- CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Mettre à jour les utilisateurs existants (si la table user_roles existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_roles'
    ) THEN
        UPDATE profiles SET role = 'admin' WHERE id IN (
            SELECT user_id FROM user_roles WHERE role = 'admin'
        );
    END IF;
END $$;

-- Créer un index pour les recherches par rôle s'il n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'profiles'
        AND indexname = 'idx_profiles_role'
    ) THEN
        CREATE INDEX idx_profiles_role ON profiles(role);
    END IF;
END $$;
