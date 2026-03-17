import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Landing() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-16">
        <div className="text-6xl mb-6">✝️</div>
        <h1 className="text-4xl font-bold text-amber-900 mb-2">Diario Bíblico</h1>
        <p className="text-xl text-amber-700 mb-1">La Biblia en un Año</p>
        <p className="text-gray-500 mb-1 max-w-sm text-sm">Acompañando el libro de</p>
        <p className="text-gray-700 font-semibold mb-10 max-w-sm">Fray Sergio Serrano &amp; Dempsey Rosales</p>

        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Un espacio para reflexionar tu lectura diaria</h2>
          <div className="space-y-4 text-left text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-xl">📖</span>
              <span>Plan de lectura diario: AT, NT, Salmos y Proverbios</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✍️</span>
              <span>Reflexiones, oraciones y aplicaciones personales guiadas</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📅</span>
              <span>Seguimiento visual de tu progreso durante los 365 días</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <span>Diario privado y personal, solo tuyo</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link to="/register" className="btn-primary text-center flex-1 py-3 text-base">
            Crear cuenta
          </Link>
          <Link to="/login" className="btn-secondary text-center flex-1 py-3 text-base">
            Iniciar sesión
          </Link>
        </div>
      </div>
      <footer className="text-center text-xs text-gray-400 py-4">
        Basado en "La Biblia en un Año" — Fray Sergio Serrano &amp; Dempsey Rosales
      </footer>
    </div>
  )
}
