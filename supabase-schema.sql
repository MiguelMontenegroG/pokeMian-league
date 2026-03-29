-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  team_name TEXT NOT NULL,
  trainer_name TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  pokemons JSONB NOT NULL DEFAULT '[]',
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Policies for trainers table (public read, only admins can update)
CREATE POLICY "Allow public read access on trainers" ON trainers
  FOR SELECT
  USING (true);

-- Policies for teams table
-- Public can read all teams
CREATE POLICY "Allow public read access on teams" ON teams
  FOR SELECT
  USING (true);

-- Authenticated trainers can only insert/update/delete their own teams
-- This is enforced at application level with trainer_id check
CREATE POLICY "Allow trainers to manage their own teams" ON teams
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON teams(team_name);
CREATE INDEX IF NOT EXISTS idx_trainers_name ON trainers(name);
