import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const AuthContext = createContext(null)

function redirectPathByRole(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'diretor') return '/diretor/dashboard'
  return '/colaborador/dashboard'
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const userData = {
      id: data.userId,
      nome: data.nome,
      email: data.email,
      role: data.role,
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    navigate(redirectPathByRole(data.role))
  }

  const register = async (payload) => {
    await api.post('/auth/register', payload)
    navigate('/login')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const value = useMemo(
    () => ({ user, login, register, logout, redirectPathByRole }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
