'use client'

import { useState } from 'react'
import type { Team } from '@/app/page'
import type { Trainer } from '@/components/TrainersView'
import StandingsTable from '@/components/StandingsTable'
import TeamsView from '@/components/TeamsView'
import TeamForm from '@/components/TeamForm'
import TrainersView from '@/components/TrainersView'
import TrainerForm from '@/components/TrainerForm'
import TrainerDetail from '@/components/TrainerDetail'

interface AdminPanelProps {
  teams: Team[]
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>
  addTeam?: (t: Omit<Team, 'id'>) => Promise<void | any>
  updateTeam?: (t: Team) => Promise<void>
  deleteTeam?: (id: number) => Promise<void>
  onLogout: () => void
  trainersData?: {
    trainers: Trainer[]
    addTrainer: (t: Omit<Trainer, 'id'>) => Promise<void | any>
    updateTrainer: (t: Trainer) => Promise<void>
    deleteTrainer: (id: number) => Promise<void>
  }
}

type AdminView = 'standings' | 'teams' | 'create' | 'trainers' | 'create-trainer' | 'trainer-detail'

const navItems = [
  { id: 'standings' as AdminView, label: 'Clasificación', icon: TrophyIcon },
  { id: 'teams' as AdminView, label: 'Equipos', icon: ShieldIcon },
  { id: 'create' as AdminView, label: 'Crear Equipo', icon: PlusIcon },
  { id: 'trainers' as AdminView, label: 'Entrenadores', icon: TrainerIcon },
]

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function TrainerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function AdminPanel({ teams, setTeams, addTeam: addTeamFromProps, updateTeam: updateTeamFromProps, deleteTeam: deleteTeamFromProps, onLogout, trainersData }: AdminPanelProps) {
  const [currentView, setCurrentView] = useState<AdminView>('standings')
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  
  // Use provided trainersData or fallback to hook (for backwards compatibility)
  const trainers = trainersData?.trainers || []
  const addTrainer = trainersData?.addTrainer || (async () => {})
  const updateTrainer = trainersData?.updateTrainer || (async () => {})
  const deleteTrainer = trainersData?.deleteTrainer || (async () => {})
  
  // Loading states - check if we have data from parent
  const teamsLoading = false // Data comes from parent, no local loading needed
  const trainersLoading = !trainersData // Only loading if trainersData not provided

  const addTeam = async (team: Omit<Team, 'id'>) => {
    console.log('🟠 ADMIN PANEL ADD TEAM:', team)
    try {
      const calculatedPoints = team.wins * 3
      const newTeamWithId = { ...team, points: calculatedPoints, id: Date.now() }
      
      // Actualizar estado local inmediatamente (optimistic update)
      setTeams(prev => [...prev, newTeamWithId])
      setCurrentView('teams')
      
      // Intentar guardar en Supabase si está disponible
      if (addTeamFromProps) {
        console.log('✅ Calling addTeam from props (Supabase)')
        await addTeamFromProps(team)
      } else {
        console.log('⚠️ No addTeam from props, using optimistic only')
      }
    } catch (error) {
      console.error('Error adding team:', error)
    }
  }

  const updateTeam = (updated: Team) => {
    const calculatedPoints = updated.wins * 3
    setTeams(prev => prev.map(t => (t.id === updated.id ? { ...updated, points: calculatedPoints } : t)))
    setCurrentView('teams')
  }

  const deleteTeam = (id: number) => {
    setTeams(prev => prev.filter(t => t.id !== id))
  }

  const handleTrainerClick = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setCurrentView('trainer-detail')
  }

  const handleEditTrainer = (trainer: Trainer) => {
    // Abrir formulario de edición con el entrenador seleccionado
    console.log('Editando entrenador:', trainer)
    setSelectedTrainer(trainer)
    setCurrentView('create-trainer') // Reutilizamos la vista de crear
  }

  if (teamsLoading || trainersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(8, 11, 20, 0.98)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ color: '#e8eaf6' }}>Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'rgba(8, 11, 20, 0.98)', fontFamily: 'var(--font-rajdhani), Inter, system-ui, sans-serif' }}>
      {/* Admin Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(8, 11, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold tracking-wide leading-none"
                  style={{ color: '#f59e0b', letterSpacing: '0.05em' }}
                >
                  Admin Panel
                </h1>
                <p className="text-xs tracking-widest uppercase" style={{ color: '#64748b', letterSpacing: '0.2em' }}>
                  Gestión de Liga
                </p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2" aria-label="Navegación de administración">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 border ${isActive ? 'nav-active' : ''}`}
                    style={{
                      color: isActive ? '#f59e0b' : '#64748b',
                      borderColor: isActive ? 'rgba(245,158,11,0.5)' : 'rgba(79,195,247,0.08)',
                      background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
              
              {/* Logout button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 border ml-2"
                style={{
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(239, 68, 68, 0.2)'
                  el.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.3)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(239, 68, 68, 0.1)'
                  el.style.boxShadow = 'none'
                }}
              >
                <LogoutIcon className="w-4 h-4" />
                Salir
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <select
                value={currentView}
                onChange={e => setCurrentView(e.target.value as AdminView)}
                className="px-3 py-2 rounded-xl text-sm font-semibold border bg-transparent"
                style={{
                  color: '#f59e0b',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  background: 'rgba(245, 158, 11, 0.05)',
                }}
              >
                {navItems.map(item => (
                  <option key={item.id} value={item.id} style={{ color: '#000' }}>
                    {item.label}
                  </option>
                ))}
                <option value="create-trainer" style={{ color: '#000' }}>Crear Entrenador</option>
              </select>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg"
                style={{ color: '#ef4444' }}
                aria-label="Cerrar sesión"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'standings' && (
          <StandingsTable teams={teams} onNavigate={(id) => setCurrentView(id as AdminView)} />
        )}
        {currentView === 'teams' && (
          <TeamsView teams={teams} onEdit={() => setCurrentView('create')} />
        )}
        {currentView === 'create' && (
          <TeamForm
            onSave={addTeam}
            onUpdate={updateTeam}
            onDelete={deleteTeam}
            existingTeams={teams}
            trainers={trainers}
          />
        )}
        {currentView === 'trainers' && !selectedTrainer && (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setCurrentView('create-trainer')}
                className="btn-glow flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase"
              >
                <PlusIcon className="w-4 h-4" />
                Nuevo Entrenador
              </button>
            </div>
            <TrainersView trainers={trainers} onTrainerClick={handleTrainerClick} />
          </>
        )}
        {currentView === 'trainer-detail' && selectedTrainer && (
          <TrainerDetail 
            trainer={selectedTrainer} 
            onBack={() => setCurrentView('trainers')}
            onEdit={handleEditTrainer}
          />
        )}
        {currentView === 'create-trainer' && (
          <TrainerForm
            onSave={addTrainer}
            onUpdate={updateTrainer}
            onDelete={deleteTrainer}
            existingTrainers={trainers}
          />
        )}
      </main>

      {/* Footer indicator */}
      <div
        className="fixed bottom-4 right-4 px-4 py-2 rounded-lg text-xs font-semibold"
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
        }}
      >
        Modo Administrador
      </div>
    </div>
  )
}
