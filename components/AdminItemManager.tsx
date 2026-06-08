'use client'

import { useState, useRef } from 'react'
import type { Item } from '@/data/itemsList'
import { RARITY_COLORS, RARITY_GLOWS, RARITY_LABELS } from '@/data/itemsList'

interface Props {
  items: Item[]
  onAdd: (item: Omit<Item, 'id'>) => Promise<Item | null>
  onUpdate: (item: Item) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onImportCSV: (csvText: string) => Promise<{ added: number; errors: string[] }>
}

export default function AdminItemManager({ items, onAdd, onUpdate, onDelete, onImportCSV }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [showCSV, setShowCSV] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    rarity: 'comun' as Item['rarity'],
    sprite: '',
    description: '',
  })

  const rarityStats = {
    comun: items.filter(i => i.rarity === 'comun').length,
    raro: items.filter(i => i.rarity === 'raro').length,
    epico: items.filter(i => i.rarity === 'epico').length,
    legendario: items.filter(i => i.rarity === 'legendario').length,
  }

  const openNewForm = () => {
    setEditingItem(null)
    setFormData({ name: '', rarity: 'comun', sprite: '', description: '' })
    setShowForm(true)
  }

  const openEditForm = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      rarity: item.rarity,
      sprite: item.sprite,
      description: item.description,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.sprite.trim()) {
      alert('Nombre y sprite son obligatorios')
      return
    }

    try {
      if (editingItem) {
        await onUpdate({ ...editingItem, ...formData, name: formData.name.trim() })
      } else {
        await onAdd({
          name: formData.name.trim(),
          rarity: formData.rarity,
          sprite: formData.sprite.trim(),
          description: formData.description.trim(),
        })
      }
      setShowForm(false)
      setEditingItem(null)
    } catch (err) {
      console.error('Error saving item:', err)
    }
  }

  const handleDelete = async (item: Item) => {
    if (!confirm(`Eliminar "${item.name}" del catalogo?`)) return
    try {
      await onDelete(item.id)
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      setCsvText(text)
    }
    reader.readAsText(file)
  }

  const handleImportCSV = async () => {
    if (!csvText.trim()) {
      alert('Pega el contenido CSV o selecciona un archivo')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      const result = await onImportCSV(csvText)
      setImportResult(result)
    } catch (err) {
      console.error('Error importing CSV:', err)
      setImportResult({ added: 0, errors: ['Error inesperado al importar'] })
    } finally {
      setImporting(false)
    }
  }

  const downloadCSVTemplate = () => {
    const headers = 'name,rarity,sprite,description'
    const example =
      'Pocion Maxima,comun,https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png,Recupera todos los PS de un Pokemon\n' +
      'MT Dragón,epico,https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tr-02.png,Poderoso movimiento de dragon'
    const blob = new Blob([headers + '\n' + example], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_items_ruleta.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            Gestión de Items
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Catalogo de items para la ruleta diaria ({items.length} items)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCSV(!showCSV)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(79, 195, 247, 0.1)',
              border: '1px solid rgba(79, 195, 247, 0.3)',
              color: '#4fc3f7',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Importar CSV
          </button>
          <button
            onClick={openNewForm}
            className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Item
          </button>
        </div>
      </div>

      {/* Rarity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['comun', 'raro', 'epico', 'legendario'] as const).map(rarity => (
          <div
            key={rarity}
            className="p-4 rounded-xl"
            style={{
              background: `${RARITY_COLORS[rarity]}08`,
              border: `1px solid ${RARITY_COLORS[rarity]}25`,
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: RARITY_COLORS[rarity] }}>
              {RARITY_LABELS[rarity]}
            </p>
            <p className="text-2xl font-bold" style={{ color: RARITY_COLORS[rarity] }}>
              {rarityStats[rarity]}
            </p>
          </div>
        ))}
      </div>

      {/* CSV Import Section */}
      {showCSV && (
        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(79, 195, 247, 0.03)',
            border: '1px solid rgba(79, 195, 247, 0.15)',
          }}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#e8eaf6' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Importar desde CSV
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={downloadCSVTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(79, 195, 247, 0.08)',
                border: '1px solid rgba(79, 195, 247, 0.2)',
                color: '#4fc3f7',
              }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar Plantilla
            </button>
            <label
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10b981',
              }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Subir archivo
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="name,rarity,sprite,description"
            className="w-full h-32 p-4 rounded-xl text-sm font-mono"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(79,195,247,0.15)',
              color: '#e8eaf6',
              resize: 'vertical',
            }}
          />

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleImportCSV}
              disabled={importing || !csvText.trim()}
              className="btn-glow px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider"
              style={{
                opacity: importing || !csvText.trim() ? 0.5 : 1,
                cursor: importing || !csvText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {importing ? 'Importando...' : 'Importar items'}
            </button>
          </div>

          {importResult && (
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-sm font-bold" style={{ color: '#10b981' }}>
                Agregados: {importResult.added} items
              </p>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-bold" style={{ color: '#ef4444' }}>
                    Errores ({importResult.errors.length}):
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i} className="text-xs" style={{ color: '#ef4444' }}>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="glass-card max-w-md w-full p-6 animate-fade-scale"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6" style={{ color: '#f59e0b' }}>
              {editingItem ? 'Editar Item' : 'Nuevo Item'}
            </h3>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="dark-input w-full px-4 py-2.5 rounded-xl text-sm"
                  placeholder="Ej: Master Ball"
                />
              </div>

              {/* Rareza */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
                  Rareza
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['comun', 'raro', 'epico', 'legendario'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setFormData(prev => ({ ...prev, rarity: r }))}
                      className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                      style={{
                        background: formData.rarity === r ? `${RARITY_COLORS[r]}25` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${formData.rarity === r ? RARITY_COLORS[r] : 'rgba(79,195,247,0.1)'}`,
                        color: formData.rarity === r ? RARITY_COLORS[r] : '#64748b',
                      }}
                    >
                      {RARITY_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sprite URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
                  URL del Sprite
                </label>
                <input
                  type="text"
                  value={formData.sprite}
                  onChange={e => setFormData(prev => ({ ...prev, sprite: e.target.value }))}
                  className="dark-input w-full px-4 py-2.5 rounded-xl text-sm"
                  placeholder="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/..."
                />
                {formData.sprite && (
                  <img
                    src={formData.sprite}
                    alt="Preview"
                    className="w-10 h-10 mt-2"
                    style={{ imageRendering: 'pixelated' }}
                    onError={e => {
                      (e.currentTarget as HTMLElement).style.display = 'none'
                    }}
                  />
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
                  Descripcion
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="dark-input w-full px-4 py-2.5 rounded-xl text-sm"
                  placeholder="Descripcion del item..."
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                className="btn-glow flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider"
              >
                {editingItem ? 'Guardar Cambios' : 'Agregar Item'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(79,195,247,0.15)',
                  color: '#94a3b8',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(79,195,247,0.1)' }}>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Sprite</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Nombre</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Rareza</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Descripcion</th>
                <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Activo</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="table-row-animate group"
                  style={{
                    borderBottom: '1px solid rgba(79,195,247,0.05)',
                    animationDelay: `${index * 30}ms`,
                    opacity: item.enabled ? 1 : 0.45,
                    filter: item.enabled ? 'none' : 'grayscale(0.5)',
                  }}
                >
                  <td className="py-3 px-4">
                    <img
                      src={item.sprite}
                      alt={item.name}
                      className="w-8 h-8"
                      style={{
                        imageRendering: 'pixelated',
                        filter: `drop-shadow(0 0 6px ${RARITY_GLOWS[item.rarity]})`,
                      }}
                      onError={e => {
                        (e.currentTarget as HTMLElement).style.display = 'none'
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-bold" style={{ color: '#e8eaf6' }}>
                      {item.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                      style={{
                        background: `${RARITY_COLORS[item.rarity]}15`,
                        border: `1px solid ${RARITY_COLORS[item.rarity]}30`,
                        color: RARITY_COLORS[item.rarity],
                      }}
                    >
                      {RARITY_LABELS[item.rarity]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs" style={{ color: '#64748b' }}>
                      {item.description}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={async () => {
                        await onUpdate({ ...item, enabled: !item.enabled })
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.enabled ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                      title={item.enabled ? 'Deshabilitar item' : 'Habilitar item'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: '#4fc3f7' }}
                        title="Editar"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: '#ef4444' }}
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-semibold" style={{ color: '#64748b' }}>
              No hay items en el catalogo
            </p>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>
              Agrega items manualmente o importa via CSV
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
