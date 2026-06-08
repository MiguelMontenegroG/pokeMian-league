'use client'

import { useState } from 'react'
import type { Team } from '@/app/page'
import type { Matchup } from '@/hooks/useMatchups'
import { generateMatchups, canGenerateMatchups, getMatchupStats } from '@/lib/matchup-generator'

interface Props {
  teams: Team[]
  existingMatchups: Matchup[]
  onGenerate: (matchups: Array<Omit<Matchup, 'id' | 'createdAt'>>) => Promise<void>
  onDelete?: () => Promise<void>
}

export default function GenerateMatchupsButton({ teams, existingMatchups, onGenerate, onDelete }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMatchups, setPreviewMatchups] = useState<Array<{ teamAId: number; teamBId: number; round: number }>>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Verificar si ya existen enfrentamientos
  const hasExistingMatchups = existingMatchups.length > 0
  
  const handleDelete = async () => {
    if (onDelete) {
      await onDelete()
      setShowDeleteConfirm(false)
    }
  }

  // Validar si se puede generar
  const validation = canGenerateMatchups(teams as any)
  
  // Debug logging
  console.log('🔍 GenerateMatchupsButton - Teams count:', teams.length)
  console.log('🔍 Validation result:', validation)
  if (!validation.valid) {
    console.error('❌ Validation failed:', validation.message)
  }

  const handleGenerate = async () => {
    if (!validation.valid) {
      setError(validation.message)
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Generar enfrentamientos
      const generated = generateMatchups(teams as any)
      
      // Convertir al formato esperado
      const formattedMatchups = generated.map(m => ({
        teamAId: m.teamAId,
        teamBId: m.teamBId,
        winnerTeamId: null,
        teamAPokemonAlive: 0,
        teamBPokemonAlive: 0,
        roundNumber: m.round,
        played: false
      }))

      // Guardar en la base de datos
      await onGenerate(formattedMatchups)
      
      setShowPreview(false)
      setPreviewMatchups([])
    } catch (err: any) {
      console.error('Error generating matchups:', err)
      setError(err.message || 'Error al generar enfrentamientos')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = () => {
    if (!validation.valid) {
      setError(validation.message)
      return
    }

    try {
      const generated = generateMatchups(teams as any)
      const stats = getMatchupStats(generated)
      
      setPreviewMatchups(generated)
      setShowPreview(true)
      setError(null)
    } catch (err: any) {
      console.error('Error generating preview:', err)
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Botón principal */}
      {hasExistingMatchups ? (
        <div className="glass-card p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10b981' }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-bold" style={{ color: '#e8eaf6' }}>
              Enfrentamientos Generados
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
            Ya hay {existingMatchups.length} enfrentamientos programados
          </p>
          
          <div className="flex gap-3 justify-center mb-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-2 rounded-xl font-semibold text-sm"
              style={{ 
                background: 'rgba(79,195,247,0.1)',
                color: '#4fc3f7',
                border: '1px solid rgba(79,195,247,0.3)'
              }}
            >
              {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 rounded-xl font-semibold text-sm"
              style={{ 
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)'
              }}
            >
              Eliminar Todo
            </button>
          </div>
          
          <p className="text-xs" style={{ color: '#64748b' }}>
            ⚠️ Esta acción eliminará todos los enfrentamientos permanentemente
          </p>
        </div>
      ) : (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2" style={{ color: '#e8eaf6' }}>
            Generar Enfrentamientos Automáticamente
          </h3>
          <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
            Se crearán todos los enfrentamientos de la fase regular respetando la regla de descanso
          </p>
          
          {/* Info */}
          <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex items-start gap-2" style={{ color: '#93c5fd' }}>
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <div>
                <strong>Regla de descanso:</strong> Un equipo que juega en la Fecha N no puede jugar en la Fecha N+1.
                Esto asegura que todos los equipos tengan al menos una fecha de descanso entre combates.
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={isGenerating || !validation.valid}
              className="flex-1 px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-50"
              style={{ 
                background: 'rgba(79,195,247,0.1)',
                color: '#4fc3f7',
                border: '1px solid rgba(79,195,247,0.3)'
              }}
            >
              Vista Previa
            </button>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !validation.valid}
              className="flex-1 btn-glow py-2 rounded-xl font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {isGenerating ? 'Generando...' : 'Generar Todo'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewMatchups.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-scale">
          <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: 'rgba(79,195,247,0.2)' }}>
              <h3 className="text-xl font-bold" style={{ color: '#e8eaf6' }}>
                Vista Previa de Enfrentamientos
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: '#64748b' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-4">
                <div className="text-2xl font-bold" style={{ color: '#4fc3f7' }}>{previewMatchups.length}</div>
                <div className="text-xs uppercase" style={{ color: '#64748b' }}>Total de Combates</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                  {Math.max(...previewMatchups.map(m => m.round))}
                </div>
                <div className="text-xs uppercase" style={{ color: '#64748b' }}>Fechas Totales</div>
              </div>
            </div>

            {/* Matchups list */}
            <div className="space-y-4">
              {Array.from(new Set(previewMatchups.map(m => m.round)))
                .sort((a, b) => a - b)
                .map(round => (
                  <div key={round}>
                    <div className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: '#64748b' }}>
                      Fecha {round}
                    </div>
                    <div className="space-y-2">
                      {previewMatchups
                        .filter(m => m.round === round)
                        .map((matchup, idx) => {
                          const teamA = teams.find(t => t.id === matchup.teamAId)
                          const teamB = teams.find(t => t.id === matchup.teamBId)
                          
                          if (!teamA || !teamB) return null
                          
                          return (
                            <div
                              key={idx}
                              className="glass-card p-3 text-sm"
                              style={{ background: 'rgba(79,195,247,0.05)' }}
                            >
                              <div className="flex items-center justify-between">
                                <span style={{ color: '#e8eaf6' }}>{teamA.teamName}</span>
                                <span className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(79,195,247,0.1)', color: '#64748b' }}>
                                  VS
                                </span>
                                <span style={{ color: '#e8eaf6' }}>{teamB.teamName}</span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t flex gap-3" style={{ borderColor: 'rgba(79,195,247,0.2)' }}>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 rounded-xl font-semibold"
                style={{ 
                  background: 'rgba(100,116,139,0.1)',
                  color: '#64748b',
                  border: '1px solid rgba(100,116,139,0.3)'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 btn-glow py-2 rounded-xl font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isGenerating ? 'Generando...' : 'Confirmar y Generar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-scale">
          <div className="glass-card max-w-md w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#e8eaf6' }}>Eliminar Enfrentamientos</h3>
                <p className="text-xs" style={{ color: '#64748b' }}>Esta acción no se puede deshacer</p>
              </div>
            </div>

            {/* Warning message */}
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ef4444' }}>
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm" style={{ color: '#fca5a5' }}>
                  <strong>¡ATENCIÓN!</strong> Estás a punto de eliminar {existingMatchups.length} enfrentamientos.
                  Esta acción es permanente y no se puede deshacer.
                  ¿Estás seguro de que quieres continuar?
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold"
                style={{ 
                  background: 'rgba(100,116,139,0.1)',
                  color: '#64748b',
                  border: '1px solid rgba(100,116,139,0.3)'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl font-bold uppercase tracking-wider"
                style={{ 
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.3)'
                }}
              >
                Sí, Eliminar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
