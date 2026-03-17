import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { readingPlan } from '../lib/readingPlan'
import Layout from '../components/Layout'

const SECTIONS = [
  {
    key: 'what_i_read',
    label: '¿Qué leí?',
    icon: '📖',
    placeholder: 'Escribe un resumen breve de los pasajes que leíste hoy...',
  },
  {
    key: 'what_god_said',
    label: '¿Qué me habló Dios?',
    icon: '💬',
    placeholder: '¿Qué versículo o mensaje te tocó el corazón? ¿Qué sientes que Dios te dice personalmente?',
  },
  {
    key: 'what_i_will_do',
    label: '¿Qué voy a hacer?',
    icon: '🎯',
    placeholder: '¿Cómo vas a aplicar lo que aprendiste hoy en tu vida?',
  },
  {
    key: 'prayer',
    label: 'Mi oración de hoy',
    icon: '🙏',
    placeholder: 'Escribe tu oración en respuesta a la Palabra de hoy...',
  },
  {
    key: 'free_notes',
    label: 'Notas adicionales',
    icon: '📝',
    placeholder: 'Pensamientos extras, preguntas, versículos para memorizar...',
  },
]

export default function DayEntry() {
  const { dayNumber } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const day = parseInt(dayNumber)
  const plan = readingPlan[day - 1]

  const [form, setForm] = useState({
    what_i_read: '',
    what_god_said: '',
    what_i_will_do: '',
    prayer: '',
    free_notes: '',
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [entryId, setEntryId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchEntry = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_number', day)
        .maybeSingle()

      if (data) {
        setForm({
          what_i_read: data.what_i_read || '',
          what_god_said: data.what_god_said || '',
          what_i_will_do: data.what_i_will_do || '',
          prayer: data.prayer || '',
          free_notes: data.free_notes || '',
        })
        setIsCompleted(data.is_completed || false)
        setEntryId(data.id)
      }
      setLoading(false)
    }
    fetchEntry()
  }, [day, user])

  const handleSave = async (completed = isCompleted) => {
    setSaving(true)
    const payload = {
      user_id: user.id,
      day_number: day,
      is_completed: completed,
      ...form,
    }
    if (entryId) {
      await supabase.from('journal_entries').update(payload).eq('id', entryId)
    } else {
      const { data } = await supabase
        .from('journal_entries')
        .insert(payload)
        .select()
        .single()
      if (data) setEntryId(data.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleComplete = async () => {
    const newCompleted = !isCompleted
    setIsCompleted(newCompleted)
    await handleSave(newCompleted)
  }

  if (!plan) {
    return (
      <Layout>
        <div className="text-center py-20 text-gray-500">Día no encontrado.</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header del día */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-800 to-amber-600 text-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-200 text-sm">Día {day} de 365</p>
            {isCompleted && (
              <span className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full">
                ✓ Completado
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold mb-4">{plan.title}</h1>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Antiguo Testamento</p>
              <p className="text-white font-semibold">{plan.oldTestament.ref}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Nuevo Testamento</p>
              <p className="text-white font-semibold">{plan.newTestament.ref}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Salmo</p>
              <p className="text-white font-semibold">{plan.psalm.ref}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-amber-100 text-xs font-medium mb-1">Proverbios</p>
              <p className="text-white font-semibold">{plan.proverb.ref}</p>
            </div>
          </div>
        </div>

        {/* Secciones del diario */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando tu entrada...</div>
        ) : (
          SECTIONS.map(({ key, label, icon, placeholder }) => (
            <div key={key} className="card">
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3 text-base">
                <span className="text-xl">{icon}</span>
                {label}
              </label>
              <textarea
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="textarea-field"
                rows={key === 'free_notes' ? 3 : 4}
                placeholder={placeholder}
              />
            </div>
          ))
        )}

        {/* Botones de acción */}
        {!loading && (
          <div className="flex gap-3 pb-2">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="btn-secondary flex-1 py-3"
            >
              {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar borrador'}
            </button>
            <button
              onClick={handleComplete}
              disabled={saving}
              className={`flex-1 py-3 font-semibold rounded-lg transition-colors ${
                isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                  : 'btn-primary'
              }`}
            >
              {isCompleted ? '✓ Completado' : '✅ Marcar completado'}
            </button>
          </div>
        )}

        {/* Navegación entre días */}
        <div className="flex gap-3 pb-6">
          {day > 1 && (
            <button
              onClick={() => navigate(`/day/${day - 1}`)}
              className="btn-secondary flex-1 py-2 text-sm"
            >
              ← Día {day - 1}
            </button>
          )}
          {day < 365 && (
            <button
              onClick={() => navigate(`/day/${day + 1}`)}
              className="btn-secondary flex-1 py-2 text-sm"
            >
              Día {day + 1} →
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
