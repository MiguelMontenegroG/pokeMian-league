'use client'

const TRAINERS = [
  { id: 'red', name: 'Rojo', game: 'Rojo/Azul' },
  { id: 'blue', name: 'Azul', game: 'Rojo/Azul' },
  { id: 'ethan', name: 'Oro', game: 'Oro/Plata' },
  { id: 'lyra', name: 'Kristal', game: 'Oro/Plata/Cristal' },
  { id: 'brendan', name: 'Bruno', game: 'Rubi/Zafiro' },
  { id: 'may', name: 'Aro', game: 'Rubi/Zafiro' },
  { id: 'steven', name: 'Maximo', game: 'Rubi/Zafiro' },
  { id: 'cynthia', name: 'Cintia', game: 'Diamante/Perla' },
  { id: 'lance', name: 'Lance', game: 'Rojo/Azul' },
]

export default function SpritesPreview() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1a',
      color: '#e8eaf6',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ textAlign: 'center', color: '#4fc3f7', marginBottom: '2rem' }}>
        Vista previa de sprites de entrenadores
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1.5rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {TRAINERS.map(t => (
          <div key={t.id} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(79,195,247,0.2)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            transition: '0.2s'
          }}>
            <img
              src={`/sprites/trainers/${t.id}.png`}
              alt={t.name}
              style={{
                width: '96px',
                height: '96px',
                imageRendering: 'pixelated',
                marginBottom: '0.5rem'
              }}
            />
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4fc3f7' }}>
              {t.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {t.game}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
