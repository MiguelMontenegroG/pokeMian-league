'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import defaultItems, { type Item } from '@/data/itemsList'

export function useItemCatalog() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsSupabaseConfigured(!!url && !!key && url !== 'tu_supabase_url_aqui')
  }, [])

  // Cargar items
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fallback a defaultItems + localStorage
      try {
        const saved = localStorage.getItem('pokeMianItemCatalog')
        if (saved) {
          const parsed = JSON.parse(saved) as Item[]
          // Asegurar que todos tengan el campo enabled (retrocompatibilidad)
          const migrated = parsed.map(item => ({ ...item, enabled: item.enabled ?? true }))
          setItems(migrated)
        } else {
          // Primera vez: usar los items por defecto y guardarlos
          const defaultWithEnabled = defaultItems.map(item => ({ ...item, enabled: true }))
          setItems(defaultWithEnabled)
          localStorage.setItem('pokeMianItemCatalog', JSON.stringify(defaultWithEnabled))
        }
      } catch (err) {
        console.error('Error loading item catalog:', err)
        setItems(defaultItems.map(item => ({ ...item, enabled: true })))
      } finally {
        setLoading(false)
      }
      return
    }

    loadItems()
  }, [isSupabaseConfigured])

  const loadItems = async () => {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      setLoading(true)
      const { data, error } = await supabase.from('item_catalog').select('*').order('id')

      if (error) throw error

      // Siempre devolver lo que hay en la BD, sin importar si esta vacio o no
      // Si la BD esta vacia, devolvemos array vacio (no defaultItems)
      if (data && data.length > 0) {
        const parsed = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          rarity: item.rarity as Item['rarity'],
          sprite: item.sprite,
          description: item.description || '',
          enabled: item.enabled ?? true, // Por defecto habilitado
        }))
        setItems(parsed)
      } else {
        // BD vacia con supabase configurado: devolvemos array vacio
        // El administrador debe importar items manualmente
        console.log('No hay items en la base de datos. Usa el panel de administracion para importarlos.')
        setItems([])
      }
    } catch (err: any) {
      console.error('Error loading items:', err)
      setError(err.message)
      // Solo en caso de error de conexion usamos fallback
      setItems(defaultItems.map(item => ({ ...item, enabled: true })))
    } finally {
      setLoading(false)
    }
  }

  // Agregar un item al catálogo
  const addItem = async (item: Omit<Item, 'id'>): Promise<Item | null> => {
    try {
      if (!isSupabaseConfigured) {
        const newItem = { ...item, id: Date.now(), enabled: true }
        const updated = [...items, newItem]
        setItems(updated)
        localStorage.setItem('pokeMianItemCatalog', JSON.stringify(updated))
        return newItem
      }

      const { data, error } = await supabase
        .from('item_catalog')
        .insert([{ name: item.name, rarity: item.rarity, sprite: item.sprite, description: item.description, enabled: true }])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const parsed: Item = {
          id: data[0].id,
          name: data[0].name,
          rarity: data[0].rarity,
          sprite: data[0].sprite,
          description: data[0].description || '',
          enabled: data[0].enabled ?? true,
        }
        setItems(prev => [...prev, parsed])
        return parsed
      }
      return null
    } catch (err: any) {
      console.error('Error adding item:', err)
      throw err
    }
  }

  // Actualizar un item del catálogo
  const updateItem = async (updated: Item): Promise<void> => {
    try {
      if (!isSupabaseConfigured) {
        const updatedList = items.map(i => (i.id === updated.id ? updated : i))
        setItems(updatedList)
        localStorage.setItem('pokeMianItemCatalog', JSON.stringify(updatedList))
        return
      }

      const { error } = await supabase
        .from('item_catalog')
        .update({
          name: updated.name,
          rarity: updated.rarity,
          sprite: updated.sprite,
          description: updated.description,
          enabled: updated.enabled,
        })
        .eq('id', updated.id)

      if (error) throw error

      setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)))
    } catch (err: any) {
      console.error('Error updating item:', err)
      throw err
    }
  }

  // Eliminar un item del catálogo
  const deleteItem = async (id: number): Promise<void> => {
    try {
      if (!isSupabaseConfigured) {
        const updatedList = items.filter(i => i.id !== id)
        setItems(updatedList)
        localStorage.setItem('pokeMianItemCatalog', JSON.stringify(updatedList))
        return
      }

      const { error } = await supabase.from('item_catalog').delete().eq('id', id)

      if (error) throw error

      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err: any) {
      console.error('Error deleting item:', err)
      throw err
    }
  }

  // Importar items desde CSV
  const importFromCSV = async (csvText: string): Promise<{ added: number; errors: string[] }> => {
    const lines = csvText.trim().split('\n')
    const errors: string[] = []
    let added = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Saltar header si existe
      if (i === 0 && line.toLowerCase().includes('name')) continue

      const parts = line.split(',')
      if (parts.length < 3) {
        errors.push(`Linea ${i + 1}: formato invalido (se esperan al menos 3 columnas: name,rarity,sprite)`)
        continue
      }

      const name = parts[0].trim()
      const rarity = parts[1].trim().toLowerCase() as Item['rarity']
      const sprite = parts[2].trim()
      const description = parts[3]?.trim() || ''

      if (!['comun', 'raro', 'epico', 'legendario'].includes(rarity)) {
        errors.push(`Linea ${i + 1}: rareza "${rarity}" invalida. Usar: comun, raro, epico, legendario`)
        continue
      }

      try {
        await addItem({ name, rarity, sprite, description })
        added++
      } catch (err) {
        errors.push(`Linea ${i + 1}: error al agregar "${name}"`)
      }
    }

    return { added, errors }
  }

  return {
    items,
    setItems,
    loading,
    error,
    isSupabaseConfigured,
    addItem,
    updateItem,
    deleteItem,
    importFromCSV,
    refreshItems: loadItems,
  }
}
