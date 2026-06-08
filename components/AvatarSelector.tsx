'use client'

import { useState, useEffect } from 'react'

const TOTAL_SPRITES = 93

interface AvatarSelectorProps {
  currentAvatar: number | null
  onSelect: (spriteId: number) => void
  onClose: () => void
}

export default function AvatarSelector({ currentAvatar, onSelect, onClose }: AvatarSelectorProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl animate-fade-scale"
        style={{
          background: 'rgba(8, 11, 20, 0.98)',
          border: '1px solid rgba(79, 195, 247, 0.2)',
          boxShadow: '0 0 60px rgba(79, 195, 247, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6 pb-4"
          style={{
            background: 'rgba(8, 11, 20, 0.98)',
            borderBottom: '1px solid rgba(79, 195, 247, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold" style={{ color: '#e8eaf6' }}>
              Elegir Avatar
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748b' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Selecciona un avatar para tu perfil de entrenador
          </p>
        </div>

        {/* Grid */}
        <div className="p-6">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {Array.from({ length: TOTAL_SPRITES }, (_, i) => i + 1).map(id => {
              const isSelected = currentAvatar === id
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(79, 195, 247, 0.2), rgba(79, 195, 247, 0.1))'
                      : 'rgba(255,255,255,0.03)',
                    border: isSelected
                      ? '2px solid #4fc3f7'
                      : '1px solid rgba(79, 195, 247, 0.1)',
                    borderRadius: '10px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    boxShadow: isSelected ? '0 0 20px rgba(79, 195, 247, 0.3)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(79, 195, 247, 0.4)'
                      el.style.background = 'rgba(79, 195, 247, 0.08)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(79, 195, 247, 0.1)'
                      el.style.background = 'rgba(255,255,255,0.03)'
                    }
                  }}
                >
                  <img
                    src={`/sprites_profile/${String(id).padStart(3, '0')}.png`}
                    alt={`Avatar ${id}`}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'contain',
                      borderRadius: '6px',
                    }}
                  />
                  {isSelected && (
                    <div
                      className="absolute top-1 right-1 w-3 h-3 rounded-full"
                      style={{
                        background: '#4fc3f7',
                        boxShadow: '0 0 10px rgba(79, 195, 247, 0.8)',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
