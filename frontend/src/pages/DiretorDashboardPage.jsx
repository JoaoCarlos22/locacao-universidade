import { useEffect, useState } from 'react'
import { api } from '../api/client'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import TableSkeleton from '../components/TableSkeleton'
import ToastMessage from '../components/ToastMessage'

function DiretorDashboardPage() {
  const [reservas, setReservas] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadReservas() {
    setIsLoading(true)
    try {
      const { data } = await api.get('/diretor/reservas')
      setReservas(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservas().catch(() => setError('Falha ao carregar reservas.'))
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const timeout = setTimeout(() => {
      setMessage('')
      setError('')
    }, 4000)

    return () => clearTimeout(timeout)
  }, [message, error])

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

  async function confirmAction() {
    if (!pendingAction) return

    if (pendingAction.type === 'aprovar') {
      await aprovar(pendingAction.id)
    }

    if (pendingAction.type === 'reprovar') {
      await reprovar(pendingAction.id)
    }

    setPendingAction(null)
  }

  const pendentes = reservas.filter((reserva) => reserva.status === 'pendente').length
  const aprovadas = reservas.filter((reserva) => reserva.status === 'aprovado').length

  return (
    <div className="dashboard-grid">
      <section className="page-header">
        <div>
          <h2>Painel da Diretoria</h2>
          <p>Aprove ou reprove reservas encaminhadas para decisao final.</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Total em analise</p>
          <p className="stat-value">{reservas.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pendentes</p>
          <p className="stat-value">{pendentes}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Aprovadas</p>
          <p className="stat-value">{aprovadas}</p>
        </article>
      </section>

      <section className="card table-card">
        <div className="table-wrap">
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
              {isLoading && <TableSkeleton rows={6} columns={5} />}
              {!isLoading && reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.id}</td>
                  <td>{reserva.solicitanteNome || '-'}</td>
                  <td>{reserva.localNome || '-'}</td>
                  <td>
                    <StatusBadge status={reserva.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => setPendingAction({ id: reserva.id, type: 'aprovar' })}>
                        Aprovar
                      </button>
                      <button type="button" className="btn-danger" onClick={() => setPendingAction({ id: reserva.id, type: 'reprovar' })}>
                        Reprovar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="toast-stack">
        <ToastMessage type="error" text={error} onClose={() => setError('')} />
        <ToastMessage type="success" text={message} onClose={() => setMessage('')} />
      </div>

      <ConfirmModal
        open={Boolean(pendingAction)}
        title={pendingAction?.type === 'aprovar' ? 'Confirmar aprovacao' : 'Confirmar reprovacao'}
        description={
          pendingAction?.type === 'aprovar'
            ? 'Deseja aprovar esta reserva agora?'
            : 'Deseja reprovar esta reserva agora?'
        }
        confirmLabel={pendingAction?.type === 'aprovar' ? 'Aprovar' : 'Reprovar'}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
        danger={pendingAction?.type === 'reprovar'}
      />
    </div>
  )
}

export default DiretorDashboardPage
