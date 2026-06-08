'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Trainer } from './TrainersView'
import type { Team } from '@/app/page'
import AvatarSelector from './AvatarSelector'

interface TrainerProfileProps {
  trainer: Trainer
  onUpdateProfile: (data: {
    avatarSprite: number | null
    description: string
    favoritePokemon?: string
    favoritePokemonImage?: string
    badges?: Array<{ name: string; image: string; obtained: boolean }>
  }) => Promise<void>
  onBack: () => void
  isAdminMode?: boolean
  onToggleBadge?: (trainerId: number, badgeIndex: number) => Promise<void>
}

export default function TrainerProfile({ trainer, onUpdateProfile, onBack, isAdminMode, onToggleBadge }: TrainerProfileProps) {
  const { trainer: loggedTrainer, isAdminLoggedIn } = useAuth()
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(trainer.description || '')
  const [avatarSprite, setAvatarSprite] = useState<number | null>(trainer.avatarSprite ?? null)
  const [favoritePokemon, setFavoritePokemon] = useState(trainer.favoritePokemon || '')
  const [favoritePokemonImage, setFavoritePokemonImage] = useState(trainer.favoritePokemonImage || '')
  const [localBadges, setLocalBadges] = useState(trainer.badges)
  const [togglingBadge, setTogglingBadge] = useState<number | null>(null)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [saving, setSaving] = useState(false)

  // Determinar si el usuario actual puede editar este perfil
  const canEdit = isAdminLoggedIn || isAdminMode || (loggedTrainer !== null && loggedTrainer.id === trainer.id)

  // Cargar datos desde trainer prop
  useEffect(() => {
    setAvatarSprite(trainer.avatarSprite ?? null)
    setDescription(trainer.description || '')
    setFavoritePokemon(trainer.favoritePokemon || '')
    setFavoritePokemonImage(trainer.favoritePokemonImage || '')
    setLocalBadges(trainer.badges)
  }, [trainer.id, trainer.avatarSprite, trainer.description, trainer.favoritePokemon, trainer.favoritePokemonImage, trainer.badges])

  const handleBadgeToggle = async (index: number) => {
    if (!isAdminLoggedIn || !onToggleBadge) return
    setTogglingBadge(index)
    try {
      await onToggleBadge(trainer.id, index)
      setLocalBadges(prev => prev.map((b, i) =>
        i === index ? { ...b, obtained: !b.obtained } : b
      ))
    } catch (err) {
      console.error('Error toggling badge:', err)
    } finally {
      setTogglingBadge(null)
    }
  }

  const handleSave = async () => {
    // Validar rango de avatarSprite
    if (avatarSprite !== null && (avatarSprite < 1 || avatarSprite > 93)) {
      console.error('Avatar sprite fuera de rango (1-93)')
      return
    }

    setSaving(true)
    try {
      const updateData: any = { avatarSprite, description }

      // Si es admin, tambien actualizar pokemon favorito y medallas
      if (isAdminLoggedIn || isAdminMode) {
        updateData.favoritePokemon = favoritePokemon
        updateData.favoritePokemonImage = favoritePokemonImage
        updateData.badges = localBadges
      }

      await onUpdateProfile(updateData)
      setEditing(false)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const obtainedBadges = localBadges.filter(b => b.obtained).length

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
          Volver
        </button>

        {!editing && canEdit && (
          <button
            onClick={() => {
              setEditing(true)
              setDescription(trainer.description || '')
              setAvatarSprite(trainer.avatarSprite ?? null)
              setFavoritePokemon(trainer.favoritePokemon || '')
              setFavoritePokemonImage(trainer.favoritePokemonImage || '')
              setLocalBadges(trainer.badges)
            }}
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
            {isAdminLoggedIn ? 'Editar Perfil (Admin)' : 'Editar Perfil'}
          </button>
        )}
        {!editing && !canEdit && (
          <div className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ color: '#475569', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(79,195,247,0.1)' }}>
            Inicia sesion como {trainer.name} para editar
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="glass-card p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div
              className="relative group"
              style={{ cursor: editing ? 'pointer' : 'default' }}
              onClick={() => editing && setShowAvatarSelector(true)}
            >
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background: avatarSprite
                    ? 'linear-gradient(135deg, rgba(79, 195, 247, 0.15), rgba(79, 195, 247, 0.05))'
                    : 'linear-gradient(135deg, rgba(79, 195, 247, 0.2), rgba(79, 195, 247, 0.1))',
                  border: avatarSprite
                    ? '2px solid rgba(79, 195, 247, 0.4)'
                    : '2px dashed rgba(79, 195, 247, 0.3)',
                  boxShadow: avatarSprite
                    ? '0 0 30px rgba(79, 195, 247, 0.2)'
                    : '0 0 20px rgba(79, 195, 247, 0.1)',
                }}
              >
                {avatarSprite ? (
                  <img
                    src={`/sprites_profile/${String(avatarSprite).padStart(3, '0')}.png`}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              {editing && (
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4fc3f7' }}>
                    Cambiar
                  </span>
                </div>
              )}
            </div>
            
            {editing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: 'rgba(79,195,247,0.1)',
                    border: '1px solid rgba(79,195,247,0.3)',
                    color: '#4fc3f7',
                  }}
                >
                  {avatarSprite ? 'Cambiar Avatar' : 'Seleccionar Avatar'}
                </button>
                {avatarSprite && (
                  <button
                    onClick={() => setAvatarSprite(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.2)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)' }}
                  >
                    Quitar Avatar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{
                color: '#e8eaf6',
                textShadow: '0 0 20px rgba(79, 195, 247, 0.4)',
              }}
            >
              {trainer.name}
            </h1>
            
            <p className="text-sm mb-4" style={{ color: '#64748b' }}>
              Pokemon Favorito:{' '}
              {editing && (isAdminLoggedIn || isAdminMode) ? (
                <span className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={favoritePokemon}
                    onChange={e => setFavoritePokemon(e.target.value)}
                    placeholder="Nombre del Pokemon"
                    className="dark-input px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{ width: '200px' }}
                  />
                  {favoritePokemonImage && (
                    <img
                      src={favoritePokemonImage}
                      alt={favoritePokemon}
                      className="w-8 h-8 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      crossOrigin="anonymous"
                    />
                  )}
                </span>
              ) : (
                <span style={{ color: '#4fc3f7', fontWeight: 700 }}>{trainer.favoritePokemon}</span>
              )}
            </p>

            {/* Description */}
            {editing ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4fc3f7' }}>
                  Biografía
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Escribe algo sobre ti..."
                  rows={4}
                  className="dark-input w-full px-4 py-3 rounded-xl text-sm font-medium resize-none"
                  style={{ minHeight: '100px' }}
                />
              </div>
            ) : description ? (
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(79,195,247,0.1)',
                }}
              >
                <p className="text-base leading-relaxed" style={{ color: '#94a3b8' }}>
                  {description}
                </p>
              </div>
            ) : (
              <div
                className="p-4 rounded-xl text-center"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(79,195,247,0.15)',
                }}
              >
                <p className="text-sm" style={{ color: '#475569' }}>
                  Sin biografía aún
                </p>
              </div>
            )}

            {/* Save/Cancel buttons */}
            {editing && (
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all btn-glow"
                  disabled={saving}
                  style={{ opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setDescription(trainer.description || '')
                    setAvatarSprite(trainer.avatarSprite ?? null)
                    setFavoritePokemon(trainer.favoritePokemon || '')
                    setFavoritePokemonImage(trainer.favoritePokemonImage || '')
                    setLocalBadges(trainer.badges)
                  }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)' }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Badge counter */}
          <div
            className="px-6 py-4 rounded-2xl text-center flex-shrink-0"
            style={{
              background: obtainedBadges === 8
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.15))'
                : 'rgba(79,195,247,0.1)',
              border: obtainedBadges === 8
                ? '2px solid rgba(245, 158, 11, 0.5)'
                : '2px solid rgba(79,195,247,0.2)',
              boxShadow: obtainedBadges === 8 ? '0 0 30px rgba(245, 158, 11, 0.2)' : 'none',
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#475569' }}>
              Medallas
            </p>
            <p
              className="text-4xl font-bold leading-none mb-1"
              style={{
                color: obtainedBadges === 8 ? '#f59e0b' : '#4fc3f7',
                textShadow: obtainedBadges === 8 ? '0 0 20px rgba(245, 158, 11, 0.6)' : 'none',
              }}
            >
              {obtainedBadges}/8
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#e8eaf6' }}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Medallas de Johto
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {localBadges.map((badge, index) => (
            <div
              key={index}
              className="relative group"
              onClick={() => editing && handleBadgeToggle(index)}
              style={{ cursor: (editing && isAdminLoggedIn) ? 'pointer' : 'default' }}
            >
              <div
                className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300"
                style={{
                  background: badge.obtained
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08))'
                    : 'rgba(255,255,255,0.02)',
                  border: badge.obtained
                    ? '2px solid rgba(245, 158, 11, 0.5)'
                    : '2px dashed rgba(79, 195, 247, 0.15)',
                  boxShadow: badge.obtained
                    ? '0 0 20px rgba(245, 158, 11, 0.2)'
                    : 'none',
                  transform: badge.obtained ? 'scale(1.02)' : 'scale(1)',
                  opacity: togglingBadge === index ? 0.5 : 1,
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
                  {badge.name}
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
                {editing && isAdminLoggedIn && (
                  <div
                    className="absolute bottom-1 right-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: badge.obtained ? '#ef4444' : '#10b981' }}
                  >
                    {badge.obtained ? 'Quitar' : 'Dar'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={avatarSprite}
          onSelect={(id) => {
            setAvatarSprite(id)
            setShowAvatarSelector(false)
          }}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  )
}
