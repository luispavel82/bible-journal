import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getCurrentDayNumber } from '../lib/dayUtils'
import Layout from '../components/Layout'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Friends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [pendingReceived, setPendingReceived] = useState([])
  const [inviteCode, setInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [encouraged, setEncouraged] = useState({})

  const flash = (setter, text, ms = 3000) => {
    setter(text)
    setTimeout(() => setter(''), ms)
  }

  useEffect(() => {
    loadAll()
  }, [user])

  const loadAll = async () => {
    setLoading(true)

    // Cargar código de invitación propio
    const { data: codeRow } = await supabase
      .from('invite_codes')
      .select('code')
      .eq('user_id', user.id)
      .maybeSingle()
    setInviteCode(codeRow?.code || '')

    // Amigos aceptados
    const { data: accepted } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted')

    const { data: acceptedReverse } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id')
      .eq('friend_id', user.id)
      .eq('status', 'accepted')

    // Solicitudes pendientes recibidas
    const { data: pending } = await supabase
      .from('friendships')
      .select('id, user_id')
      .eq('friend_id', user.id)
      .eq('status', 'pending')

    // Obtener todos los IDs relevantes para buscar perfiles
    const allIds = [
      ...(accepted || []).map(f => f.friend_id),
      ...(acceptedReverse || []).map(f => f.user_id),
      ...(pending || []).map(f => f.user_id),
    ]
    let profilesMap = {}
    if (allIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, plan_start_date')
        .in('user_id', allIds)
      profilesData?.forEach(p => { profilesMap[p.user_id] = p })
    }

    // Agregar perfil a pendientes
    setPendingReceived((pending || []).map(p => ({
      ...p,
      profiles: profilesMap[p.user_id] || null,
    })))

    // Cargar entradas de amigos
    const friendIds = [
      ...(accepted || []).map(f => f.friend_id),
      ...(acceptedReverse || []).map(f => f.user_id),
    ]

    let entriesByUser = {}
    if (friendIds.length > 0) {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('user_id, day_number, is_completed')
        .in('user_id', friendIds)
      entries?.forEach(e => {
        if (!entriesByUser[e.user_id]) entriesByUser[e.user_id] = []
        entriesByUser[e.user_id].push(e)
      })
    }

    // Ánimos enviados hoy
    const today = new Date().toISOString().split('T')[0]
    const { data: encToday } = await supabase
      .from('encouragements')
      .select('to_user_id')
      .eq('from_user_id', user.id)
      .gte('created_at', today)
    const encMap = {}
    encToday?.forEach(e => { encMap[e.to_user_id] = true })
    setEncouraged(encMap)

    const buildFriend = (friendId, profileData = profilesMap[friendId]) => {
      const userEntries = entriesByUser[friendId] || []
      const completed = userEntries.filter(e => e.is_completed).length
      const startDate = profileData?.plan_start_date || `${new Date().getFullYear()}-01-01`
      const currentDay = getCurrentDayNumber(startDate)
      const todayDone = userEntries.find(e => e.day_number === currentDay && e.is_completed)
      const streak = calcStreak(userEntries, currentDay)
      const weekCount = userEntries.filter(e => {
        return e.is_completed && e.day_number >= currentDay - 6 && e.day_number <= currentDay
      }).length
      return {
        id: friendId,
        name: profileData?.display_name || 'Amigo',
        currentDay,
        completed,
        progress: Math.round((completed / 365) * 100),
        todayDone: !!todayDone,
        streak,
        weekCount,
      }
    }

    const allFriends = [
      ...(accepted || []).map(f => buildFriend(f.friend_id)),
      ...(acceptedReverse || []).map(f => buildFriend(f.user_id)),
    ]
    setFriends(allFriends)
    setLoading(false)
  }

  function calcStreak(entries, currentDay) {
    const set = new Set(entries.filter(e => e.is_completed).map(e => e.day_number))
    let s = 0
    for (let d = currentDay; d >= 1; d--) {
      if (set.has(d)) s++
      else break
    }
    return s
  }

  const handleGenerateCode = async () => {
    const code = generateCode()
    await supabase.from('invite_codes').upsert({ user_id: user.id, code }, { onConflict: 'user_id' })
    setInviteCode(code)
    flash(setMsg, '¡Código generado!')
  }

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(link)
    flash(setMsg, '¡Enlace copiado!')
  }

  const handleAcceptCode = async (e) => {
    e.preventDefault()
    setError('')
    const code = inputCode.trim().toUpperCase()
    if (!code) return

    const { data: codeRow } = await supabase
      .from('invite_codes')
      .select('user_id')
      .eq('code', code)
      .maybeSingle()

    if (!codeRow) { flash(setError, 'Código no encontrado.'); return }
    if (codeRow.user_id === user.id) { flash(setError, 'No puedes agregarte a ti mismo.'); return }

    const { error } = await supabase.from('friendships').insert({
      user_id: codeRow.user_id,
      friend_id: user.id,
      status: 'accepted',
    })

    if (error) {
      flash(setError, 'Ya estás conectado con este amigo.')
    } else {
      setInputCode('')
      flash(setMsg, '¡Amigo agregado!')
      loadAll()
    }
  }

  const handleAcceptRequest = async (friendshipId) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    loadAll()
  }

  const handleEncourage = async (friendId) => {
    if (encouraged[friendId]) return
    await supabase.from('encouragements').insert({ from_user_id: user.id, to_user_id: friendId })
    setEncouraged(prev => ({ ...prev, [friendId]: true }))
    flash(setMsg, '¡Ánimo enviado! 💪')
  }

  const sortedFriends = [...friends].sort((a, b) => b.weekCount - a.weekCount)

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-800">Amigos</h1>

        {msg && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl">{msg}</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>}

        {/* Mi código de invitación */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🔗</span> Mi código de invitación
          </h2>
          {inviteCode ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-amber-800 tracking-widest">{inviteCode}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyInvite} className="btn-primary flex-1 py-2 text-sm">
                  📋 Copiar enlace
                </button>
                <button onClick={handleGenerateCode} className="btn-secondary flex-1 py-2 text-sm">
                  🔄 Nuevo código
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleGenerateCode} className="btn-primary w-full py-3">
              Generar mi código
            </button>
          )}
        </div>

        {/* Ingresar código de amigo */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>➕</span> Agregar un amigo
          </h2>
          <form onSubmit={handleAcceptCode} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              className="input-field flex-1 uppercase tracking-widest font-bold"
              placeholder="Ingresa el código"
              maxLength={6}
            />
            <button type="submit" className="btn-primary px-5">
              Agregar
            </button>
          </form>
        </div>

        {/* Solicitudes pendientes */}
        {pendingReceived.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-3">Solicitudes pendientes</h2>
            <div className="space-y-2">
              {pendingReceived.map(req => (
                <div key={req.id} className="flex items-center justify-between bg-amber-50 rounded-xl p-3">
                  <span className="text-sm font-medium text-gray-700">
                    {req.profiles?.display_name || 'Alguien'} quiere ser tu amigo
                  </span>
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Aceptar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking semanal */}
        {friends.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>🏆</span> Ranking esta semana
            </h2>
            <div className="space-y-2">
              {sortedFriends.map((f, i) => (
                <div
                  key={f.id}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    i === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    i === 1 ? 'bg-gray-50 border border-gray-200' :
                    i === 2 ? 'bg-orange-50 border border-orange-200' :
                    'bg-white border border-gray-100'
                  }`}
                >
                  <span className="text-xl w-8 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm truncate">{f.name}</p>
                      {f.todayDone && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Hoy ✓</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span>🔥 {f.streak} días</span>
                      <span>Día {f.currentDay}</span>
                      <span>{f.progress}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5 mt-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${f.progress}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-amber-700">{f.weekCount}</p>
                    <p className="text-xs text-gray-400">esta semana</p>
                  </div>
                  <button
                    onClick={() => handleEncourage(f.id)}
                    disabled={encouraged[f.id]}
                    className={`text-xl transition-all ${encouraged[f.id] ? 'opacity-40' : 'hover:scale-125'}`}
                    title="Animar"
                  >
                    💪
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && friends.length === 0 && (
          <div className="card text-center py-10">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-gray-500 text-sm">Aún no tienes amigos agregados.</p>
            <p className="text-gray-400 text-xs mt-1">Comparte tu código para comenzar juntos.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
