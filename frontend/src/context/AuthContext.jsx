import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { AuthContext, redirectPathByRole } from './auth-context'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return null

    try {
      return JSON.parse(storedUser)
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

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

  const value = { user, login, register, logout, redirectPathByRole }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
