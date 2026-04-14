import { useEffect, useState } from 'react'
import { api } from '../api/client'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import TableSkeleton from '../components/TableSkeleton'
import ToastMessage from '../components/ToastMessage'

function AdminDashboardPage() {
  const [reservas, setReservas] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadReservas() {
    setIsLoading(true)
    try {
      const { data } = await api.get('/admin/reservas')
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

  async function reprovar(id) {
    setError('')
    setMessage('')
    try {
      const { data } = await api.post(`/admin/reservas/${id}/reprovar`)
      setMessage(data.message)
      await loadReservas()
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao reprovar reserva.')
    }
  }

  async function encaminhar(id) {
    setError('')
    setMessage('')
    try {
      const { data } = await api.post(`/admin/reservas/${id}/enviar-diretoria`)
      setMessage(data.message)
      await loadReservas()
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao encaminhar reserva.')
    }
  }

  async function confirmAction() {
    if (!pendingAction) return

    if (pendingAction.type === 'encaminhar') {
      await encaminhar(pendingAction.id)
    }

    if (pendingAction.type === 'reprovar') {
      await reprovar(pendingAction.id)
    }

    setPendingAction(null)
  }

  const pendentes = reservas.filter((reserva) => reserva.status === 'pendente').length

  return (
    <div className="dashboard-grid">
      <section className="page-header">
        <div>
          <h2>Dashboard Administrativo</h2>
          <p>Gerencie reservas e encaminhe para a diretoria.</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Total de reservas</p>
          <p className="stat-value">{reservas.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pendentes</p>
          <p className="stat-value">{pendentes}</p>
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
                      <button type="button" onClick={() => setPendingAction({ id: reserva.id, type: 'encaminhar' })}>
                        Encaminhar
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
        title={pendingAction?.type === 'reprovar' ? 'Confirmar reprovacao' : 'Confirmar encaminhamento'}
        description={
          pendingAction?.type === 'reprovar'
            ? 'Tem certeza que deseja reprovar esta reserva?'
            : 'Deseja encaminhar esta reserva para avaliacao da diretoria?'
        }
        confirmLabel={pendingAction?.type === 'reprovar' ? 'Reprovar' : 'Encaminhar'}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
        danger={pendingAction?.type === 'reprovar'}
      />
    </div>
  )
}

export default AdminDashboardPage
