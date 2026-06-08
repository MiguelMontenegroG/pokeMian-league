'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PokemonPicker from '@/components/PokemonPicker'
import type { Team, Pokemon } from '@/types/pokemon'
import type { Trainer } from '@/components/TrainersView'

type TeamMode = 'league' | 'personal'

interface Props {
  mode: TeamMode
  trainerId?: number // Para modo 'personal' - el ID del entrenador
  initialFormat?: 'league' | 'practice' // Formato inicial para editar equipos personales
  initialData?: {
    teamName: string
    pokemons: Pokemon[]
  } // Datos iniciales para pre-poblar el formulario (edicion)
  onSave: (team: {
    teamName: string
    trainerName: string
    wins: number
    gamesPlayed: number
    pokemons: Pokemon[]
  }) => Promise<void>
  onUpdate?: (team: Team) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  existingTeams?: Team[]
  trainers?: Trainer[]
  onBack?: () => void
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4fc3f7', letterSpacing: '0.15em' }}>
      {children}
    </label>
  )
}

function NumberStepper({
  value,
  onChange,
  min = 0,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <div
      className="flex items-center rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(79,195,247,0.15)', background: 'rgba(26,32,53,0.8)' }}
    >
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg"
        style={{ color: '#4fc3f7' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(79,195,247,0.08)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Reducir"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={e => onChange(Math.max(min, parseInt(e.target.value) || 0))}
        className="w-16 text-center bg-transparent focus:outline-none text-base font-bold"
        style={{ color: '#e8eaf6' }}
      />
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center transition-colors font-bold text-lg"
        style={{ color: '#4fc3f7' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(79,195,247,0.08)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  )
}

export default function TeamFormUnified({
  mode,
  trainerId,
  initialFormat,
  initialData,
  onSave,
  onUpdate,
  onDelete,
  existingTeams = [],
  trainers = [],
  onBack,
}: Props) {
  const { trainer, isAdminLoggedIn } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [teamFormat, setTeamFormat] = useState<'league' | 'practice'>(initialFormat || 'league')

  // MAX_SLOTS dinamico segun el modo y formato
  const MAX_SLOTS = mode === 'personal' ? (teamFormat === 'practice' ? 6 : 10) : 10

  // Al cambiar formato, limpiar pokemons que excedan el maximo
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      pokemons: prev.pokemons.slice(0, MAX_SLOTS),
    }))
  }, [MAX_SLOTS])

  const [formData, setFormData] = useState<{
    teamName: string
    trainerName: string
    wins: number
    gamesPlayed: number
    pokemons: Pokemon[]
  }>({
    teamName: '',
    trainerName: isAdminLoggedIn ? '' : (trainer?.name || ''),
    wins: 0,
    gamesPlayed: 0,
    pokemons: [],
  })

  // En modo personal, el trainerName se asigna automaticamente
  useEffect(() => {
    if (mode === 'personal' && trainer) {
      setFormData(prev => ({ ...prev, trainerName: trainer.name }))
    }
  }, [mode, trainer])

  // Pre-poblar formulario cuando se edita un equipo personal
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        teamName: initialData.teamName,
        pokemons: [...initialData.pokemons],
      }))
    }
  }, [initialData])

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const resetForm = () => {
    setFormData({
      teamName: '',
      trainerName: isAdminLoggedIn ? '' : (trainer?.name || ''),
      wins: 0,
      gamesPlayed: 0,
      pokemons: [],
    })
    setIsEditing(false)
    setEditingId(null)
  }

  const handleEdit = (team: Team) => {
    setFormData({
      teamName: team.teamName,
      trainerName: team.trainerName,
      wins: team.wins,
      gamesPlayed: team.gamesPlayed || 0,
      pokemons: [...team.pokemons],
    })
    setIsEditing(true)
    setEditingId(team.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar este equipo?')) return
    if (onDelete) {
      await onDelete(id)
      resetForm()
      showNotification('Equipo eliminado correctamente')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.pokemons.length === 0) {
      showNotification('Debes anadir al menos 1 Pokemon', 'error')
      return
    }

    try {
      if (isEditing && editingId !== null && onUpdate) {
        await onUpdate({ ...formData, id: editingId, points: formData.wins * 3, bracketPosition: null })
        showNotification('Equipo actualizado correctamente')
      } else {
        await onSave({
          ...formData,
          wins: formData.wins,
          gamesPlayed: formData.gamesPlayed,
          format: mode === 'personal' ? teamFormat : 'league',
        } as any)
        showNotification('Equipo creado correctamente')
      }
      resetForm()
    } catch (err) {
      console.error('Error saving team:', err)
      showNotification('Error al guardar el equipo', 'error')
    }
  }

  const handleAddPokemon = (pokemon: { name: string; types: string[]; image: string }) => {
    if (formData.pokemons.some(p => p.name === pokemon.name)) {
      showNotification(`${pokemon.name} ya esta en el equipo`, 'error')
      return
    }
    setFormData(prev => ({
      ...prev,
      pokemons: [...prev.pokemons, pokemon],
    }))
  }

  const handleRemovePokemon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pokemons: prev.pokemons.filter((_, i) => i !== index),
    }))
  }

  const slots = Array.from({ length: MAX_SLOTS })
  const isPersonalMode = mode === 'personal'

  return (
    <div className="animate-fade-up">
      {/* Notification toast */}
      {notification && (
        <div
          className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl animate-fade-scale"
          style={{
            background: notification.type === 'success'
              ? 'rgba(16,185,129,0.15)'
              : 'rgba(239,68,68,0.15)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: notification.type === 'success' ? '#10b981' : '#ef4444',
            backdropFilter: 'blur(12px)',
          }}
        >
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
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
            Volver
          </button>
        )}
        <div>
          <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#4fc3f7', letterSpacing: '0.2em' }}>
            {isEditing ? 'Modificar registro' : 'Nuevo registro'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
            {isEditing ? 'Editar ' : 'Crear '}
            <span className="glow-text" style={{ color: '#4fc3f7' }}>
              {isPersonalMode ? 'Mi Equipo' : 'Equipo'}
            </span>
          </h2>
          {isPersonalMode && (
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Equipo de {MAX_SLOTS} pokemons en formato {teamFormat === 'league' ? 'Liga' : 'Practica'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Basic info card */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#e8eaf6' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Informacion del Equipo
            </h3>
            <form id="team-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <FieldLabel>Nombre del equipo</FieldLabel>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={e => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                    required
                    placeholder="Ej: Rayos Electricos"
                    className="dark-input w-full px-4 py-3 rounded-xl text-base font-medium"
                  />
                </div>
                <div>
                  <FieldLabel>Entrenador</FieldLabel>
                  {isPersonalMode && trainer ? (
                    <div
                      className="w-full px-4 py-3 rounded-xl text-base font-medium"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981'
                      }}
                    >
                      {trainer.name} (Tu cuenta)
                    </div>
                  ) : trainers.length > 0 ? (
                    <select
                      value={formData.trainerName}
                      onChange={e => setFormData(prev => ({ ...prev, trainerName: e.target.value }))}
                      required
                      className="dark-input w-full px-4 py-3 rounded-xl text-base font-medium"
                      style={{ color: '#e8eaf6' }}
                    >
                      <option value="" disabled>Selecciona un entrenador</option>
                      {trainers.map(t => (
                        <option key={t.name} value={t.name} style={{ color: '#000' }}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
                      <p className="text-sm" style={{ color: '#f59e0b' }}>
                        No hay entrenadores registrados. Primero debes crear un entrenador.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {isPersonalMode && (
                <div className="mb-5">
                  <FieldLabel>Formato del equipo</FieldLabel>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTeamFormat('practice')}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all"
                      style={{
                        background: teamFormat === 'practice'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${teamFormat === 'practice' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(79,195,247,0.1)'}`,
                        color: teamFormat === 'practice' ? '#10b981' : '#64748b',
                      }}
                    >
                      Practica (6 slots)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamFormat('league')}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all"
                      style={{
                        background: teamFormat === 'league'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${teamFormat === 'league' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(79,195,247,0.1)'}`,
                        color: teamFormat === 'league' ? '#f59e0b' : '#64748b',
                      }}
                    >
                      Liga (10 slots)
                    </button>
                  </div>
                </div>
              )}
              {isAdminLoggedIn && !isPersonalMode && (
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Victorias</FieldLabel>
                    <NumberStepper value={formData.wins} onChange={v => setFormData(prev => ({ ...prev, wins: v }))} />
                  </div>
                  <div>
                    <FieldLabel>Partidas Jugadas</FieldLabel>
                    <NumberStepper value={formData.gamesPlayed} onChange={v => setFormData(prev => ({ ...prev, gamesPlayed: Math.max(v, formData.wins) }))} />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Team slots card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#e8eaf6' }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Equipo Pokemon
              </h3>
              <span
                className="text-sm font-bold px-3 py-1 rounded-lg"
                style={{
                  background: formData.pokemons.length === MAX_SLOTS
                    ? 'rgba(245,158,11,0.1)'
                    : 'rgba(79,195,247,0.1)',
                  border: `1px solid ${formData.pokemons.length === MAX_SLOTS ? 'rgba(245,158,11,0.3)' : 'rgba(79,195,247,0.2)'}`,
                  color: formData.pokemons.length === MAX_SLOTS ? '#f59e0b' : '#4fc3f7',
                }}
              >
                {formData.pokemons.length} / {MAX_SLOTS}
              </span>
            </div>

            {/* Slot grid */}
            <div className="grid gap-3" style={{ gridTemplateColumns: MAX_SLOTS === 10 ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)' }}>
              {slots.map((_, i) => {
                const pokemon = formData.pokemons[i]
                return (
                  <div
                    key={i}
                    className="relative group rounded-xl flex flex-col items-center justify-center transition-all duration-200"
                    style={{
                      aspectRatio: '1',
                      background: pokemon ? 'rgba(79,195,247,0.05)' : 'rgba(255,255,255,0.02)',
                      border: pokemon
                        ? '1px solid rgba(79,195,247,0.25)'
                        : '1px dashed rgba(79,195,247,0.1)',
                      padding: '0.5rem',
                    }}
                  >
                    {pokemon ? (
                      <>
                        <img
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-full h-full object-contain"
                          style={{ maxWidth: 72, maxHeight: 72, imageRendering: 'pixelated' }}
                          crossOrigin="anonymous"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePokemon(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}
                          aria-label={`Quitar ${pokemon.name}`}
                        >
                          x
                        </button>
                        <span
                          className="text-center mt-1 leading-tight"
                          style={{ fontSize: '0.55rem', color: '#64748b', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {pokemon.name}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.55rem', color: '#2d3748' }}>#{i + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              form="team-form"
              className="btn-glow flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold tracking-wider uppercase"
            >
              {isEditing ? 'Actualizar equipo' : 'Guardar equipo'}
            </button>
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(79,195,247,0.2)',
                    color: '#94a3b8',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(79,195,247,0.4)'
                    el.style.color = '#4fc3f7'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(79,195,247,0.2)'
                    el.style.color = '#94a3b8'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => editingId !== null && handleDelete(editingId)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-200"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(239,68,68,0.2)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Pokemon picker column */}
        <PokemonPicker
          selectedPokemons={formData.pokemons.map(p => p.name)}
          maxSlots={MAX_SLOTS}
          onAddPokemon={handleAddPokemon}
          onRemovePokemon={handleRemovePokemon}
        />
      </div>

      {/* Existing teams to edit */}
      {existingTeams.length > 0 && !isEditing && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#e8eaf6' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {isPersonalMode ? 'Mis equipos' : (trainer && !isAdminLoggedIn ? 'Editar mis equipos' : 'Editar equipo existente')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {existingTeams
              .filter(team => {
                // En modo personal, solo mostrar equipos del entrenador actual
                if (isPersonalMode && trainer) {
                  return team.trainerName === trainer.name
                }
                // Si es entrenador logueado (no admin), solo muestra sus equipos
                if (trainer && !isAdminLoggedIn) {
                  return team.trainerName === trainer.name
                }
                // Si es admin, muestra todos
                return true
              })
              .map(team => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleEdit(team)}
                  className="glass-card p-4 text-left transition-all duration-200"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(245,158,11,0.4)'
                    el.style.boxShadow = '0 0 20px rgba(245,158,11,0.1)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(79,195,247,0.12)'
                    el.style.boxShadow = ''
                  }}
                >
                  <div className="flex items-center gap-3">
                    {team.pokemons[0] && (
                      <img
                        src={team.pokemons[0].image}
                        alt={team.pokemons[0].name}
                        className="w-10 h-10 flex-shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                        crossOrigin="anonymous"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: '#e8eaf6' }}>
                        {team.teamName}
                      </p>
                      <p className="text-xs" style={{ color: '#64748b' }}>
                        {team.trainerName} | {team.wins}W-{(team.gamesPlayed || 0) - team.wins}L
                      </p>
                    </div>
                    <svg className="w-4 h-4 ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
