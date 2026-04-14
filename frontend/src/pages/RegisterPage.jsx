import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'colaborador',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await register(form)
      setSuccess('Conta criada com sucesso. Faça login.')
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao registrar usuário.')
    }
  }

  return (
    <div className="auth-page">
      <form className="card shadow-sm auth-form" onSubmit={handleSubmit}>
        <h2>Criar nova conta</h2>
        <p className="auth-subtitle">Cadastre seu usuario para acessar o ambiente de locacao.</p>

        <label htmlFor="nome">Nome</label>
        <input id="nome" value={form.nome} onChange={(e) => updateField('nome', e.target.value)} required />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />

        <label htmlFor="password">Senha</label>
        <input id="password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />

        <label htmlFor="confirmPassword">Confirmar senha</label>
        <input
          id="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          required
        />

        <label htmlFor="role">Perfil</label>
        <select id="role" value={form.role} onChange={(e) => updateField('role', e.target.value)}>
          <option value="colaborador">Colaborador</option>
          <option value="admin">Admin</option>
          <option value="diretor">Diretor</option>
        </select>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" className="btn btn-primary">
          Registrar
        </button>
        <Link className="auth-link" to="/login">
          Voltar para login
        </Link>
      </form>
    </div>
  )
}

export default RegisterPage
