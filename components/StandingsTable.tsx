'use client'

import { useMemo, useState, useEffect } from 'react'
import type { Team, Matchup } from '@/app/page'
import type { Trainer } from '@/components/TrainersView'

// Helper para obtener URL de avatar
function getAvatarUrl(spriteId: number | null | undefined): string | null {
  if (!spriteId) return null
  if (spriteId < 1 || spriteId > 93) return null
  return `/sprites_profile/${String(spriteId).padStart(3, '0')}.png`
}

interface Props {
  teams: Team[]
  matchups?: Matchup[]
  onNavigate: (view: string) => void
  trainers?: Trainer[]
  trainer?: { id: number; name: string } | null
  onNavigateToMyTeams?: () => void
}

const RANK_COLORS: Record<number, { color: string; glow: string; label: string; bg: string }> = {
  1: { color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', label: 'Campeón', bg: 'rgba(245,158,11,0.08)' },
  2: { color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', label: 'Subcampeón', bg: 'rgba(148,163,184,0.05)' },
  3: { color: '#cd7f32', glow: 'rgba(205,127,50,0.3)', label: 'Top 3', bg: 'rgba(205,127,50,0.05)' },
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.7))' }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
  if (rank === 2) return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#94a3b8', filter: 'drop-shadow(0 0 4px rgba(148,163,184,0.5))' }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
  if (rank === 3) return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#cd7f32', filter: 'drop-shadow(0 0 4px rgba(205,127,50,0.5))' }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
  return <span className="text-sm font-bold" style={{ color: '#475569' }}>#{rank}</span>
}

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min((value / max) * 100, 100)), 100)
    return () => clearTimeout(t)
  }, [value, max])
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.05)' }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, background: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  )
}

