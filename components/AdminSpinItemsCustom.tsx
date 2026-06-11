'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Item } from '@/data/itemsList'
import { RARITY_COLORS, RARITY_LABELS, RARITY_GLOWS } from '@/data/itemsList'

interface Props {
  catalogItems: Item[]
  onSave: (selectedItems: number[]) => void
  onClear: () => void
  currentSelection: number[]
}

const MAX_SLOTS = 25

export default function AdminSpinItemsCustom({
  catalogItems,
  onSave,
  onClear,
  currentSelection,
}: Props) {
  const [slots, setSlots] = useState<number[]>(() => {
    // Si currentSelection tiene datos, usarlos
    // Si no, precargar 25 slots vacios
    if (currentSelection.length > 0) return [...currentSelection]
    return Array(MAX_SLOTS).fill(-1)
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)
  const [rarityFilter, setRarityFilter] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  // Cuando cambia currentSelection desde fuera, actualizar slots
  useEffect(() => {
    setSlots(currentSelection)
  }, [currentSelection])

  const filteredItems = useMemo(() => {
    let result = catalogItems.filter(i => i.enabled !== false)
    if (rarityFilter) {
      result = result.filter(i => i.rarity === rarityFilter)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(i => i.name.toLowerCase().includes(term))
    }
    return result
  }, [catalogItems, searchTerm, rarityFilter])

  const assignItemToSlot = (slotIndex: number, itemId: number) => {
    const newSlots = [...slots]
    // Si el slotIndex ya existe, lo reemplazamos
    // Si es mayor que el array, rellenamos con -1 (vacio)
    while (newSlots.length <= slotIndex) {
      newSlots.push(-1)
    }
    newSlots[slotIndex] = itemId
    setSlots(newSlots)
  }

  const removeSlot = (slotIndex: number) => {
    const newSlots = [...slots]
    newSlots[slotIndex] = -1
    setSlots(newSlots)
  }

  const addEmptySlot = () => {
    if (slots.length >= MAX_SLOTS) return
    setSlots([...slots, -1])
  }

  const fillAllWithItem = (itemId: number) => {
    setSlots(Array(MAX_SLOTS).fill(itemId))
  }

  // Funcion para randomizar los slots con items habilitados aleatoriamente
  const randomizeSlots = () => {
    const enabledItems = catalogItems.filter(i => i.enabled !== false)
    if (enabledItems.length === 0) return
    const randomized = Array.from({ length: MAX_SLOTS }, () => {
      const randomIndex = Math.floor(Math.random() * enabledItems.length)
      return enabledItems[randomIndex].id
    })
    setSlots(randomized)
  }

  const getItemById = (id: number): Item | undefined => {
    return catalogItems.find(i => i.id === id)
  }

  const filledSlots = slots.filter(s => s !== -1).length
  const isEmpty = slots.length === 0 || slots.every(s => s === -1)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            Personalizar Items de la Ruleta
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Elige exactamente que items aparecen en la ruleta ({filledSlots}/{MAX_SLOTS} slots ocupados)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedMessage && (
            <span
              className="text-sm font-semibold animate-fade-up"
              style={{ color: '#10b981' }}
            >
              {savedMessage}
            </span>
          )}
          <button
            onClick={randomizeSlots}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(79, 195, 247, 0.1)',
              border: '1px solid rgba(79, 195, 247, 0.3)',
              color: '#4fc3f7',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(79, 195, 247, 0.2)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(79, 195, 247, 0.1)'
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
            Randomizar
          </button>
          <button
            onClick={() => {
              setSlots([])
              onClear()
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.2)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Usar Ruleta Normal
          </button>
          <button
            onClick={() => {
              onSave(slots)
              setSavedMessage('Configuracion guardada correctamente')
              setTimeout(() => setSavedMessage(null), 3000)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
            }}
            disabled={slots.length === 0}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.25)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.15)'
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar Configuracion
          </button>
        </div>
      </div>

      {/* Accion rapida: llenar todos con un item */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
            Accion Rapida: Llenar los {MAX_SLOTS} slots con un solo item
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar item para llenar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs border outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(79,195,247,0.2)',
                color: '#e8eaf6',
                width: '200px',
              }}
            />
          </div>
        </div>
        {searchTerm && (
          <div className="mt-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {filteredItems.slice(0, 10).map(item => (
              <button
                key={item.id}
                onClick={() => fillAllWithItem(item.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: `${RARITY_COLORS[item.rarity]}15`,
                  border: `1px solid ${RARITY_COLORS[item.rarity]}30`,
                  color: RARITY_COLORS[item.rarity],
                }}
              >
                <img src={item.sprite} alt="" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} />
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: slots de la ruleta */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
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
                <path d="M12 6v6l4 2" />
              </svg>
              Slots de la Ruleta ({filledSlots}/{MAX_SLOTS})
            </h3>
          </div>

          <div className="p-4">
            {slots.every(s => s === -1) ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: '#64748b' }}>
                  Todos los slots estan vacios. Selecciona un slot y luego un item del catalogo.
                </p>
                <p className="text-xs mt-2" style={{ color: '#475569' }}>
                  Sin configuracion personalizada, la ruleta usara la seleccion automatica diaria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {slots.map((itemId, index) => {
                  const item = getItemById(itemId)
                  return (
                    <div
                      key={index}
                      className={`relative rounded-xl p-2 transition-all cursor-pointer ${
                        selectedSlotIndex === index ? 'ring-2 ring-offset-1 ring-offset-gray-900' : ''
                      }`}
                      style={{
                        background: item
                          ? `linear-gradient(135deg, ${RARITY_COLORS[item.rarity]}20, transparent)`
                          : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${
                          item
                            ? `${RARITY_COLORS[item.rarity]}30`
                            : 'rgba(255,255,255,0.08)'
                        }`,
                        outline: selectedSlotIndex === index
                          ? `2px solid ${item ? RARITY_COLORS[item.rarity] : '#4fc3f7'}`
                          : 'none',
                      }}
                      onClick={() => setSelectedSlotIndex(index)}
                    >
                      <span
                        className="absolute top-1 left-1 text-[9px] font-bold px-1 rounded"
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          color: '#94a3b8',
                        }}
                      >
                        #{index + 1}
                      </span>

                      {item ? (
                        <>
                          <div className="flex justify-center pt-4 pb-1">
                            <img
                              src={item.sprite}
                              alt={item.name}
                              className="w-10 h-10"
                              style={{
                                imageRendering: 'pixelated',
                                filter: `drop-shadow(0 0 6px ${RARITY_GLOWS[item.rarity]})`,
                              }}
                            />
                          </div>
                          <p
                            className="text-[10px] font-semibold text-center truncate"
                            style={{ color: RARITY_COLORS[item.rarity] }}
                          >
                            {item.name}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSlot(index)
                            }}
                            className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              background: 'rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                            }}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span className="text-[9px]" style={{ color: '#475569' }}>Vacio</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {slots.length < MAX_SLOTS && (
              <button
                onClick={addEmptySlot}
                className="w-full mt-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  background: 'rgba(79, 195, 247, 0.05)',
                  border: '1px dashed rgba(79, 195, 247, 0.3)',
                  color: '#4fc3f7',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(79, 195, 247, 0.1)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(79, 195, 247, 0.05)'
                }}
              >
                + Anadir Slot ({MAX_SLOTS - slots.length} disponibles)
              </button>
            )}
          </div>
        </div>

        {/* Panel derecho: catalogo de items */}
        <div className="glass-card overflow-hidden">
          <div
            className="px-4 py-3"
            style={{
              borderBottom: '1px solid rgba(79, 195, 247, 0.1)',
              background: 'rgba(79, 195, 247, 0.03)',
            }}
          >
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#4fc3f7' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Catalogo de Items
            </h3>

            {/* Filtro de rareza */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[null, 'comun', 'raro', 'epico', 'legendario'].map(r => (
                <button
                  key={r || 'todas'}
                  onClick={() => setRarityFilter(r)}
                  className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: rarityFilter === r
                      ? `${r ? RARITY_COLORS[r as keyof typeof RARITY_COLORS] : '#4fc3f7'}20`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${
                      rarityFilter === r
                        ? `${r ? RARITY_COLORS[r as keyof typeof RARITY_COLORS] : '#4fc3f7'}40`
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    color: rarityFilter === r
                      ? `${r ? RARITY_COLORS[r as keyof typeof RARITY_COLORS] : '#4fc3f7'}`
                      : '#64748b',
                  }}
                >
                  {r ? RARITY_LABELS[r as keyof typeof RARITY_LABELS] : 'Todas'}
                </button>
              ))}
            </div>

            {/* Buscador */}
            <div className="relative mt-2">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3"
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
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(79,195,247,0.15)',
                  color: '#e8eaf6',
                }}
              />
            </div>
          </div>

          <div className="p-2 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs" style={{ color: '#64748b' }}>No se encontraron items</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (selectedSlotIndex !== null && selectedSlotIndex < MAX_SLOTS) {
                        assignItemToSlot(selectedSlotIndex, item.id)
                        setSelectedSlotIndex(null)
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left"
                    style={{
                      background: selectedSlotIndex !== null ? `${RARITY_COLORS[item.rarity]}08` : 'transparent',
                      border: `1px solid transparent`,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${RARITY_COLORS[item.rarity]}12`
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = selectedSlotIndex !== null ? `${RARITY_COLORS[item.rarity]}08` : 'transparent'
                    }}
                  >
                    <img
                      src={item.sprite}
                      alt={item.name}
                      className="w-8 h-8 flex-shrink-0"
                      style={{
                        imageRendering: 'pixelated',
                        filter: `drop-shadow(0 0 4px ${RARITY_GLOWS[item.rarity]})`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#e8eaf6' }}>
                        {item.name}
                      </p>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: RARITY_COLORS[item.rarity] }}
                      >
                        {RARITY_LABELS[item.rarity]}
                      </span>
                    </div>
                    {selectedSlotIndex !== null && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          background: `${RARITY_COLORS[item.rarity]}20`,
                          color: RARITY_COLORS[item.rarity],
                        }}
                      >
                        Slot #{selectedSlotIndex + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vista previa de la configuracion actual */}
      {!isEmpty && (
        <div
          className="p-4 rounded-xl"
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
                Resumen de la Configuracion
              </p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                {filledSlots} slots ocupados de {MAX_SLOTS}. 
                {slots.some((id, i) => id !== -1 && slots.indexOf(id) !== i) && (
                  <span style={{ color: '#f59e0b' }}> Hay items repetidos en la ruleta.</span>
                )}
                {filledSlots > 0 && filledSlots < 3 && (
                  <span style={{ color: '#ef4444' }}> Muy pocos slots. La ruleta funciona mejor con al menos 3.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
