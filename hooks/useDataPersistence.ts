'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Team {
  id: number
  teamName: string
  trainerName: string
  wins: number
  gamesPlayed: number
  points: number
  pokemons: Array<{
    name: string
    types: string[]
    image: string
  }>
  bracketPosition?: number | null
}

interface Trainer {
  id: number
  name: string
  favoritePokemon: string
  favoritePokemonImage?: string
  description: string
  badges: Array<{
    name: string
    image: string
    obtained: boolean
  }>
  avatarSprite?: number | null
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  // Check if Supabase is configured
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsSupabaseConfigured(!!url && !!key && url !== 'tu_supabase_url_aqui')
  }, [])

  // Load teams from Supabase or fallback to localStorage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fallback to localStorage for development
      try {
        const saved = localStorage.getItem('pokeMianTeams')
        if (saved) {
          const loaded = JSON.parse(saved)
          setTeams(loaded)
        }
      } catch (err) {
        console.error('Error loading from localStorage:', err)
      } finally {
        setLoading(false)
      }
      return
    }

    loadTeams()
  }, [isSupabaseConfigured])

  const loadTeams = async () => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      setLoading(true)
      const { data, error } = await supabase.from('teams').select('*')
      
      if (error) throw error
      
      if (data) {
        // Parse JSON strings back to objects AND convert snake_case to camelCase
        const parsed = data.map(team => ({
          id: team.id,
          teamName: team.team_name,
          trainerName: team.trainer_name,
          wins: team.wins,
          gamesPlayed: team.games_played,
          points: team.points,
          pokemons: typeof team.pokemons === 'string' ? JSON.parse(team.pokemons) : team.pokemons,
          bracketPosition: team.bracket_position
        }))
        setTeams(parsed)
      }
    } catch (err: any) {
      console.error('Error loading teams:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addTeam = async (team: Omit<Team, 'id'>) => {
    console.log('🔵 ADD TEAM CALLED:', team)
    try {
      const calculatedPoints = team.wins * 3
      // Mapear camelCase a snake_case para Supabase
      const newTeam = {
        team_name: team.teamName,
        trainer_name: team.trainerName,
        wins: team.wins,
        games_played: team.gamesPlayed,
        points: calculatedPoints,
        pokemons: JSON.stringify(team.pokemons),
        bracket_position: team.bracketPosition ?? null
      }
      
      console.log('🔵 Is Supabase configured?', isSupabaseConfigured)
      console.log('🔵 Supabase client exists?', !!supabase)
      
      if (!isSupabaseConfigured) {
        console.log('⚠️ Using localStorage fallback')
        // Fallback to localStorage
        const updatedTeams = [...teams, { ...team, points: calculatedPoints, id: Date.now() }]
        setTeams(updatedTeams)
        localStorage.setItem('pokeMianTeams', JSON.stringify(updatedTeams))
        return updatedTeams[updatedTeams.length - 1]
      }
      
      console.log('✅ Inserting into Supabase:', newTeam)
      const { data, error } = await supabase
        .from('teams')
        .insert([newTeam])
        .select()
      
      if (error) {
        console.error('❌ SUPABASE ERROR:', error)
        throw error
      }
      
      console.log('✅ SUPABASE SUCCESS:', data)
      
      if (data && data.length > 0) {
        const parsedTeam = {
          id: data[0].id,
          teamName: data[0].team_name,
          trainerName: data[0].trainer_name,
          wins: data[0].wins,
          gamesPlayed: data[0].games_played,
          points: data[0].points,
          pokemons: typeof data[0].pokemons === 'string' 
            ? JSON.parse(data[0].pokemons) 
            : data[0].pokemons,
          bracketPosition: data[0].bracket_position
        }
        setTeams(prev => [...prev, parsedTeam])
        return parsedTeam
      }
    } catch (err: any) {
      console.error('❌ Error adding team:', err)
      throw err
    }
  }

  const updateTeam = async (updated: Team) => {
    console.log('🟡 UPDATE TEAM CALLED:', updated)
    try {
      if (!updated.id) {
        console.error('❌ No team ID provided for update')
        throw new Error('No team ID provided')
      }
      
      const calculatedPoints = updated.wins * 3
      // Mapear camelCase a snake_case para Supabase
      const teamToUpdate = {
        team_name: updated.teamName,
        trainer_name: updated.trainerName,
        wins: updated.wins,
        games_played: updated.gamesPlayed,
        points: calculatedPoints, // Siempre recalcular puntos basados en victorias
        pokemons: JSON.stringify(updated.pokemons),
        bracket_position: updated.bracketPosition ?? null
      }
      
      console.log('🟡 Is Supabase configured?', isSupabaseConfigured)
      
      if (!isSupabaseConfigured) {
        console.log('⚠️ Using localStorage fallback')
        // Fallback to localStorage
        const updatedTeams = teams.map(t => t.id === updated.id ? { ...updated, points: calculatedPoints } : t)
        setTeams(updatedTeams)
        localStorage.setItem('pokeMianTeams', JSON.stringify(updatedTeams))
        return
      }
      
      console.log('🟡 Updating in Supabase:', teamToUpdate, 'ID:', updated.id)
      const { data, error } = await supabase
        .from('teams')
        .update(teamToUpdate)
        .eq('id', updated.id)
        .select()
      
      if (error) {
        console.error('❌ SUPABASE UPDATE ERROR:', error)
        throw error
      }
      
      console.log('✅ SUPABASE UPDATE SUCCESS:', data)
      
      if (data && data.length > 0) {
        const parsedTeam = {
          id: data[0].id,
          teamName: data[0].team_name,
          trainerName: data[0].trainer_name,
          wins: data[0].wins,
          gamesPlayed: data[0].games_played,
          points: data[0].points,
          pokemons: typeof data[0].pokemons === 'string' 
            ? JSON.parse(data[0].pokemons) 
            : data[0].pokemons,
          bracketPosition: data[0].bracket_position
        }
        // Update local state with the returned data
        setTeams(prev => prev.map(t => t.id === updated.id ? parsedTeam : t))
      }
    } catch (err: any) {
      console.error('❌ Error updating team:', err)
      throw err
    }
  }

  const deleteTeam = async (id: number) => {
    console.log('🔴 DELETE TEAM CALLED - ID:', id)
    try {
      if (!id) {
        console.error('❌ No team ID provided for deletion')
        throw new Error('No team ID provided')
      }
      
      if (!isSupabaseConfigured) {
        console.log('⚠️ Using localStorage fallback for deletion')
        // Fallback to localStorage
        const updatedTeams = teams.filter(t => t.id !== id)
        setTeams(updatedTeams)
        localStorage.setItem('pokeMianTeams', JSON.stringify(updatedTeams))
        return
      }
      
      console.log('🔴 Deleting from Supabase - ID:', id)
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('❌ SUPABASE DELETE ERROR:', error)
        throw error
      }
      
      console.log('✅ SUPABASE DELETE SUCCESS')
      setTeams(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      console.error('❌ Error deleting team:', err)
      throw err
    }
  }

  return {
    teams,
    setTeams,
    loading,
    error,
    isSupabaseConfigured,
    addTeam,
    updateTeam,
    deleteTeam,
    refreshTeams: loadTeams
  }
}

