import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DayEntry from './pages/DayEntry'
import Calendar from './pages/Calendar'
import SharedEntry from './pages/SharedEntry'
import ExportDiary from './pages/ExportDiary'
import Settings from './pages/Settings'
import Friends from './pages/Friends'
import AcceptInvite from './pages/AcceptInvite'
import { useProfile } from './context/ProfileContext'
import { getCurrentDayNumber } from './lib/dayUtils'

function TodayRedirect() {
  const { planStartDate } = useProfile()
  const day = getCurrentDayNumber(planStartDate)
  return <Navigate to={`/day/${day}`} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/share/:token" element={<SharedEntry />} />
            <Route path="/invite/:code" element={<AcceptInvite />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/today" element={<ProtectedRoute><TodayRedirect /></ProtectedRoute>} />
            <Route path="/day/:dayNumber" element={<ProtectedRoute><DayEntry /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><ExportDiary /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  )
}
