'use client'

import { useState, useEffect } from 'react'
import type { Team } from '@/app/page'
import { useBracketResults } from '@/hooks/useBracketResults'

interface Props {
  teams: Team[]
}

export default function BracketView({ teams }: Props) {
  // Get teams with bracket positions, sorted by position
  const bracketTeams = teams
    .filter(t => t.bracketPosition !== null && t.bracketPosition !== undefined)
    .sort((a, b) => (a.bracketPosition || 0) - (b.bracketPosition || 0))

  // Get qualified teams (top 4 by points)
  const qualifiedTeams = [...teams]
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)

  const hasBracket = bracketTeams.length === 4

  // Get team by bracket position
  const getTeamByPosition = (position: number) => {
    return bracketTeams.find(t => t.bracketPosition === position)
  }

  // Hook para leer resultados del bracket desde Supabase
  const { results, loading } = useBracketResults()

  const [semi1Winner, setSemi1Winner] = useState<Team | null>(null)
  const [semi2Winner, setSemi2Winner] = useState<Team | null>(null)
  const [finalWinner, setFinalWinner] = useState<Team | null>(null)

  // Cargar resultados desde Supabase
  useEffect(() => {
    if (loading || !results) return

    setSemi1Winner(results.semi1WinnerId ? teams.find(t => t.id === results.semi1WinnerId) || null : null)
    setSemi2Winner(results.semi2WinnerId ? teams.find(t => t.id === results.semi2WinnerId) || null : null)
    setFinalWinner(results.finalWinnerId ? teams.find(t => t.id === results.finalWinnerId) || null : null)
  }, [results, loading, teams])

  if (!hasBracket && bracketTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 animate-fade-scale">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.15)' }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf6' }}>Bracket en Configuracion</h2>
          <p className="mb-4" style={{ color: '#64748b' }}>
            Los {qualifiedTeams.length} mejores equipos estan clasificados para el playoff
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {qualifiedTeams.map((team, i) => (
              <div
                key={team.id}
                className="glass-card p-4 text-center"
                style={{ 
                  borderColor: i < 4 ? 'rgba(245,158,11,0.3)' : 'rgba(79,195,247,0.1)',
                  boxShadow: i < 4 ? '0 0 20px rgba(245,158,11,0.2)' : 'none'
                }}
              >
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
                  Posicion #{i + 1} por puntos
                </div>
                <div className="font-bold" style={{ color: '#e8eaf6' }}>{team.teamName}</div>
                <div className="text-sm" style={{ color: '#64748b' }}>{team.trainerName}</div>
                <div className="text-xs mt-2" style={{ color: '#f59e0b' }}>{team.points} pts</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm" style={{ color: '#64748b' }}>
            El administrador configurara los enfrentamientos pronto
          </p>
        </div>
      </div>
    )
  }

  const team1 = getTeamByPosition(1)
  const team2 = getTeamByPosition(2)
  const team3 = getTeamByPosition(3)
  const team4 = getTeamByPosition(4)

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#f59e0b', letterSpacing: '0.2em' }}>
          Fase Final
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
          Bracket del{' '}
          <span className="glow-text" style={{ color: '#f59e0b' }}>Campeonato</span>
        </h2>
      </div>

      {/* Bracket Tree */}
      <div className="glass-card p-6 md:p-8 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Semifinals */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Semi 1: [1] vs [4] */}
            <div className="space-y-4">
              <div className="text-center text-xs uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>
                Semifinal 1
              </div>
              <BracketMatchupCard
                team1={team1 || null}
                team2={team4 || null}
                winner={semi1Winner}
                isReadOnly={true}
              />
            </div>

            {/* Semi 2: [2] vs [3] */}
            <div className="space-y-4">
              <div className="text-center text-xs uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>
                Semifinal 2
              </div>
              <BracketMatchupCard
                team1={team2 || null}
                team2={team3 || null}
                winner={semi2Winner}
                isReadOnly={true}
              />
            </div>
          </div>

          {/* Connector lines to Final */}
          <div className="relative h-16 mb-8">
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(245,158,11,0.3)' }} />
            <div className="absolute left-1/4 right-1/4 top-1/2 h-px" style={{ background: 'rgba(245,158,11,0.3)' }} />
          </div>

          {/* Final */}
          <div className="text-center">
            <div className="text-center text-xs uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>
              Gran Final
            </div>
            <div className="inline-block w-full max-w-md">
              <BracketMatchupCard
                team1={semi1Winner}
                team2={semi2Winner}
                winner={finalWinner}
                isFinal={true}
                isReadOnly={true}
              />
            </div>
          </div>

          {/* Champion */}
          {finalWinner && (
            <div className="text-center mt-8 animate-fade-scale">
              <div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
                  border: '2px solid rgba(245,158,11,0.4)',
                  boxShadow: '0 0 40px rgba(245,158,11,0.3)'
                }}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f59e0b' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#64748b' }}>Campeon</div>
                  <div className="font-bold text-lg" style={{ color: '#f59e0b' }}>{finalWinner.teamName}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BracketMatchupCard({
  team1,
  team2,
  winner,
  isFinal = false,
  isReadOnly = false,
}: {
  team1: Team | null
  team2: Team | null
  winner: Team | null
  isFinal?: boolean
  isReadOnly?: boolean
}) {
  return (
    <div
      className="glass-card p-5"
      style={{
        borderColor: winner ? 'rgba(16,185,129,0.4)' : isFinal ? 'rgba(245,158,11,0.3)' : 'rgba(79,195,247,0.1)',
        boxShadow: winner ? '0 0 30px rgba(16,185,129,0.2)' : isFinal ? '0 0 20px rgba(245,158,11,0.15)' : 'none',
        background: isFinal ? 'rgba(245,158,11,0.04)' : undefined,
      }}
    >
      {/* Team 1 */}
      <div
        className="w-full flex items-center justify-between p-3 rounded-xl"
        style={{
          cursor: 'default',
          opacity: team1 ? 1 : 0.5,
          background: winner?.id === team1?.id
            ? 'rgba(16,185,129,0.15)'
            : 'rgba(255,255,255,0.03)',
          border: winner?.id === team1?.id
            ? '2px solid rgba(16,185,129,0.5)'
            : '1px solid rgba(79,195,247,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          {team1?.pokemons[0] ? (
            <img
              src={team1.pokemons[0].image}
              alt={team1.pokemons[0].name}
              className="w-10 h-10 pokemon-sprite"
              style={{
                filter: winner?.id === team1?.id
                  ? 'drop-shadow(0 0 12px rgba(16,185,129,0.6))'
                  : 'drop-shadow(0 0 8px rgba(245,158,11,0.3))'
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-10 h-10 rounded-full" style={{ background: 'rgba(79,195,247,0.1)', border: '1px dashed rgba(79,195,247,0.2)' }} />
          )}
          <div className="text-left">
            <div className="font-bold text-sm" style={{ color: team1 ? '#e8eaf6' : '#64748b' }}>
              {team1?.teamName || 'Por definir'}
            </div>
            {team1 && (
              <div className="text-xs" style={{ color: '#64748b' }}>{team1.trainerName}</div>
            )}
          </div>
        </div>
        {winner?.id === team1?.id && (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10b981' }}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* VS divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(245,158,11,0.2)' }} />
        <span className="px-3 py-0.5 rounded text-xs font-bold" style={{
          background: winner ? 'rgba(16,185,129,0.15)' : 'rgba(79,195,247,0.1)',
          color: winner ? '#10b981' : '#64748b',
          border: `1px solid ${winner ? 'rgba(16,185,129,0.3)' : 'rgba(79,195,247,0.2)'}`
        }}>
          VS
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(245,158,11,0.2)' }} />
      </div>

      {/* Team 2 */}
      <div
        className="w-full flex items-center justify-between p-3 rounded-xl"
        style={{
          cursor: 'default',
          opacity: team2 ? 1 : 0.5,
          background: winner?.id === team2?.id
            ? 'rgba(16,185,129,0.15)'
            : 'rgba(255,255,255,0.03)',
          border: winner?.id === team2?.id
            ? '2px solid rgba(16,185,129,0.5)'
            : '1px solid rgba(79,195,247,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          {team2?.pokemons[0] ? (
            <img
              src={team2.pokemons[0].image}
              alt={team2.pokemons[0].name}
              className="w-10 h-10 pokemon-sprite"
              style={{
                filter: winner?.id === team2?.id
                  ? 'drop-shadow(0 0 12px rgba(16,185,129,0.6))'
                  : 'drop-shadow(0 0 8px rgba(245,158,11,0.3))'
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-10 h-10 rounded-full" style={{ background: 'rgba(79,195,247,0.1)', border: '1px dashed rgba(79,195,247,0.2)' }} />
          )}
          <div className="text-left">
            <div className="font-bold text-sm" style={{ color: team2 ? '#e8eaf6' : '#64748b' }}>
              {team2?.teamName || 'Por definir'}
            </div>
            {team2 && (
              <div className="text-xs" style={{ color: '#64748b' }}>{team2.trainerName}</div>
            )}
          </div>
        </div>
        {winner?.id === team2?.id && (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10b981' }}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
    </div>
  )
}