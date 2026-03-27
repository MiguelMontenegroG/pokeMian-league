'use client'

import { useState } from 'react'
import type { Trainer } from './TrainersView'

interface Props {
  trainer: Trainer
  onBack: () => void
  onEdit?: (trainer: Trainer) => void
}

export default function TrainerDetail({ trainer, onBack, onEdit }: Props) {
  const obtainedBadges = trainer.badges.filter(b => b.obtained).length
  const allBadgesObtained = obtainedBadges === 8
  const [isEditing, setIsEditing] = useState(false)

  const handleEditClick = () => {
    console.log('✏️ Editando entrenador:', trainer.name)
    if (onEdit) {
      onEdit(trainer)
    }
  }

  return (
    <div className="animate-fade-up">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'rgba(79,195,247,0.1)',
            border: '1px solid rgba(79,195,247,0.2)',
            color: '#4fc3f7',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(79,195,247,0.15)'
            el.style.borderColor = 'rgba(79,195,247,0.4)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(79,195,247,0.1)'
            el.style.borderColor = 'rgba(79,195,247,0.2)'
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a entrenadores
        </button>
        
        {onEdit && (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(245, 158, 11, 0.2)'
              el.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.3)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(245, 158, 11, 0.1)'
              el.style.boxShadow = 'none'
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="glass-card p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Favorite Pokemon */}
          {trainer.favoritePokemonImage && (
            <div
              className="w-32 h-32 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: allBadgesObtained
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.1))'
                  : 'linear-gradient(135deg, rgba(79, 195, 247, 0.2), rgba(79, 195, 247, 0.05))',
                border: allBadgesObtained
                  ? '2px solid rgba(245, 158, 11, 0.5)'
                  : '2px solid rgba(79, 195, 247, 0.3)',
                boxShadow: allBadgesObtained
                  ? '0 0 40px rgba(245, 158, 11, 0.3)'
                  : '0 0 30px rgba(79, 195, 247, 0.2)',
              }}
            >
              <img
                src={trainer.favoritePokemonImage}
                alt={trainer.favoritePokemon}
                className="w-24 h-24 object-contain"
                style={{
                  imageRendering: 'pixelated',
                  filter: allBadgesObtained
                    ? 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.5))'
                    : 'drop-shadow(0 0 15px rgba(79, 195, 247, 0.4))',
                }}
                crossOrigin="anonymous"
              />
            </div>
          )}

          <div className="flex-1">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{
                color: '#e8eaf6',
                textShadow: allBadgesObtained
                  ? '0 0 20px rgba(245, 158, 11, 0.5)'
                  : '0 0 20px rgba(79, 195, 247, 0.4)',
              }}
            >
              {trainer.name}
            </h1>
            <p className="text-lg mb-3" style={{ color: '#64748b' }}>
              Pokémon Favorito:{' '}
              <span style={{ color: '#4fc3f7', fontWeight: 700 }}>{trainer.favoritePokemon}</span>
            </p>
            
            {trainer.description && (
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(79,195,247,0.1)',
                }}
              >
                <p className="text-base leading-relaxed" style={{ color: '#94a3b8' }}>
                  {trainer.description}
                </p>
              </div>
            )}
          </div>

          {/* Badge Counter */}
          <div
            className="px-6 py-4 rounded-2xl text-center flex-shrink-0"
            style={{
              background: allBadgesObtained
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.15))'
                : 'rgba(79,195,247,0.1)',
              border: allBadgesObtained
                ? '2px solid rgba(245, 158, 11, 0.5)'
                : '2px solid rgba(79,195,247,0.2)',
              boxShadow: allBadgesObtained
                ? '0 0 30px rgba(245, 158, 11, 0.2)'
                : 'none',
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#475569' }}>
              Medallas Johto
            </p>
            <p
              className="text-4xl font-bold leading-none mb-1"
              style={{
                color: allBadgesObtained ? '#f59e0b' : '#4fc3f7',
                textShadow: allBadgesObtained ? '0 0 20px rgba(245, 158, 11, 0.6)' : 'none',
              }}
            >
              {obtainedBadges}/8
            </p>
            {allBadgesObtained && (
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#f59e0b' }}>
                ¡Leyenda!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e8eaf6' }}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Medallas de Johto
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trainer.badges.map((badge, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div
                className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300"
                style={{
                  background: badge.obtained
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08))'
                    : 'rgba(255,255,255,0.02)',
                  border: badge.obtained
                    ? '2px solid rgba(245, 158, 11, 0.4)'
                    : '2px dashed rgba(79, 195, 247, 0.15)',
                  transform: badge.obtained ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <img
  src={badge.image}
  alt={badge.name}
  className="w-14 h-14 object-contain mb-3 transition-all duration-300 group-hover:scale-110"
  style={{
    imageRendering: 'pixelated',
    filter: badge.obtained
      ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.7))'
      : 'grayscale(100%) opacity(0.25)',
  }}
/>
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{
                    color: badge.obtained ? '#f59e0b' : '#475569',
                    fontSize: '0.6rem',
                  }}
                >
                  {badge.name} Badge
                </span>
                
                {badge.obtained && (
                  <div
                    className="absolute top-2 right-2 w-3 h-3 rounded-full"
                    style={{
                      background: '#f59e0b',
                      boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>Progreso</span>
            <span className="text-sm font-bold" style={{ color: obtainedBadges === 8 ? '#f59e0b' : '#4fc3f7' }}>
              {Math.round((obtainedBadges / 8) * 100)}%
            </span>
          </div>
          <div
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(obtainedBadges / 8) * 100}%`,
                background: obtainedBadges === 8
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #4fc3f7, #0288d1)',
                boxShadow: obtainedBadges === 8
                  ? '0 0 20px rgba(245, 158, 11, 0.5)'
                  : '0 0 15px rgba(79, 195, 247, 0.4)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Completion message */}
      {allBadgesObtained && (
        <div
          className="mt-6 p-6 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">🏆</span>
            <h3 className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
              ¡Entrenador de Leyenda!
            </h3>
            <span className="text-4xl">🏆</span>
          </div>
          <p className="text-base" style={{ color: '#e8eaf6' }}>
            {trainer.name} ha conseguido las 8 medallas de Johto y puede competir en la Liga Pokémon
          </p>
          <p className="text-lg font-bold mt-3" style={{ color: '#f59e0b', textShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}>
            ✨ ¡Clasifica a la PokeMian League! ✨
          </p>
        </div>
      )}
    </div>
  )
}
