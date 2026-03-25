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
  name TEXT NOT NULL,
  favorite_pokemon TEXT NOT NULL,
  favorite_pokemon_image TEXT,
  description TEXT,
  badges JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for personal use)
-- In production, you would restrict these based on user authentication
CREATE POLICY "Allow all operations on teams" ON teams
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on trainers" ON trainers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_team_name ON teams(team_name);
CREATE INDEX IF NOT EXISTS idx_trainers_name ON trainers(name);
