import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DayEntry from './pages/DayEntry'
import Calendar from './pages/Calendar'

function TodayRedirect() {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const day = Math.min(
    Math.ceil((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1,
    365
  )
  return <Navigate to={`/day/${day}`} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/today" element={<ProtectedRoute><TodayRedirect /></ProtectedRoute>} />
          <Route path="/day/:dayNumber" element={<ProtectedRoute><DayEntry /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
