'use client'

import { useMemo } from 'react'
import type { Team } from '@/app/page'
import type { Matchup } from '@/hooks/useMatchups'
import MatchupCard from './MatchupCard'

interface Props {
  matchups: Matchup[]
  teams: Team[]
  isAdmin: boolean
  onEditMatchup?: (matchup: Matchup) => void
}

export default function MatchupsView({ matchups, teams, isAdmin, onEditMatchup }: Props) {
  // Agrupar enfrentamientos por ronda
  const matchupsByRound = useMemo(() => {
    const rounds = new Map<number, Matchup[]>()
    
    matchups.forEach(matchup => {
      const round = matchup.roundNumber
      if (!rounds.has(round)) {
        rounds.set(round, [])
      }
      rounds.get(round)!.push(matchup)
    })
    
    return rounds
  }, [matchups])

  // Obtener número total de rondas
  const totalRounds = Math.max(...Array.from(matchupsByRound.keys()), 0)

  if (matchups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-fade-scale">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ 
            background: 'rgba(79,195,247,0.08)', 
            border: '2px solid rgba(79,195,247,0.15)' 
          }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf6' }}>
            Sin Enfrentamientos Programados
          </h2>
          <p className="mb-6" style={{ color: '#64748b' }}>
            Los enfrentamientos se generarán automáticamente cuando haya suficientes equipos
          </p>
          {isAdmin && (
            <div className="text-sm" style={{ color: '#94a3b8' }}>
              Como admin, puedes generar los enfrentamientos desde el panel de administración
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#4fc3f7', letterSpacing: '0.2em' }}>
          Fase Regular
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
          Enfrentamientos{' '}
          <span className="glow-text" style={{ color: '#4fc3f7' }}>Todos Contra Todos</span>
        </h2>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(79,195,247,0.1)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2">
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#e8eaf6' }}>{totalRounds}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>Jornadas</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#e8eaf6' }}>
                {matchups.filter(m => m.played).length}
              </div>
              <div className="text-xs" style={{ color: '#64748b' }}>Jugados</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#e8eaf6' }}>
                {matchups.filter(m => !m.played).length}
              </div>
              <div className="text-xs" style={{ color: '#64748b' }}>Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rondas */}
      <div className="space-y-8">
        {Array.from(matchupsByRound.entries())
          .sort(([a], [b]) => a - b)
          .map(([roundNumber, roundMatchups]) => (
            <div key={roundNumber}>
              {/* Round header */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
                    boxShadow: '0 0 20px rgba(79,195,247,0.3)'
                  }}
                >
                  {roundNumber}
                </div>
                <div className="flex-1 h-px" style={{ background: 'rgba(79,195,247,0.2)' }} />
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                  Fecha {roundNumber}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(79,195,247,0.2)' }} />
              </div>

              {/* Matchups grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {roundMatchups.map((matchup) => (
                  <MatchupCard
                    key={matchup.id}
                    matchup={matchup}
                    teams={teams}
                    isAdmin={isAdmin}
                    onEdit={() => onEditMatchup?.(matchup)}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Legend */}
      <div className="mt-8 glass-card p-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
            <span style={{ color: '#94a3b8' }}>Pokémon Vivos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
            <span style={{ color: '#94a3b8' }}>Pokémon Debilitados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              VS
            </div>
            <span style={{ color: '#94a3b8' }}>Combate</span>
          </div>
        </div>
      </div>
    </div>
  )
}
