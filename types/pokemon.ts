// Tipos compartidos para Pokémon y equipos

export interface Pokemon {
  name: string
  types: string[] // Array of types, e.g., ['fire', 'flying']
  image: string
}

export interface PokemonEntry {
  id: number
  name: string
  types: string[]
}

export interface Team {
  id: number
  teamName: string
  trainerName: string
  points: number
  wins: number
  gamesPlayed: number
  pokemons: Pokemon[]
  bracketPosition?: number | null
}
