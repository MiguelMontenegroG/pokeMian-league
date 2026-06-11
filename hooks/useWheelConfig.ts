'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'pokeMianCustomSpinItems'
const CONFIG_ID = 1 // Unica fila en la tabla, siempre ID 1

export interface WheelConfig {
  id: number
  itemIds: number[]
  updatedAt: string
}

export function useWheelConfig() {
  const [config, setConfig] = useState<WheelConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)
  const [lastSavedIds, setLastSavedIds] = useState<number[]>([])

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsSupabaseConfigured(!!url && !!key && url !== 'tu_supabase_url_aqui')
  }, [])

  // Cargar config desde Supabase (con fallback a localStorage)
  const loadConfig = useCallback(async (): Promise<number[]> => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback localStorage
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setConfig({ id: 0, itemIds: parsed, updatedAt: '' })
            return parsed
          }
        }
        return []
      }

      if (!supabase) return []

      // Intentar obtener de Supabase
      const { data, error } = await supabase
        .from('wheel_config')
        .select('*')
        .eq('id', CONFIG_ID)
        .maybeSingle()

      if (error) throw error

      if (data) {
        const loadedConfig: WheelConfig = {
          id: data.id,
          itemIds: data.item_ids || [],
          updatedAt: data.updated_at || '',
        }
        setConfig(loadedConfig)
        // Sincronizar localStorage como respaldo
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedConfig.itemIds))
        return loadedConfig.itemIds
      }

      // Si no hay fila, intentar desde localStorage como migracion
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrar a Supabase
          await saveConfigToSupabase(parsed)
          return parsed
        }
      }

      return []
        } catch (err: any) {
          // Si la tabla no existe en Supabase, ignorar silenciosamente
          const tableNotFoundCodes = ['42P01', 'PGRST205']
          const tableNotFoundMessages = ['relation', 'does not exist', 'Could not find the table', 'schema cache']
          const isTableNotFound = !err || Object.keys(err).length === 0 ||
            tableNotFoundCodes.includes(err?.code) ||
            tableNotFoundMessages.some((msg: string) => err?.message?.includes(msg))
          if (!isTableNotFound) {
            console.error('Error loading wheel config:', err)
          }
          // Fallback a localStorage
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
              const parsed = JSON.parse(saved)
              if (Array.isArray(parsed)) return parsed
            }
          } catch {}
          return []
        } finally {
          setLoading(false)
        }
  }, [isSupabaseConfigured])

  const saveConfigToSupabase = async (itemIds: number[]): Promise<boolean> => {
        if (!supabase) return false
        try {
          const now = new Date().toISOString()
          const { error } = await supabase.from('wheel_config').upsert(
            {
              id: CONFIG_ID,
              item_ids: itemIds,
              updated_at: now,
            },
            { onConflict: 'id' }
          )
          if (error) throw error
          return true
        } catch (err: any) {
          // Si la tabla no existe en Supabase, ignorar silenciosamente
          const tableNotFoundCodes = ['42P01', 'PGRST205']
          const tableNotFoundMessages = ['relation', 'does not exist', 'Could not find the table', 'schema cache']
          const isTableNotFound = !err || Object.keys(err).length === 0 ||
            tableNotFoundCodes.includes(err?.code) ||
            tableNotFoundMessages.some((msg: string) => err?.message?.includes(msg))
          if (!isTableNotFound) {
            console.error('Error saving wheel config to Supabase:', err)
          }
          return false
        }
  }

  // Guardar config (Supabase + localStorage + evento)
  const saveConfig = useCallback(async (itemIds: number[]): Promise<boolean> => {
    try {
      // Siempre guardar en localStorage (respaldo inmediato)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemIds))

      // Guardar en Supabase si configurado
      if (isSupabaseConfigured) {
        await saveConfigToSupabase(itemIds)
      }

      setConfig(prev => prev ? { ...prev, itemIds } : { id: 0, itemIds, updatedAt: new Date().toISOString() })
      setLastSavedIds(itemIds)

      // Disparar evento para actualizar la ruleta en tiempo real
      console.log('[useWheelConfig] Disparando evento spinItemsUpdated con', itemIds.length, 'items')
      window.dispatchEvent(new CustomEvent('spinItemsUpdated', { detail: itemIds }))
      return true
    } catch (err) {
      console.error('Error saving wheel config:', err)
      return false
    }
  }, [isSupabaseConfigured])

  // Limpiar config
  const clearConfig = useCallback(async (): Promise<boolean> => {
    try {
      localStorage.removeItem(STORAGE_KEY)

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('wheel_config')
          .delete()
          .eq('id', CONFIG_ID)
        if (error) throw error
      }

      setConfig(null)
      setLastSavedIds([])
      window.dispatchEvent(new CustomEvent('spinItemsUpdated', { detail: [] }))
      return true
    } catch (err) {
      console.error('Error clearing wheel config:', err)
      return false
    }
  }, [isSupabaseConfigured])

  // Cargar al montar
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    config,
    loading,
    isSupabaseConfigured,
    loadConfig,
    saveConfig,
    clearConfig,
    lastSavedIds,
  }
}
