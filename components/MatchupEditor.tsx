'use client'

import { useState, useMemo } from 'react'
import type { Team } from '@/app/page'
import type { Matchup } from '@/hooks/useMatchups'

interface Props {
  matchup: Matchup
  teams: Team[]
  onSave: (updatedMatchup: Matchup) => Promise<void>
  onClose: () => void
}

export default function MatchupEditor({ matchup, teams, onSave, onClose }: Props) {
  const [winnerTeamId, setWinnerTeamId] = useState<number | null>(matchup.winnerTeamId ?? null)
  const [teamAPokemonAlive, setTeamAPokemonAlive] = useState(matchup.teamAPokemonAlive)
  const [teamBPokemonAlive, setTeamBPokemonAlive] = useState(matchup.teamBPokemonAlive)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Encontrar equipos
  const teamA = useMemo(() => teams.find(t => t.id === matchup.teamAId), [teams, matchup.teamAId])
  const teamB = useMemo(() => teams.find(t => t.id === matchup.teamBId), [teams, matchup.teamBId])

  if (!teamA || !teamB) {
    return (
      <div className="p-4 text-center" style={{ color: '#ef4444' }}>
        Error: Equipos no encontrados
      </div>
    )
  }

  const handleSave = async () => {
    // Validaciones
    if (!winnerTeamId) {
      setError('Debes seleccionar un ganador')
      return
    }

    if (teamAPokemonAlive < 0 || teamAPokemonAlive > 6) {
      setError('Pokémon vivos del equipo A debe estar entre 0 y 6')
      return
    }

    if (teamBPokemonAlive < 0 || teamBPokemonAlive > 6) {
      setError('Pokémon vivos del equipo B debe estar entre 0 y 6')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onSave({
        ...matchup,
        winnerTeamId,
        teamAPokemonAlive,
        teamBPokemonAlive,
        played: true
      })
      onClose()
    } catch (err: any) {
      console.error('Error saving matchup:', err)
      setError(err.message || 'Error al guardar')
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setWinnerTeamId(matchup.winnerTeamId ?? null)
    setTeamAPokemonAlive(matchup.teamAPokemonAlive)
    setTeamBPokemonAlive(matchup.teamBPokemonAlive)
    setError(null)
  }

  return (
    <div className="animate-fade-scale">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: 'rgba(79,195,247,0.2)' }}>
        <h3 className="text-xl font-bold" style={{ color: '#e8eaf6' }}>
          Editar Resultado
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: '#64748b' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Información del enfrentamiento */}
      <div className="glass-card p-4 mb-6" style={{ background: 'rgba(79,195,247,0.05)' }}>
        <div className="text-center">
          <div className="text-sm uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
            Fecha {matchup.roundNumber}
          </div>
          <div className="text-lg font-bold" style={{ color: '#e8eaf6' }}>
            {teamA.teamName} vs {teamB.teamName}
          </div>
        </div>
      </div>

      {/* Selector de ganador */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: '#94a3b8' }}>
          Ganador del Combate *
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Equipo A */}
          <button
            type="button"
            onClick={() => setWinnerTeamId(teamA.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              winnerTeamId === teamA.id
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            style={{
              background: winnerTeamId === teamA.id 
                ? 'rgba(16,185,129,0.1)' 
                : 'rgba(79,195,247,0.05)',
              borderColor: winnerTeamId === teamA.id 
                ? 'rgba(16,185,129,0.5)' 
                : 'rgba(100,116,139,0.5)'
            }}
          >
            <div className="flex items-center gap-3">
              {teamA.pokemons[0] && (
                <img
                  src={teamA.pokemons[0].image}
                  alt={teamA.pokemons[0].name}
                  className="w-10 h-10 pokemon-sprite"
                  crossOrigin="anonymous"
                />
              )}
              <div className="text-left">
                <div className="font-bold" style={{ color: '#e8eaf6' }}>{teamA.teamName}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{teamA.trainerName}</div>
              </div>
            </div>
            {winnerTeamId === teamA.id && (
              <div className="mt-2 flex items-center gap-1 text-xs font-bold" style={{ color: '#10b981' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Seleccionado
              </div>
            )}
          </button>

          {/* Equipo B */}
          <button
            type="button"
            onClick={() => setWinnerTeamId(teamB.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              winnerTeamId === teamB.id
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            style={{
              background: winnerTeamId === teamB.id 
                ? 'rgba(16,185,129,0.1)' 
                : 'rgba(79,195,247,0.05)',
              borderColor: winnerTeamId === teamB.id 
                ? 'rgba(16,185,129,0.5)' 
                : 'rgba(100,116,139,0.5)'
            }}
          >
            <div className="flex items-center gap-3">
              {teamB.pokemons[0] && (
                <img
                  src={teamB.pokemons[0].image}
                  alt={teamB.pokemons[0].name}
                  className="w-10 h-10 pokemon-sprite"
                  crossOrigin="anonymous"
                />
              )}
              <div className="text-left">
                <div className="font-bold" style={{ color: '#e8eaf6' }}>{teamB.teamName}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{teamB.trainerName}</div>
              </div>
            </div>
            {winnerTeamId === teamB.id && (
              <div className="mt-2 flex items-center gap-1 text-xs font-bold" style={{ color: '#10b981' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Seleccionado
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Pokémon Vivos - Equipo A */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: '#94a3b8' }}>
          Pokémons vivos - {teamA.teamName}
        </label>
        
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="6"
            value={teamAPokemonAlive}
            onChange={(e) => setTeamAPokemonAlive(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{ 
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(teamAPokemonAlive / 6) * 100}%, #374151 ${(teamAPokemonAlive / 6) * 100}%, #374151 100%)`
            }}
          />
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
            style={{ 
              background: 'rgba(16,185,129,0.1)',
              border: '2px solid rgba(16,185,129,0.3)',
              color: '#10b981'
            }}
          >
            {teamAPokemonAlive}
          </div>
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
          <span>0</span>
          <span>6</span>
        </div>
      </div>

      {/* Pokémon Vivos - Equipo B */}
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: '#94a3b8' }}>
          Pokémons vivos - {teamB.teamName}
        </label>
        
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="6"
            value={teamBPokemonAlive}
            onChange={(e) => setTeamBPokemonAlive(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{ 
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(teamBPokemonAlive / 6) * 100}%, #374151 ${(teamBPokemonAlive / 6) * 100}%, #374151 100%)`
            }}
          />
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
            style={{ 
              background: 'rgba(16,185,129,0.1)',
              border: '2px solid rgba(16,185,129,0.3)',
              color: '#10b981'
            }}
          >
            {teamBPokemonAlive}
          </div>
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
          <span>0</span>
          <span>6</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#ef4444' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 btn-glow py-3 rounded-xl font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar Resultado'}
        </button>
        
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider"
          style={{ 
            background: 'rgba(100,116,139,0.1)',
            color: '#64748b',
            border: '1px solid rgba(100,116,139,0.3)'
          }}
        >
          Resetear
        </button>
        
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider"
          style={{ 
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.3)'
          }}
        >
          Cancelar
        </button>
      </div>

      {/* Info note */}
      <div className="mt-4 p-4 rounded-xl text-xs" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="flex items-start gap-2" style={{ color: '#93c5fd' }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <div>
            <strong>Nota:</strong> Al guardar, se actualizarán automáticamente los puntos y victorias de ambos equipos.
            El ganador recibe 3 puntos, el perdedor 0 puntos. Los Pokémon vivos sirven como factor de desempate en la tabla.
          </div>
        </div>
      </div>
    </div>
  )
}
