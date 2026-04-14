import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Callout, Card, Flex, Heading, Select, Text, TextField } from '@radix-ui/themes'
import { useAuth } from '../context/useAuth'

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
      <Card className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Heading as="h2" size="6">
            Criar nova conta
          </Heading>
          <Text as="p" color="gray" className="auth-subtitle">
            Cadastre seu usuario para acessar o ambiente de locacao.
          </Text>

          <label htmlFor="nome">Nome</label>
          <TextField.Root id="nome" value={form.nome} onChange={(e) => updateField('nome', e.target.value)} required />

          <label htmlFor="email">Email</label>
          <TextField.Root id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />

          <label htmlFor="password">Senha</label>
          <TextField.Root id="password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />

          <label htmlFor="confirmPassword">Confirmar senha</label>
          <TextField.Root
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            required
          />

          <label htmlFor="role">Perfil</label>
          <Select.Root value={form.role} onValueChange={(value) => updateField('role', value)}>
            <Select.Trigger id="role" />
            <Select.Content>
              <Select.Item value="colaborador">Colaborador</Select.Item>
              <Select.Item value="admin">Admin</Select.Item>
              <Select.Item value="diretor">Diretor</Select.Item>
            </Select.Content>
          </Select.Root>

          {error && <Callout.Root color="red">{error}</Callout.Root>}
          {success && <Callout.Root color="green">{success}</Callout.Root>}

          <Flex direction="column" gap="2" mt="2">
            <Button type="submit" size="3">
              Registrar
            </Button>
            <Link className="auth-link" to="/login">
              Voltar para login
            </Link>
          </Flex>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPage
