import { useNavigate } from 'react-router-dom'

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
      <section className="card shadow-sm server-offline-card">
        <h1>Servidor indisponivel</h1>
        <p>
          Nao foi possivel conectar com a API no momento. Verifique se o backend esta em execução e tente novamente.
        </p>
        <button type="button" className="btn btn-primary" onClick={handleRetry}>
          Tentar novamente
        </button>
      </section>
    </main>
  )
}