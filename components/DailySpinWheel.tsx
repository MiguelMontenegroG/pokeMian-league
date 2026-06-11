'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { Item } from '@/data/itemsList'
import { RARITY_COLORS, RARITY_GLOWS, RARITY_LABELS } from '@/data/itemsList'

interface Props {
  items: Item[]
  trainerId: number
  trainerName: string
  hasSpunToday: boolean
  todayItem: { item: Item; delivered: boolean } | null
  customItemIds?: number[] // IDs de items personalizados por el admin (opcional)
  onSpin: (item: Item) => Promise<boolean>
  onClose: () => void
}

const SPIN_DURATION_MS = 6000
const PI = Math.PI
const TAU = 2 * PI

// Generador pseudoaleatorio deterministico basado en un seed (string)
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const chr = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return () => {
    hash = (hash * 1103515245 + 12345) | 0
    return (hash >>> 0) / 4294967296
  }
}

// Fisher-Yates shuffle DETERMINISTA: mismo seed produce mismo orden
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const rng = seededRandom(seed)
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function DailySpinWheel({
  items,
  trainerId,
  trainerName,
  hasSpunToday,
  todayItem,
  customItemIds,
  onSpin,
  onClose,
}: Props) {
  const [spinning, setSpinning] = useState(false)
  const [resultItem, setResultItem] = useState<Item | null>(todayItem?.item || null)
  const [showResult, setShowResult] = useState(!!todayItem)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentRotationRef = useRef(0)
  const animationRef = useRef<number>(0)
  const [rotation, setRotation] = useState(0)

  const dailySeed = useMemo(() => {
    const today = new Date()
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  }, [])

  // Usar items personalizados del admin, o la seleccion automatica diaria
  const displayItems = useMemo(() => {
    // Si hay configuracion personalizada, usarla directamente
    if (customItemIds && customItemIds.length > 0) {
      const customItems = customItemIds
        .map(id => items.find(i => i.id === id))
        .filter((i): i is Item => i !== undefined)
      // Si hay al menos 1 item valido, usarlos; si no, usar logica normal
      if (customItems.length > 0) return customItems
    }

    // Logica normal: seleccion diaria determinista
    const enabledItems = items.filter(i => i.enabled !== false)

    // Separar por rareza
    const legendary = enabledItems.filter(i => i.rarity === 'legendario')
    const epic = enabledItems.filter(i => i.rarity === 'epico')
    const rare = enabledItems.filter(i => i.rarity === 'raro')
    const common = enabledItems.filter(i => i.rarity === 'comun')

    // Queremos 3 legendarios, 5 epicos, 7 raros, 10 comunes = 25
    const selectedLegendary = seededShuffle(legendary, dailySeed + '-legendary').slice(0, 3)
    const selectedEpic = seededShuffle(epic, dailySeed + '-epic').slice(0, 5)
    const selectedRare = seededShuffle(rare, dailySeed + '-rare').slice(0, 7)
    const selectedCommon = seededShuffle(common, dailySeed + '-common').slice(0, 10)

    const combined = [...selectedLegendary, ...selectedEpic, ...selectedRare, ...selectedCommon]
    return seededShuffle(combined, dailySeed + '-order') // Mezclar todo junto para orden aleatorio
  }, [items, dailySeed])

  // Segmentos: los 25 items mezclados
  const segments = useMemo(() => {
    return displayItems.map(item => ({
      label: item.name,
      color: RARITY_COLORS[item.rarity],
      rarity: item.rarity,
      itemId: item.id,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayItems, dailySeed])

  const segAngle = TAU / segments.length

  // Dibujar rueda en canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = canvas.offsetWidth
    if (size === 0) return
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 2

    ctx.clearRect(0, 0, size, size)

    segments.forEach((seg, i) => {
      const startAngle = currentRotationRef.current + i * segAngle
      const endAngle = startAngle + segAngle

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()

      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Texto mas centrado para que se vea mejor
      const textAngle = startAngle + segAngle / 2
      const textRadius = radius * 0.6
      const tx = cx + Math.cos(textAngle) * textRadius
      const ty = cy + Math.sin(textAngle) * textRadius

      ctx.save()
      ctx.translate(tx, ty)
      ctx.rotate(textAngle)

      // Fuente mas grande, con 25 segmentos hay espacio suficiente
      const fontSize = Math.min(11, radius * 0.085)
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.9)'
      ctx.shadowBlur = 5

      // Acortar a 9 caracteres maximo
      const label = seg.label.length > 9 ? seg.label.slice(0, 8) + '.' : seg.label
      ctx.fillText(label, 0, 0)
      ctx.restore()
    })

    // Borde exterior
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, TAU)
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Circulo central mas peque?o para dejar mas espacio
    const centerRadius = Math.max(20, Math.min(26, radius * 0.12))
    ctx.beginPath()
    ctx.arc(cx, cy, centerRadius, 0, TAU)
    ctx.fillStyle = '#0d1220'
    ctx.fill()
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.4)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Flecha central
    ctx.save()
    ctx.fillStyle = '#4fc3f7'
    const arrowSize = Math.max(5, centerRadius * 0.3)
    ctx.beginPath()
    ctx.moveTo(cx - arrowSize * 0.8, cy - arrowSize * 0.8)
    ctx.lineTo(cx + arrowSize * 0.8, cy - arrowSize * 0.8)
    ctx.lineTo(cx, cy - arrowSize * 0.15)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx - arrowSize * 0.8, cy + arrowSize * 0.8)
    ctx.lineTo(cx + arrowSize * 0.8, cy + arrowSize * 0.8)
    ctx.lineTo(cx, cy + arrowSize * 0.15)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx + arrowSize * 0.8, cy - arrowSize * 0.8)
    ctx.lineTo(cx + arrowSize * 0.8, cy + arrowSize * 0.8)
    ctx.lineTo(cx + arrowSize * 0.15, cy)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments])

  // Animacion de giro
  const animateSpin = (targetRotation: number) => {
    const startRotation = currentRotationRef.current
    const totalDelta = targetRotation - startRotation
    const startTime = performance.now()

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / SPIN_DURATION_MS, 1)
      const easedProgress = easeOutCubic(progress)

      currentRotationRef.current = startRotation + totalDelta * easedProgress
      setRotation(currentRotationRef.current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const getTimeUntilNextSpin = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const handleSpin = async () => {
    if (spinning || hasSpunToday) return

    setSpinning(true)
    setShowResult(false)
    setResultItem(null)

    // 1. Elegir item por peso (gacha real)
    // Si hay configuracion personalizada, distribucion uniforme (el admin decidio los items)
    const useUniform = !!customItemIds && customItemIds.length > 0
    const picked = pickWeightedRandom(displayItems, useUniform)
    setResultItem(picked)

    // 2. Encontrar el indice del segmento donde esta ese item
    const segmentIndex = segments.findIndex(s => s.itemId === picked.id)
    if (segmentIndex === -1) {
      // Fallback: si no se encuentra, recargar
      setSpinning(false)
      return
    }

    // 3. Calcular la rotacion final para que la flecha (ARRIBA) apunte al item
    // El canvas dibuja el segmento `segmentIndex` empezando en el angulo:
    //   currentRotationRef.current + segmentIndex * segAngle
    // Su centro esta en: currentRotationRef.current + segmentIndex * segAngle + segAngle/2
    //
    // La flecha esta en la parte superior del canvas (12 en punto).
    // En coordenadas canvas, arriba = 3*PI/2 (o -PI/2).
    // El canvas rota visualmente con CSS transform: rotate(rotation rad).
    // Cuando rotation = 0, el centro del segmento esta en su angulo de dibujo.
    // Para que coincida con la flecha (arriba), necesitamos que:
    //   angulo_centro_segmento - rotation = 3*PI/2
    //   rotation = angulo_centro_segmento - 3*PI/2
    //
    // Pero como la rotacion CSS y los angulos canvas tienen sentidos opuestos:
    //   rotation = -(angulo_centro_segmento - 3*PI/2)
    //   rotation = 3*PI/2 - angulo_centro_segmento
    //
    // Para evitar valores negativos, sumamos TAU:
    const segmentCenter = currentRotationRef.current + segmentIndex * segAngle + segAngle / 2
    const angleToPointer = (3 * PI / 2 - segmentCenter + TAU) % TAU

    // 4. Agregar vueltas extra para que se vea emocionante
    const extraSpins = 6 + Math.floor(Math.random() * 4) // 6-9 vueltas completas
    const totalRotation = currentRotationRef.current + TAU * extraSpins + angleToPointer

    animateSpin(totalRotation)

    await new Promise(resolve => setTimeout(resolve, SPIN_DURATION_MS + 200))

    const success = await onSpin(picked)
    if (success) {
      setShowResult(true)
    }
    setSpinning(false)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-scale">
      <div
        className="glass-card max-w-2xl w-full p-6 md:p-8 animate-fade-up"
        style={{ maxHeight: '95vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#e8eaf6' }}>
              Ruleta Diaria
            </h2>
            <p className="text-sm" style={{ color: '#64748b' }}>
              {trainerName}, gira una vez al dia
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#64748b' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wheel Container */}
        <div className="relative flex flex-col items-center mb-6">
          {/* Pointer */}
          <div
            className="absolute top-0 z-10 w-0 h-0"
            style={{
              borderLeft: '18px solid transparent',
              borderRight: '18px solid transparent',
              borderTop: '30px solid #f59e0b',
              filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.6))',
              transform: 'translateY(-8px)',
            }}
          />

          {/* Canvas Wheel */}
          <div
            className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(79, 195, 247, 0.15), inset 0 0 60px rgba(0,0,0,0.3)',
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{
                transform: `rotate(${rotation}rad)`,
              }}
            />
          </div>
        </div>

        {/* Leyenda de rarezas con conteo */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {(['legendario', 'epico', 'raro', 'comun'] as const).map(rarity => (
            <div key={rarity} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: RARITY_COLORS[rarity] }}
              />
              <span className="text-xs font-semibold" style={{ color: '#64748b' }}>
                {RARITY_LABELS[rarity]} ({displayItems.filter(i => i.rarity === rarity).length})
              </span>
            </div>
          ))}
        </div>

        {/* Porcentajes gacha */}
        <div className="text-center mb-4">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: '#475569' }}>
            {customItemIds && customItemIds.length > 0
              ? `Ruleta personalizada - ${displayItems.length} items con igual probabilidad`
              : 'Probabilidades: 50% Comun · 30% Raro · 15% Epico · 5% Legendario'}
          </p>
        </div>

        {/* Spin Button or Result */}
        {!showResult && !hasSpunToday ? (
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="btn-glow w-full py-5 rounded-xl text-lg font-bold tracking-wider uppercase flex items-center justify-center gap-3"
            style={{
              background: spinning
                ? 'linear-gradient(135deg, #64748b, #475569)'
                : 'linear-gradient(135deg, #4fc3f7, #0288d1)',
              boxShadow: spinning
                ? 'none'
                : '0 0 30px rgba(79, 195, 247, 0.4)',
              cursor: spinning ? 'not-allowed' : 'pointer',
            }}
          >
            {spinning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Girando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                ¡Girar!
              </>
            )}
          </button>
        ) : showResult && resultItem ? (
          <div className="text-center">
            <div
              className="p-6 rounded-2xl mb-4"
              style={{
                background: `linear-gradient(135deg, ${RARITY_GLOWS[resultItem.rarity]}, transparent)`,
                border: `2px solid ${RARITY_COLORS[resultItem.rarity]}40`,
                boxShadow: `0 0 30px ${RARITY_GLOWS[resultItem.rarity]}`,
              }}
            >
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: RARITY_COLORS[resultItem.rarity] }}>
                {RARITY_LABELS[resultItem.rarity]}
              </p>
              <img
                src={resultItem.sprite}
                alt={resultItem.name}
                className="w-24 h-24 mx-auto mb-3"
                style={{
                  imageRendering: 'pixelated',
                  filter: `drop-shadow(0 0 15px ${RARITY_GLOWS[resultItem.rarity]})`,
                }}
              />
              <h3
                className="text-2xl font-bold mb-1"
                style={{
                  color: RARITY_COLORS[resultItem.rarity],
                  textShadow: `0 0 20px ${RARITY_GLOWS[resultItem.rarity]}`,
                }}
              >
                {resultItem.name}
              </h3>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                {resultItem.description}
              </p>
            </div>

            {todayItem && !todayItem.delivered && (
              <p className="text-sm mb-4" style={{ color: '#f59e0b' }}>
                Item pendiente de entrega por el administrador
              </p>
            )}

            {todayItem && todayItem.delivered && (
              <p className="text-sm mb-4 flex items-center justify-center gap-2" style={{ color: '#10b981' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Entregado por el administrador
              </p>
            )}

            <p className="text-sm" style={{ color: '#64748b' }}>
              Proximo giro en <span style={{ color: '#4fc3f7', fontWeight: 700 }}>{getTimeUntilNextSpin()}</span>
            </p>
          </div>
        ) : hasSpunToday && !showResult ? (
          <div className="text-center">
            <div className="p-6 rounded-2xl mb-4" style={{ background: 'rgba(79, 195, 247, 0.05)', border: '1px solid rgba(79, 195, 247, 0.15)' }}>
              <svg className="w-16 h-16 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <p className="text-lg font-bold mb-1" style={{ color: '#e8eaf6' }}>
                Ya giraste hoy
              </p>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Vuelve manana para tu proximo giro
              </p>
              <p className="text-sm mt-2" style={{ color: '#4fc3f7', fontWeight: 700 }}>
                Proximo giro en {getTimeUntilNextSpin()}
              </p>
            </div>
          </div>
        ) : null}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(79,195,247,0.15)',
            color: '#94a3b8',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.06)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.03)'
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

function pickWeightedRandom(items: Item[], useUniformDistribution = false): Item {
  if (items.length === 0) throw new Error('No items available')

  if (useUniformDistribution) {
    // Distribucion uniforme: todos los items tienen la misma probabilidad
    const randomIndex = Math.floor(Math.random() * items.length)
    return items[randomIndex]
  }

  const weights: Record<string, number> = {
    comun: 50,
    raro: 30,
    epico: 15,
    legendario: 5,
  }

  const weightedItems = items.map(item => ({
    item,
    weight: weights[item.rarity] || 1,
  }))

  const totalWeight = weightedItems.reduce((sum, w) => sum + w.weight, 0)
  let random = Math.random() * totalWeight

  for (const { item, weight } of weightedItems) {
    random -= weight
    if (random <= 0) {
      return item
    }
  }

  return items[items.length - 1]
}