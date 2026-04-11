import { useEffect, useState } from 'react'
import { api } from '../api/client'

function DiretorDashboardPage() {
  const [reservas, setReservas] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadReservas() {
    const { data } = await api.get('/diretor/reservas')
    setReservas(data)
  }

  useEffect(() => {
    loadReservas().catch(() => setError('Falha ao carregar reservas.'))
  }, [])

  async function aprovar(id) {
    setError('')
    setMessage('')
    try {
      const { data } = await api.post(`/diretor/reservas/${id}/aprovar`)
      setMessage(data.message)
      await loadReservas()
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao aprovar reserva.')
    }
  }

  async function reprovar(id) {
    setError('')
    setMessage('')
    try {
      const { data } = await api.post(`/diretor/reservas/${id}/reprovar`)
      setMessage(data.message)
      await loadReservas()
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao reprovar reserva.')
    }
  }

  return (
    <section className="card">
      <h2>Painel da Diretoria</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Solicitante</th>
            <th>Local</th>
            <th>Status</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>{reserva.id}</td>
              <td>{reserva.solicitanteNome || '-'}</td>
              <td>{reserva.localNome || '-'}</td>
              <td>{reserva.status}</td>
              <td>
                <button type="button" onClick={() => aprovar(reserva.id)}>
                  Aprovar
                </button>
                <button type="button" onClick={() => reprovar(reserva.id)}>
                  Reprovar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default DiretorDashboardPage
