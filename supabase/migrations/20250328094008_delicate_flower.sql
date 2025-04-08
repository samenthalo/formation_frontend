/*
  # Ajout des tables formations et sessions

  1. Nouvelles Tables
    - `formations`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `duration` (text)
      - `max_participants` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `location` (text)
      - `status` (enum)
      - `enrolled_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `formation_instructors`
      - `formation_id` (uuid, foreign key)
      - `instructor_id` (uuid, foreign key)
      - `created_at` (timestamptz)

    - `sessions`
      - `id` (uuid, primary key)
      - `formation_id` (uuid, foreign key)
      - `instructor_id` (uuid, foreign key)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `location` (text)
      - `status` (enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
*/

-- Création du type enum pour le statut des formations
CREATE TYPE formation_status AS ENUM ('upcoming', 'ongoing', 'completed');

-- Création du type enum pour le statut des sessions
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Table des formations
CREATE TABLE IF NOT EXISTS formations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration text NOT NULL,
  max_participants integer NOT NULL DEFAULT 10,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text NOT NULL,
  status formation_status NOT NULL DEFAULT 'upcoming',
  enrolled_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de liaison formateurs-formations
CREATE TABLE IF NOT EXISTS formation_instructors (
  formation_id uuid REFERENCES formations(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (formation_id, instructor_id)
);

-- Table des sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id uuid REFERENCES formations(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES instructors(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text NOT NULL,
  status session_status NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Politiques pour formations
CREATE POLICY "Tous les utilisateurs peuvent lire les formations"
  ON formations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent créer des formations"
  ON formations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins peuvent modifier les formations"
  ON formations
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins peuvent supprimer les formations"
  ON formations
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques pour formation_instructors
CREATE POLICY "Tous les utilisateurs peuvent lire les liaisons formateurs-formations"
  ON formation_instructors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les liaisons formateurs-formations"
  ON formation_instructors
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Politiques pour sessions
CREATE POLICY "Tous les utilisateurs peuvent lire les sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins et formateurs peuvent créer des sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'role' = 'instructor' AND instructor_id::text = auth.uid())
  );

CREATE POLICY "Admins et formateurs peuvent modifier leurs sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'role' = 'instructor' AND instructor_id::text = auth.uid())
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'role' = 'instructor' AND instructor_id::text = auth.uid())
  );

CREATE POLICY "Admins peuvent supprimer les sessions"
  ON sessions
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();