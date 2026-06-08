'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import StandingsTable from '@/components/StandingsTable'
import TeamsView from '@/components/TeamsView'
import TeamForm from '@/components/TeamForm'
import TeamFormUnified from '@/components/TeamFormUnified'
import LoginModal from '@/components/LoginModal'
import AdminPanel from '@/components/AdminPanel'
import TrainersView from '@/components/TrainersView'
import SupabaseWarning from '@/components/SupabaseWarning'
import BracketView from '@/components/BracketView'
import MatchupsView from '@/components/MatchupsView'
import MatchupEditor from '@/components/MatchupEditor'
import TrainerProfile from '@/components/TrainerProfile'
import MyTeamsView from '@/components/MyTeamsView'
import MyTeamForm from '@/components/MyTeamForm'
import type { Trainer } from '@/components/TrainersView'
import { useTeams, useTrainers } from '@/hooks/useDataPersistence'
import { useTrainerTeams } from '@/hooks/useTrainerTeams'
import type { TrainerTeam } from '@/hooks/useTrainerTeams'
import { useMatchups, type Matchup } from '@/hooks/useMatchups'
import { useItemCatalog } from '@/hooks/useItemCatalog'
import { useItemSpins } from '@/hooks/useItemSpins'
import DailySpinWheel from '@/components/DailySpinWheel'

export interface Pokemon {
  name: string
  types: string[] // Array of types, e.g., ['fire', 'flying']
  image: string
}

export interface Team {
  id: number
  teamName: string
  trainerName: string
  points: number
  wins: number
  gamesPlayed: number
  pokemons: Pokemon[] // Todos los Pokémon del equipo (pueden ser 10)
  bracketPosition?: number | null // Position in final bracket (1-4)
}

