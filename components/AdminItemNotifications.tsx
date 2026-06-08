'use client'

import type { SpinRecord } from '@/hooks/useItemSpins'
import type { Item } from '@/data/itemsList'
import { RARITY_COLORS, RARITY_LABELS, RARITY_GLOWS } from '@/data/itemsList'

interface Props {
  spins: SpinRecord[]
  items: Item[]
  onMarkDelivered: (spinId: number) => Promise<void>
  onMarkUndelivered: (spinId: number) => Promise<void>
  onRefresh: () => void
}

export default function AdminItemNotifications({ spins, items, onMarkDelivered, onMarkUndelivered, onRefresh }: Props) {
  const pendingSpins = spins.filter(s => !s.delivered)
  const deliveredSpins = spins.filter(s => s.delivered)

  const getItemById = (itemId: number): Item | undefined => {
    return items.find(i => i.id === itemId)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            Items Pendientes
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {pendingSpins.length} items por entregar
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
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
      </div>

      {/* Pendientes */}
      {pendingSpins.length > 0 ? (
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Pendientes de Entrega ({pendingSpins.length})
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(79,195,247,0.05)' }}>
            {pendingSpins.map((spin, index) => {
              const item = getItemById(spin.itemId)
              return (
                <div
                  key={spin.id}
                  className="flex items-center justify-between p-4 px-6 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {item ? (
                      <img
                        src={item.sprite}
                        alt={item.name}
                        className="w-10 h-10"
                        style={{
                          imageRendering: 'pixelated',
                          filter: `drop-shadow(0 0 8px ${RARITY_GLOWS[item.rarity]})`,
                        }}
                        onError={e => {
                          (e.currentTarget as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        <span className="text-lg">?</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#e8eaf6' }}>
                        {spin.trainerName || `Entrenador #${spin.trainerId}`}
                      </p>
                      <p className="text-xs flex items-center gap-2" style={{ color: '#64748b' }}>
                        {item ? (
                          <>
                            <span style={{ color: RARITY_COLORS[item.rarity], fontWeight: 700 }}>
                              {item.name}
                            </span>
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                background: `${RARITY_COLORS[item.rarity]}15`,
                                color: RARITY_COLORS[item.rarity],
                              }}
                            >
                              {RARITY_LABELS[item.rarity]}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#ef4444' }}>Item eliminado del catalogo</span>
                        )}
                      </p>
                      <p className="text-[10px]" style={{ color: '#475569' }}>
                        {new Date(spin.spinDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await onMarkDelivered(spin.id)
                      } catch (err) {
                        console.error('Error:', err)
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Entregado
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16, 185, 129, 0.1)' }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="text-xl font-bold mb-2" style={{ color: '#e8eaf6' }}>
            No hay items pendientes
          </p>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Todos los items han sido entregados
          </p>
        </div>
      )}

      {/* Historial de entregados */}
      {deliveredSpins.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(79,195,247,0.08)' }}>
            <h3 className="text-lg font-bold" style={{ color: '#64748b' }}>
              Historial de Entregas ({deliveredSpins.length})
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(79,195,247,0.03)' }}>
            {deliveredSpins.slice(0, 20).map((spin, index) => {
              const item = getItemById(spin.itemId)
              return (
                <div
                  key={spin.id}
                  className="flex items-center justify-between p-3 px-6 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item && (
                      <img
                        src={item.sprite}
                        alt={item.name}
                        className="w-8 h-8"
                        style={{
                          imageRendering: 'pixelated',
                          opacity: 0.6,
                        }}
                        onError={e => {
                          (e.currentTarget as HTMLElement).style.display = 'none'
                        }}
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
                        {spin.trainerName || `Entrenador #${spin.trainerId}`}
                      </p>
                      <p className="text-xs" style={{ color: '#475569' }}>
                        {item?.name || 'Item desconocido'} - {new Date(spin.spinDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await onMarkUndelivered(spin.id)
                      } catch (err) {
                        console.error('Error:', err)
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      opacity: 0.6,
                    }}
                    title="Desmarcar como entregado"
                  >
                    Deshacer
                  </button>
                </div>
              )
            })}
            {deliveredSpins.length > 20 && (
              <div className="p-4 text-center">
                <p className="text-xs" style={{ color: '#475569' }}>
                  Mostrando los ultimos 20 de {deliveredSpins.length} entregados
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
