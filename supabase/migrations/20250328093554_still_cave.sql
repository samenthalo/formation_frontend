/*
  # Création de la table des formateurs

  1. Nouvelle Table
    - `instructors`
      - `id` (uuid, clé primaire)
      - `first_name` (text, obligatoire)
      - `last_name` (text, obligatoire)
      - `email` (text, unique, obligatoire)
      - `phone` (text, optionnel)
      - `specialties` (text[], optionnel)
      - `bio` (text, optionnel)
      - `is_active` (boolean, par défaut true)
      - `created_at` (timestamp avec fuseau horaire)
      - `updated_at` (timestamp avec fuseau horaire)

  2. Relations
    - Relation avec la table formations (à venir)

  3. Sécurité
    - Activation de RLS
    - Politiques pour les admins et les formateurs
*/

-- Création de la table instructors
CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  specialties text[],
  bio text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les admins et instructeurs
CREATE POLICY "Admins et instructeurs peuvent lire les formateurs"
  ON instructors
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'instructor')
  );

-- Politique de création pour les admins
CREATE POLICY "Admins peuvent créer des formateurs"
  ON instructors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Politique de mise à jour pour les admins et le formateur lui-même
CREATE POLICY "Admins et formateurs peuvent modifier leur propre profil"
  ON instructors
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'role' = 'instructor' AND id::text = auth.uid())
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'role' = 'instructor' AND id::text = auth.uid())
  );

-- Politique de suppression pour les admins
CREATE POLICY "Admins peuvent supprimer des formateurs"
  ON instructors
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();