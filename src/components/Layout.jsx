import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'text-amber-800 border-b-2 border-amber-600 pb-1'
          : 'text-gray-600 hover:text-amber-700'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">✝️</span>
            <div>
              <p className="font-bold text-amber-900 leading-tight text-sm">Diario Bíblico</p>
              <p className="text-xs text-gray-500 leading-tight">La Biblia en un Año</p>
            </div>
          </Link>
          {user && (
            <nav className="flex items-center gap-5">
              {navLink('/dashboard', 'Inicio')}
              {navLink('/today', 'Hoy')}
              {navLink('/calendar', 'Calendario')}
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Salir
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-amber-100 bg-white">
        Basado en "La Biblia en un Año" — Fray Sergio Serrano &amp; Dempsey Rosales
      </footer>
    </div>
  )
}
