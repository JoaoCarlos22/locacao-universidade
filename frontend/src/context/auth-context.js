import { createContext } from 'react'

export const AuthContext = createContext(null)

export function redirectPathByRole(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'diretor') return '/diretor/dashboard'
  return '/colaborador/dashboard'
}
