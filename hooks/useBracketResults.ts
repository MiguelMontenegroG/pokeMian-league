'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface BracketResults {
  semi1WinnerId: number | null
  semi2WinnerId: number | null
  finalWinnerId: number | null
}

export function useBracketResults() {
  const [results, setResults] = useState<BracketResults>({
    semi1WinnerId: null,
    semi2WinnerId: null,
    finalWinnerId: null,
  })
  const [loading, setLoading] = useState(true)

  const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'tu_supabase_url_aqui'
  )

  const loadResults = useCallback(async () => {
    try {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('bracket_results')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        console.warn('No bracket_results table found yet:', error.message)
        setLoading(false)
        return
      }

      if (data) {
        setResults({
          semi1WinnerId: data.semi1_winner_id,
          semi2WinnerId: data.semi2_winner_id,
          finalWinnerId: data.final_winner_id,
        })
      }
    } catch (err) {
      console.error('Error loading bracket results:', err)
    } finally {
      setLoading(false)
    }
  }, [isSupabaseConfigured])

  const saveResults = useCallback(async (newResults: BracketResults) => {
    setResults(newResults)

    if (!isSupabaseConfigured) return

    try {
      const { error } = await supabase
        .from('bracket_results')
        .upsert({
          id: 1,
          semi1_winner_id: newResults.semi1WinnerId,
          semi2_winner_id: newResults.semi2WinnerId,
          final_winner_id: newResults.finalWinnerId,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      console.log('Bracket results saved to Supabase:', newResults)
    } catch (err) {
      console.error('Error saving bracket results:', err)
    }
  }, [isSupabaseConfigured])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  return { results, loading, saveResults, loadResults }
}
