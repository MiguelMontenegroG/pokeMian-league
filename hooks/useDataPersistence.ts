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
}

interface Trainer {
  id: number
  name: string
  favoritePokemon: string
  favoritePokemonImage?: string
  description: string
  badges: Array<{
    name: string
    icon: string
    obtained: boolean
  }>
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
          pokemons: typeof team.pokemons === 'string' ? JSON.parse(team.pokemons) : team.pokemons
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
        pokemons: JSON.stringify(team.pokemons)
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
          ...data[0],
          teamName: data[0].team_name,
          trainerName: data[0].trainer_name,
          gamesPlayed: data[0].games_played,
          pokemons: typeof data[0].pokemons === 'string' 
            ? JSON.parse(data[0].pokemons) 
            : data[0].pokemons
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
    try {
      const calculatedPoints = updated.wins * 3
      const teamToUpdate = {
        ...updated,
        points: calculatedPoints,
        pokemons: JSON.stringify(updated.pokemons)
      }
      
      if (!isSupabaseConfigured) {
        // Fallback to localStorage
        const updatedTeams = teams.map(t => t.id === updated.id ? { ...teamToUpdate, id: updated.id } : t)
        setTeams(updatedTeams)
        localStorage.setItem('pokeMianTeams', JSON.stringify(updatedTeams))
        return
      }
      
      const { error } = await supabase
        .from('teams')
        .update(teamToUpdate)
        .eq('id', updated.id)
      
      if (error) throw error
      
      // Update local state
      const parsedTeam = {
        ...updated,
        points: calculatedPoints,
        pokemons: typeof updated.pokemons === 'string'
          ? JSON.parse(updated.pokemons)
          : updated.pokemons
      }
      setTeams(prev => prev.map(t => t.id === updated.id ? parsedTeam : t))
    } catch (err: any) {
      console.error('Error updating team:', err)
      throw err
    }
  }

  const deleteTeam = async (id: number) => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback to localStorage
        const updatedTeams = teams.filter(t => t.id !== id)
        setTeams(updatedTeams)
        localStorage.setItem('pokeMianTeams', JSON.stringify(updatedTeams))
        return
      }
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setTeams(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      console.error('Error deleting team:', err)
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
          badges: typeof trainer.badges === 'string' ? JSON.parse(trainer.badges) : trainer.badges
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
        badges: JSON.stringify(trainer.badges)
      }
      
      if (!isSupabaseConfigured) {
        // Fallback to localStorage
        const updatedTrainers = [...trainers, { ...newTrainer, id: Date.now() }]
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
          ...data[0],
          favoritePokemon: data[0].favorite_pokemon,
          favoritePokemonImage: data[0].favorite_pokemon_image,
          badges: typeof data[0].badges === 'string'
            ? JSON.parse(data[0].badges)
            : data[0].badges
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
    try {
      // Mapear camelCase a snake_case para Supabase
      const trainerToUpdate = {
        name: updated.name,
        favorite_pokemon: updated.favoritePokemon,
        favorite_pokemon_image: updated.favoritePokemonImage || null,
        description: updated.description || null,
        badges: JSON.stringify(updated.badges)
      }
      
      if (!isSupabaseConfigured) {
        // Fallback to localStorage
        const updatedTrainers = trainers.map(t => t.id === updated.id ? { ...updated } : t)
        setTrainers(updatedTrainers)
        localStorage.setItem('pokeMianTrainers', JSON.stringify(updatedTrainers))
        return
      }
      
      const { error } = await supabase
        .from('trainers')
        .update(trainerToUpdate)
        .eq('id', updated.id)
      
      if (error) throw error
      
      // Update local state
      setTrainers(prev => prev.map(t => t.id === updated.id ? updated : t))
    } catch (err: any) {
      console.error('Error updating trainer:', err)
      throw err
    }
  }

  const deleteTrainer = async (id: number) => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback to localStorage
        const updatedTrainers = trainers.filter(t => t.id !== id)
        setTrainers(updatedTrainers)
        localStorage.setItem('pokeMianTrainers', JSON.stringify(updatedTrainers))
        return
      }
      
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setTrainers(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      console.error('Error deleting trainer:', err)
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