export function useTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  // Check if Supabase is configured
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsSupabaseConfigured(!!url && !!key && url !== 'tu_supabase_url_aqui')
  }, [])

  // Load trainers from Supabase or fallback to localStorage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fallback to localStorage for development
      try {
        const saved = localStorage.getItem('pokeMianTrainers')
        if (saved) {
          const loaded = JSON.parse(saved)
          setTrainers(loaded)
        }
      } catch (err) {
        console.error('Error loading from localStorage:', err)
      } finally {
        setLoading(false)
      }
      return
    }

    loadTrainers()
  }, [isSupabaseConfigured])

  const loadTrainers = async () => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      setLoading(true)
      const { data, error } = await supabase.from('trainers').select('*')
      
      if (error) throw error
      
      if (data) {
        // Parse JSON strings back to objects AND convert snake_case to camelCase
        const parsed = data.map(trainer => ({
          id: trainer.id,
          name: trainer.name,
          favoritePokemon: trainer.favorite_pokemon,
          favoritePokemonImage: trainer.favorite_pokemon_image,
          description: trainer.description,
          badges: typeof trainer.badges === 'string' ? JSON.parse(trainer.badges) : trainer.badges,
          avatarSprite: trainer.avatar_sprite ?? null
        }))
        setTrainers(parsed)
      }
    } catch (err: any) {
      console.error('Error loading trainers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addTrainer = async (trainer: Omit<Trainer, 'id'>) => {
    try {
      // Mapear camelCase a snake_case para Supabase
      const newTrainer = {
        name: trainer.name,
        favorite_pokemon: trainer.favoritePokemon,
        favorite_pokemon_image: trainer.favoritePokemonImage || null,
        description: trainer.description || null,
        badges: JSON.stringify(trainer.badges),
        avatar_sprite: trainer.avatarSprite ?? null
      }
      
      if (!isSupabaseConfigured) {
        // Fallback to localStorage
        const updatedTrainers = [...trainers, { ...trainer, avatarSprite: trainer.avatarSprite ?? null, id: Date.now() }]
        setTrainers(updatedTrainers)
        localStorage.setItem('pokeMianTrainers', JSON.stringify(updatedTrainers))
        return updatedTrainers[updatedTrainers.length - 1]
      }
      
      const { data, error } = await supabase
        .from('trainers')
        .insert([newTrainer])
        .select()
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const parsedTrainer = {
          id: data[0].id,
          name: data[0].name,
          favoritePokemon: data[0].favorite_pokemon,
          favoritePokemonImage: data[0].favorite_pokemon_image,
          description: data[0].description,
          badges: typeof data[0].badges === 'string'
            ? JSON.parse(data[0].badges)
            : data[0].badges,
          avatarSprite: data[0].avatar_sprite ?? null
        }
        setTrainers(prev => [...prev, parsedTrainer])
        return parsedTrainer
      }
    } catch (err: any) {
      console.error('Error adding trainer:', err)
      throw err
    }
  }

  const updateTrainer = async (updated: Trainer) => {
    console.log('🟡 UPDATE TRAINER CALLED:', updated)
    try {
      if (!updated.id) {
        console.error('❌ No trainer ID provided for update')
        throw new Error('No trainer ID provided')
      }
      
      // Mapear camelCase a snake_case para Supabase
      const trainerToUpdate = {
        name: updated.name,
        favorite_pokemon: updated.favoritePokemon,
        favorite_pokemon_image: updated.favoritePokemonImage || null,
        description: updated.description || null,
        badges: JSON.stringify(updated.badges),
        avatar_sprite: updated.avatarSprite ?? null
      }
      
      console.log('🟡 Is Supabase configured?', isSupabaseConfigured)
      
      if (!isSupabaseConfigured) {
        console.log('⚠️ Using localStorage fallback')
        // Fallback to localStorage
        const updatedTrainers = trainers.map(t => t.id === updated.id ? { ...updated } : t)
        setTrainers(updatedTrainers)
        localStorage.setItem('pokeMianTrainers', JSON.stringify(updatedTrainers))
        return
      }
      
      console.log('🟡 Updating in Supabase:', trainerToUpdate, 'ID:', updated.id)
      const { data, error } = await supabase
        .from('trainers')
        .update(trainerToUpdate)
        .eq('id', updated.id)
        .select()
      
      if (error) {
        console.error('❌ SUPABASE UPDATE ERROR:', error)
        throw error
      }
      
      console.log('✅ SUPABASE UPDATE SUCCESS:', data)
      
      if (data && data.length > 0) {
        const parsedTrainer = {
          id: data[0].id,
          name: data[0].name,
          favoritePokemon: data[0].favorite_pokemon,
          favoritePokemonImage: data[0].favorite_pokemon_image,
          description: data[0].description,
          avatarSprite: data[0].avatar_sprite ?? null,
          badges: typeof data[0].badges === 'string'
            ? JSON.parse(data[0].badges)
            : data[0].badges
        }
        // Update local state with the returned data
        setTrainers(prev => prev.map(t => t.id === updated.id ? parsedTrainer : t))
      }
    } catch (err: any) {
      console.error('❌ Error updating trainer:', err)
      throw err
    }
  }

  const deleteTrainer = async (id: number) => {
    console.log('🔴 DELETE TRAINER CALLED - ID:', id)
    try {
      if (!id) {
        console.error('❌ No trainer ID provided for deletion')
        throw new Error('No trainer ID provided')
      }
      
      if (!isSupabaseConfigured) {
        console.log('⚠️ Using localStorage fallback for deletion')
        // Fallback to localStorage
        const updatedTrainers = trainers.filter(t => t.id !== id)
        setTrainers(updatedTrainers)
        localStorage.setItem('pokeMianTrainers', JSON.stringify(updatedTrainers))
        return
      }
      
      console.log('🔴 Deleting from Supabase - ID:', id)
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('❌ SUPABASE DELETE ERROR:', error)
        throw error
      }
      
      console.log('✅ SUPABASE DELETE SUCCESS')
      setTrainers(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      console.error('❌ Error deleting trainer:', err)
      throw err
    }
  }

  return {
    trainers,
    setTrainers,
    loading,
    error,
    isSupabaseConfigured,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    refreshTrainers: loadTrainers
  }
}

