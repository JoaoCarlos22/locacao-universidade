import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ColaboradorDashboardPage from './pages/ColaboradorDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import DiretorDashboardPage from './pages/DiretorDashboardPage'
import DiretorLocaisPage from './pages/DiretorLocaisPage'
import ProfilePage from './pages/ProfilePage'
import ServerOfflinePage from './pages/ServerOfflinePage'
import ShellLayout from './components/ShellLayout'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/perfil" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/servidor-indisponivel" element={<ServerOfflinePage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ShellLayout />
          </ProtectedRoute>
        }
      >
        <Route path="perfil" element={<ProfilePage />} />

        <Route
          path="colaborador/dashboard"
          element={
            <ProtectedRoute roles={['colaborador']}>
              <ColaboradorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="diretor/dashboard"
          element={
            <ProtectedRoute roles={['diretor']}>
              <DiretorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="diretor/locais"
          element={
            <ProtectedRoute roles={['diretor']}>
              <DiretorLocaisPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
