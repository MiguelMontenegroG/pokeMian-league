'use client'

import { useEffect, useState } from 'react'

export interface Badge {
  name: string
  image: string
  obtained: boolean
}

export interface Trainer {
  id: number
  name: string
  favoritePokemon: string
  favoritePokemonImage?: string
  description: string
  badges: Badge[]
  avatarSprite?: number | null
}

// Helper para obtener URL de avatar
function getAvatarUrl(spriteId: number | null | undefined): string | null {
  if (!spriteId) return null
  if (spriteId < 1 || spriteId > 93) return null
  return `/sprites_profile/${String(spriteId).padStart(3, '0')}.png`
}

interface Props {
  trainers: Trainer[]
  onTrainerClick?: (trainer: Trainer) => void
}

const JOHTO_BADGES_DATA = [
  { name: 'Kaswu',  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/9.png' },
  { name: 'Panrata',    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/10.png' },
  { name: 'Dashie',   image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/11.png' },
  { name: 'Skaiso',     image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/12.png' },
  { name: 'PokeMian',   image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/13.png' },
  { name: 'Wadekya', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/14.png' },
  { name: 'Oha', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/15.png' },
  { name: 'Corkky',  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/16.png' },
]

function BadgeDisplay({ badge }: { badge: Badge }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300"
      style={{
        background: badge.obtained
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))'
          : 'rgba(255,255,255,0.02)',
        border: 'none',
        transform: badge.obtained ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <img
  src={badge.image}
  alt={badge.name}
  className="w-4 h-4 object-contain"
  style={{
    filter: badge.obtained ? 'none' : 'grayscale(100%) opacity(0.3)',
  }}
/>
      <span
        className="text-xs font-bold uppercase tracking-wider text-center"
        style={{
          color: badge.obtained ? '#f59e0b' : '#475569',
          fontSize: '0.5rem',
        }}
      >
        {badge.name}
      </span>
    </div>
  )
}

function TrainerCard({ trainer, index, onClick }: { trainer: Trainer; index: number; onClick: () => void }) {
  const [visible, setVisible] = useState(false)
  const obtainedBadges = trainer.badges.filter(b => b.obtained).length
  const avatarUrl = getAvatarUrl(trainer.avatarSprite)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      className="glass-card cursor-pointer flex flex-col"
      onClick={onClick}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        background: 'rgba(13, 18, 32, 0.8)',
        borderColor: 'rgba(79,195,247,0.1)',
        minHeight: '250px',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(245, 158, 11, 0.4)'
        el.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.15), 0 20px 60px rgba(0,0,0,0.4)'
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
      <div className="p-5 pb-2 flex-1">
        <div className="flex items-start gap-4">
          {/* Avatar o Favorite Pokemon */}
          {avatarUrl ? (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.15), rgba(79, 195, 247, 0.05))',
                border: '2px solid rgba(79, 195, 247, 0.3)',
              }}
            >
              <img
                src={avatarUrl}
                alt={trainer.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : trainer.favoritePokemonImage && (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.15), rgba(79, 195, 247, 0.05))',
                border: '1px solid rgba(79, 195, 247, 0.3)',
              }}
            >
              <img
                src={trainer.favoritePokemonImage}
                alt={trainer.favoritePokemon}
                className="w-12 h-12 object-contain"
                style={{ imageRendering: 'pixelated' }}
                crossOrigin="anonymous"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3
              className="text-xl font-bold truncate"
              style={{ color: '#e8eaf6', letterSpacing: '0.02em' }}
            >
              {trainer.name}
            </h3>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Pokemon Favorito: <span style={{ color: '#4fc3f7', fontWeight: 600 }}>{trainer.favoritePokemon}</span>
            </p>
          </div>

          {/* Badge count */}
          <div
            className="px-3 py-1.5 rounded-lg text-center flex-shrink-0"
            style={{
              background: obtainedBadges === 8
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))'
                : 'rgba(79,195,247,0.1)',
              border: obtainedBadges === 8
                ? '1px solid rgba(245, 158, 11, 0.4)'
                : '1px solid rgba(79,195,247,0.2)',
            }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ color: '#475569' }}>Medallas</p>
            <p
              className="text-lg font-bold leading-tight"
              style={{
                color: obtainedBadges === 8 ? '#f59e0b' : '#4fc3f7',
                textShadow: obtainedBadges === 8 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none',
              }}
            >
              {obtainedBadges}/8
            </p>
          </div>
        </div>

        {/* Description - altura fija con o sin descripcion */}
        <div
          className="mt-4 rounded-lg flex items-center"
          style={{
            background: trainer.description ? 'rgba(79, 195, 247, 0.04)' : 'rgba(79, 195, 247, 0.02)',
            border: trainer.description
              ? '1px solid rgba(79, 195, 247, 0.08)'
              : '1px dashed rgba(79, 195, 247, 0.06)',
            minHeight: '72px',
            maxHeight: '72px',
          }}
        >
          {trainer.description ? (
            <div className="p-3 w-full">
              <p
                className="text-sm leading-relaxed line-clamp-3"
                style={{ color: '#94a3b8' }}
              >
                {trainer.description}
              </p>
            </div>
          ) : (
            <div className="w-full text-center">
              <span className="text-xs italic" style={{ color: '#475569' }}>
                Sin descripcion
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Badges preview - siempre al fondo */}
      <div
        className="px-5 py-3 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex gap-2 overflow-hidden justify-center">
          {trainer.badges.slice(0, 8).map((badge, idx) => (
            <div
              key={idx}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{
                background: badge.obtained
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(255,255,255,0.03)',
                border: 'none',
                transform: badge.obtained ? 'scale(1.05)' : 'scale(1)',
              }}
              title={badge.name}
            >
              <img
                src={badge.image}
                alt={badge.name}
                className="w-4 h-4 object-contain"
                style={{
                  filter: badge.obtained ? 'none' : 'grayscale(100%) opacity(0.3)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TrainersView({ trainers, onTrainerClick }: Props) {
  if (!trainers || trainers.length === 0) {
    return (
      <div
        className="text-center py-16"
        style={{ color: '#475569' }}
      >
        <svg
          className="w-16 h-16 mx-auto mb-4 opacity-50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <p className="text-lg font-semibold">No hay entrenadores registrados</p>
        <p className="text-sm mt-1">Los entrenadores aparecerán aquí cuando sean creados</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map((trainer, index) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            index={index}
            onClick={() => onTrainerClick?.(trainer)}
          />
        ))}
      </div>
    </div>
  )
}
