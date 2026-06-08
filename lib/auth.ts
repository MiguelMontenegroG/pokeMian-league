import { supabase } from './supabase'

export interface TrainerAuth {
  id: number
  name: string
  favoritePokemon: string
  favoritePokemonImage?: string
  description: string
  avatarSprite?: number | null
}

/**
 * Login para entrenadores
 * Valida nombre y contraseña contra la base de datos
 */
export async function loginTrainer(name: string, password: string): Promise<TrainerAuth | null> {
  try {
    if (!supabase) {
      console.error('Supabase no está configurado')
      return null
    }

    // Buscar entrenador por nombre y contraseña
    const { data, error } = await supabase
      .from('trainers')
      .select('id, name, favorite_pokemon, favorite_pokemon_image, description, avatar_sprite')
      .eq('name', name)
      .eq('password', password)
      .maybeSingle() // Usar maybeSingle en lugar de single para evitar errores con 0 resultados

    if (error) {
      console.error('Error en login:', error.message)
      return null
    }
    
    if (!data) {
      console.error('Credenciales inválidas: No se encontró el entrenador')
      return null
    }

    // Transformar snake_case a camelCase
    const trainer: TrainerAuth = {
      id: data.id,
      name: data.name,
      favoritePokemon: data.favorite_pokemon,
      favoritePokemonImage: data.favorite_pokemon_image,
      description: data.description,
      avatarSprite: data.avatar_sprite ?? null
    }

    // Guardar sesión en localStorage
    localStorage.setItem('pokeMianTrainerSession', JSON.stringify(trainer))

    console.log('✅ Trainer login exitoso:', trainer.name)
    return trainer
  } catch (err: any) {
    console.error('❌ Error en login de entrenador:', err)
    return null
  }
}

/**
 * Logout de entrenador
 * Elimina la sesión del localStorage
 */
export function logoutTrainer(): void {
  localStorage.removeItem('pokeMianTrainerSession')
  console.log('🚪 Trainer logout completado')
}

/**
 * Verificar si hay una sesión activa
 */
export function getActiveTrainerSession(): TrainerAuth | null {
  try {
    const session = localStorage.getItem('pokeMianTrainerSession')
    if (session) {
      return JSON.parse(session)
    }
    return null
  } catch (err) {
    console.error('Error al leer sesión:', err)
    return null
  }
}

/**
 * Verificar si un entrenador está logueado
 */
export function isTrainerLoggedIn(): boolean {
  return getActiveTrainerSession() !== null
}

/**
 * Obtener el nombre del entrenador logueado
 */
export function getLoggedInTrainerName(): string | null {
  const session = getActiveTrainerSession()
  return session?.name || null
}
