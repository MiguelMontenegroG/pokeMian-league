'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
          const loaded = JSON.parse(saved).map((t: any) => ({
            ...t,
            format: t.format || 'league', // Migrar equipos sin formato
          }))
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
