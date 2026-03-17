import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { supabase } from '../lib/supabase'
import { readingPlan } from '../lib/readingPlan'
import { getCurrentDayNumber } from '../lib/dayUtils'
import Layout from '../components/Layout'
import PodcastPlayer from '../components/PodcastPlayer'

function calculateStreak(entries, currentDay) {
  const completed = new Set(entries.filter(e => e.is_completed).map(e => e.day_number))
  let streak = 0
  for (let d = currentDay; d >= 1; d--) {
    if (completed.has(d)) streak++
    else break
  }
  return streak
}

export default function Dashboard() {
  const { user } = useAuth()
  const { profile, planStartDate } = useProfile()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  const currentDay = getCurrentDayNumber(planStartDate)
  const todayPlan = readingPlan[currentDay - 1]

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]
      const [{ data: entriesData }, { data: encData }] = await Promise.all([
        supabase.from('journal_entries').select('day_number, is_completed').eq('user_id', user.id),
        supabase.from('encouragements').select('from_user_id').eq('to_user_id', user.id).gte('created_at', today),
      ])
      setEntries(entriesData || [])

      // Obtener nombres de perfiles por separado
      const senderIds = (encData || []).map(e => e.from_user_id)
      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase.from('profiles').select('user_id, display_name').in('user_id', senderIds)
        setNotifications(profilesData || [])
      } else {
        setNotifications([])
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const completedDays = entries.filter(e => e.is_completed).length
  const progress = Math.round((completedDays / 365) * 100)
  const todayEntry = entries.find(e => e.day_number === currentDay)
  const streak = calculateStreak(entries, currentDay)

  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const day = currentDay - 6 + i
    if (day < 1) return null
    const entry = entries.find(e => e.day_number === day)
    return { day, completed: entry?.is_completed || false }
  }).filter(Boolean)

  const displayName = profile?.display_name || ''

  return (
    <Layout>
      <div className="space-y-5">
        {/* Ánimos recibidos */}
        {notifications.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
            💪 {notifications.map(n => n.display_name || 'Alguien').join(', ')} te enviaron ánimos hoy
          </div>
        )}

        {/* Banner de progreso */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-800 to-amber-600 text-white p-6 shadow-md">
          <p className="text-amber-200 text-sm mb-0.5">Bienvenido{displayName ? `, ${displayName}` : ''}</p>
          <h1 className="text-2xl font-bold mb-4">Diario Bíblico</h1>
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-100 text-sm">Progreso anual</span>
            <span className="font-bold text-white">{completedDays}/365 días</span>
          </div>
          <div className="bg-amber-900 rounded-full h-3 mb-1">
            <div
              className="bg-amber-300 h-3 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-amber-200 text-xs text-right mt-1">{progress}% completado</p>
        </div>

        {/* Lectura de hoy */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Lectura de hoy</p>
              <h2 className="text-lg font-bold text-gray-800 mt-0.5">
                Día {currentDay} — {todayPlan?.title}
              </h2>
            </div>
            {todayEntry?.is_completed && <span className="text-2xl">✅</span>}
          </div>
          {todayPlan && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-semibold mb-1">Antiguo Testamento</p>
                <p className="text-sm text-gray-700 font-medium">{todayPlan.oldTestament.ref}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">Nuevo Testamento</p>
                <p className="text-sm text-gray-700 font-medium">{todayPlan.newTestament.ref}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600 font-semibold mb-1">Salmo</p>
                <p className="text-sm text-gray-700 font-medium">{todayPlan.psalm.ref}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-xs text-purple-600 font-semibold mb-1">Proverbios</p>
                <p className="text-sm text-gray-700 font-medium">{todayPlan.proverb.ref}</p>
              </div>
            </div>
          )}
          <Link to="/today" className="btn-primary block text-center w-full py-3">
            {todayEntry ? '✏️ Ver / Editar entrada de hoy' : '✍️ Escribir entrada de hoy'}
          </Link>
        </div>

        {/* Podcast Evangelio y Vida */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2 px-1">
            🎙️ Último episodio
          </p>
          <PodcastPlayer />
        </div>

        {/* Últimos 7 días */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Últimos 7 días</h3>
          {loading ? (
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {recentDays.map(({ day, completed }) => (
                <Link
                  key={day}
                  to={`/day/${day}`}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-colors text-center ${
                    completed
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : day === currentDay
                      ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500 hover:bg-amber-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{completed ? '✓' : day === currentDay ? '·' : '○'}</span>
                  <span className="text-xs font-medium mt-1">{day}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-3">
          <div className="card text-center py-4 px-2">
            <p className="text-2xl font-bold text-amber-700">{completedDays}</p>
            <p className="text-xs text-gray-500 mt-1">Completados</p>
          </div>
          <div className="card text-center py-4 px-2">
            <p className="text-xl">{streak > 0 ? '🔥' : '○'}</p>
            <p className="text-lg font-bold text-amber-700 leading-tight">{streak}</p>
            <p className="text-xs text-gray-500">Racha</p>
          </div>
          <div className="card text-center py-4 px-2">
            <p className="text-2xl font-bold text-amber-700">{currentDay}</p>
            <p className="text-xs text-gray-500 mt-1">Día del año</p>
          </div>
          <div className="card text-center py-4 px-2">
            <p className="text-2xl font-bold text-amber-700">{365 - currentDay}</p>
            <p className="text-xs text-gray-500 mt-1">Restantes</p>
          </div>
        </div>

        {/* Exportar diario */}
        <Link to="/export" className="btn-secondary w-full py-3 text-center block text-sm">
          📄 Exportar mi diario en PDF
        </Link>
      </div>
    </Layout>
  )
}