const initialTeams: Team[] = [
  {
    id: 1,
    teamName: 'Rayos Eléctricos',
    trainerName: 'Ash Ketchum',
    wins: 12,
    gamesPlayed: 15,
    points: 36,
    pokemons: [
      { name: 'Pikachu', types: ['electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
      { name: 'Raichu', types: ['electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png' },
      { name: 'Zapdos', types: ['electric', 'flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png' },
      { name: 'Jolteon', types: ['electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png' },
    ]
  },
  {
    id: 2,
    teamName: 'Llamas Infernales',
    trainerName: 'Gary Oak',
    wins: 10,
    gamesPlayed: 15,
    points: 30,
    pokemons: [
      { name: 'Charizard', types: ['fire', 'flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' },
      { name: 'Arcanine', types: ['fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png' },
      { name: 'Moltres', types: ['fire', 'flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png' },
    ]
  },
  {
    id: 3,
    teamName: 'Mente Psíquica',
    trainerName: 'Sabrina',
    wins: 9,
    gamesPlayed: 15,
    points: 27,
    pokemons: [
      { name: 'Mewtwo', types: ['psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
      { name: 'Alakazam', types: ['psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png' },
      { name: 'Starmie', types: ['water', 'psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png' },
    ]
  },
]

type View = 'standings' | 'teams' | 'bracket' | 'matchups' | 'trainers' | 'my-teams'

const navItems: Array<{ id: View; label: string; icon: React.ComponentType<{ className?: string }>; requireAuth?: boolean }> = [
  { id: 'standings' as View, label: 'Clasificación', icon: TrophyIcon },
  { id: 'teams' as View, label: 'Equipos Oficiales', icon: ShieldIcon },
  { id: 'matchups' as View, label: 'Enfrentamientos', icon: MatchupsIcon },
  { id: 'bracket' as View, label: 'Bracket', icon: BracketIcon },
  { id: 'trainers' as View, label: 'Entrenadores', icon: TrainerIcon },
  { id: 'my-teams' as View, label: 'Mis Equipos', icon: ShieldIcon, requireAuth: true },
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

function AnimatedBackground() {
  return (
    <div className="poke-bg" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div
        className="pokeball-deco"
        style={{ top: '15%', right: '8%', width: 180, height: 180 }}
      />
      <div
        className="pokeball-deco"
        style={{ bottom: '20%', left: '5%', width: 120, height: 120, animationDirection: 'reverse', animationDuration: '20s' }}
      />
    </div>
  )
}

export default function App() {
  const { trainer, isAdminLoggedIn, isLoading, loginAsTrainer, logout, logoutAdmin } = useAuth()
  const [currentView, setCurrentView] = useState<View>('standings')
  const [showTeamForm, setShowTeamForm] = useState(false)
  const { teams, setTeams, loading: teamsLoading, error: teamsError, addTeam, updateTeam, deleteTeam, isSupabaseConfigured: teamsConfigured } = useTeams()
  const { trainers, setTrainers, loading: trainersLoading, error: trainersError, addTrainer, updateTrainer, deleteTrainer, isSupabaseConfigured: trainersConfigured } = useTrainers()
  const { matchups, setMatchups, loading: matchupsLoading, bulkCreateMatchups, updateMatchup: updateMatchupHook, deleteAllMatchups, refreshMatchups } = useMatchups()
  const {
    trainerTeams,
    setTrainerTeams,
    loading: trainerTeamsLoading,
    addTrainerTeam,
    updateTrainerTeam,
    deleteTrainerTeam,
  } = useTrainerTeams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Modal states
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [trainerLoginModalOpen, setTrainerLoginModalOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Matchup editor state
  const [editingMatchup, setEditingMatchup] = useState<Matchup | null>(null)

  // Trainer profile view state
  const [viewingTrainerProfile, setViewingTrainerProfile] = useState<Trainer | null>(null)

  // My teams form state
  const [showMyTeamForm, setShowMyTeamForm] = useState(false)
  const [editingTrainerTeam, setEditingTrainerTeam] = useState<TrainerTeam | null>(null)

  // Daily spin wheel state
  const [showSpinWheel, setShowSpinWheel] = useState(false)
  const {
    items: spinItems,
    loading: spinItemsLoading,
  } = useItemCatalog()
  const {
    hasSpunToday,
    getTodaySpin,
    saveSpin,
  } = useItemSpins()
  const [hasSpunState, setHasSpunState] = useState(false)
  const [todaySpinResult, setTodaySpinResult] = useState<{ item: import('@/data/itemsList').Item; delivered: boolean } | null>(null)

  // Combinar equipos oficiales para la vista de "Equipos Oficiales"
  // Prioridad: mostrar equipos de la tabla teams (que incluye los oficiales sincronizados)
  // Si no hay teams, mostrar trainerTeams oficiales como fallback
  const officialTeamsForDisplay = teams.length > 0
    ? teams
    : trainerTeams
        .filter(tt => tt.isOfficial)
        .map(tt => {
          const trainerName = trainers.find(t => t.id === tt.trainerId)?.name || 'Desconocido'
          return {
            id: tt.id + 10000,
            teamName: tt.teamName,
            trainerName: trainerName,
            points: 0,
            wins: 0,
            gamesPlayed: 0,
            pokemons: tt.pokemons,
            bracketPosition: null,
          }
        })

  // Handle URL parameter ?view=bracket
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')
    if (viewParam === 'bracket' && !isAdminLoggedIn) {
      changeView('bracket')
    }
  }, [isAdminLoggedIn])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check if trainer has spun today
  useEffect(() => {
    if (!trainer) return
    const checkSpinStatus = async () => {
      try {
        const spun = await hasSpunToday(trainer.id)
        setHasSpunState(spun)
        if (spun) {
          const result = await getTodaySpin(trainer.id)
          if (result) setTodaySpinResult(result)
        }
      } catch (err) {
        console.error('Error checking spin status:', err)
      }
    }
    checkSpinStatus()
  }, [trainer])

  // Hidden login trigger - click 5 times on logo
  const handleLogoClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    
    // Reset timer
    if (clickTimer) clearTimeout(clickTimer)
    
    const timer = setTimeout(() => {
      setClickCount(0)
    }, 1000)
    setClickTimer(timer)
    
    if (newCount >= 5) {
      setLoginModalOpen(true)
      setClickCount(0)
      if (clickTimer) clearTimeout(clickTimer)
    }
  }

  const handleLoginSuccess = () => {
    setLoginModalOpen(false)
  }

  const handleTrainerLoginSuccess = () => {
    setTrainerLoginModalOpen(false)
  }

  // Resetear viewingTrainerProfile cuando se cambia de vista
  const changeView = (view: View) => {
    setViewingTrainerProfile(null)
    setCurrentView(view)
  }

  const handleLogout = () => {
    logout()
    setShowTeamForm(false)
    changeView('standings')
  }

  const handleSpin = async (item: import('@/data/itemsList').Item): Promise<boolean> => {
    if (!trainer) return false
    try {
      const success = await saveSpin(trainer.id, item.id)
      if (success) {
        setHasSpunState(true)
        setTodaySpinResult({ item, delivered: false })
      }
      return success
    } catch (err) {
      console.error('Error saving spin:', err)
      return false
    }
  }

  const handleOpenSpinWheel = () => {
    setShowSpinWheel(true)
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    changeView('standings')
  }

  // Handle trainer team operations
  const handleSetOfficial = async (teamId: number) => {
    if (!trainer) return
    try {
      const team = trainerTeams.find(t => t.id === teamId)
      if (!team) return

      // Validar que el equipo tenga exactamente 10 pokemons (formato liga)
      if (team.pokemons.length !== 10) {
        alert('El equipo debe tener exactamente 10 pokemons (completar los 10 slots) para ser oficial.')
        return
      }

      // Desoficializar el equipo oficial anterior si existe
      const currentOfficial = trainerTeams.find(t => t.trainerId === trainer.id && t.isOfficial)
      if (currentOfficial) {
        // Eliminar el equipo anterior de la tabla teams oficiales
        const oldTeamInOfficial = teams.find(t => t.trainerName === trainer.name && t.teamName === currentOfficial.teamName)
        if (oldTeamInOfficial) {
          await deleteTeam(oldTeamInOfficial.id)
        }
        await updateTrainerTeam({ ...currentOfficial, isOfficial: false })
      }

      // Marcar el nuevo equipo como oficial
      await updateTrainerTeam({ ...team, isOfficial: true })

      // Sincronizar con la tabla teams (equipos oficiales visibles)
      const newTeamEntry = {
        teamName: team.teamName,
        trainerName: trainer.name,
        wins: 0,
        gamesPlayed: 0,
        points: 0,
        pokemons: team.pokemons,
      }
      await addTeam(newTeamEntry)
    } catch (err) {
      console.error('Error setting official team:', err)
    }
  }

  const handleRemoveOfficial = async () => {
    if (!trainer) return
    try {
      const official = trainerTeams.find(t => t.trainerId === trainer.id && t.isOfficial)
      if (official) {
        await updateTrainerTeam({ ...official, isOfficial: false })
        // Borrar el equipo de la tabla teams
        const teamInOfficial = teams.find(t => t.trainerName === trainer.name && t.teamName === official.teamName)
        if (teamInOfficial) {
          await deleteTeam(teamInOfficial.id)
        }
      }
    } catch (err) {
      console.error('Error removing official team:', err)
    }
  }

  const handleDeleteTrainerTeam = async (teamId: number) => {
    try {
      // Verificar si es oficial
      const team = trainerTeams.find(t => t.id === teamId)
      if (team?.isOfficial) {
        alert('No puedes eliminar el equipo oficial. Desoficializalo primero.')
        return
      }
      await deleteTrainerTeam(teamId)
    } catch (err) {
      console.error('Error deleting trainer team:', err)
    }
  }

  const handleCreateTrainerTeam = async (teamData: {
    trainerId: number
    teamName: string
    format: 'league' | 'practice'
    isOfficial: boolean
    pokemons: Array<{ name: string; types: string[]; image: string }>
  }) => {
    try {
      await addTrainerTeam(teamData)
      setShowMyTeamForm(false)
      changeView('my-teams')
    } catch (err) {
      console.error('Error creating trainer team:', err)
    }
  }

  // Handle matchup result update with automatic points calculation
  const handleUpdateMatchupResult = async (updatedMatchup: Matchup) => {
    console.log('🟡 Updating matchup result:', updatedMatchup)
    
    try {
      // ACTUALIZAR PRIMERO el enfrentamiento en la DB
      console.log('📝 Step 1: Updating matchup in DB...')
      await updateMatchupHook(updatedMatchup)
      console.log('✅ Matchup updated in DB')
      
      // REFRESCAR los matchups desde la DB para obtener el actualizado
      console.log('📝 Step 2: Refreshing matchups from DB...')
      try {
        await refreshMatchups()
        console.log('✅ Matchups refreshed from DB')
      } catch (err) {
        console.error('❌ Error refreshing matchups:', err)
      }
      
      // AHORA recalcular TODOS los puntos desde cero basado en TODOS los enfrentamientos
      console.log('📝 Step 3: Recalculating all teams...')
      // Esto evita bugs cuando se cambia el ganador
      const teamStats = new Map<number, { wins: number; gamesPlayed: number }>()
      
      // Inicializar todos los equipos
      teams.forEach(team => {
        teamStats.set(team.id, { wins: 0, gamesPlayed: 0 })
      })
      
      // Procesar TODOS los enfrentamientos (incluyendo el actualizado)
      const allMatchups = matchups.map(m => 
        m.id === updatedMatchup.id ? updatedMatchup : m
      )
      
      allMatchups.forEach(matchup => {
        if (matchup.played && matchup.winnerTeamId) {
          const winnerStats = teamStats.get(matchup.winnerTeamId)!
          winnerStats.wins += 1
          winnerStats.gamesPlayed += 1
          
          const loserId = matchup.winnerTeamId === matchup.teamAId ? matchup.teamBId : matchup.teamAId
          const loserStats = teamStats.get(loserId)!
          loserStats.gamesPlayed += 1
        }
      })
      
      // Actualizar TODOS los equipos con las estadísticas recalculadas
      for (const [teamId, stats] of teamStats.entries()) {
        const team = teams.find(t => t.id === teamId)
        if (team) {
          await updateTeam({
            ...team,
            wins: stats.wins,
            gamesPlayed: stats.gamesPlayed,
            points: stats.wins * 3 // Recalcular puntos basados en wins
          })
        }
      }
      
      console.log('✅ All teams recalculated')
      console.log('📊 Current matchups count in page.tsx:', matchups.length)
      
      // Forzar un re-render para que StandingsTable reciba los matchups actualizados
      setMatchups([...matchups])
      
      setEditingMatchup(null)
    } catch (err: any) {
      console.error('❌ Error updating matchup:', err)
      throw err
    }
  }

  // If admin is logged in, show admin panel
  if (isAdminLoggedIn) {
    return (
      <>
        <AdminPanel 
          teams={teams} 
          setTeams={setTeams}
          addTeam={addTeam}
          updateTeam={updateTeam}
          deleteTeam={deleteTeam}
          trainerTeams={trainerTeams}
          updateTrainerTeam={updateTrainerTeam}
          trainersData={{ trainers, addTrainer, updateTrainer, deleteTrainer }}
          matchups={matchups}
          bulkCreateMatchups={bulkCreateMatchups}
          deleteAllMatchups={deleteAllMatchups}
          onUpdateMatchupResult={handleUpdateMatchupResult}
          onLogout={handleAdminLogout}
        />
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLogin={handleLoginSuccess} />
      </>
    )
  }

  // Loading state - show spinner while auth is initializing
  if (isLoading || teamsLoading || trainersLoading || matchupsLoading) {
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
    <div className="relative min-h-screen" style={{ fontFamily: 'var(--font-rajdhani), Inter, system-ui, sans-serif' }}>
      <AnimatedBackground />
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLogin={handleLoginSuccess} />
      <LoginModal 
        isOpen={trainerLoginModalOpen} 
        onClose={() => setTrainerLoginModalOpen(false)} 
        onLogin={handleTrainerLoginSuccess}
        isTrainerMode={true}
      />
      
      {/* Show warning if Supabase is not configured */}
      {(!teamsConfigured || !trainersConfigured) && <SupabaseWarning />}

      {/* Header */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(8, 11, 20, 0.95)'
            : 'rgba(8, 11, 20, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(79, 195, 247, 0.1)',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center relative cursor-pointer logo-secret"
                style={{
                  background: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
                  boxShadow: '0 0 20px rgba(79,195,247,0.4)',
                }}
                onClick={handleLogoClick}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleLogoClick()}
                aria-label="PokéMian League Logo"
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <div
                  className="w-full h-[1px] absolute"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                />
                <div
                  className="w-3 h-3 rounded-full z-10"
                  style={{
                    background: 'white',
                    boxShadow: '0 0 8px rgba(79,195,247,0.8)',
                  }}
                />
              </div>
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold tracking-wide leading-none glow-text"
                  style={{ color: '#4fc3f7', letterSpacing: '0.05em' }}
                >
                  PokéMian
                </h1>
                <p className="text-xs tracking-widest uppercase" style={{ color: '#64748b', letterSpacing: '0.2em' }}>
                  League
                </p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Navegación principal">
              {navItems.map((item) => {
                // Ocultar "Mis Equipos" si no hay trainer logueado
                if (item.requireAuth && !trainer) return null

                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => changeView(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border ${isActive ? 'nav-active' : ''}`}
                    style={{
                      color: isActive ? '#4fc3f7' : '#64748b',
                      borderColor: isActive ? 'rgba(79,195,247,0.5)' : 'rgba(79,195,247,0.08)',
                      background: isActive ? 'rgba(79,195,247,0.08)' : 'transparent',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                )
              })}
              
              {/* Trainer login/logout button */}
              {trainer ? (
                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-700">
                  {/* Daily Spin Button */}
                  <button
                    onClick={handleOpenSpinWheel}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: hasSpunState
                        ? 'rgba(79, 195, 247, 0.08)'
                        : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: hasSpunState
                        ? '1px solid rgba(79, 195, 247, 0.3)'
                        : '1px solid rgba(245, 158, 11, 0.5)',
                      color: hasSpunState ? '#4fc3f7' : '#080b14',
                      boxShadow: hasSpunState
                        ? 'none'
                        : '0 0 15px rgba(245, 158, 11, 0.4)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      if (!hasSpunState) {
                        el.style.boxShadow = '0 0 25px rgba(245, 158, 11, 0.6)'
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      if (!hasSpunState) {
                        el.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.4)'
                      }
                    }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {hasSpunState ? 'Ruleta' : 'Ruleta Diaria'}
                  </button>

                  <span className="text-xs font-semibold" style={{ color: '#4fc3f7' }}>
                    {trainer.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setTrainerLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border ml-2"
                  style={{
                    color: '#10b981',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.1)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'rgba(16, 185, 129, 0.1)'
                  }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Soy Entrenador
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#4fc3f7' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav
              className="md:hidden pb-4 flex flex-col gap-2"
              style={{ borderTop: '1px solid rgba(79,195,247,0.1)', paddingTop: '1rem' }}
              aria-label="Menú móvil"
            >
              {navItems.map((item) => {
                // Ocultar "Mis Equipos" si no hay trainer logueado
                if (item.requireAuth && !trainer) return null

                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { changeView(item.id); setMobileMenuOpen(false) }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide w-full text-left transition-all border ${isActive ? 'nav-active' : ''}`}
                    style={{
                      color: isActive ? '#4fc3f7' : '#94a3b8',
                      borderColor: isActive ? 'rgba(79,195,247,0.5)' : 'rgba(79,195,247,0.08)',
                      background: isActive ? 'rgba(79,195,247,0.08)' : 'transparent',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
              
              {/* Trainer login/logout mobile */}
              {trainer ? (
                <div className="pt-4 mt-4 border-t border-gray-700">
                  <button
                    onClick={() => { handleOpenSpinWheel(); setMobileMenuOpen(false) }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider mb-3"
                    style={{
                      background: hasSpunState
                        ? 'rgba(79, 195, 247, 0.08)'
                        : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: hasSpunState
                        ? '1px solid rgba(79, 195, 247, 0.3)'
                        : '1px solid rgba(245, 158, 11, 0.5)',
                      color: hasSpunState ? '#4fc3f7' : '#080b14',
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {hasSpunState ? 'Ruleta Diaria' : 'Girar Ruleta'}
                  </button>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-semibold" style={{ color: '#4fc3f7' }}>
                      {trainer.name}
                    </span>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      Salir
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setTrainerLoginModalOpen(true); setMobileMenuOpen(false) }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold mx-2 mt-2"
                  style={{
                    color: '#10b981',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Soy Entrenador
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showTeamForm ? (
          <TeamFormUnified
            mode="league"
            onSave={async (team) => {
              await addTeam(team as Omit<Team, 'id'>)
              setShowTeamForm(false)
              changeView('teams')
            }}
            onUpdate={async (team) => {
              await updateTeam(team)
              setShowTeamForm(false)
              changeView('teams')
            }}
            onDelete={async (id) => {
              await deleteTeam(id)
              setShowTeamForm(false)
              changeView('teams')
            }}
            existingTeams={teams}
            trainers={trainers}
          />
        ) : currentView === 'standings' && (
          <StandingsTable
            teams={teams}
            matchups={matchups}
            onNavigate={(id) => changeView(id as View)}
            trainer={trainer ? { id: trainer.id, name: trainer.name } : null}
            onNavigateToMyTeams={() => {
              changeView('my-teams')
              setShowMyTeamForm(true)
            }}
            trainers={trainers}
          />
        )}
        {!showTeamForm && currentView === 'matchups' && (
          <MatchupsView 
            matchups={matchups} 
            teams={teams} 
            isAdmin={isAdminLoggedIn}
            onEditMatchup={isAdminLoggedIn ? setEditingMatchup : undefined}
          />
        )}
        {!showTeamForm && currentView === 'bracket' && (
          <BracketView teams={teams} />
        )}
        {!showTeamForm && currentView === 'teams' && (
          <TeamsView 
            teams={officialTeamsForDisplay}
            trainer={trainer}
            onNavigateToMyTeams={() => {
            changeView('my-teams')
            setShowMyTeamForm(true)
            }}
          />
        )}
        {!showTeamForm && currentView === 'my-teams' && !showMyTeamForm && (
          <MyTeamsView
            trainerTeams={trainerTeams}
            trainer={trainer ? { id: trainer.id, name: trainer.name } : { id: 0, name: '' }}
            officialTeamId={trainer ? (trainerTeams.find(t => t.trainerId === trainer.id && t.isOfficial)?.id ?? null) : null}
            onCreateTeam={() => setShowMyTeamForm(true)}
            onSetOfficial={handleSetOfficial}
            onRemoveOfficial={handleRemoveOfficial}
            onDeleteTeam={handleDeleteTrainerTeam}
            onEditTeam={(team) => {
              // Guardar el equipo a editar en estado y abrir el form
              setEditingTrainerTeam(team)
              setShowMyTeamForm(true)
            }}
          />
        )}
        {!showTeamForm && currentView === 'my-teams' && showMyTeamForm && trainer && (
          <TeamFormUnified
            mode="personal"
            key={editingTrainerTeam?.id || 'new'}
            initialFormat={editingTrainerTeam?.format}
            initialData={editingTrainerTeam ? {
              teamName: editingTrainerTeam.teamName,
              pokemons: editingTrainerTeam.pokemons,
            } : undefined}
            onSave={async (team) => {
              // El formato viene del TeamFormUnified (selector de formato)
              const format = (team as any).format || editingTrainerTeam?.format || 'league'
              if (editingTrainerTeam) {
                // Actualizar equipo existente
                await updateTrainerTeam({
                  ...editingTrainerTeam,
                  teamName: team.teamName,
                  format: format,
                  pokemons: team.pokemons,
                })
              } else {
                // Crear nuevo equipo
                await addTrainerTeam({
                  trainerId: trainer.id,
                  teamName: team.teamName,
                  format: format,
                  isOfficial: false,
                  pokemons: team.pokemons,
                })
              }
              setShowMyTeamForm(false)
              setEditingTrainerTeam(null)
              changeView('my-teams')
            }}
            onBack={() => {
              setShowMyTeamForm(false)
              setEditingTrainerTeam(null)
            }}
          />
        )}
        {!showTeamForm && currentView === 'trainers' && !viewingTrainerProfile && (
          <TrainersView trainers={trainers} onTrainerClick={(t) => setViewingTrainerProfile(t)} />
        )}
        {!showTeamForm && currentView === 'trainers' && viewingTrainerProfile && (
          <TrainerProfile
            key={viewingTrainerProfile.id}
            trainer={viewingTrainerProfile}
            onUpdateProfile={async (data) => {
              // Validar avatarSprite
              if (data.avatarSprite !== null && (data.avatarSprite < 1 || data.avatarSprite > 93)) {
                console.error('Avatar sprite invalido (debe ser 1-93)')
                return
              }
              // Actualizar entrenador en Supabase/localStorage
              const updated = {
                ...viewingTrainerProfile,
                description: data.description,
                avatarSprite: data.avatarSprite,
              }
              try {
                await updateTrainer(updated)
                // Actualizar en el estado local
                setTrainers(prev => prev.map(t =>
                  t.id === updated.id ? updated : t
                ))
                setViewingTrainerProfile(updated)
              } catch (err) {
                console.error('Error updating profile:', err)
              }
            }}
            onBack={() => setViewingTrainerProfile(null)}
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

      {/* Daily Spin Wheel Modal */}
      {showSpinWheel && trainer && (
        <DailySpinWheel
          items={spinItems}
          trainerId={trainer.id}
          trainerName={trainer.name}
          hasSpunToday={hasSpunState}
          todayItem={todaySpinResult}
          onSpin={handleSpin}
          onClose={() => setShowSpinWheel(false)}
        />
      )}
    </div>
  )
}