// ==========================================
// TrainerTeams (Equipos personales de cada entrenador)
// ==========================================

export interface TrainerTeam {
  id: number
  trainerId: number
  teamName: string
  format: 'league' | 'practice'
  isOfficial: boolean
  pokemons: Array<{
    name: string
    types: string[]
    image: string
  }>
}

export function useTrainerTeams() {
  const [trainerTeams, setTrainerTeams] = useState<TrainerTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsSupabaseConfigured(!!url && !!key && url !== 'tu_supabase_url_aqui')
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const saved = localStorage.getItem('pokeMianTrainerTeams')
        if (saved) {
          const loaded = JSON.parse(saved)
          setTrainerTeams(loaded)
        }
      } catch (err) {
        console.error('Error loading trainer teams from localStorage:', err)
      } finally {
        setLoading(false)
      }
      return
    }

    loadTrainerTeams()
  }, [isSupabaseConfigured])

  const loadTrainerTeams = async () => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      setLoading(true)
      const { data, error } = await supabase.from('trainer_teams').select('*')

      if (error) throw error

      if (data) {
        const parsed = data.map((tt: any) => ({
          id: tt.id,
          trainerId: tt.trainer_id,
          teamName: tt.team_name,
          format: tt.format,
          isOfficial: tt.is_official,
          pokemons: typeof tt.pokemons === 'string' ? JSON.parse(tt.pokemons) : tt.pokemons,
        }))
        setTrainerTeams(parsed)
      }
    } catch (err: any) {
      console.error('Error loading trainer teams:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addTrainerTeam = async (team: Omit<TrainerTeam, 'id'>) => {
    try {
      const newTeam = {
        trainer_id: team.trainerId,
        team_name: team.teamName,
        format: team.format,
        is_official: team.isOfficial,
        pokemons: JSON.stringify(team.pokemons),
      }

      if (!isSupabaseConfigured) {
        const updatedTeams = [...trainerTeams, { ...team, id: Date.now() }]
        setTrainerTeams(updatedTeams)
        localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(updatedTeams))
        return updatedTeams[updatedTeams.length - 1]
      }

      const { data, error } = await supabase
        .from('trainer_teams')
        .insert([newTeam])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const parsed = {
          id: data[0].id,
          trainerId: data[0].trainer_id,
          teamName: data[0].team_name,
          format: data[0].format,
          isOfficial: data[0].is_official,
          pokemons: typeof data[0].pokemons === 'string' ? JSON.parse(data[0].pokemons) : data[0].pokemons,
        }
        setTrainerTeams(prev => [...prev, parsed])
        return parsed
      }
    } catch (err: any) {
      console.error('Error adding trainer team:', err)
      throw err
    }
  }

  const updateTrainerTeam = async (updated: TrainerTeam) => {
    try {
      if (!updated.id) throw new Error('No trainer team ID provided')

      const teamToUpdate = {
        trainer_id: updated.trainerId,
        team_name: updated.teamName,
        format: updated.format,
        is_official: updated.isOfficial,
        pokemons: JSON.stringify(updated.pokemons),
      }

      if (!isSupabaseConfigured) {
        const updatedTeams = trainerTeams.map(t => (t.id === updated.id ? { ...updated } : t))
        setTrainerTeams(updatedTeams)
        localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(updatedTeams))
        return
      }

      const { data, error } = await supabase
        .from('trainer_teams')
        .update(teamToUpdate)
        .eq('id', updated.id)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const parsed = {
          id: data[0].id,
          trainerId: data[0].trainer_id,
          teamName: data[0].team_name,
          format: data[0].format,
          isOfficial: data[0].is_official,
          pokemons: typeof data[0].pokemons === 'string' ? JSON.parse(data[0].pokemons) : data[0].pokemons,
        }
        setTrainerTeams(prev => prev.map(t => (t.id === updated.id ? parsed : t)))
      }
    } catch (err: any) {
      console.error('Error updating trainer team:', err)
      throw err
    }
  }

  const deleteTrainerTeam = async (id: number) => {
    try {
      if (!isSupabaseConfigured) {
        const updatedTeams = trainerTeams.filter(t => t.id !== id)
        setTrainerTeams(updatedTeams)
        localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(updatedTeams))
        return
      }

      const { error } = await supabase
        .from('trainer_teams')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTrainerTeams(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      console.error('Error deleting trainer team:', err)
      throw err
    }
  }

  return {
    trainerTeams,
    setTrainerTeams,
    loading,
    error,
    isSupabaseConfigured,
    addTrainerTeam,
    updateTrainerTeam,
    deleteTrainerTeam,
    refreshTrainerTeams: loadTrainerTeams,
  }
}
