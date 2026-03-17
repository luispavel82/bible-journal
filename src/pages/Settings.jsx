import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { supabase } from '../lib/supabase'
import { toInputDate } from '../lib/dayUtils'
import Layout from '../components/Layout'

export default function Settings() {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfile()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [planStartDate, setPlanStartDate] = useState(
    profile?.plan_start_date ? toInputDate(profile.plan_start_date) : toInputDate(new Date())
  )
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    const { error } = await updateProfile({
      display_name: displayName.trim(),
      plan_start_date: planStartDate,
    })
    setProfileSaving(false)
    setProfileMsg(error ? 'Error al guardar. Intenta de nuevo.' : '¡Perfil actualizado!')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMsg('')
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)
    if (error) {
      setPasswordError('No se pudo cambiar la contraseña. Intenta cerrar sesión y volver a entrar.')
    } else {
      setPasswordMsg('¡Contraseña actualizada correctamente!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordMsg(''), 3000)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">←</button>
          <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
        </div>

        {/* Perfil */}
        <div className="card">
          <h2 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
            <span>👤</span> Perfil
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de perfil
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="input-field"
                maxLength={50}
                placeholder="¿Cómo quieres que te llamemos?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio de tu plan de lectura
              </label>
              <input
                type="date"
                value={planStartDate}
                onChange={e => setPlanStartDate(e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                Todos los días del plan se calcularán desde esta fecha.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field bg-gray-50 text-gray-400"
                disabled
              />
            </div>
            {profileMsg && (
              <div className={`text-sm p-3 rounded-lg ${profileMsg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {profileMsg}
              </div>
            )}
            <button type="submit" disabled={profileSaving} className="btn-primary w-full py-3">
              {profileSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Contraseña */}
        <div className="card">
          <h2 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
            <span>🔐</span> Cambiar contraseña
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Repite la nueva contraseña"
                required
              />
            </div>
            {passwordError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{passwordError}</div>
            )}
            {passwordMsg && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">{passwordMsg}</div>
            )}
            <button type="submit" disabled={passwordSaving} className="btn-primary w-full py-3">
              {passwordSaving ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
