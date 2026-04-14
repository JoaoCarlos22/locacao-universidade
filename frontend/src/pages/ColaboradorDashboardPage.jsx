import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import TableSkeleton from '../components/TableSkeleton'
import ToastMessage from '../components/ToastMessage'

function ColaboradorDashboardPage() {
  const [payload, setPayload] = useState({ reservas: [], locais: [], recursos: [], locaisRecursos: [] })
  const [form, setForm] = useState({ localId: '', motivo: '', inicioPer: '', fimPer: '', equipamentos: {} })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  async function loadDashboard() {
    setIsLoading(true)
    try {
      const { data } = await api.get('/colaborador/dashboard')
      setPayload(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard().catch(() => setError('Falha ao carregar dados do colaborador.'))
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const timeout = setTimeout(() => {
      setMessage('')
      setError('')
    }, 4000)

    return () => clearTimeout(timeout)
  }, [message, error])

  const equipamentosDoLocal = useMemo(
    () => payload.locaisRecursos.filter((lr) => String(lr.localId) === String(form.localId)),
    [payload.locaisRecursos, form.localId],
  )

  const reservasPendentes = payload.reservas.filter((reserva) => reserva.status === 'pendente').length

  function recursoName(recursoId) {
    return payload.recursos.find((r) => r.id === recursoId)?.nome || `Recurso ${recursoId}`
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const equipamentos = Object.entries(form.equipamentos)
        .map(([locaisRecursosId, quantidade]) => ({ locaisRecursosId: Number(locaisRecursosId), quantidade: Number(quantidade) }))
        .filter((e) => e.quantidade > 0)

      await api.post('/colaborador/reservas', {
        localId: Number(form.localId),
        motivo: form.motivo,
        inicioPer: form.inicioPer,
        fimPer: form.fimPer,
        equipamentos,
      })

      setForm({ localId: '', motivo: '', inicioPer: '', fimPer: '', equipamentos: {} })
      setMessage('Reserva criada com sucesso.')
      await loadDashboard()
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao criar reserva.')
    }
  }

  return (
    <div className="dashboard-grid">
      <section className="page-header">
        <div>
          <h2>Dashboard do Colaborador</h2>
          <p>Solicite novos espacos e acompanhe o andamento das suas reservas.</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Minhas reservas</p>
          <p className="stat-value">{payload.reservas.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pendentes</p>
          <p className="stat-value">{reservasPendentes}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Locais disponiveis</p>
          <p className="stat-value">{payload.locais.length}</p>
        </article>
      </section>

      <section className="card">
        <h2>Nova Reserva</h2>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label htmlFor="localId">Local</label>
          <select id="localId" value={form.localId} onChange={(e) => setForm((p) => ({ ...p, localId: e.target.value }))} required>
            <option value="">Selecione</option>
            {payload.locais.map((local) => (
              <option key={local.id} value={local.id}>
                {local.nome} - {local.bloco || 'Sem bloco'}
              </option>
            ))}
          </select>

          <label htmlFor="motivo">Motivo</label>
          <textarea id="motivo" value={form.motivo} onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))} required />

          <label htmlFor="inicioPer">Inicio</label>
          <input
            id="inicioPer"
            type="datetime-local"
            value={form.inicioPer}
            onChange={(e) => setForm((p) => ({ ...p, inicioPer: e.target.value }))}
            required
          />

          <label htmlFor="fimPer">Fim</label>
          <input
            id="fimPer"
            type="datetime-local"
            value={form.fimPer}
            onChange={(e) => setForm((p) => ({ ...p, fimPer: e.target.value }))}
            required
          />

          {equipamentosDoLocal.length > 0 && (
            <div className="equipamentos">
              {equipamentosDoLocal.map((item) => (
                <label key={item.id}>
                  {recursoName(item.recursoId)} (max {item.quantidade})
                  <input
                    type="number"
                    min="0"
                    max={item.quantidade}
                    value={form.equipamentos[item.id] || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        equipamentos: { ...prev.equipamentos, [item.id]: e.target.value },
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          )}
          <button type="submit" className="btn btn-primary">
            Solicitar Reserva
          </button>
        </form>
      </section>

      <section className="card table-card">
        <h2>Minhas Reservas</h2>
        <div className="table-wrap">
          <table className="table table-hover table-sm mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Local</th>
                <th>Inicio</th>
                <th>Fim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableSkeleton rows={6} columns={5} />}
              {!isLoading && payload.reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.id}</td>
                  <td>{reserva.localNome || '-'}</td>
                  <td>{new Date(reserva.inicioPer).toLocaleString()}</td>
                  <td>{new Date(reserva.fimPer).toLocaleString()}</td>
                  <td>
                    <StatusBadge status={reserva.status} />
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
    </div>
  )
}

export default ColaboradorDashboardPage
