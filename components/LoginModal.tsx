'use client'

import { useState } from 'react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'caterpie' && password === 'bidoof') {
      onLogin()
      setUsername('')
      setPassword('')
      setError('')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card p-8 w-full max-w-md mx-4 animate-fade-scale"
        style={{
          background: 'rgba(8, 11, 20, 0.95)',
          border: '1px solid rgba(79, 195, 247, 0.2)',
          boxShadow: '0 0 60px rgba(79, 195, 247, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
              boxShadow: '0 0 30px rgba(79, 195, 247, 0.5)',
            }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#e8eaf6' }}>
            Admin Login
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Ingresa tus credenciales de entrenador
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4fc3f7', letterSpacing: '0.15em' }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Tu usuario"
              className="dark-input w-full px-4 py-3 rounded-xl text-base font-medium"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4fc3f7', letterSpacing: '0.15em' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="dark-input w-full px-4 py-3 rounded-xl text-base font-medium"
            />
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-glow w-full px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase mt-2"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-sm font-semibold transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