export default function StandingsTable({ teams, matchups = [], onNavigate, trainer, onNavigateToMyTeams, trainers = [] }: Props) {
  // Calcular Pokémon vivos totales por equipo desde los enfrentamientos jugados (usando useMemo para evitar loops)
  const pokemonAliveStats = useMemo(() => {
    console.log('🔵 Calculando PKM Vivos - Teams:', teams.length, 'Matchups:', matchups.length)
    console.log('📦 Matchups received in StandingsTable:', matchups.map(m => ({
      id: m.id,
      round: m.roundNumber,
      played: m.played,
      teamA: m.teamAId,
      teamB: m.teamBId,
      aliveA: m.teamAPokemonAlive,
      aliveB: m.teamBPokemonAlive
    })))
    const stats = new Map<number, number>()
    
    // Inicializar todos los equipos con 0
    teams.forEach(team => {
      stats.set(team.id, 0)
    })
    
    // Sumar Pokémon vivos de cada enfrentamiento jugado para AMBOS equipos
    matchups.forEach(matchup => {
      console.log('🔍 [StandingsTable] Matchup ID:', matchup.id, 'Round:', matchup.roundNumber)
      console.log('   Played:', matchup.played, '| TeamA:', matchup.teamAId, 'TeamB:', matchup.teamBId)
      console.log('   Alive A:', matchup.teamAPokemonAlive, 'Alive B:', matchup.teamBPokemonAlive)
      
      if (matchup.played) {
        // Solo contar si el enfrentamiento está jugado
        const teamAPokemonAlive = matchup.teamAPokemonAlive || 0
        const teamBPokemonAlive = matchup.teamBPokemonAlive || 0
        
        console.log('   ✅ Sumando PKM vivos - Team', matchup.teamAId, ':', teamAPokemonAlive)
        console.log('   ✅ Sumando PKM vivos - Team', matchup.teamBId, ':', teamBPokemonAlive)
        
        // Sumar al equipo A
        const currentAliveA = stats.get(matchup.teamAId) || 0
        stats.set(matchup.teamAId, currentAliveA + teamAPokemonAlive)
        
        // Sumar al equipo B
        const currentAliveB = stats.get(matchup.teamBId) || 0
        stats.set(matchup.teamBId, currentAliveB + teamBPokemonAlive)
      } else {
        console.log('   ❌ Skip (not played)')
      }
    })
    
    console.log('📊 Stats finales:', Object.fromEntries(stats))
    return stats
  }, [teams, matchups]) // Solo se recalcula cuando teams o matchups cambian realmente
  
  // Calcular estadísticas de combates por equipo
  const combatStats = useMemo(() => {
    const stats = new Map<number, { played: number; total: number }>()

    // Inicializar todos los equipos
    teams.forEach(team => {
      stats.set(team.id, { played: 0, total: 0 })
    })

    // Calcular cuantos combates tiene cada equipo (jugados y totales)
    teams.forEach(team => {
      const teamMatchups = matchups.filter(m => m.teamAId === team.id || m.teamBId === team.id)
      const totalForTeam = teamMatchups.length
      const playedForTeam = teamMatchups.filter(m => m.played).length
      stats.set(team.id, { played: playedForTeam, total: totalForTeam })
    })

    return stats
  }, [teams, matchups])

  const sorted = [...teams].sort((a, b) => {
    // Primero ordenar por puntos
    if (b.points !== a.points) return b.points - a.points
    // En caso de empate, usar Pokémon vivos como desempate
    const aliveA = pokemonAliveStats.get(a.id) || 0
    const aliveB = pokemonAliveStats.get(b.id) || 0
    return aliveB - aliveA
  })
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-fade-scale">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(79,195,247,0.08)', border: '2px solid rgba(79,195,247,0.15)' }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf6' }}>Sin equipos registrados</h2>
          <p className="mb-6" style={{ color: '#64748b' }}>Crea el primer equipo para comenzar la liga</p>
          <button
            onClick={() => {
              if (trainer && onNavigateToMyTeams) {
                onNavigateToMyTeams()
              } else if (!trainer) {
                alert('Debes iniciar sesión como entrenador para crear un equipo.')
              } else {
                onNavigate('create')
              }
            }}
            className="btn-glow px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase"
          >
            Crear primer equipo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="transition-all duration-500 opacity-100 translate-y-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#4fc3f7', letterSpacing: '0.2em' }}>
            Temporada 2025
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
            Tabla de{' '}
            <span className="glow-text" style={{ color: '#4fc3f7' }}>Clasificación</span>
          </h2>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: 'rgba(79,195,247,0.08)',
            border: '1px solid rgba(79,195,247,0.15)',
            color: '#4fc3f7',
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {teams.length} equipos
        </div>
      </div>

      {/* Top 3 podium cards */}
      {sorted.length >= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[sorted[1], sorted[0], sorted[2]].filter(Boolean).map((team, i) => {
            const realRank = sorted.indexOf(team) + 1
            const rankInfo = RANK_COLORS[realRank] || { color: '#475569', glow: 'transparent', label: '', bg: 'transparent' }
            const isChamp = realRank === 1
            return (
              <div
                key={team.id}
                className={`glass-card p-5 flex flex-col items-center text-center ${isChamp ? 'sm:order-2' : i === 0 ? 'sm:order-1' : 'sm:order-3'}`}
                style={{
                  borderColor: `rgba(${rankInfo.color === '#f59e0b' ? '245,158,11' : rankInfo.color === '#94a3b8' ? '148,163,184' : '205,127,50'},0.3)`,
                  background: rankInfo.bg,
                  boxShadow: `0 0 30px ${rankInfo.glow}`,
                  transform: isChamp ? 'scale(1.03)' : 'scale(1)',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="mb-3">
                  <MedalIcon rank={realRank} />
                </div>
                {/* Avatar del entrenador */}
                {(trainers.find(t => t.name === team.trainerName)?.avatarSprite) ? (
                  <div className="relative mb-2">
                    <img
                      src={getAvatarUrl(trainers.find(t => t.name === team.trainerName)?.avatarSprite) || ''}
                      alt={team.trainerName}
                      className="w-28 h-28 rounded-lg object-cover"
                      style={{
                        border: `2px solid ${rankInfo.color}`,
                        boxShadow: `0 0 12px ${rankInfo.glow}`,
                      }}
                    />
                  </div>
                ) : team.pokemons[0] && (
                  <div className="relative mb-2">
                    <img
                      src={team.pokemons[0].image}
                      alt={team.pokemons[0].name}
                      className="w-28 h-28 pokemon-sprite"
                      style={{ filter: `drop-shadow(0 0 12px ${rankInfo.glow})` }}
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                <h3 className="text-base font-bold mb-1" style={{ color: rankInfo.color }}>
                  {team.teamName}
                </h3>
                <p className="text-xs mb-3" style={{ color: '#64748b' }}>
                  {team.trainerName}
                </p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: '#475569' }}>Puntos</p>
                    <p className="text-xl font-bold" style={{ color: rankInfo.color, textShadow: `0 0 10px ${rankInfo.glow}` }}>
                      {team.points}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: '#475569' }}>Victorias</p>
                    <p className="text-xl font-bold" style={{ color: '#10b981' }}>
                      {team.wins}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full standings table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: 'rgba(79,195,247,0.08)' }}>
          <h3 className="text-lg font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
            Clasificación Completa
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr style={{ background: 'rgba(79,195,247,0.05)', borderBottom: '1px solid rgba(79,195,247,0.1)' }}>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Pos.</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Equipo</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest hidden md:table-cell" style={{ color: '#475569' }}>Entrenador</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Puntos</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest hidden sm:table-cell" style={{ color: '#475569' }}>Victorias</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>PKM Vivos</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest hidden lg:table-cell" style={{ color: '#475569' }}>Combates</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, index) => {
                const rank = index + 1
                const rankInfo = RANK_COLORS[rank]
                const isQualified = rank <= 4 && team.bracketPosition !== null && team.bracketPosition !== undefined
                return (
                  <tr
                    key={team.id}
                    className="table-row-animate border-b group cursor-default transition-colors duration-200"
                    style={{
                      borderColor: 'rgba(79,195,247,0.05)',
                      animationDelay: `${index * 0.07}s`,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(79,195,247,0.04)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MedalIcon rank={rank} />
                        {isQualified && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ 
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              boxShadow: '0 0 8px rgba(245,158,11,0.5)'
                            }}
                            title="Clasificado al Bracket"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {team.pokemons[0] ? (
                          <img
                            src={team.pokemons[0].image}
                            alt={team.pokemons[0].name}
                            className="w-9 h-9 flex-shrink-0"
                            style={{
                              imageRendering: 'pixelated',
                              filter: rankInfo ? `drop-shadow(0 0 6px ${rankInfo.glow})` : 'none',
                            }}
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ background: 'rgba(79,195,247,0.08)', border: '1px dashed rgba(79,195,247,0.2)' }} />
                        )}
                        <span className="font-bold text-base" style={{ color: rankInfo ? rankInfo.color : '#e8eaf6' }}>
                          {team.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {(trainers.find(t => t.name === team.trainerName)?.avatarSprite) ? (
                          <img
                            src={getAvatarUrl(trainers.find(t => t.name === team.trainerName)?.avatarSprite) || ''}
                            alt={team.trainerName}
                            className="w-7 h-7 rounded object-cover flex-shrink-0"
                            style={{
                              border: rankInfo ? `1.5px solid ${rankInfo.color}` : '1.5px solid rgba(79,195,247,0.3)',
                            }}
                          />
                        ) : null}
                        <span className="text-sm" style={{ color: '#64748b' }}>{team.trainerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className="text-lg font-bold"
                        style={{
                          color: rankInfo ? rankInfo.color : '#4fc3f7',
                          textShadow: rankInfo ? `0 0 10px ${rankInfo.glow}` : 'none',
                        }}
                      >
                        {team.points}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right hidden sm:table-cell">
                      <span className="text-base font-semibold" style={{ color: '#10b981' }}>
                        {team.wins}W
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-base font-bold" style={{ color: '#f59e0b' }}>
                        {pokemonAliveStats.get(team.id) || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="w-36 mx-auto text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                            {combatStats.get(team.id)?.played || 0}
                          </span>
                          <span className="text-xs" style={{ color: '#475569' }}>/</span>
                          <span className="text-sm font-bold" style={{ color: '#4fc3f7' }}>
                            {combatStats.get(team.id)?.total || 0}
                          </span>
                        </div>
                        <div className="text-xs font-semibold" style={{ color: '#475569' }}>
                          Combates
                        </div>
                        <div className="w-full rounded-full overflow-hidden mt-2" style={{ height: 4, background: 'rgba(255,255,255,0.05)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${combatStats.get(team.id)?.total ? ((combatStats.get(team.id)?.played || 0) / (combatStats.get(team.id)?.total || 1)) * 100 : 0}%`,
                              background: (combatStats.get(team.id)?.played || 0) === (combatStats.get(team.id)?.total || 0) ? '#10b981' : '#4fc3f7',
                              boxShadow: (combatStats.get(team.id)?.played || 0) === (combatStats.get(team.id)?.total || 0) ? '0 0 6px #10b981' : '0 0 6px #4fc3f7',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
