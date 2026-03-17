import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { readingPlan } from '../lib/readingPlan'
import Layout from '../components/Layout'

export default function Calendar() {
  const { user } = useAuth()
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const currentDay = Math.min(
    Math.ceil((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1,
    365
  )

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('day_number, is_completed')
        .eq('user_id', user.id)
      const map = {}
      data?.forEach(e => { map[e.day_number] = e.is_completed })
      setEntries(map)
      setLoading(false)
    }
    fetchEntries()
  }, [user])

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  const year = today.getFullYear()
  let dayCounter = 1

  const monthData = months.map((name, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const days = []
    for (let d = 1; d <= daysInMonth && dayCounter <= 365; d++) {
      days.push(dayCounter++)
    }
    return { name, days }
  })

  const completedCount = Object.values(entries).filter(Boolean).length

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Calendario</h1>
          <span className="text-sm text-gray-500 bg-white border border-amber-100 rounded-full px-3 py-1">
            {completedCount} / 365 días
          </span>
        </div>

        <div className="flex gap-4 text-xs text-gray-600 flex-wrap bg-white rounded-xl p-3 border border-amber-100">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-green-400 inline-block"></span> Completado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-200 ring-2 ring-amber-500 inline-block"></span> Hoy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-100 inline-block"></span> Pendiente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gray-100 inline-block"></span> Futuro
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando calendario...</div>
        ) : (
          monthData.map(({ name, days }) => (
            <div key={name} className="card py-4">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">{name}</h3>
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                  const completed = entries[day]
                  const isToday = day === currentDay
                  const isFuture = day > currentDay
                  return (
                    <Link
                      key={day}
                      to={`/day/${day}`}
                      title={readingPlan[day - 1]?.title}
                      className={`aspect-square flex items-center justify-center text-xs rounded-lg font-medium transition-colors ${
                        completed
                          ? 'bg-green-400 text-white hover:bg-green-500'
                          : isToday
                          ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-500 hover:bg-amber-300'
                          : isFuture
                          ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {day}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
