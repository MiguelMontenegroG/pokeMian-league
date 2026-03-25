'use client'

import { useEffect, useState } from 'react'
import type { Team, Pokemon } from '@/app/page'

interface Props {
  teams: Team[]
  onEdit?: () => void
}

const TYPE_GRADIENT: Record<string, string> = {
  fire: 'linear-gradient(135deg, rgba(238,129,48,0.15), rgba(238,80,30,0.05))',
  water: 'linear-gradient(135deg, rgba(99,144,240,0.15), rgba(30,100,200,0.05))',
  electric: 'linear-gradient(135deg, rgba(247,208,44,0.12), rgba(200,160,0,0.04))',
  grass: 'linear-gradient(135deg, rgba(122,199,76,0.15), rgba(60,150,50,0.05))',
  psychic: 'linear-gradient(135deg, rgba(249,85,135,0.15), rgba(180,40,100,0.05))',
  ghost: 'linear-gradient(135deg, rgba(115,87,151,0.2), rgba(60,40,100,0.05))',
  dragon: 'linear-gradient(135deg, rgba(111,53,252,0.15), rgba(60,20,180,0.05))',
  ice: 'linear-gradient(135deg, rgba(150,217,214,0.12), rgba(80,180,180,0.04))',
  fighting: 'linear-gradient(135deg, rgba(194,46,40,0.15), rgba(140,20,20,0.05))',
  poison: 'linear-gradient(135deg, rgba(163,62,161,0.15), rgba(100,20,100,0.05))',
  normal: 'linear-gradient(135deg, rgba(168,167,122,0.12), rgba(120,120,80,0.04))',
  rock: 'linear-gradient(135deg, rgba(182,161,54,0.15), rgba(140,120,30,0.05))',
  bug: 'linear-gradient(135deg, rgba(166,185,26,0.12), rgba(120,140,10,0.04))',
  ground: 'linear-gradient(135deg, rgba(226,191,101,0.12), rgba(180,150,60,0.04))',
  flying: 'linear-gradient(135deg, rgba(169,143,243,0.12), rgba(120,100,200,0.04))',
  dark: 'linear-gradient(135deg, rgba(112,87,70,0.15), rgba(70,50,40,0.05))',
  steel: 'linear-gradient(135deg, rgba(183,183,206,0.12), rgba(140,140,160,0.04))',
  fairy: 'linear-gradient(135deg, rgba(214,133,173,0.15), rgba(180,90,140,0.05))',
}

const TYPE_GLOW: Record<string, string> = {
  fire: 'rgba(238,129,48,0.35)',
  water: 'rgba(99,144,240,0.35)',
  electric: 'rgba(247,208,44,0.35)',
  grass: 'rgba(122,199,76,0.35)',
  psychic: 'rgba(249,85,135,0.35)',
  ghost: 'rgba(115,87,151,0.4)',
  dragon: 'rgba(111,53,252,0.35)',
  ice: 'rgba(150,217,214,0.35)',
  fighting: 'rgba(194,46,40,0.35)',
  poison: 'rgba(163,62,161,0.35)',
  normal: 'rgba(168,167,122,0.3)',
  rock: 'rgba(182,161,54,0.35)',
  default: 'rgba(79,195,247,0.3)',
}

function getTeamGradient(pokemons: Pokemon[]) {
  if (!pokemons.length) return TYPE_GRADIENT.normal
  return TYPE_GRADIENT[pokemons[0].type] || TYPE_GRADIENT.normal
}

function getTeamGlow(pokemons: Pokemon[]) {
  if (!pokemons.length) return TYPE_GLOW.default
  return TYPE_GLOW[pokemons[0].type] || TYPE_GLOW.default
}

