'use client'

import { useState, useEffect } from 'react'
import type { Team } from '@/app/page'
import type { Trainer } from '@/components/TrainersView'
import type { TrainerTeam } from '@/hooks/useTrainerTeams'
import StandingsTable from '@/components/StandingsTable'
import TeamsView from '@/components/TeamsView'
import TeamForm from '@/components/TeamForm'
import TrainersView from '@/components/TrainersView'
import TrainerForm from '@/components/TrainerForm'
import TrainerProfile from '@/components/TrainerProfile'
import TrainerDetail from '@/components/TrainerDetail'
import BracketView from '@/components/BracketView'
import BracketManagement from '@/components/BracketManagement'
import MatchupsView from '@/components/MatchupsView'
import MatchupEditor from '@/components/MatchupEditor'
import GenerateMatchupsButton from '@/components/GenerateMatchupsButton'
import type { Matchup } from '@/hooks/useMatchups'
import AdminItemManager from '@/components/AdminItemManager'
import AdminItemNotifications from '@/components/AdminItemNotifications'
import AdminSpinBoost from '@/components/AdminSpinBoost'
import AdminSpinItemsCustom from '@/components/AdminSpinItemsCustom'
import { useItemCatalog } from '@/hooks/useItemCatalog'
import { useItemSpins } from '@/hooks/useItemSpins'
import { useWheelConfig } from '@/hooks/useWheelConfig'

interface AdminPanelProps {
  teams: Team[]
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>
  addTeam?: (t: Omit<Team, 'id'>) => Promise<void | any>
  updateTeam?: (t: Team) => Promise<void>
  deleteTeam?: (id: number) => Promise<void>
  trainerTeams?: TrainerTeam[]
  updateTrainerTeam?: (t: TrainerTeam) => Promise<void>
  onLogout: () => void
  trainersData?: {
    trainers: Trainer[]
    addTrainer: (t: Omit<Trainer, 'id'>) => Promise<void | any>
    updateTrainer: (t: Trainer) => Promise<void>
    deleteTrainer: (id: number) => Promise<void>
  }
  matchups?: Matchup[]
  bulkCreateMatchups?: (matchups: Array<Omit<Matchup, 'id' | 'createdAt'>>) => Promise<void>
  deleteAllMatchups?: () => Promise<void>
  onUpdateMatchupResult?: (matchup: Matchup) => Promise<void>
}

type AdminView = 'standings' | 'teams' | 'create' | 'matchups' | 'bracket' | 'trainers' | 'create-trainer' | 'trainer-detail' | 'trainer-edit-profile' | 'items' | 'pending-items' | 'spin-boost' | 'spin-items'

const navItems = [
  { id: 'standings' as AdminView, label: 'Clasificacion', icon: TrophyIcon },
  { id: 'teams' as AdminView, label: 'Equipos', icon: ShieldIcon },
  { id: 'create' as AdminView, label: 'Crear Equipo', icon: PlusIcon },
  { id: 'matchups' as AdminView, label: 'Enfrentamientos', icon: MatchupsIcon },
  { id: 'bracket' as AdminView, label: 'Bracket', icon: BracketIcon },
  { id: 'trainers' as AdminView, label: 'Entrenadores', icon: TrainerIcon },
  { id: 'items' as AdminView, label: 'Items Ruleta', icon: ItemsIcon },
  { id: 'pending-items' as AdminView, label: 'Items Pendientes', icon: BellIcon },
  { id: 'spin-boost' as AdminView, label: 'Giros Extra', icon: SpinBoostIcon },
  { id: 'spin-items' as AdminView, label: 'Personalizar Ruleta', icon: SpinWheelIcon },
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

function BracketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  )
}

function MatchupsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
}

function ItemsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function SpinBoostIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M8 12h8" />
    </svg>
  )
}

function SpinWheelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

