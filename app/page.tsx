'use client'

import { useState, useEffect } from 'react'
import StandingsTable from '@/components/StandingsTable'
import TeamsView from '@/components/TeamsView'
import TeamForm from '@/components/TeamForm'
import LoginModal from '@/components/LoginModal'
import AdminPanel from '@/components/AdminPanel'
import TrainersView from '@/components/TrainersView'
import SupabaseWarning from '@/components/SupabaseWarning'
import { useTeams, useTrainers } from '@/hooks/useDataPersistence'

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
  pokemons: Pokemon[]
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

type View = 'standings' | 'teams' | 'trainers'

const navItems = [
  { id: 'standings' as View, label: 'Clasificación', icon: TrophyIcon },
  { id: 'teams' as View, label: 'Equipos', icon: ShieldIcon },
  { id: 'trainers' as View, label: 'Entrenadores', icon: TrainerIcon },
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
  const [currentView, setCurrentView] = useState<View>('standings')
  const { teams, setTeams, loading: teamsLoading, error: teamsError, addTeam, updateTeam, deleteTeam, isSupabaseConfigured: teamsConfigured } = useTeams()
  const { trainers, setTrainers, loading: trainersLoading, error: trainersError, addTrainer, updateTrainer, deleteTrainer, isSupabaseConfigured: trainersConfigured } = useTrainers()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    setIsAdminLoggedIn(true)
    setLoginModalOpen(false)
  }

  const handleLogout = () => {
    setIsAdminLoggedIn(false)
    setCurrentView('standings')
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
          trainersData={{ trainers, addTrainer, updateTrainer, deleteTrainer }}
          onLogout={handleLogout}
        />
        <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLogin={handleLoginSuccess} />
      </>
    )
  }

  // Loading state
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
    <div className="relative min-h-screen" style={{ fontFamily: 'var(--font-rajdhani), Inter, system-ui, sans-serif' }}>
      <AnimatedBackground />
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLogin={handleLoginSuccess} />
      
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
            <nav className="hidden md:flex items-center gap-2" aria-label="Navegación principal">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 border ${isActive ? 'nav-active' : ''}`}
                    style={{
                      color: isActive ? '#4fc3f7' : '#64748b',
                      borderColor: isActive ? 'rgba(79,195,247,0.5)' : 'rgba(79,195,247,0.08)',
                      background: isActive ? 'rgba(79,195,247,0.08)' : 'transparent',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
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
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false) }}
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
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'standings' && (
          <StandingsTable teams={teams} onNavigate={(id) => setCurrentView(id as View)} />
        )}
        {currentView === 'teams' && (
          <TeamsView teams={teams} />
        )}
        {currentView === 'trainers' && (
          <TrainersView trainers={trainers} onTrainerClick={() => {}} />
        )}
      </main>
    </div>
  )
}
