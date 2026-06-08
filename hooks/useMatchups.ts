'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Matchup {
  id: number
  teamAId: number
  teamBId: number
  winnerTeamId?: number | null
  teamAPokemonAlive: number
  teamBPokemonAlive: number
  roundNumber: number
  played: boolean
  createdAt: string
}

export interface LeagueSettings {
  pokemonPerBattle: number
  totalPokemonPerTeam: number
}

export function useMatchups() {
  const [matchups, setMatchups] = useState<Matchup[]>([])
  const [settings, setSettings] = useState<LeagueSettings>({
    pokemonPerBattle: 6,
    totalPokemonPerTeam: 10
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  // Check if Supabase is configured
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsSupabaseConfigured(!!url && !!key && url !== 'tu_supabase_url_aqui')
  }, [])

  // Load matchups and settings
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    loadMatchups()
    loadSettings()
  }, [isSupabaseConfigured])

  const loadMatchups = async () => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      setLoading(true)
      
      console.log('🔄 Loading matchups from Supabase...')
      const { data, error } = await supabase
        .from('matchups')
        .select('*')
        .order('round_number', { ascending: true })
      
      if (error) {
        console.error('❌ Error loading matchups:', error)
        throw error
      }
      
      console.log('✅ Loaded matchups:', data?.length || 0)
      
      if (data) {
        const parsed = data.map(m => ({
          id: m.id,
          teamAId: m.team_a_id,
          teamBId: m.team_b_id,
          winnerTeamId: m.winner_team_id,
          teamAPokemonAlive: m.team_a_pokemon_alive,
          teamBPokemonAlive: m.team_b_pokemon_alive,
          roundNumber: m.round_number,
          played: m.played,
          createdAt: m.created_at
        }))
        console.log('📦 Parsed matchups:', parsed.length)
        setMatchups(parsed)
      }
    } catch (err: any) {
      console.error('Error loading matchups:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      
      const { data, error } = await supabase
        .from('league_settings')
        .select('*')
      
      if (error) throw error
      
      if (data) {
        const settingsMap: Record<string, any> = {}
        data.forEach(setting => {
          settingsMap[setting.setting_key] = JSON.parse(setting.setting_value as string)
        })
        
        setSettings({
          pokemonPerBattle: settingsMap.pokemon_per_battle || 6,
          totalPokemonPerTeam: settingsMap.total_pokemon_per_team || 10
        })
      }
    } catch (err: any) {
      console.error('Error loading settings:', err)
    }
  }

  const createMatchup = async (matchup: Omit<Matchup, 'id' | 'createdAt'>) => {
    console.log('🟠 CREATE MATCHUP:', matchup)
    try {
      const newMatchup = {
        team_a_id: matchup.teamAId,
        team_b_id: matchup.teamBId,
        winner_team_id: matchup.winnerTeamId ?? null,
        team_a_pokemon_alive: matchup.teamAPokemonAlive,
        team_b_pokemon_alive: matchup.teamBPokemonAlive,
        round_number: matchup.roundNumber,
        played: matchup.played
      }
      
      if (!isSupabaseConfigured) {
        const updatedMatchups = [...matchups, { ...matchup, id: Date.now() }]
        setMatchups(updatedMatchups)
        return updatedMatchups[updatedMatchups.length - 1]
      }
      
      const { data, error } = await supabase
        .from('matchups')
        .insert([newMatchup])
        .select()
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const parsedMatchup: Matchup = {
          id: data[0].id,
          teamAId: data[0].team_a_id,
          teamBId: data[0].team_b_id,
          winnerTeamId: data[0].winner_team_id,
          teamAPokemonAlive: data[0].team_a_pokemon_alive,
          teamBPokemonAlive: data[0].team_b_pokemon_alive,
          roundNumber: data[0].round_number,
          played: data[0].played,
          createdAt: data[0].created_at
        }
        setMatchups(prev => [...prev, parsedMatchup])
        return parsedMatchup
      }
    } catch (err: any) {
      console.error('Error creating matchup:', err)
      throw err
    }
  }

  const updateMatchup = async (updated: Matchup) => {
    console.log('🟡 UPDATE MATCHUP:', updated)
    try {
      if (!updated.id) {
        throw new Error('No matchup ID provided')
      }
      
      const matchupToUpdate = {
        team_a_id: updated.teamAId,
        team_b_id: updated.teamBId,
        winner_team_id: updated.winnerTeamId,
        team_a_pokemon_alive: updated.teamAPokemonAlive,
        team_b_pokemon_alive: updated.teamBPokemonAlive,
        round_number: updated.roundNumber,
        played: updated.played
      }
      
      if (!isSupabaseConfigured) {
        const updatedMatchups = matchups.map(m => 
          m.id === updated.id ? updated : m
        )
        setMatchups(updatedMatchups)
        return
      }
      
      const { data, error } = await supabase
        .from('matchups')
        .update(matchupToUpdate)
        .eq('id', updated.id)
        .select()
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const parsedMatchup: Matchup = {
          id: data[0].id,
          teamAId: data[0].team_a_id,
          teamBId: data[0].team_b_id,
          winnerTeamId: data[0].winner_team_id,
          teamAPokemonAlive: data[0].team_a_pokemon_alive,
          teamBPokemonAlive: data[0].team_b_pokemon_alive,
          roundNumber: data[0].round_number,
          played: data[0].played,
          createdAt: data[0].created_at
        }
        setMatchups(prev => prev.map(m => m.id === updated.id ? parsedMatchup : m))
      }
    } catch (err: any) {
      console.error('Error updating matchup:', err)
      throw err
    }
  }

  const deleteMatchup = async (id: number) => {
    console.log('🔴 DELETE MATCHUP:', id)
    try {
      if (!isSupabaseConfigured) {
        setMatchups(prev => prev.filter(m => m.id !== id))
        return
      }
      
      const { error } = await supabase
        .from('matchups')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setMatchups(prev => prev.filter(m => m.id !== id))
    } catch (err: any) {
      console.error('Error deleting matchup:', err)
      throw err
    }
  }

  const deleteAllMatchups = async () => {
    console.log('🔴 DELETE ALL MATCHUPS')
    try {
      if (!isSupabaseConfigured) {
        setMatchups([])
        return
      }
      
      // Estrategia: Obtener todos los IDs y luego eliminar
      const { data: allMatchups, error: fetchError } = await supabase
        .from('matchups')
        .select('id')
      
      if (fetchError) throw fetchError
      
      if (allMatchups && allMatchups.length > 0) {
        const ids = allMatchups.map(m => m.id)
        
        const { error } = await supabase
          .from('matchups')
          .delete()
          .in('id', ids)
        
        if (error) throw error
      }
      
      setMatchups([])
    } catch (err: any) {
      console.error('Error deleting all matchups:', err)
      throw err
    }
  }

  const bulkCreateMatchups = async (matchupsToCreate: Array<Omit<Matchup, 'id' | 'createdAt'>>) => {
    console.log('🔵 BULK CREATE MATCHUPS:', matchupsToCreate.length)
    try {
      if (!isSupabaseConfigured) {
        const newMatchups = matchupsToCreate.map((m, idx) => ({
          ...m,
          id: Date.now() + idx
        }))
        setMatchups(prev => [...prev, ...newMatchups])
        return newMatchups
      }
      
      const formattedMatchups = matchupsToCreate.map(m => ({
        team_a_id: m.teamAId,
        team_b_id: m.teamBId,
        winner_team_id: m.winnerTeamId ?? null,
        team_a_pokemon_alive: m.teamAPokemonAlive,
        team_b_pokemon_alive: m.teamBPokemonAlive,
        round_number: m.roundNumber,
        played: m.played
      }))
      
      const { data, error } = await supabase
        .from('matchups')
        .insert(formattedMatchups)
        .select()
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const parsedMatchups: Matchup[] = data.map(d => ({
          id: d.id,
          teamAId: d.team_a_id,
          teamBId: d.team_b_id,
          winnerTeamId: d.winner_team_id,
          teamAPokemonAlive: d.team_a_pokemon_alive,
          teamBPokemonAlive: d.team_b_pokemon_alive,
          roundNumber: d.round_number,
          played: d.played,
          createdAt: d.created_at
        }))
        setMatchups(prev => [...prev, ...parsedMatchups])
        return parsedMatchups
      }
    } catch (err: any) {
      console.error('Error bulk creating matchups:', err)
      throw err
    }
  }

  return {
    matchups,
    setMatchups,
    settings,
    loading,
    error,
    isSupabaseConfigured,
    createMatchup,
    updateMatchup,
    deleteMatchup,
    deleteAllMatchups,
    bulkCreateMatchups,
    refreshMatchups: loadMatchups
  }
}
