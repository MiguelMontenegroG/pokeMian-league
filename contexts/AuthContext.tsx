'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginTrainer, logoutTrainer, getActiveTrainerSession, TrainerAuth } from '@/lib/auth'

interface AuthContextType {
  trainer: TrainerAuth | null
  isAdminLoggedIn: boolean
  isLoading: boolean
  loginAsTrainer: (name: string, password: string) => Promise<boolean>
  loginAsAdmin: () => void
  logout: () => void
  logoutAdmin: () => void
  isAnyoneLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [trainer, setTrainer] = useState<TrainerAuth | null>(null)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar sesión al cargar
  useEffect(() => {
    const initAuth = () => {
      try {
        // Verificar sesión de entrenador
        const trainerSession = getActiveTrainerSession()
        if (trainerSession) {
          setTrainer(trainerSession)
        }

        // Verificar sesión de admin (localStorage)
        const adminSession = localStorage.getItem('pokeMianAdminSession')
        if (adminSession === 'true') {
          setIsAdminLoggedIn(true)
        }
      } catch (err) {
        console.error('Error al inicializar auth:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login de entrenador
  const loginAsTrainer = async (name: string, password: string): Promise<boolean> => {
    const result = await loginTrainer(name, password)
    if (result) {
      setTrainer(result)
      return true
    }
    return false
  }

  // Login de admin
  const loginAsAdmin = () => {
    setIsAdminLoggedIn(true)
    localStorage.setItem('pokeMianAdminSession', 'true')
  }

  // Logout general
  const logout = () => {
    logoutTrainer()
    setTrainer(null)
    // No eliminamos admin session aquí, se maneja por separado
  }

  // Logout solo de admin
  const logoutAdmin = () => {
    setIsAdminLoggedIn(false)
    localStorage.removeItem('pokeMianAdminSession')
  }

  // Verificar si alguien está logueado
  const isAnyoneLoggedIn = trainer !== null || isAdminLoggedIn

  const value = {
    trainer,
    isAdminLoggedIn,
    isLoading,
    loginAsTrainer,
    loginAsAdmin,
    logout,
    logoutAdmin,
    isAnyoneLoggedIn
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
