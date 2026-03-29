'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
  isTrainerMode?: boolean // Nuevo prop para modo entrenador
}

export default function LoginModal({ isOpen, onClose, onLogin, isTrainerMode = false }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { loginAsTrainer, loginAsAdmin } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isTrainerMode) {
        // Login de entrenador
        if (!username || !password) {
          setError('Por favor ingresa usuario y contraseña')
          setIsLoading(false)
          return
        }

        const success = await loginAsTrainer(username, password)
        if (success) {
          onLogin()
          setUsername('')
          setPassword('')
          setError('')
        } else {
          setError('Credenciales incorrectas. Verifica tu nombre y contraseña.')
        }
      } else {
        // Login de admin (hardcoded por ahora)
        if (username === 'caterpie' && password === 'bidoof') {
          loginAsAdmin()
          onLogin()
          setUsername('')
          setPassword('')
          setError('')
        } else {
          setError('Credenciales incorrectas')
        }
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error al iniciar sesión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
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
            {isTrainerMode ? 'Login Entrenador' : 'Admin Login'}
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {isTrainerMode 
              ? 'Ingresa tus credenciales de entrenador' 
              : 'Ingresa tus credenciales de administrador'}
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
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
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
