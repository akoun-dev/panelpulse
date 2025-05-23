-- Migration pour ajouter la colonne role et définir les valeurs par défaut
ALTER TABLE profiles 
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Optionnel : Créer un enum pour les rôles si votre SGBD le supporte
-- CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Mettre à jour les utilisateurs existants
UPDATE profiles SET role = 'admin' WHERE id IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Créer un index pour les recherches par rôle
CREATE INDEX idx_profiles_role ON profiles(role);
