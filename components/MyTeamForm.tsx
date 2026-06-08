'use client'

import { useState, useEffect, useRef } from 'react'

interface PokemonSlot {
  name: string
  types: string[]
  image: string
}

interface Props {
  trainerId: number
  trainerName: string
  onSave: (team: {
    trainerId: number
    teamName: string
    format: 'league' | 'practice'
    isOfficial: boolean
    pokemons: PokemonSlot[]
  }) => Promise<void>
  onBack: () => void
}

const MAX_SLOTS_BY_FORMAT = {
  league: 10,
  practice: 6,
} as const

// Cache simple para evitar requests repetidos a PokeAPI
const pokemonCache = new Map<string, PokemonSlot>()

async function fetchPokemonData(name: string): Promise<PokemonSlot | null> {
  const cleanName = name.trim().toLowerCase()
  if (!cleanName) return null

  if (pokemonCache.has(cleanName)) {
    return pokemonCache.get(cleanName)!
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`)
    if (!res.ok) return null
    const data = await res.json()
    const slot: PokemonSlot = {
      name: data.name,
      types: data.types.map((t: any) => t.type.name),
      image: data.sprites.other?.['official-artwork']?.front_default
        || data.sprites.front_default,
    }
    pokemonCache.set(cleanName, slot)
    return slot
  } catch {
    return null
  }
}

export default function MyTeamForm({ trainerId, trainerName, onSave, onBack }: Props) {
  const [teamName, setTeamName] = useState('')
  const [format, setFormat] = useState<'league' | 'practice'>('practice')
  const [pokemonNames, setPokemonNames] = useState<string[]>(Array(MAX_SLOTS_BY_FORMAT.practice).fill(''))
  const [pokemonData, setPokemonData] = useState<(PokemonSlot | null)[]>(Array(MAX_SLOTS_BY_FORMAT.practice).fill(null))
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Cambiar cantidad de slots al cambiar formato
  useEffect(() => {
    const newSize = MAX_SLOTS_BY_FORMAT[format]
    setPokemonNames(prev => {
      const arr = [...prev]
      while (arr.length < newSize) arr.push('')
      while (arr.length > newSize) arr.pop()
      return arr
    })
    setPokemonData(prev => {
      const arr = [...prev]
      while (arr.length < newSize) arr.push(null)
      while (arr.length > newSize) arr.pop()
      return arr
    })
  }, [format])

  const handlePokemonNameChange = (index: number, value: string) => {
    const newNames = [...pokemonNames]
    newNames[index] = value
    setPokemonNames(newNames)

    // Si el campo se vacia, limpiar datos
    if (!value.trim()) {
      const newData = [...pokemonData]
      newData[index] = null
      setPokemonData(newData)
    }
  }

  const handleSearchPokemon = async (index: number) => {
    const name = pokemonNames[index].trim()
    if (!name) return

    setSearchingIndex(index)
    const data = await fetchPokemonData(name)
    const newData = [...pokemonData]
    newData[index] = data
    setPokemonData(newData)
    setSearchingIndex(null)

    if (data) {
      // Si encontro el pokemon, actualizar el nombre con el oficial
      const newNames = [...pokemonNames]
      newNames[index] = data.name
      setPokemonNames(newNames)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchPokemon(index)
    }
  }

  // Busqueda al perder foco
  const handleBlur = (index: number) => {
    if (pokemonNames[index].trim() && !pokemonData[index]) {
      handleSearchPokemon(index)
    }
  }

  const handleFormatChange = (newFormat: 'league' | 'practice') => {
    setFormat(newFormat)
    setTeamName('')
  }

  const handleSave = async () => {
    if (!teamName.trim()) return

    setSaving(true)
    try {
      // Buscar todos los pokemons que aun no tengan datos
      const promises = pokemonNames.map(async (name, i) => {
        if (name.trim() && !pokemonData[i]) {
          return handleSearchPokemon(i)
        }
      })
      await Promise.all(promises || [])

      // Verificar que al menos haya 1 pokemon valido
      const validPokemons = pokemonData.filter(p => p !== null)
      if (validPokemons.length === 0) {
        alert('Agrega al menos un pokemon valido')
        setSaving(false)
        return
      }

      await onSave({
        trainerId,
        teamName: teamName.trim(),
        format,
        isOfficial: false,
        pokemons: validPokemons,
      })
    } catch (err) {
      console.error('Error saving team:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectFormat = (fmt: 'league' | 'practice') => {
    // Si estaba en league y pasa a practice, avisar si pierde pokemons
    if (format === 'league' && fmt === 'practice') {
      const filledSlots = pokemonData.filter(p => p !== null).length
      if (filledSlots > 6) {
        const confirm = window.confirm(
          'Al cambiar a formato de practica (6 pokemons), los pokemons en las posiciones 7-10 se perderan. Continuar?'
        )
        if (!confirm) return
      }
    }
    setFormat(fmt)
  }

  const maxSlots = MAX_SLOTS_BY_FORMAT[format]

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'rgba(79,195,247,0.1)',
            border: '1px solid rgba(79,195,247,0.2)',
            color: '#4fc3f7',
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a Mis Equipos
        </button>
      </div>

      {/* Main card */}
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#e8eaf6' }}>
          Nuevo Equipo
        </h1>

        {/* Team name */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4fc3f7' }}>
            Nombre del Equipo
          </label>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder={format === 'league' ? 'Ej: Rayos de Johto' : 'Ej: Equipo de Prueba'}
            className="dark-input w-full px-4 py-3 rounded-xl text-sm font-medium"
            maxLength={40}
          />
        </div>

        {/* Format selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4fc3f7' }}>
            Formato
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleSelectFormat('practice')}
              className="flex-1 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
              style={{
                background: format === 'practice'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))'
                  : 'rgba(255,255,255,0.03)',
                border: format === 'practice'
                  ? '2px solid rgba(16, 185, 129, 0.5)'
                  : '2px dashed rgba(79, 195, 247, 0.15)',
                color: format === 'practice' ? '#10b981' : '#64748b',
              }}
            >
              <div className="text-lg mb-1">6</div>
              <div className="text-xs">Practica</div>
              <div className="text-xs mt-1" style={{ color: '#475569' }}>Formato rapido</div>
            </button>
            <button
              onClick={() => handleSelectFormat('league')}
              className="flex-1 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
              style={{
                background: format === 'league'
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))'
                  : 'rgba(255,255,255,0.03)',
                border: format === 'league'
                  ? '2px solid rgba(245, 158, 11, 0.5)'
                  : '2px dashed rgba(79, 195, 247, 0.15)',
                color: format === 'league' ? '#f59e0b' : '#64748b',
              }}
            >
              <div className="text-lg mb-1">10</div>
              <div className="text-xs">Oficial</div>
              <div className="text-xs mt-1" style={{ color: '#475569' }}>Formato de liga</div>
            </button>
          </div>
        </div>

        {/* Pokemon slots */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4fc3f7' }}>
              Pokemons ({pokemonData.filter(p => p !== null).length}/{maxSlots})
            </label>
            <span className="text-xs" style={{ color: '#475569' }}>
              Presiona Enter o haz clic fuera para buscar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: maxSlots }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl p-3"
                style={{
                  background: pokemonData[index]
                    ? 'rgba(79, 195, 247, 0.05)'
                    : 'rgba(255,255,255,0.02)',
                  border: pokemonData[index]
                    ? '1px solid rgba(79, 195, 247, 0.3)'
                    : '1px dashed rgba(79, 195, 247, 0.1)',
                }}
              >
                {/* Pokemon preview */}
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center mb-2"
                  style={{
                    background: pokemonData[index]
                      ? 'rgba(79, 195, 247, 0.08)'
                      : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {searchingIndex === index ? (
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : pokemonData[index] ? (
                    <img
                      src={pokemonData[index]!.image}
                      alt={pokemonData[index]!.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated', maxWidth: 56, maxHeight: 56 }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="text-xs" style={{ color: '#2d3748' }}>
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Input */}
                <input
                  ref={el => { inputRefs.current[index] = el }}
                  type="text"
                  value={pokemonNames[index]}
                  onChange={e => handlePokemonNameChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onBlur={() => handleBlur(index)}
                  placeholder="Nombre..."
                  className="w-full px-2 py-1.5 rounded-lg text-xs font-medium text-center"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(79,195,247,0.15)',
                    color: pokemonData[index] ? '#4fc3f7' : '#94a3b8',
                  }}
                  maxLength={30}
                />

                {/* Type indicators */}
                {pokemonData[index] && (
                  <div className="flex gap-1 mt-1.5 justify-center flex-wrap">
                    {pokemonData[index]!.types.map(type => (
                      <span
                        key={type}
                        className="text-[0.5rem] px-1.5 py-0.5 rounded-full font-bold uppercase"
                        style={{
                          background: 'rgba(79,195,247,0.15)',
                          color: '#4fc3f7',
                          border: '1px solid rgba(79,195,247,0.2)',
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !teamName.trim()}
            className="px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all btn-glow"
            style={{ opacity: saving || !teamName.trim() ? 0.5 : 1 }}
          >
            {saving ? 'Guardando...' : 'Guardar Equipo'}
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
