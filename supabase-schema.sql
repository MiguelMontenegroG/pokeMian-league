-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  team_name TEXT NOT NULL,
  trainer_name TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  pokemons JSONB NOT NULL DEFAULT '[]',
  bracket_position INTEGER NULL UNIQUE, -- Position in the final bracket (1-4), NULL = not qualified
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create trainers table
CREATE TABLE IF NOT EXISTS trainers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  favorite_pokemon TEXT NOT NULL,
  favorite_pokemon_image TEXT,
  description TEXT,
  badges JSONB NOT NULL DEFAULT '[]',
  password TEXT,
  avatar_sprite INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT chk_valid_avatar_sprite CHECK (avatar_sprite IS NULL OR (avatar_sprite >= 1 AND avatar_sprite <= 93))
);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Policies for trainers table (public read, only admins can update)
DO $$ BEGIN
  CREATE POLICY "Allow public read access on trainers" ON trainers
    FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Policies for teams table
-- Public can read all teams
DO $$ BEGIN
  CREATE POLICY "Allow public read access on teams" ON teams
    FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Authenticated trainers can only insert/update/delete their own teams
-- This is enforced at application level with trainer_id check
DO $$ BEGIN
  CREATE POLICY "Allow trainers to manage their own teams" ON teams
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON teams(team_name);
CREATE INDEX IF NOT EXISTS idx_trainers_name ON trainers(name);
CREATE INDEX IF NOT EXISTS idx_teams_bracket_position ON teams(bracket_position);

-- ============================================
-- ENFRENTAMIENTOS (Matchups)
-- ============================================

-- Tabla de enfrentamientos - fase todos contra todos
CREATE TABLE IF NOT EXISTS matchups (
  id BIGSERIAL PRIMARY KEY,
  
  -- Equipos que se enfrentan
  team_a_id BIGINT REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  team_b_id BIGINT REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  
  -- Resultado del combate
  winner_team_id BIGINT REFERENCES teams(id) NULL, -- NULL hasta que se juegue el combate
  
  -- Factor de desempate: Pokémon VIVOS (no debilitados)
  team_a_pokemon_alive INTEGER DEFAULT 0, -- Cantidad de PKM no debilitados (0-6)
  team_b_pokemon_alive INTEGER DEFAULT 0, -- Cantidad de PKM no debilitados (0-6)
  
  -- Organización
  round_number INTEGER NOT NULL, -- Fecha/Jornada del combate
  played BOOLEAN DEFAULT false, -- ¿Ya se jugó el combate?
  
  -- Validaciones
  CONSTRAINT chk_different_teams CHECK (team_a_id != team_b_id),
  CONSTRAINT chk_unique_matchup UNIQUE (team_a_id, team_b_id),
  CONSTRAINT chk_valid_alive_team_a CHECK (team_a_pokemon_alive >= 0 AND team_a_pokemon_alive <= 6),
  CONSTRAINT chk_valid_alive_team_b CHECK (team_b_pokemon_alive >= 0 AND team_b_pokemon_alive <= 6),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONFIGURACIÓN DE LA LIGA
-- ============================================

-- Tabla para configuración flexible (cantidad de Pokémon, reglas, etc.)
CREATE TABLE IF NOT EXISTS league_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO league_settings (setting_key, setting_value, description) VALUES
  ('pokemon_per_battle', '6'::jsonb, 'Cantidad de Pokémon por equipo en cada batalla'),
  ('total_pokemon_per_team', '10'::jsonb, 'Cantidad total de Pokémon que puede tener un equipo')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_matchups_round ON matchups(round_number);
CREATE INDEX IF NOT EXISTS idx_matchups_teams ON matchups(team_a_id, team_b_id);
CREATE INDEX IF NOT EXISTS idx_matchups_played ON matchups(played);
CREATE INDEX IF NOT EXISTS idx_matchups_winner ON matchups(winner_team_id);
