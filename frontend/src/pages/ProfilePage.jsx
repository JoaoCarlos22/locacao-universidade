import { useEffect, useState } from 'react'
import { Button, Callout, Card, Heading, Text, TextField } from '@radix-ui/themes'
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
    <div className="dashboard-grid">
      <section className="page-header">
        <div>
          <Heading as="h2" size="6">
            Meu Perfil
          </Heading>
          <Text color="gray">Atualize seus dados e mantenha sua conta segura.</Text>
        </div>
      </section>

      <Card>
        <form onSubmit={handleSubmit} className="grid-form">
          <label htmlFor="nome">Nome</label>
          <TextField.Root id="nome" value={profile.nome} onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))} />

          <label htmlFor="email">Email</label>
          <TextField.Root
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          />

          <label htmlFor="role">Perfil</label>
          <TextField.Root id="role" value={profile.role} disabled />

          <label htmlFor="senha">Nova senha (opcional)</label>
          <TextField.Root id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />

          {error && <Callout.Root color="red">{error}</Callout.Root>}
          {message && <Callout.Root color="green">{message}</Callout.Root>}
          <Button type="submit" size="3">
            Salvar alteracoes
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default ProfilePage
