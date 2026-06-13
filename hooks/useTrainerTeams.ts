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
      const tempId = Date.now()
      const optimisticTeam = { ...team, id: tempId }

      // Optimistic update con callback para evitar closure obsoleto
      setTrainerTeams(prev => {
        const updated = [...prev, optimisticTeam]
        localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(updated))
        return updated
      })

      if (!isSupabaseConfigured) {
        return optimisticTeam
      }

      const newTeam = {
        trainer_id: team.trainerId,
        team_name: team.teamName,
        format: team.format,
        is_official: team.isOfficial,
        pokemons: JSON.stringify(team.pokemons),
      }

      const { data, error } = await supabase
        .from('trainer_teams')
        .insert([newTeam])
        .select()

      if (error) {
        console.warn('Supabase insert failed, using optimistic data:', error)
        return optimisticTeam
      }

      if (data && data.length > 0) {
        const parsed = {
          id: data[0].id,
          trainerId: data[0].trainer_id,
          teamName: data[0].team_name,
          format: data[0].format,
          isOfficial: data[0].is_official,
          pokemons: typeof data[0].pokemons === 'string' ? JSON.parse(data[0].pokemons) : data[0].pokemons,
        }
        setTrainerTeams(prev => {
          const synced = prev.map(t => (t.id === tempId ? parsed : t))
          localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(synced))
          return synced
        })
        return parsed
      }

      return optimisticTeam
    } catch (err: any) {
      console.error('Error adding trainer team:', err)
      throw err
    }
  }

  const updateTrainerTeam = async (updated: TrainerTeam) => {
    console.log('[useTrainerTeams] updateTrainerTeam called:', updated.teamName, 'pokemons:', updated.pokemons.length)
    try {
      if (!updated.id) throw new Error('No trainer team ID provided')

      const teamToUpdate = {
        trainer_id: updated.trainerId,
        team_name: updated.teamName,
        format: updated.format,
        is_official: updated.isOfficial,
        pokemons: JSON.stringify(updated.pokemons),
      }

      // Optimistic update con callback para evitar closure obsoleto
      setTrainerTeams(prev => {
        const updatedTeams = prev.map(t => (t.id === updated.id ? { ...updated } : t))
        console.log('[useTrainerTeams] Optimistic update, setting state with', updatedTeams.length, 'teams')
        localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(updatedTeams))
        return updatedTeams
      })

      if (!isSupabaseConfigured) {
        console.log('[useTrainerTeams] No Supabase, saved to localStorage')
        return
      }

      const { data, error } = await supabase
        .from('trainer_teams')
        .update(teamToUpdate)
        .eq('id', updated.id)
        .select()
      console.log('[useTrainerTeams] Supabase response:', { data, error })

      if (error) {
        console.log('[useTrainerTeams] updateTrainerTeam completed (supabase fallback)')
        return
      }

      // Si Supabase devuelve datos, sincronizar
      if (data && data.length > 0) {
        const parsed = {
          id: data[0].id,
          trainerId: data[0].trainer_id,
          teamName: data[0].team_name,
          format: data[0].format,
          isOfficial: data[0].is_official,
          pokemons: typeof data[0].pokemons === 'string' ? JSON.parse(data[0].pokemons) : data[0].pokemons,
        }
        setTrainerTeams(prev => {
          const synced = prev.map(t => (t.id === updated.id ? parsed : t))
          localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(synced))
          return synced
        })
      }
      console.log('[useTrainerTeams] updateTrainerTeam completed successfully')
    } catch (err: any) {
      console.error('Error updating trainer team:', err)
    }
  }

  const deleteTrainerTeam = async (id: number) => {
    try {
      // Optimistic update con callback
      setTrainerTeams(prev => {
        const filtered = prev.filter(t => t.id !== id)
        localStorage.setItem('pokeMianTrainerTeams', JSON.stringify(filtered))
        return filtered
      })

      if (!isSupabaseConfigured) {
        return
      }

      const { error } = await supabase
        .from('trainer_teams')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Supabase delete failed, data already removed from localStorage:', error)
      }
    } catch (err: any) {
      console.error('Error deleting trainer team:', err)
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