export default function AdminPanel({ teams, setTeams, addTeam: addTeamFromProps, updateTeam: updateTeamFromProps, deleteTeam: deleteTeamFromProps, trainerTeams, updateTrainerTeam, onLogout, trainersData, matchups: matchupsFromProps, bulkCreateMatchups, deleteAllMatchups, onUpdateMatchupResult }: AdminPanelProps) {
  const [currentView, setCurrentView] = useState<AdminView>('standings')
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [editingMatchup, setEditingMatchup] = useState<Matchup | null>(null)

  // Estado para configuracion personalizada de la ruleta (persistida en Supabase + localStorage)
  const {
    saveConfig: saveWheelConfig,
    clearConfig: clearWheelConfig,
    loadConfig: loadWheelConfig,
  } = useWheelConfig()
  const [customSpinItems, setCustomSpinItems] = useState<number[]>([])

  // Cargar configuracion personalizada de la ruleta desde Supabase/localStorage
  useEffect(() => {
    loadWheelConfig().then(ids => {
      if (ids && ids.length > 0) setCustomSpinItems(ids)
    })
  }, [loadWheelConfig])

  // Resetear selectedTrainer al cambiar de vista
  const changeView = (view: AdminView) => {
    setSelectedTrainer(null)
    setCurrentView(view)
  }

  // Items de la ruleta
  const {
    items: catalogItems,
    loading: itemsLoading,
    addItem,
    updateItem,
    deleteItem,
    importFromCSV,
  } = useItemCatalog()

  const {
    spins,
    loading: spinsLoading,
    markAsDelivered,
    markAsUndelivered,
    resetTodaySpin,
    resetAllTodaySpins,
    refreshSpins,
  } = useItemSpins()

  // Use provided trainersData or fallback to hook (for backwards compatibility)
  const trainers = trainersData?.trainers || []
  const addTrainerFromProps = trainersData?.addTrainer || (async () => {})
  const updateTrainerFromProps = trainersData?.updateTrainer || (async () => {})
  const deleteTrainerFromProps = trainersData?.deleteTrainer || (async () => {})
  
  // Loading states - check if we have data from parent
  const teamsLoading = false // Data comes from parent, no local loading needed
  const trainersLoading = !trainersData // Only loading if trainersData not provided
  const matchups = matchupsFromProps || []

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

  const updateTeam = async (updated: Team) => {
    console.log('🟡 ADMIN PANEL UPDATE TEAM:', updated)
    try {
      const calculatedPoints = updated.wins * 3
      
      // Actualizar estado local inmediatamente (optimistic update)
      setTeams(prev => prev.map(t => (t.id === updated.id ? { ...updated, points: calculatedPoints } : t)))
      setCurrentView('teams')
      
      // Intentar guardar en Supabase si está disponible
      if (updateTeamFromProps) {
        console.log('✅ Calling updateTeam from props (Supabase)')
        await updateTeamFromProps(updated)
      } else {
        console.log('⚠️ No updateTeam from props, using optimistic only')
      }
    } catch (error) {
      console.error('Error updating team:', error)
      // Revertir el cambio en caso de error
      console.error('Reverting local change due to error')
    }
  }

  const deleteTeam = async (id: number) => {
    console.log('🔴 ADMIN PANEL DELETE TEAM - ID:', id)
    try {
      // Guardar una copia para revertir en caso de error
      const previousTeams = [...teams]
      
      // Actualizar estado local inmediatamente (optimistic update)
      setTeams(prev => prev.filter(t => t.id !== id))
      
      // Intentar eliminar de Supabase si está disponible
      if (deleteTeamFromProps) {
        console.log('✅ Calling deleteTeam from props (Supabase)')
        await deleteTeamFromProps(id)
      } else {
        console.log('⚠️ No deleteTeam from props, using optimistic only')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      // Revertir el cambio en caso de error
      console.error('Reverting local change due to error')
    }
  }

  const addTrainer = async (trainer: Omit<Trainer, 'id'>) => {
    console.log('🟠 ADMIN PANEL ADD TRAINER:', trainer)
    try {
      const newTrainerWithId = { ...trainer, id: Date.now() }
      
      // Intentar guardar en Supabase si está disponible
      if (addTrainerFromProps) {
        console.log('✅ Calling addTrainer from props (Supabase)')
        const result = await addTrainerFromProps(trainer)
        return result
      } else {
        console.log('⚠️ No addTrainer from props')
      }
    } catch (error) {
      console.error('Error adding trainer:', error)
    }
  }

  const updateTrainer = async (updated: Trainer) => {
    console.log('🟡 ADMIN PANEL UPDATE TRAINER:', updated)
    try {
      // Actualizar estado local inmediatamente (optimistic update)
      // Note: trainers come from parent state via props, so we can't directly modify
      // The parent component handles state updates via useTrainers hook
      
      // Intentar guardar en Supabase si está disponible
      if (updateTrainerFromProps) {
        console.log('✅ Calling updateTrainer from props (Supabase)')
        await updateTrainerFromProps(updated)
      } else {
        console.log('⚠️ No updateTrainer from props, using optimistic only')
      }
    } catch (error) {
      console.error('Error updating trainer:', error)
    }
  }

  const deleteTrainer = async (id: number) => {
    console.log('🔴 ADMIN PANEL DELETE TRAINER - ID:', id)
    try {
      // Intentar eliminar de Supabase si está disponible
      if (deleteTrainerFromProps) {
        console.log('✅ Calling deleteTrainer from props (Supabase)')
        await deleteTrainerFromProps(id)
      } else {
        console.log('⚠️ No deleteTrainer from props, using optimistic only')
      }
    } catch (error) {
      console.error('Error deleting trainer:', error)
    }
  }

  const handleTrainerClick = (trainer: Trainer) => {
    console.log('🔵 TRAINER CLICKED:', trainer)
    setSelectedTrainer(trainer)
    setCurrentView('trainer-detail')
  }

  const handleBackFromDetail = () => {
    console.log('🔴 BACK FROM DETAIL - Clearing selectedTrainer')
    setSelectedTrainer(null)
    setCurrentView('trainers')
  }

  const handleEditTrainer = (trainer: Trainer) => {
    // Abrir el perfil completo con editor (TrainerProfile) para editar avatar, descripcion, pokemon favorito y medallas
    console.log('✏️ Editando entrenador (perfil completo):', trainer)
    setSelectedTrainer(trainer)
    setCurrentView('trainer-edit-profile')
  }

  const handleToggleBadge = async (trainerId: number, badgeIndex: number) => {
    console.log('🟡 Toggle badge - Trainer ID:', trainerId, 'Badge Index:', badgeIndex)
    const trainer = trainers.find(t => t.id === trainerId)
    if (!trainer) return

    try {
      const updatedBadges = trainer.badges.map((b, i) =>
        i === badgeIndex ? { ...b, obtained: !b.obtained } : b
      )
      await updateTrainer({ ...trainer, badges: updatedBadges })
    } catch (err) {
      console.error('Error toggling badge:', err)
    }
  }

  const handleBackFromEditProfile = () => {
    setSelectedTrainer(null)
    setCurrentView('trainers')
  }

  const updateBracketPosition = async (teamId: number, position: number | null) => {
    console.log('🔵 UPDATE BRACKET POSITION - Team ID:', teamId, 'Position:', position)
    try {
      // Actualizar estado local inmediatamente
      setTeams(prev => prev.map(t => 
        t.id === teamId ? { ...t, bracketPosition: position } : t
      ))
      
      // Intentar guardar en Supabase si está disponible
      if (updateTeamFromProps) {
        // Buscar el equipo actualizado
        const team = teams.find(t => t.id === teamId)
        if (team) {
          const updatedTeam = { ...team, bracketPosition: position }
          console.log('✅ Calling updateTeam from props with bracket position')
          await updateTeamFromProps(updatedTeam)
        }
      }
    } catch (error) {
      console.error('Error updating bracket position:', error)
    }
  }

  const handleUpdateMatchupResult = async (updatedMatchup: Matchup) => {
    console.log('🟡 ADMIN PANEL Updating matchup result:', updatedMatchup)
    console.log('🔍 onUpdateMatchupResult exists?', !!onUpdateMatchupResult)
    try {
      // Delegar la lógica de actualización a page.tsx si está disponible
      if (onUpdateMatchupResult) {
        console.log('✅ Calling onUpdateMatchupResult...')
        await onUpdateMatchupResult(updatedMatchup)
        console.log('✅ onUpdateMatchupResult completed')
      } else {
        // Fallback: solo actualizar el enfrentamiento sin puntos
        console.warn('⚠️ No onUpdateMatchupResult provided, updating matchup only')
      }
      setEditingMatchup(null)
    } catch (err: any) {
      console.error('Error updating matchup:', err)
      throw err
    }
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
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Navegación de administración">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => changeView(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border ${isActive ? 'nav-active' : ''}`}
                    style={{
                      color: isActive ? '#f59e0b' : '#64748b',
                      borderColor: isActive ? 'rgba(245,158,11,0.5)' : 'rgba(79,195,247,0.08)',
                      background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                )
              })}
              
              {/* Logout button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border ml-2"
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
                <LogoutIcon className="w-3.5 h-3.5" />
                Salir
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <select
                value={currentView}
                onChange={e => changeView(e.target.value as AdminView)}
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
          <StandingsTable teams={teams} matchups={matchups} onNavigate={(id) => changeView(id as AdminView)} trainers={trainers} />
        )}
        {currentView === 'teams' && (
          <div className="space-y-6">
            <TeamsView teams={teams} onEdit={() => changeView('create')} />

            {/* Gestion de equipos oficiales de entrenadores */}
            {trainerTeams && trainerTeams.some(t => t.isOfficial) && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Equipos Oficiales de Entrenadores
                </h3>
                <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                  Aqui puedes desoficializar equipos que los entrenadores hayan marcado como oficiales.
                </p>
                <div className="space-y-3">
                  {trainerTeams.filter(t => t.isOfficial).map(officialTeam => {
                    const trainerName = trainers.find(t => t.id === officialTeam.trainerId)?.name || 'Desconocido'
                    return (
                      <div
                        key={officialTeam.id}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                      >
                        <div className="flex items-center gap-3">
                          {officialTeam.pokemons[0] && (
                            <img
                              src={officialTeam.pokemons[0].image}
                              alt={officialTeam.pokemons[0].name}
                              className="w-10 h-10"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          )}
                          <div>
                            <p className="font-bold text-sm" style={{ color: '#e8eaf6' }}>{officialTeam.teamName}</p>
                            <p className="text-xs" style={{ color: '#64748b' }}>Entrenador: {trainerName}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm(`Desoficializar "${officialTeam.teamName}" de ${trainerName}?`)) {
                              await updateTrainerTeam?.({ ...officialTeam, isOfficial: false })
                              // Tambien eliminar de la tabla teams si existe
                              const teamInTable = teams.find(t => t.trainerName === trainerName && t.teamName === officialTeam.teamName)
                              if (teamInTable && deleteTeamFromProps) {
                                await deleteTeamFromProps(teamInTable.id)
                              }
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                          }}
                        >
                          Desoficializar
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
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
        {currentView === 'matchups' && (
          <div className="space-y-6">
            <GenerateMatchupsButton
              teams={teams}
              existingMatchups={matchups}
              onGenerate={async (newMatchups) => {
                if (bulkCreateMatchups) {
                  await bulkCreateMatchups(newMatchups)
                }
              }}
              onDelete={async () => {
                if (deleteAllMatchups) {
                  await deleteAllMatchups()
                }
                // Resetear estadisticas de todos los equipos al borrar enfrentamientos
                for (const team of teams) {
                  await updateTeam({
                    ...team,
                    wins: 0,
                    gamesPlayed: 0,
                    points: 0,
                  })
                }
              }}
            />
            
            {matchups.length > 0 && (
              <MatchupsView
                matchups={matchups}
                teams={teams}
                isAdmin={true}
                onEditMatchup={setEditingMatchup}
              />
            )}
          </div>
        )}
        {currentView === 'bracket' && (
          <BracketManagement 
            teams={teams} 
            onUpdatePosition={updateBracketPosition}
          />
        )}
        {currentView === 'trainers' && !selectedTrainer && (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => changeView('create-trainer')}
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
          <div className="space-y-6">
            {/* Seccion de equipo oficial del entrenador */}
            {trainerTeams && trainerTeams.some(t => t.trainerId === selectedTrainer.id && t.isOfficial) && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Equipo Oficial
                </h3>
                {trainerTeams.filter(t => t.trainerId === selectedTrainer.id && t.isOfficial).map(officialTeam => (
                  <div
                    key={officialTeam.id}
                    className="p-5 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {officialTeam.pokemons.slice(0, 6).map((p, i) => (
                          <img
                            key={i}
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10"
                            style={{ imageRendering: 'pixelated' }}
                            title={p.name}
                          />
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: '#e8eaf6' }}>{officialTeam.teamName}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>
                          {officialTeam.pokemons.length} pokemons | {officialTeam.format === 'league' ? 'Formato Liga' : 'Formato Practica'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={async () => {
                          if (confirm(`Desoficializar "${officialTeam.teamName}" de ${selectedTrainer.name}?`)) {
                            await updateTrainerTeam?.({ ...officialTeam, isOfficial: false })
                            // Tambien eliminar de la tabla teams si existe
                            const teamInTable = teams.find(t => t.trainerName === selectedTrainer.name && t.teamName === officialTeam.teamName)
                            if (teamInTable && deleteTeamFromProps) {
                              await deleteTeamFromProps(teamInTable.id)
                            }
                          }
                        }}
                        className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#ef4444',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.25)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.12)'
                        }}
                      >
                        Desactivar como oficial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <TrainerDetail
              trainer={selectedTrainer}
              onBack={handleBackFromDetail}
              onEdit={handleEditTrainer}
              onToggleBadge={handleToggleBadge}
              isAdmin={true}
            />
          </div>
        )}
        {currentView === 'trainer-edit-profile' && selectedTrainer && (
          <TrainerProfile
            trainer={selectedTrainer}
            onUpdateProfile={async (data) => {
              const updated = {
                ...selectedTrainer,
                description: data.description ?? selectedTrainer.description,
                avatarSprite: data.avatarSprite ?? selectedTrainer.avatarSprite,
                favoritePokemon: data.favoritePokemon ?? selectedTrainer.favoritePokemon,
                favoritePokemonImage: data.favoritePokemonImage ?? selectedTrainer.favoritePokemonImage,
                badges: data.badges ?? selectedTrainer.badges,
              }
              await updateTrainer(updated)
              setSelectedTrainer(updated)
            }}
            onBack={handleBackFromEditProfile}
            isAdminMode={true}
            onToggleBadge={handleToggleBadge}
          />
        )}
        {currentView === 'items' && (
          <AdminItemManager
            items={catalogItems}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onImportCSV={importFromCSV}
          />
        )}
        {currentView === 'pending-items' && (
          <AdminItemNotifications
            spins={spins}
            items={catalogItems}
            onMarkDelivered={markAsDelivered}
            onMarkUndelivered={markAsUndelivered}
            onRefresh={refreshSpins}
          />
        )}
        {currentView === 'spin-boost' && (
          <AdminSpinBoost
            trainers={trainers}
            spins={spins}
            catalogItems={catalogItems}
            onResetTrainerSpin={resetTodaySpin}
            onResetAllSpins={resetAllTodaySpins}
            onRefresh={refreshSpins}
          />
        )}
        {currentView === 'spin-items' && (
          <AdminSpinItemsCustom
            catalogItems={catalogItems}
            currentSelection={customSpinItems}
            onSave={async (selectedIds) => {
              setCustomSpinItems(selectedIds)
              await saveWheelConfig(selectedIds)
            }}
            onClear={async () => {
              setCustomSpinItems([])
              await clearWheelConfig()
            }}
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

      {/* Matchup Editor Modal */}
      {editingMatchup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-scale">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <MatchupEditor
              matchup={editingMatchup}
              teams={teams}
              onSave={handleUpdateMatchupResult}
              onClose={() => setEditingMatchup(null)}
            />
          </div>
        </div>
      )}

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
