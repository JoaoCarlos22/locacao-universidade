import { useEffect, useState } from 'react'
import { api } from '../api/client'

function ProfilePage() {
  const [profile, setProfile] = useState({ nome: '', email: '', role: '' })
  const [senha, setSenha] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data } = await api.get('/profile')
      setProfile(data)
    }

    loadProfile().catch(() => setError('Nao foi possivel carregar o perfil.'))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await api.put('/profile', {
        nome: profile.nome,
        email: profile.email,
        senha: senha || null,
      })
      setMessage('Perfil atualizado com sucesso.')
      setSenha('')
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao atualizar perfil.')
    }
  }

  return (
    <section className="card">
      <h2>Meu Perfil</h2>
      <form onSubmit={handleSubmit} className="grid-form">
        <label htmlFor="nome">Nome</label>
        <input id="nome" value={profile.nome} onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))} />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
        />

        <label htmlFor="role">Perfil</label>
        <input id="role" value={profile.role} disabled />

        <label htmlFor="senha">Nova senha (opcional)</label>
        <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit">Salvar</button>
      </form>
    </section>
  )
}

export default ProfilePage
