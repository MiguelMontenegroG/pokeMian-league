'use client'

import { useState } from 'react'
import type { Trainer } from '@/components/TrainersView'
import type { SpinRecord } from '@/hooks/useItemSpins'
import type { Item } from '@/data/itemsList'
import { RARITY_COLORS, RARITY_LABELS, RARITY_GLOWS } from '@/data/itemsList'

interface Props {
  trainers: Trainer[]
  spins: SpinRecord[]
  catalogItems: Item[]
  onResetTrainerSpin: (trainerId: number) => Promise<boolean>
  onResetAllSpins: () => Promise<boolean>
  onRefresh: () => void
}

export default function AdminSpinBoost({
  trainers,
  spins,
  catalogItems,
  onResetTrainerSpin,
  onResetAllSpins,
  onRefresh,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmingAll, setConfirmingAll] = useState(false)
  const [confirmingTrainer, setConfirmingTrainer] = useState<number | null>(null)
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const today = new Date().toISOString().split('T')[0]

  // Entrenadores que ya giraron hoy
  const trainersWhoSpunToday = spins
    .filter(s => s.spinDate === today)
    .map(s => s.trainerId)

  const filteredTrainers = trainers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleResetTrainer = async (trainerId: number, trainerName: string) => {
    setConfirmingTrainer(null)
    const success = await onResetTrainerSpin(trainerId)
    if (success) {
      setActionMessage({ text: `Giro extra concedido a ${trainerName}`, type: 'success' })
    } else {
      setActionMessage({ text: `Error al conceder giro a ${trainerName}`, type: 'error' })
    }
    setTimeout(() => setActionMessage(null), 3000)
  }

  const handleResetAll = async () => {
    setConfirmingAll(false)
    const success = await onResetAllSpins()
    if (success) {
      setActionMessage({ text: 'Giro extra concedido a TODOS los entrenadores', type: 'success' })
    } else {
      setActionMessage({ text: 'Error al conceder giro a todos', type: 'error' })
    }
    setTimeout(() => setActionMessage(null), 3000)
  }

  const getTodaySpinForTrainer = (trainerId: number) => {
    return spins.find(s => s.trainerId === trainerId && s.spinDate === today)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            Giros Extra - Ruleta Diaria
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Concede un giro adicional a un entrenador o a todos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(79, 195, 247, 0.1)',
              border: '1px solid rgba(79, 195, 247, 0.3)',
              color: '#4fc3f7',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>

          {/* Boton para dar giro a todos */}
          {!confirmingAll ? (
            <button
              onClick={() => setConfirmingAll(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(245, 158, 11, 0.25)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(245, 158, 11, 0.15)'
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
                <path d="M8 12h8" />
              </svg>
              Dar Giro a Todos
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>
                Dar giro a todos?
              </span>
              <button
                onClick={handleResetAll}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                }}
              >
                Si, Confirmar
              </button>
              <button
                onClick={() => setConfirmingAll(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de accion */}
      {actionMessage && (
        <div
          className="p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-fade-scale"
          style={{
            background: actionMessage.type === 'success'
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${actionMessage.type === 'success'
              ? 'rgba(16, 185, 129, 0.3)'
              : 'rgba(239, 68, 68, 0.3)'}`,
            color: actionMessage.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          {actionMessage.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {actionMessage.text}
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar entrenador..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-12 rounded-xl text-sm font-semibold border outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(79,195,247,0.15)',
            color: '#e8eaf6',
          }}
        />
      </div>

      {/* Resumen */}
      <div className="flex gap-4 flex-wrap">
        <div
          className="px-5 py-3 rounded-xl"
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            {trainersWhoSpunToday.length}
          </p>
          <p className="text-xs font-semibold" style={{ color: '#64748b' }}>
            Entrenadores que ya giraron hoy
          </p>
        </div>
        <div
          className="px-5 py-3 rounded-xl"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
            {trainers.length - trainersWhoSpunToday.length}
          </p>
          <p className="text-xs font-semibold" style={{ color: '#64748b' }}>
            Entrenadores que NO han girado
          </p>
        </div>
      </div>

      {/* Lista de entrenadores */}
      <div className="glass-card overflow-hidden">
        <div
          className="px-6 py-4"
          style={{
            borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
            background: 'rgba(245, 158, 11, 0.03)',
          }}
        >
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#f59e0b' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Entrenadores
          </h3>
        </div>

        {filteredTrainers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#64748b' }}>
              {searchTerm ? 'No se encontraron entrenadores' : 'No hay entrenadores registrados'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(79,195,247,0.05)' }}>
            {filteredTrainers.map(trainer => {
              const hasSpun = trainersWhoSpunToday.includes(trainer.id)
              const todaySpin = getTodaySpinForTrainer(trainer.id)
              const item = todaySpin ? catalogItems.find(i => i.id === todaySpin.itemId) : null
              const isConfirming = confirmingTrainer === trainer.id

              return (
                <div
                  key={trainer.id}
                  className="flex items-center justify-between p-4 px-6 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{
                        background: hasSpun
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${hasSpun
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(16, 185, 129, 0.3)'}`,
                        color: hasSpun ? '#f59e0b' : '#10b981',
                      }}
                    >
                      {trainer.avatarSprite ? (
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${trainer.avatarSprite}.png`}
                          alt={trainer.name}
                          className="w-8 h-8"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        trainer.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-sm" style={{ color: '#e8eaf6' }}>
                        {trainer.name}
                      </p>
                      <p className="text-xs flex items-center gap-2" style={{ color: '#64748b' }}>
                        {hasSpun ? (
                          <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            Ya giro hoy
                          </span>
                        ) : (
                          <span className="flex items-center gap-1" style={{ color: '#10b981' }}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            No ha girado hoy
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Item que obtuvo si ya giro */}
                    {item && (
                      <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-lg" style={{
                        background: `${RARITY_COLORS[item.rarity]}10`,
                        border: `1px solid ${RARITY_COLORS[item.rarity]}20`,
                      }}>
                        <img
                          src={item.sprite}
                          alt={item.name}
                          className="w-6 h-6"
                          style={{
                            imageRendering: 'pixelated',
                            filter: `drop-shadow(0 0 4px ${RARITY_GLOWS[item.rarity]})`,
                          }}
                        />
                        <span className="text-xs font-semibold" style={{ color: RARITY_COLORS[item.rarity] }}>
                          {item.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {hasSpun ? (
                      !isConfirming ? (
                        <button
                          onClick={() => setConfirmingTrainer(trainer.id)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                          style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#f59e0b',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(245, 158, 11, 0.2)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(245, 158, 11, 0.1)'
                          }}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                            <path d="M8 12h8" />
                          </svg>
                          Dar Giro Extra
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold" style={{ color: '#ef4444' }}>
                            Confirmar?
                          </span>
                          <button
                            onClick={() => handleResetTrainer(trainer.id, trainer.name)}
                            className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#ef4444',
                            }}
                          >
                            Si
                          </button>
                          <button
                            onClick={() => setConfirmingTrainer(null)}
                            className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#94a3b8',
                            }}
                          >
                            No
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs font-semibold px-4" style={{ color: '#475569' }}>
                        No necesita giro extra
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Informacion adicional */}
      <div
        className="p-5 rounded-xl"
        style={{
          background: 'rgba(79, 195, 247, 0.05)',
          border: '1px solid rgba(79, 195, 247, 0.15)',
        }}
      >
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: '#4fc3f7' }}>
              Como funciona?
            </p>
            <p className="text-xs" style={{ color: '#64748b' }}>
              Al dar un giro extra, se elimina el registro del giro de hoy de ese entrenador,
              permitiendole volver a girar la ruleta. Esto es util para eventos especiales,
              torneos o compensaciones. El entrenador podra girar nuevamente al abrir la ruleta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
