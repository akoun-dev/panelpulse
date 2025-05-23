-- Seed data pour les profils utilisateur
-- Note: Ces insertions ne fonctionneront que si les utilisateurs existent déjà dans auth.users
-- Vous devrez remplacer les UUID par des valeurs réelles après avoir créé des utilisateurs

-- Création d'un utilisateur administrateur (à exécuter manuellement après avoir créé l'utilisateur)
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Remplacer par un UUID réel
  'admin@example.com',
  crypt('password', gen_salt('bf')),
  now(),
  'authenticated'
);
*/

-- Insertion de données de test dans profiles
-- Ces insertions doivent être exécutées après avoir créé les utilisateurs correspondants
/*
INSERT INTO public.profiles (
  id, 
  name, 
  email, 
  company, 
  role, 
  location, 
  bio, 
  social_links, 
  user_role
)
VALUES
(
  '00000000-0000-0000-0000-000000000000', -- Remplacer par l'ID de l'utilisateur admin
  'Admin User',
  'admin@example.com',
  'PanelPulse',
  'Administrateur',
  'Paris, France',
  'Administrateur de la plateforme PanelPulse.',
  '{"linkedin": "https://linkedin.com/in/adminuser", "twitter": "https://twitter.com/adminuser", "website": "https://example.com"}',
  'admin'
),
(
  '11111111-1111-1111-1111-111111111111', -- Remplacer par l'ID d'un utilisateur normal
  'Regular User',
  'user@example.com',
  'Entreprise ABC',
  'Développeur',
  'Lyon, France',
  'Utilisateur régulier de la plateforme PanelPulse.',
  '{"linkedin": "https://linkedin.com/in/regularuser"}',
  'user'
);
*/

-- Insertion de données de test pour les expertises
-- Ces insertions doivent être exécutées après avoir créé les profils correspondants
/*
INSERT INTO public.user_expertise (user_id, expertise)
VALUES
('00000000-0000-0000-0000-000000000000', 'Gestion de projet'),
('00000000-0000-0000-0000-000000000000', 'Administration système'),
('11111111-1111-1111-1111-111111111111', 'Développement web'),
('11111111-1111-1111-1111-111111111111', 'UX/UI Design');
*/

-- Insertion de données de test pour les langues
-- Ces insertions doivent être exécutées après avoir créé les profils correspondants
/*
INSERT INTO public.user_languages (user_id, language)
VALUES
('00000000-0000-0000-0000-000000000000', 'Français'),
('00000000-0000-0000-0000-000000000000', 'Anglais'),
('11111111-1111-1111-1111-111111111111', 'Français'),
('11111111-1111-1111-1111-111111111111', 'Espagnol');
*/

-- Note: Décommentez les sections ci-dessus après avoir remplacé les UUID par des valeurs réelles
