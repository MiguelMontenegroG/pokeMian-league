'use client'

export default function SupabaseWarning() {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 rounded-xl border-2 z-50 animate-fade-up"
      style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '2px solid rgba(245, 158, 11, 0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div className="flex-1">
          <h3 className="font-bold mb-1" style={{ color: '#f59e0b' }}>Supabase no configurado</h3>
          <p className="text-sm mb-3" style={{ color: '#e8eaf6' }}>
            La aplicación funcionará con datos temporales. Para guardar datos persistentes, configura Supabase.
          </p>
          <details className="text-xs" style={{ color: '#94a3b8' }}>
            <summary className="cursor-pointer hover:text-blue-400 mb-2">Ver instrucciones</summary>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>Crea cuenta en supabase.com</li>
              <li>Copia las credenciales en .env.local</li>
              <li>Ejecuta el SQL schema</li>
              <li>Reinicia la app</li>
            </ol>
          </details>
        </div>
      </div>
    </div>
  )
}
