'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RARITY_WEIGHTS } from '@/data/itemsList'
import type { Item } from '@/data/itemsList'

export interface SpinRecord {
  id: number
  trainerId: number
  itemId: number
  spinDate: string
  delivered: boolean
  deliveredAt: string | null
  item?: Item // Joined item data
  trainerName?: string // Joined trainer name
}

export function useItemSpins() {
  const [spins, setSpins] = useState<SpinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsSupabaseConfigured(!!url && !!key && url !== 'tu_supabase_url_aqui')
  }, [])

  // Cargar todos los spins (para admin)
  const loadSpins = useCallback(async () => {
    try {
      setLoading(true)

      if (!isSupabaseConfigured) {
        // Fallback localStorage
        const saved = localStorage.getItem('pokeMianItemSpins')
        if (saved) {
          setSpins(JSON.parse(saved))
        }
        setLoading(false)
        return
      }

      if (!supabase) throw new Error('Supabase not configured')

      const { data, error } = await supabase
        .from('item_spins')
        .select('*, trainers(name)')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const parsed: SpinRecord[] = data.map((s: any) => ({
          id: s.id,
          trainerId: s.trainer_id,
          itemId: s.item_id,
          spinDate: s.spin_date,
          delivered: s.delivered,
          deliveredAt: s.delivered_at,
          trainerName: s.trainers?.name || 'Desconocido',
        }))
        setSpins(parsed)
      }
    } catch (err: any) {
      console.error('Error loading spins:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isSupabaseConfigured])

  useEffect(() => {
    loadSpins()
  }, [loadSpins])

  // Verificar si un entrenador ya giró hoy
  const hasSpunToday = async (trainerId: number): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('pokeMianItemSpins')
      if (saved) {
        const allSpins = JSON.parse(saved) as SpinRecord[]
        return allSpins.some(s => s.trainerId === trainerId && s.spinDate === today)
      }
      return false
    }

    try {
      if (!supabase) return false
      const { data, error } = await supabase
        .from('item_spins')
        .select('id')
        .eq('trainer_id', trainerId)
        .eq('spin_date', today)
        .maybeSingle()

      if (error) throw error
      return !!data
    } catch (err) {
      console.error('Error checking daily spin:', err)
      return false
    }
  }

  // Obtener el item que un entrenador ya giró hoy (si existe)
  const getTodaySpin = async (trainerId: number): Promise<{ item: Item; delivered: boolean } | null> => {
    const today = new Date().toISOString().split('T')[0]

    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('pokeMianItemSpins')
      const catalog = localStorage.getItem('pokeMianItemCatalog')
      if (saved && catalog) {
        const allSpins = JSON.parse(saved) as SpinRecord[]
        const todaySpin = allSpins.find(s => s.trainerId === trainerId && s.spinDate === today)
        if (todaySpin) {
          const allItems = JSON.parse(catalog) as Item[]
          const item = allItems.find(i => i.id === todaySpin.itemId)
          if (item) return { item, delivered: todaySpin.delivered }
        }
      }
      return null
    }

    try {
      if (!supabase) return null
      const { data, error } = await supabase
        .from('item_spins')
        .select('*, item_catalog(*)')
        .eq('trainer_id', trainerId)
        .eq('spin_date', today)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const itemData = data.item_catalog as any
      const item: Item = {
        id: itemData.id,
        name: itemData.name,
        rarity: itemData.rarity,
        sprite: itemData.sprite,
        description: itemData.description || '',
        enabled: itemData.enabled ?? true,
      }
      return { item, delivered: data.delivered }
    } catch (err) {
      console.error('Error getting today spin:', err)
      return null
    }
  }

  // Realizar un giro (seleccionar item por probabilidad ponderada)
  const performSpin = (items: Item[]): Item => {
    // Calcular total de pesos
    const totalWeight = items.reduce((sum, item) => sum + RARITY_WEIGHTS[item.rarity], 0)
    let random = Math.random() * totalWeight

    // Seleccionar item basado en peso
    for (const item of items) {
      random -= RARITY_WEIGHTS[item.rarity]
      if (random <= 0) return item
    }

    // Fallback: último item
    return items[items.length - 1]
  }

  // Guardar un spin en la base de datos
  const saveSpin = async (trainerId: number, itemId: number): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0]

    try {
      if (!isSupabaseConfigured) {
        const saved = localStorage.getItem('pokeMianItemSpins')
        const allSpins = saved ? JSON.parse(saved) : []
        const newSpin: SpinRecord = {
          id: Date.now(),
          trainerId,
          itemId,
          spinDate: today,
          delivered: false,
          deliveredAt: null,
        }
        const updated = [newSpin, ...allSpins]
        setSpins(updated)
        localStorage.setItem('pokeMianItemSpins', JSON.stringify(updated))
        return true
      }

      if (!supabase) return false

      const { error } = await supabase.from('item_spins').insert([
        {
          trainer_id: trainerId,
          item_id: itemId,
          spin_date: today,
          delivered: false,
        },
      ])

      if (error) throw error

      // Recargar spins
      await loadSpins()
      return true
    } catch (err) {
      console.error('Error saving spin:', err)
      return false
    }
  }

  // Marcar un spin como entregado (admin)
  const markAsDelivered = async (spinId: number): Promise<void> => {
    try {
      if (!isSupabaseConfigured) {
        const updated = spins.map(s =>
          s.id === spinId
            ? { ...s, delivered: true, deliveredAt: new Date().toISOString() }
            : s
        )
        setSpins(updated)
        localStorage.setItem('pokeMianItemSpins', JSON.stringify(updated))
        return
      }

      if (!supabase) return

      const { error } = await supabase
        .from('item_spins')
        .update({ delivered: true, delivered_at: new Date().toISOString() })
        .eq('id', spinId)

      if (error) throw error

      setSpins(prev =>
        prev.map(s =>
          s.id === spinId ? { ...s, delivered: true, deliveredAt: new Date().toISOString() } : s
        )
      )
    } catch (err) {
      console.error('Error marking spin as delivered:', err)
      throw err
    }
  }

  // Resetear el giro de hoy de un entrenador (permite girar otra vez)
  const resetTodaySpin = async (trainerId: number): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0]

    try {
      if (!isSupabaseConfigured) {
        const saved = localStorage.getItem('pokeMianItemSpins')
        if (saved) {
          const allSpins = JSON.parse(saved) as SpinRecord[]
          const filtered = allSpins.filter(
            s => !(s.trainerId === trainerId && s.spinDate === today)
          )
          setSpins(filtered)
          localStorage.setItem('pokeMianItemSpins', JSON.stringify(filtered))
        }
        return true
      }

      if (!supabase) return false

      const { error } = await supabase
        .from('item_spins')
        .delete()
        .eq('trainer_id', trainerId)
        .eq('spin_date', today)

      if (error) throw error

      // Recargar spins
      await loadSpins()
      return true
    } catch (err) {
      console.error('Error resetting today spin:', err)
      return false
    }
  }

  // Resetear el giro de hoy de TODOS los entrenadores
  const resetAllTodaySpins = async (): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0]

    try {
      if (!isSupabaseConfigured) {
        const saved = localStorage.getItem('pokeMianItemSpins')
        if (saved) {
          const allSpins = JSON.parse(saved) as SpinRecord[]
          const filtered = allSpins.filter(s => s.spinDate !== today)
          setSpins(filtered)
          localStorage.setItem('pokeMianItemSpins', JSON.stringify(filtered))
        }
        return true
      }

      if (!supabase) return false

      const { error } = await supabase
        .from('item_spins')
        .delete()
        .eq('spin_date', today)

      if (error) throw error

      // Recargar spins
      await loadSpins()
      return true
    } catch (err) {
      console.error('Error resetting all today spins:', err)
      return false
    }
  }

  // Marcar como no entregado (deshacer)
  const markAsUndelivered = async (spinId: number): Promise<void> => {
    try {
      if (!isSupabaseConfigured) {
        const updated = spins.map(s =>
          s.id === spinId ? { ...s, delivered: false, deliveredAt: null } : s
        )
        setSpins(updated)
        localStorage.setItem('pokeMianItemSpins', JSON.stringify(updated))
        return
      }

      if (!supabase) return

      const { error } = await supabase
        .from('item_spins')
        .update({ delivered: false, delivered_at: null })
        .eq('id', spinId)

      if (error) throw error

      setSpins(prev =>
        prev.map(s =>
          s.id === spinId ? { ...s, delivered: false, deliveredAt: null } : s
        )
      )
    } catch (err) {
      console.error('Error marking spin as undelivered:', err)
      throw err
    }
  }

  return {
    spins,
    setSpins,
    loading,
    error,
    isSupabaseConfigured,
    hasSpunToday,
    getTodaySpin,
    performSpin,
    saveSpin,
    markAsDelivered,
    markAsUndelivered,
    resetTodaySpin,
    resetAllTodaySpins,
    refreshSpins: loadSpins,
  }
}
