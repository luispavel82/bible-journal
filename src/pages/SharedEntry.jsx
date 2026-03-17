import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { readingPlan } from '../lib/readingPlan'

const SECTIONS = [
  { key: 'what_i_read', label: '¿Qué leí?', icon: '📖' },
  { key: 'what_god_said', label: '¿Qué me habló Dios?', icon: '💬' },
  { key: 'what_i_will_do', label: '¿Qué voy a hacer?', icon: '🎯' },
  { key: 'prayer', label: 'Mi oración de hoy', icon: '🙏' },
  { key: 'free_notes', label: 'Notas adicionales', icon: '📝' },
]

export default function SharedEntry() {
  const { token } = useParams()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchEntry = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('share_token', token)
        .maybeSingle()

      if (data) {
        setEntry(data)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }
    fetchEntry()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-700">Cargando reflexión...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Reflexión no encontrada</h1>
          <p className="text-gray-500 text-sm mb-4">El enlace puede haber expirado o no ser válido.</p>
          <Link to="/" className="text-amber-700 hover:underline text-sm">Ir al Diario Bíblico</Link>
        </div>
      </div>
    )
  }

  const plan = readingPlan[entry.day_number - 1]

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-2xl">✝️</span>
          <div>
            <p className="font-bold text-amber-900 text-sm leading-tight">Diario Bíblico</p>
            <p className="text-xs text-gray-500 leading-tight">Reflexión compartida</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Header del día */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-800 to-amber-600 text-white p-6 shadow-md">
          <p className="text-amber-200 text-sm mb-1">Día {entry.day_number} de 365</p>
          <h1 className="text-xl font-bold mb-4">{plan?.title}</h1>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Antiguo Testamento</p>
              <p className="text-white font-semibold">{plan?.oldTestament.ref}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Nuevo Testamento</p>
              <p className="text-white font-semibold">{plan?.newTestament.ref}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Salmo</p>
              <p className="text-white font-semibold">{plan?.psalm.ref}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Proverbios</p>
              <p className="text-white font-semibold">{plan?.proverb.ref}</p>
            </div>
          </div>
        </div>

        {/* Secciones con contenido */}
        {SECTIONS.map(({ key, label, icon }) => {
          const content = entry[key]
          if (!content) return null
          return (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
              <p className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                <span className="text-xl">{icon}</span>
                {label}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          )
        })}

        {/* CTA */}
        <div className="bg-white rounded-2xl border border-amber-100 p-5 text-center">
          <p className="text-sm text-gray-600 mb-3">¿Quieres llevar tu propio diario bíblico?</p>
          <Link to="/register" className="btn-primary inline-block px-6 py-2 text-sm">
            Crear mi diario gratuito
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 mt-4">
        Basado en "La Biblia en un Año" — Fray Sergio Serrano &amp; Dempsey Rosales
      </footer>
    </div>
  )
}
