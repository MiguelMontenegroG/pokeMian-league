'use client'

import { useMemo } from 'react'
import type { Team } from '@/app/page'
import type { Matchup } from '@/hooks/useMatchups'

interface Props {
  matchup: Matchup
  teams: Team[]
  isAdmin: boolean
  onEdit?: () => void
}

export default function MatchupCard({ matchup, teams, isAdmin, onEdit }: Props) {
  // Encontrar los equipos
  const teamA = useMemo(() => teams.find(t => t.id === matchup.teamAId), [teams, matchup.teamAId])
  const teamB = useMemo(() => teams.find(t => t.id === matchup.teamBId), [teams, matchup.teamBId])
  const winner = useMemo(() => teams.find(t => t.id === matchup.winnerTeamId), [teams, matchup.winnerTeamId])

  if (!teamA || !teamB) return null

  return (
    <div
      className="glass-card p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{ 
        borderColor: winner ? 'rgba(16,185,129,0.3)' : 'rgba(79,195,247,0.1)',
        boxShadow: winner ? '0 0 25px rgba(16,185,129,0.15)' : 'none'
      }}
    >
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {matchup.played ? (
            <div className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              Finalizado
            </div>
          ) : (
            <div className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              Pendiente
            </div>
          )}
        </div>
        
        {isAdmin && (
          <button
            onClick={onEdit}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#4fc3f7' }}
            title="Editar resultado"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Equipos enfrentados */}
      <div className="space-y-4">
        {/* Equipo A */}
        <div className={`flex items-center justify-between ${winner?.id === teamA.id ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-center gap-3">
            {/* Pokémon destacado */}
            {teamA.pokemons[0] && (
              <img
                src={teamA.pokemons[0].image}
                alt={teamA.pokemons[0].name}
                className="w-10 h-10 pokemon-sprite"
                style={{ 
                  filter: winner?.id === teamA.id 
                    ? 'drop-shadow(0 0 12px rgba(16,185,129,0.6))' 
                    : 'drop-shadow(0 0 8px rgba(79,195,247,0.3))'
                }}
                crossOrigin="anonymous"
              />
            )}
            
            {/* Info del equipo */}
            <div>
              <div className="font-bold" style={{ color: '#e8eaf6' }}>{teamA.teamName}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{teamA.trainerName}</div>
            </div>
          </div>
          
          {/* Pokémon vivos */}
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: matchup.played ? '#10b981' : '#64748b' }}>
              {matchup.teamAPokemonAlive}
            </div>
            <div className="text-xs uppercase" style={{ color: '#64748b' }}>Vivos</div>
          </div>
        </div>

        {/* VS divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px" style={{ background: 'rgba(79,195,247,0.2)' }} />
          </div>
          <div
            className="relative px-3 py-1 rounded text-xs font-bold"
            style={{ 
              background: winner ? 'rgba(16,185,129,0.2)' : 'rgba(79,195,247,0.1)',
              color: winner ? '#10b981' : '#64748b',
              border: `1px solid ${winner ? 'rgba(16,185,129,0.3)' : 'rgba(79,195,247,0.2)'}`
            }}
          >
            VS
          </div>
        </div>

        {/* Equipo B */}
        <div className={`flex items-center justify-between ${winner?.id === teamB.id ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-center gap-3">
            {/* Pokémon destacado */}
            {teamB.pokemons[0] && (
              <img
                src={teamB.pokemons[0].image}
                alt={teamB.pokemons[0].name}
                className="w-10 h-10 pokemon-sprite"
                style={{ 
                  filter: winner?.id === teamB.id 
                    ? 'drop-shadow(0 0 12px rgba(16,185,129,0.6))' 
                    : 'drop-shadow(0 0 8px rgba(79,195,247,0.3))'
                }}
                crossOrigin="anonymous"
              />
            )}
            
            {/* Info del equipo */}
            <div>
              <div className="font-bold" style={{ color: '#e8eaf6' }}>{teamB.teamName}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{teamB.trainerName}</div>
            </div>
          </div>
          
          {/* Pokémon vivos */}
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: matchup.played ? '#10b981' : '#64748b' }}>
              {matchup.teamBPokemonAlive}
            </div>
            <div className="text-xs uppercase" style={{ color: '#64748b' }}>Vivos</div>
          </div>
        </div>
      </div>

      {/* Winner indicator */}
      {matchup.played && winner && (
        <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10b981' }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#10b981' }}>
              Ganador
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#e8eaf6' }}>{winner.teamName}</span>
        </div>
      )}
    </div>
  )
}
