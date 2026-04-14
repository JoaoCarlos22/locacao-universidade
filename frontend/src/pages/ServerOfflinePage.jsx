import { useNavigate } from 'react-router-dom'
import { Button, Card, Heading, Text } from '@radix-ui/themes'

export default function ServerOfflinePage() {
  const navigate = useNavigate()

  const handleRetry = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/login', { replace: true })
  }

  return (
    <main className="server-offline-page">
      <Card className="server-offline-card">
        <Heading as="h1" size="7">
          Servidor indisponivel
        </Heading>
        <Text as="p" color="gray">
          Nao foi possivel conectar com a API no momento. Verifique se o backend esta em execução e tente novamente.
        </Text>
        <Button type="button" size="3" onClick={handleRetry}>
          Tentar novamente
        </Button>
      </Card>
    </main>
  )
}