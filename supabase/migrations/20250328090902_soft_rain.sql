/*
  # Création de la table des stagiaires

  1. Nouvelle Table
    - `trainees`
      - `id` (uuid, clé primaire)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `function` (text)
      - `birth_date` (date)
      - `formation` (text)
      - `is_responsible` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Active RLS sur la table trainees
    - Politiques pour :
      - Lecture : admins et instructeurs peuvent lire tous les stagiaires
      - Création : admins peuvent créer des stagiaires
      - Mise à jour : admins peuvent modifier les stagiaires
      - Suppression : admins peuvent supprimer les stagiaires
*/

-- Création de la table trainees
CREATE TABLE IF NOT EXISTS trainees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  function text,
  birth_date date,
  formation text,
  is_responsible boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les admins et instructeurs
CREATE POLICY "Admins et instructeurs peuvent lire les stagiaires"
  ON trainees
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'instructor')
  );

-- Politique de création pour les admins
CREATE POLICY "Admins peuvent créer des stagiaires"
  ON trainees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Politique de mise à jour pour les admins
CREATE POLICY "Admins peuvent modifier les stagiaires"
  ON trainees
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Politique de suppression pour les admins
CREATE POLICY "Admins peuvent supprimer les stagiaires"
  ON trainees
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trainees_updated_at
  BEFORE UPDATE ON trainees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();