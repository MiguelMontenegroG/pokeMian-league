'use client'

import { useState } from 'react'
import type { TrainerTeam } from '@/hooks/useTrainerTeams'
import type { Trainer } from '@/components/TrainersView'

interface Props {
  trainerTeams: TrainerTeam[]
  trainer: {
    id: number
    name: string
  }
  officialTeamId?: number | null
  onCreateTeam: () => void
  onSetOfficial: (teamId: number) => Promise<void>
  onRemoveOfficial: () => Promise<void>
  onDeleteTeam: (teamId: number) => Promise<void>
  onEditTeam?: (team: TrainerTeam) => void
  isAdmin?: boolean
}

const TYPE_GLOW: Record<string, string> = {
  fire: 'rgba(238,129,48,0.35)',
  water: 'rgba(99,144,240,0.35)',
  electric: 'rgba(247,208,44,0.35)',
  grass: 'rgba(122,199,76,0.35)',
  psychic: 'rgba(249,85,135,0.35)',
  default: 'rgba(79,195,247,0.3)',
}

function TeamCard({
  team,
  isOfficial,
  onSetOfficial,
  onRemoveOfficial,
  onDelete,
  onEdit,
  isAdmin,
}: {
  team: TrainerTeam
  isOfficial: boolean
  onSetOfficial: () => void
  onRemoveOfficial: () => void
  onDelete: () => void
  onEdit?: () => void
  isAdmin?: boolean
}) {
  const [deleting, setDeleting] = useState(false)

  // Normalizar formato: si no tiene formato (datos antiguos), asumir 'league' por defecto
  const normalizedFormat = team.format || 'league'
  const formatLabel = normalizedFormat === 'league' ? 'Oficial (10)' : 'Practica (6)'
  const maxSlots = normalizedFormat === 'league' ? 10 : 6
  // Mostrar boton para equipos de formato liga (10 slots), independientemente de cuantos pokemons tenga
  const canBeOfficial = normalizedFormat === 'league'

  // Debug
  console.log(`[TeamCard] ${team.teamName}: format=${team.format}, normalized=${normalizedFormat}, canBeOfficial=${canBeOfficial}, pokemons.length=${team.pokemons.length}, isOfficial=${isOfficial}`)

  const handleDelete = async () => {
    if (isOfficial) {
      alert('No puedes eliminar el equipo oficial. Primero desoficializalo.')
      return
    }
    const confirm = window.confirm(`Eliminar "${team.teamName}"?`)
    if (!confirm) return
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="glass-card transition-all duration-300"
      style={{
        background: isOfficial
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))'
          : 'rgba(13, 18, 32, 0.8)',
        borderColor: isOfficial
          ? 'rgba(245, 158, 11, 0.4)'
          : 'rgba(79,195,247,0.1)',
        boxShadow: isOfficial ? '0 0 30px rgba(245, 158, 11, 0.15)' : 'none',
      }}
    >
      {/* Header */}
      <div className="p-5 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  background: isOfficial
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(79,195,247,0.1)',
                  color: isOfficial ? '#f59e0b' : '#4fc3f7',
                  fontSize: '0.55rem',
                }}
              >
                {formatLabel}
              </span>
              {isOfficial && (
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded animate-pulse"
                  style={{
                    background: 'rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    fontSize: '0.55rem',
                  }}
                >
                  Oficial
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold truncate" style={{ color: '#e8eaf6' }}>
              {team.teamName}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {team.pokemons.length}/{maxSlots} pokemons
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {isOfficial ? (
              (isAdmin === true) && (
                <button
                  onClick={onRemoveOfficial}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                  }}
                >
                  Desoficializar
                </button>
              )
            ) : (
              <>
                {canBeOfficial && onSetOfficial && (
                  <button
                    onClick={onSetOfficial}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#f59e0b',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(245, 158, 11, 0.2)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(245, 158, 11, 0.1)'
                    }}
                  >
                    Hacer Oficial
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: 'rgba(79, 195, 247, 0.1)',
                      border: '1px solid rgba(79, 195, 247, 0.3)',
                      color: '#4fc3f7',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(79, 195, 247, 0.2)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(79, 195, 247, 0.1)'
                    }}
                  >
                    Editar
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: deleting ? '#475569' : '#ef4444',
              }}
            >
              {deleting ? '...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>

      {/* Pokemon grid */}
      <div className="p-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {Array.from({ length: maxSlots }).map((_, i) => {
            const pokemon = team.pokemons[i]
            const firstType = pokemon?.types?.[0] || 'default'
            return (
              <div
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center"
                style={{
                  background: pokemon
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.02)',
                  border: pokemon
                    ? '1px solid rgba(79,195,247,0.2)'
                    : '1px dashed rgba(79,195,247,0.08)',
                  padding: '0.25rem',
                }}
              >
                {pokemon ? (
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="w-full h-full object-contain"
                    style={{
                      imageRendering: 'pixelated',
                      maxWidth: 85,
                                              maxHeight: 85,
                      filter: `drop-shadow(0 0 6px ${TYPE_GLOW[firstType] || TYPE_GLOW.default})`,
                    }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <span style={{ fontSize: '0.5rem', color: '#2d3748' }}>Vacio</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function MyTeamsView({
  trainerTeams,
  trainer,
  officialTeamId,
  onCreateTeam,
  onSetOfficial,
  onRemoveOfficial,
  onDeleteTeam,
  onEditTeam,
  isAdmin,
}: Props) {
  const myTeams = trainerTeams.filter(t => t.trainerId === trainer.id)
  const officialTeam = myTeams.find(t => t.isOfficial)
  const practiceTeams = myTeams.filter(t => !t.isOfficial)

  if (myTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-fade-scale">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(79,195,247,0.08)', border: '2px solid rgba(79,195,247,0.15)' }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf6' }}>
            Sin equipos aún
          </h2>
          <p className="mb-6" style={{ color: '#64748b' }}>
            Crea tu primer equipo para la liga
          </p>
          <button onClick={onCreateTeam} className="btn-glow px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase">
            Crear equipo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#4fc3f7', letterSpacing: '0.2em' }}>
            {myTeams.length} equipo{myTeams.length !== 1 ? 's' : ''}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
            Mis{' '}
            <span className="glow-text" style={{ color: '#4fc3f7' }}>Equipos</span>
          </h2>
        </div>
        <button
          onClick={onCreateTeam}
          className="btn-glow px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo equipo
        </button>
      </div>

      {/* Todos los equipos en grid uniforme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipo oficial primero si existe */}
        {officialTeam && (
          <TeamCard
            key={officialTeam.id}
            team={officialTeam}
            isOfficial={true}
            onSetOfficial={() => {}}
            onRemoveOfficial={onRemoveOfficial}
            onDelete={() => onDeleteTeam(officialTeam.id)}
            isAdmin={isAdmin ?? false}
          />
      )}
        {/* Equipos de practica */}
        {practiceTeams.map(team => (
          <TeamCard
            key={team.id}
            team={team}
            isOfficial={false}
            onSetOfficial={() => onSetOfficial(team.id)}
            onRemoveOfficial={() => {}}
            onDelete={() => onDeleteTeam(team.id)}
            onEdit={() => onEditTeam?.(team)}
            isAdmin={isAdmin ?? false}
          />
        ))}
      </div>

      <p className="text-center mt-8 text-xs" style={{ color: '#334155' }}>
        Solo los equipos de 10 pokemons (formato oficial) pueden ser seleccionados como equipo oficial
      </p>
    </div>
  )
}
