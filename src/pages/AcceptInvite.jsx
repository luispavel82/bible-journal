import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AcceptInvite() {
  const { code } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | error | needs_auth

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setStatus('needs_auth')
      return
    }
    acceptInvite()
  }, [user, authLoading])

  const acceptInvite = async () => {
    const { data: codeRow } = await supabase
      .from('invite_codes')
      .select('user_id')
      .eq('code', code.toUpperCase())
      .maybeSingle()

    if (!codeRow) { setStatus('error'); return }
    if (codeRow.user_id === user.id) { setStatus('self'); return }

    const { error } = await supabase.from('friendships').insert({
      user_id: codeRow.user_id,
      friend_id: user.id,
      status: 'accepted',
    })

    if (error && error.code === '23505') {
      // Ya son amigos
      setStatus('already')
    } else if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => navigate('/friends'), 2000)
    }
  }

  if (status === 'needs_auth') {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invitación de amigo</h2>
          <p className="text-gray-500 text-sm mb-5">Necesitas una cuenta para aceptar esta invitación.</p>
          <div className="flex flex-col gap-2">
            <Link to={`/register?invite=${code}`} className="btn-primary py-3 text-center">Crear cuenta</Link>
            <Link to={`/login?invite=${code}`} className="btn-secondary py-3 text-center">Ya tengo cuenta</Link>
          </div>
        </div>
      </div>
    )
  }

  const messages = {
    loading: { icon: '⏳', title: 'Procesando invitación...', sub: '' },
    success: { icon: '🎉', title: '¡Amigo agregado!', sub: 'Redirigiendo...' },
    already: { icon: '✅', title: '¡Ya son amigos!', sub: '' },
    self: { icon: '😅', title: 'Ese es tu propio código', sub: 'Compártelo con alguien más.' },
    error: { icon: '❌', title: 'Código inválido', sub: 'Verifica el código e intenta de nuevo.' },
  }
  const m = messages[status] || messages.loading

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{m.icon}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{m.title}</h2>
        {m.sub && <p className="text-gray-500 text-sm mb-4">{m.sub}</p>}
        {(status === 'error' || status === 'self' || status === 'already') && (
          <Link to="/friends" className="btn-primary inline-block px-6 py-2 mt-2">Ir a Amigos</Link>
        )}
      </div>
    </div>
  )
}