function PokemonSlot({ pokemon, index }: { pokemon?: Pokemon; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-300"
      style={{
        aspectRatio: '1',
        background: pokemon
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        border: pokemon
          ? `1px solid rgba(79,195,247,0.2)`
          : '1px dashed rgba(79,195,247,0.08)',
        padding: '0.5rem',
        cursor: pokemon ? 'default' : 'default',
        transform: hovered && pokemon ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {pokemon ? (
        <>
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="w-full h-full object-contain"
            style={{
              imageRendering: 'pixelated',
              maxWidth: 56,
              maxHeight: 56,
              filter: hovered
                ? `drop-shadow(0 0 12px ${TYPE_GLOW[pokemon.types?.[0] || pokemon.type as string] || TYPE_GLOW.default})`
                : `drop-shadow(0 0 6px ${TYPE_GLOW[pokemon.types?.[0] || pokemon.type as string] || TYPE_GLOW.default})`,
              transform: hovered ? 'translateY(-3px) scale(1.1)' : 'none',
              transition: 'all 0.3s ease',
            }}
            crossOrigin="anonymous"
          />
          {hovered && (
            <div
              className="absolute bottom-0 left-0 right-0 text-center pb-1 rounded-b-xl"
              style={{
                fontSize: '0.55rem',
                fontWeight: 700,
                color: '#e8eaf6',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              {pokemon.name}
            </div>
          )}
        </>
      ) : (
        <span style={{ fontSize: '0.6rem', color: '#2d3748', textAlign: 'center' }}>Vacío</span>
      )}
    </div>
  )
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  const [visible, setVisible] = useState(false)
  const glow = getTeamGlow(team.pokemons)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      className="glass-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        background: 'rgba(13, 18, 32, 0.8)',
        borderColor: `rgba(79,195,247,0.1)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = `${glow.replace('0.35', '0.5').replace('0.4', '0.55')}`
        el.style.boxShadow = `0 0 40px ${glow}, 0 20px 60px rgba(0,0,0,0.4)`
        el.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(79,195,247,0.1)'
        el.style.boxShadow = ''
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Card header */}
      <div
        className="p-5 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs" style={{ color: '#475569' }}>
                {team.pokemons.length}/10 Pokémon
              </span>
            </div>
            <h3
              className="text-xl font-bold truncate"
              style={{ color: '#e8eaf6', letterSpacing: '0.02em' }}
            >
              {team.teamName}
            </h3>
            <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: '#64748b' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {team.trainerName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div
              className="px-3 py-1 rounded-lg text-center"
              style={{ background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.2)' }}
            >
              <p className="text-xs uppercase tracking-wider" style={{ color: '#475569' }}>Pts</p>
              <p className="text-xl font-bold leading-tight" style={{ color: '#4fc3f7', textShadow: '0 0 10px rgba(79,195,247,0.5)' }}>
                {team.points}
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-lg text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <p className="text-xs uppercase tracking-wider" style={{ color: '#475569' }}>Record</p>
              <p className="text-lg font-bold leading-tight" style={{ color: '#10b981' }}>
                {team.wins}-{(team.gamesPlayed || 0) - team.wins}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pokemon grid */}
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: '#475569' }}>
          Equipo Pokémon
        </p>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
          role="list"
          aria-label={`Pokémon de ${team.teamName}`}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} role="listitem">
              <PokemonSlot pokemon={team.pokemons[i]} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TeamsView({ teams, onEdit }: Props) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-fade-scale">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(79,195,247,0.08)', border: '2px solid rgba(79,195,247,0.15)' }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8eaf6' }}>Sin equipos registrados</h2>
          <p className="mb-6" style={{ color: '#64748b' }}>Los equipos aparecerán aquí cuando sean creados</p>
          {onEdit && (
            <button onClick={onEdit} className="btn-glow px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase">
              Crear equipo
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-widest uppercase mb-1 font-semibold" style={{ color: '#4fc3f7', letterSpacing: '0.2em' }}>
            {teams.length} equipo{teams.length !== 1 ? 's' : ''} registrado{teams.length !== 1 ? 's' : ''}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide" style={{ color: '#e8eaf6' }}>
            Equipos de{' '}
            <span className="glow-text" style={{ color: '#4fc3f7' }}>Liga</span>
          </h2>
        </div>
        <div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn-glow px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo equipo
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i} />
        ))}
      </div>

      {/* Hover hint */}
      <p className="text-center mt-6 text-xs" style={{ color: '#334155' }}>
        Pasa el cursor sobre un Pokémon para ver su nombre
      </p>
    </div>
  )
}
