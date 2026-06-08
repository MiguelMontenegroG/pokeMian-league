'use client'

import { useState, useRef } from 'react'

interface PokemonEntry {
  id: number
  name: string
  types: string[]
}

interface Props {
  selectedPokemons: string[]
  maxSlots: number
  onAddPokemon: (pokemon: { name: string; types: string[]; image: string }) => void
  onRemovePokemon: (index: number) => void
}

const ALL_TYPES = [
  'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying',
  'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock',
  'steel', 'water',
]

const TYPE_COLORS: Record<string, string> = {
  fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c',
  psychic: '#f95587', ghost: '#735797', dragon: '#6f35fc', ice: '#96d9d6',
  fighting: '#c22e28', poison: '#a33ea1', normal: '#a8a77a', rock: '#b6a136',
  bug: '#a6b91a', ground: '#e2bf65', flying: '#a98ff3', dark: '#705746',
  steel: '#b7b7ce', fairy: '#d685ad',
}

// Dataset local de Pokémon (~1350, incluyendo formas regionales Alola, Galar, Hisui)
import pokemonList from '@/data/pokemonList'

// Función para capitalizar nombres normales (fallback si algún nombre llega en minúsculas)
function formatPokemonName(name: string): string {
  return name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

export default function PokemonPicker({
  selectedPokemons,
  maxSlots,
  onAddPokemon,
  onRemovePokemon,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const listRef = useRef<HTMLDivElement>(null)

  const full = selectedPokemons.length >= maxSlots

  const filteredPokemon = pokemonList.filter(p => {
    const matchesType = typeFilter === 'all' || p.types.includes(typeFilter)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(searchLower) ||
      p.id.toString() === searchQuery
    return matchesType && matchesSearch
  })

  const handleAddPokemon = (pokemon: PokemonEntry) => {
    if (selectedPokemons.some(name => name === pokemon.name)) return
    if (full) return

    onAddPokemon({
      name: pokemon.name,
      types: pokemon.types,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
    })
  }

  return (
    <div
      className="glass-card p-5 flex flex-col"
      style={{ maxHeight: '80vh', minHeight: 400 }}
    >
      <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#e8eaf6' }}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Anadir Pokemon
        <span className="ml-auto text-xs" style={{ color: full ? '#f59e0b' : '#475569' }}>
          {full ? 'Equipo lleno' : `${maxSlots - selectedPokemons.length} slots libres`}
        </span>
      </h3>

      {/* Search */}
      <div className="relative mb-3">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar Pokemon..."
          className="dark-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
        />
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all"
          style={{
            background: typeFilter === 'all' ? 'rgba(79,195,247,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${typeFilter === 'all' ? 'rgba(79,195,247,0.5)' : 'rgba(79,195,247,0.08)'}`,
            color: typeFilter === 'all' ? '#4fc3f7' : '#64748b',
          }}
        >
          Todos
        </button>
        {ALL_TYPES.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type === typeFilter ? 'all' : type)}
            className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide transition-all"
            style={{
              background: typeFilter === type ? `${TYPE_COLORS[type]}30` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${typeFilter === type ? TYPE_COLORS[type] : 'rgba(79,195,247,0.08)'}`,
              color: typeFilter === type ? TYPE_COLORS[type] : '#64748b',
              opacity: typeFilter !== 'all' && typeFilter !== type ? 0.4 : 1,
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Pokemon list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredPokemon.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#475569' }}>
            <p className="text-sm">Sin resultados para &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {filteredPokemon.map(pokemon => {
              const inTeam = selectedPokemons.some(name => name === pokemon.name)
              return (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() => !inTeam && !full && handleAddPokemon(pokemon)}
                  disabled={inTeam || full}
                  className="flex flex-col items-center justify-center rounded-xl p-2 text-center transition-all duration-200"
                  style={{
                    background: inTeam
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(255,255,255,0.03)',
                    border: inTeam
                      ? '1px solid rgba(16,185,129,0.3)'
                      : '1px solid rgba(79,195,247,0.06)',
                    opacity: full && !inTeam ? 0.4 : 1,
                    cursor: inTeam || full ? 'default' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!inTeam && !full) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(79,195,247,0.3)'
                      el.style.background = 'rgba(79,195,247,0.07)'
                      el.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!inTeam && !full) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(79,195,247,0.06)'
                      el.style.background = 'rgba(255,255,255,0.03)'
                      el.style.transform = 'translateY(0)'
                    }
                  }}
                  aria-label={`${inTeam ? 'Ya en equipo: ' : 'Anadir '}${pokemon.name}`}
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                    alt={pokemon.name}
                    className="w-9 h-9 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                  <span style={{ fontSize: '0.6rem', color: inTeam ? '#10b981' : '#64748b', marginTop: 2, fontWeight: 600 }}>
                    {pokemon.name}
                  </span>
                  <div className="flex gap-1 flex-wrap justify-center" style={{ marginTop: 2 }}>
                    {pokemon.types.map((type, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[0.5rem] font-bold uppercase"
                        style={{
                          background: `${TYPE_COLORS[type]}20`,
                          color: TYPE_COLORS[type],
                          border: `1px solid ${TYPE_COLORS[type]}40`,
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  {inTeam && (
                    <span style={{ fontSize: '0.55rem', color: '#10b981', marginTop: 2 }}>En equipo</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
