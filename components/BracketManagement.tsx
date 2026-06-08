'use client'

import { useState } from 'react'
import type { Team } from '@/app/page'

interface Props {
  teams: Team[]
  onUpdatePosition: (teamId: number, position: number | null) => void
}

export default function BracketManagement({ teams, onUpdatePosition }: Props) {
  // Get top 4 teams by points (automatically qualified)
  const qualifiedTeams = [...teams]
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)

  // Get teams currently in bracket
  const bracketTeams = qualifiedTeams.filter(t => t.bracketPosition !== null && t.bracketPosition !== undefined)
  
  const hasBracketConfigured = bracketTeams.length === 4

  // Get available positions (positions not yet assigned)
  const getAvailablePositions = (currentTeamId?: number) => {
    const assignedPositions = qualifiedTeams
      .filter(t => t.bracketPosition !== null && t.bracketPosition !== undefined && t.id !== currentTeamId)
      .map(t => t.bracketPosition)
    
    return [1, 2, 3, 4].filter(pos => !assignedPositions.includes(pos))
  }

  // State for bracket match results (cargados desde localStorage)
  const [semi1Winner, setSemi1Winner] = useState<Team | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('bracketResults')
    if (saved) {
      const parsed = JSON.parse(saved)
      return teams.find(t => t.id === parsed.semi1WinnerId) || null
    }
    return null
  })
  const [semi2Winner, setSemi2Winner] = useState<Team | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('bracketResults')
    if (saved) {
      const parsed = JSON.parse(saved)
      return teams.find(t => t.id === parsed.semi2WinnerId) || null
    }
    return null
  })
  const [finalWinner, setFinalWinner] = useState<Team | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('bracketResults')
    if (saved) {
      const parsed = JSON.parse(saved)
      return teams.find(t => t.id === parsed.finalWinnerId) || null
    }
    return null
  })

  // Persistir en localStorage cuando cambien los ganadores
  const persistResults = (s1: Team | null, s2: Team | null, f: Team | null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bracketResults', JSON.stringify({
        semi1WinnerId: s1?.id || null,
        semi2WinnerId: s2?.id || null,
        finalWinnerId: f?.id || null
      }))
    }
  }

  // Get team by bracket position
  const getTeamByPosition = (position: number) => {
    return bracketTeams.find(t => t.bracketPosition === position)
  }

  const team1 = getTeamByPosition(1)
  const team2 = getTeamByPosition(2)
  const team3 = getTeamByPosition(3)
  const team4 = getTeamByPosition(4)

  const handleSelectWinner = (matchup: 'semi1' | 'semi2' | 'final', team: Team) => {
    let newSemi1 = semi1Winner
    let newSemi2 = semi2Winner
    let newFinal = finalWinner

    if (matchup === 'semi1') {
      newSemi1 = semi1Winner?.id === team.id ? null : team
      setSemi1Winner(newSemi1)
    } else if (matchup === 'semi2') {
      newSemi2 = semi2Winner?.id === team.id ? null : team
      setSemi2Winner(newSemi2)
    } else if (matchup === 'final') {
      newFinal = finalWinner?.id === team.id ? null : team
      setFinalWinner(newFinal)
    }

    persistResults(newSemi1, newSemi2, newFinal)
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#f59e0b', letterSpacing: '0.2em' }}>
          Panel de Administración
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
          Configurar{' '}
          <span className="glow-text" style={{ color: '#f59e0b' }}>Bracket</span>
        </h2>
      </div>

      {/* Info card */}
      <div
        className="glass-card p-6 mb-8"
        style={{ 
          border: '1px solid rgba(245,158,11,0.3)',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))'
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold mb-2" style={{ color: '#e8eaf6' }}>Instrucciones</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
              <li>✅ Los <strong>{qualifiedTeams.length}</strong> mejores equipos por puntos están clasificados</li>
              <li>🎯 Asigna una posición del bracket (1-4) a cada equipo</li>
              <li>⚠️ Las posiciones definen los enfrentamientos: [1] vs [4], [2] vs [3]</li>
              <li>💡 Solo tú puedes ver y modificar esta configuración</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Qualified teams list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {qualifiedTeams.map((team, index) => {
          const rank = index + 1
          const availablePositions = getAvailablePositions(team.id)
          
          return (
            <div
              key={team.id}
              className="glass-card p-5"
              style={{ 
                border: team.bracketPosition ? '2px solid rgba(245,158,11,0.4)' : '1px solid rgba(79,195,247,0.1)',
                background: team.bracketPosition ? 'rgba(245,158,11,0.08)' : 'transparent',
                boxShadow: team.bracketPosition ? '0 0 25px rgba(245,158,11,0.2)' : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ 
                      background: rank <= 4 ? 'linear-gradient(135deg, #4fc3f7, #0288d1)' : 'rgba(79,195,247,0.1)',
                      color: '#fff',
                      boxShadow: rank <= 4 ? '0 0 12px rgba(79,195,247,0.4)' : 'none'
                    }}
                  >
                    #{rank}
                  </div>
                  
                  {/* Pokemon sprite */}
                  {team.pokemons[0] && (
                    <img
                      src={team.pokemons[0].image}
                      alt={team.pokemons[0].name}
                      className="w-12 h-12 pokemon-sprite"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(79,195,247,0.3))' }}
                      crossOrigin="anonymous"
                    />
                  )}
                  
                  {/* Team info */}
                  <div>
                    <div className="font-bold" style={{ color: '#e8eaf6' }}>{team.teamName}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{team.trainerName}</div>
                  </div>
                </div>
                
                {/* Points badge */}
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: '#4fc3f7' }}>{team.points}</div>
                  <div className="text-xs uppercase" style={{ color: '#64748b' }}>pts</div>
                </div>
              </div>

              {/* Position selector */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: 'rgba(79,195,247,0.1)' }}>
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
                  Posición en el Bracket
                </label>
                
                <select
                  value={team.bracketPosition || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null
                    console.log(`🔵 Changing ${team.teamName} from ${team.bracketPosition} to ${value}`)
                    onUpdatePosition(team.id, value)
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm font-semibold border bg-transparent"
                  style={{ 
                    color: team.bracketPosition ? '#f59e0b' : '#64748b',
                    borderColor: team.bracketPosition ? 'rgba(245,158,11,0.4)' : 'rgba(79,195,247,0.2)',
                    background: team.bracketPosition ? 'rgba(245,158,11,0.1)' : 'rgba(79,195,247,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ color: '#000' }}>-- Seleccionar --</option>
                  {availablePositions.map(pos => (
                    <option key={pos} value={pos} style={{ color: '#000' }}>
                      Posición {pos} {pos === 1 ? '' : pos === 2 ? '' : pos === 3 ? '' : ''}
                    </option>
                  ))}
                </select>

                {/* Current position indicator */}
                {team.bracketPosition && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                    <span style={{ color: '#10b981' }}>
                      Asignado a posición <strong>#{team.bracketPosition}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Status message */}
      {!hasBracketConfigured && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
              {bracketTeams.length} de 4 posiciones asignadas
            </span>
          </div>
          <p className="mt-3 text-sm" style={{ color: '#64748b' }}>
            Asigna las 4 posiciones para completar el bracket
          </p>
        </div>
      )}

      {hasBracketConfigured && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10b981' }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
              ¡Bracket configurado correctamente!
            </span>
          </div>
          <p className="mt-3 text-sm" style={{ color: '#94a3b8' }}>
            Los usuarios ya pueden ver los enfrentamientos en la vista pública
          </p>
        </div>
      )}

      {/* Bracket interactivo */}
      {hasBracketConfigured && (
        <div className="mt-10">
          <div className="text-center mb-6">
            <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#f59e0b', letterSpacing: '0.2em' }}>
              Bracket de la Fase Final
            </p>
            <h3 className="text-2xl font-bold" style={{ color: '#e8eaf6' }}>
              Selecciona los <span className="glow-text" style={{ color: '#f59e0b' }}>Ganadores</span>
            </h3>
            <p className="text-xs mt-2" style={{ color: '#64748b' }}>
              Haz clic en un equipo para marcar como ganador del enfrentamiento
            </p>
          </div>

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
                    onSelectWinner={(team) => handleSelectWinner('semi1', team)}
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
                    onSelectWinner={(team) => handleSelectWinner('semi2', team)}
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
                    onSelectWinner={(team) => handleSelectWinner('final', team)}
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
      )}
    </div>
  )
}

function BracketMatchupCard({
  team1,
  team2,
  winner,
  isFinal = false,
  onSelectWinner
}: {
  team1: Team | null
  team2: Team | null
  winner: Team | null
  isFinal?: boolean
  onSelectWinner: (team: Team) => void
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
      <button
        onClick={() => team1 && onSelectWinner(team1)}
        disabled={!team1}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
          team1 ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default opacity-50'
        }`}
        style={{
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
      </button>

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
      <button
        onClick={() => team2 && onSelectWinner(team2)}
        disabled={!team2}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
          team2 ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default opacity-50'
        }`}
        style={{
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
      </button>
    </div>
  )
}
