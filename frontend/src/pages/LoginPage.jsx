import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Callout, Card, Flex, Heading, Text, TextField } from '@radix-ui/themes'
import { useAuth } from '../context/useAuth'

function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao realizar login.')
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Heading as="h2" size="6">
            Acesso ao sistema
          </Heading>
          <Text as="p" color="gray" className="auth-subtitle">
            Entre para acessar seu painel de reservas universitarias.
          </Text>

          <label htmlFor="email">Email</label>
          <TextField.Root id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Senha</label>
          <TextField.Root id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <Callout.Root color="red">{error}</Callout.Root>}

          <Flex direction="column" gap="2" mt="2">
            <Button type="submit" size="3">
              Entrar
            </Button>
            <Link className="auth-link" to="/register">
              Criar conta
            </Link>
          </Flex>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
