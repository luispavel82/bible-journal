import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { supabase } from '../lib/supabase'
import { readingPlan } from '../lib/readingPlan'
import { dateToDayNumber, dayNumberToDate, toInputDate } from '../lib/dayUtils'
import Layout from '../components/Layout'

const SECTIONS = [
  { key: 'what_i_read', label: '¿Qué leí?', icon: '📖', placeholder: 'Escribe un resumen breve de los pasajes que leíste hoy...' },
  { key: 'what_god_said', label: '¿Qué me habló Dios?', icon: '💬', placeholder: '¿Qué versículo o mensaje te tocó el corazón? ¿Qué sientes que Dios te dice personalmente?' },
  { key: 'what_i_will_do', label: '¿Qué voy a hacer?', icon: '🎯', placeholder: '¿Cómo vas a aplicar lo que aprendiste hoy en tu vida?' },
  { key: 'prayer', label: 'Mi oración de hoy', icon: '🙏', placeholder: 'Escribe tu oración en respuesta a la Palabra de hoy...' },
  { key: 'free_notes', label: 'Notas adicionales', icon: '📝', placeholder: 'Pensamientos extras, preguntas, versículos para memorizar...' },
]

function formatDuration(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DayEntry() {
  const { dayNumber } = useParams()
  const { user } = useAuth()
  const { planStartDate } = useProfile()
  const navigate = useNavigate()
  const day = parseInt(dayNumber)
  const plan = readingPlan[day - 1]

  // Fecha correspondiente al día del plan
  const dayDate = toInputDate(dayNumberToDate(day, planStartDate))

  const [form, setForm] = useState({ what_i_read: '', what_god_said: '', what_i_will_do: '', prayer: '', free_notes: '' })
  const [isCompleted, setIsCompleted] = useState(false)
  const [entryId, setEntryId] = useState(null)
  const [shareToken, setShareToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  // Grabaciones de voz
  const [recordings, setRecordings] = useState([]) // [{ name, url }]
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

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
        setShareToken(data.share_token || null)
      }

      // Cargar grabaciones de voz con URLs firmadas
      await loadRecordings()
      setLoading(false)
    }
    fetchEntry()
  }, [day, user])

  const loadRecordings = async () => {
    const { data: files } = await supabase.storage
      .from('voice-notes')
      .list(`${user.id}/${day}`)
    if (!files || files.length === 0) { setRecordings([]); return }
    const signed = await Promise.all(
      files.map(async (f) => {
        const { data } = await supabase.storage
          .from('voice-notes')
          .createSignedUrl(`${user.id}/${day}/${f.name}`, 3600)
        return { name: f.name, url: data?.signedUrl || '' }
      })
    )
    setRecordings(signed.filter(r => r.url))
  }

  const handleSave = async (completed = isCompleted) => {
    setSaving(true)
    const payload = { user_id: user.id, day_number: day, is_completed: completed, ...form }
    if (entryId) {
      await supabase.from('journal_entries').update(payload).eq('id', entryId)
    } else {
      const { data } = await supabase.from('journal_entries').insert(payload).select().single()
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

  const handleShare = async () => {
    let token = shareToken
    if (!token) {
      token = crypto.randomUUID()
      if (entryId) {
        await supabase.from('journal_entries').update({ share_token: token }).eq('id', entryId)
      } else {
        const payload = { user_id: user.id, day_number: day, is_completed: isCompleted, share_token: token, ...form }
        const { data } = await supabase.from('journal_entries').insert(payload).select().single()
        if (data) setEntryId(data.id)
      }
      setShareToken(token)
    }
    const url = `${window.location.origin}/share/${token}`
    await navigator.clipboard.writeText(url)
    setShareMsg('¡Enlace copiado!')
    setTimeout(() => setShareMsg(''), 2500)
  }

  const handleDateChange = (e) => {
    const targetDay = dateToDayNumber(e.target.value, planStartDate)
    navigate(`/day/${targetDay}`)
  }

  // --- Grabación de voz ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = handleRecordingStop
      mr.start()
      mediaRecorderRef.current = mr
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch {
      alert('No se pudo acceder al micrófono. Verifica los permisos.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop())
    clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const handleRecordingStop = async () => {
    setUploadingAudio(true)
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const fileName = `${Date.now()}.webm`
    const path = `${user.id}/${day}/${fileName}`
    await supabase.storage.from('voice-notes').upload(path, blob, { contentType: 'audio/webm' })
    await loadRecordings()
    setUploadingAudio(false)
  }

  const deleteRecording = async (fileName) => {
    await supabase.storage.from('voice-notes').remove([`${user.id}/${day}/${fileName}`])
    setRecordings(prev => prev.filter(r => r.name !== fileName))
  }

  if (!plan) {
    return <Layout><div className="text-center py-20 text-gray-500">Día no encontrado.</div></Layout>
  }

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header del día con date picker */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-800 to-amber-600 text-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-200 text-sm">Día {day} de 365</p>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Completado
                </span>
              )}
              {/* Date picker */}
              <input
                type="date"
                value={dayDate}
                onChange={handleDateChange}
                className="text-xs bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>
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

        {/* Grabaciones de voz */}
        {!loading && (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-xl">🎤</span> Notas de voz
            </h3>

            {/* Grabaciones existentes */}
            {recordings.length > 0 && (
              <div className="space-y-2 mb-4">
                {recordings.map((rec, i) => (
                  <div key={rec.name} className="flex items-center gap-2 bg-amber-50 rounded-xl p-3">
                    <span className="text-xs text-gray-500 w-6">#{i + 1}</span>
                    <audio controls src={rec.url} className="flex-1 h-8" style={{ minWidth: 0 }} />
                    <button
                      onClick={() => deleteRecording(rec.name)}
                      className="text-red-400 hover:text-red-600 text-lg flex-shrink-0"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Controles de grabación */}
            {isRecording ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 bg-red-50 rounded-xl p-3">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-600 font-medium">Grabando... {formatDuration(recordingTime)}</span>
                </div>
                <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                  ⏹ Detener
                </button>
              </div>
            ) : uploadingAudio ? (
              <div className="text-center py-3 text-sm text-gray-400">Guardando grabación...</div>
            ) : (
              <button
                onClick={startRecording}
                className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <span className="text-lg">🎙️</span> Grabar nota de voz
              </button>
            )}
          </div>
        )}

        {/* Botones de acción */}
        {!loading && (
          <>
            <div className="flex gap-3">
              <button onClick={() => handleSave()} disabled={saving} className="btn-secondary flex-1 py-3">
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
            <button onClick={handleShare} className="btn-secondary w-full py-3 text-sm">
              {shareMsg ? `✓ ${shareMsg}` : shareToken ? '🔗 Copiar enlace para compartir' : '🔗 Compartir esta reflexión'}
            </button>
          </>
        )}

        {/* Navegación entre días */}
        <div className="flex gap-3 pb-6">
          {day > 1 && (
            <button onClick={() => navigate(`/day/${day - 1}`)} className="btn-secondary flex-1 py-2 text-sm">
              ← Día {day - 1}
            </button>
          )}
          {day < 365 && (
            <button onClick={() => navigate(`/day/${day + 1}`)} className="btn-secondary flex-1 py-2 text-sm">
              Día {day + 1} →
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
