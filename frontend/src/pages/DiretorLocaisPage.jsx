import { useEffect, useState } from 'react'
import { api } from '../api/client'

function DiretorLocaisPage() {
  const [locais, setLocais] = useState([])
  const [recursos, setRecursos] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nome: '',
    tipo: 'sala_de_aula',
    bloco: '',
    numero: '',
    observacoes: '',
    equipamentos: {},
  })

  async function loadData() {
    const { data } = await api.get('/diretor/locais')
    setLocais(data.locais)
    setRecursos(data.recursos)
  }

  useEffect(() => {
    loadData().catch(() => setError('Falha ao carregar locais.'))
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const equipamentos = Object.entries(form.equipamentos)
        .map(([recursoId, quantidade]) => ({ recursoId: Number(recursoId), quantidade: Number(quantidade) }))
        .filter((e) => e.quantidade > 0)

      const payload = {
        nome: form.nome,
        tipo: form.tipo,
        bloco: form.bloco,
        numero: form.numero,
        observacoes: form.observacoes,
        equipamentos,
      }

      await api.post('/diretor/locais', payload)
      setMessage('Local cadastrado com sucesso.')
      setForm({ nome: '', tipo: 'sala_de_aula', bloco: '', numero: '', observacoes: '', equipamentos: {} })
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao cadastrar local.')
    }
  }

  async function deleteLocal(id) {
    try {
      await api.delete(`/diretor/locais/${id}`)
      setMessage('Local deletado com sucesso.')
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao deletar local.')
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Novo Local</h2>
        <form className="grid-form" onSubmit={handleCreate}>
          <label htmlFor="nome">Nome</label>
          <input id="nome" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} required />

          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}>
            <option value="laboratorio">Laboratorio</option>
            <option value="sala_de_aula">Sala de Aula</option>
            <option value="auditorio">Auditorio</option>
          </select>

          <label htmlFor="bloco">Bloco</label>
          <input id="bloco" value={form.bloco} onChange={(e) => setForm((p) => ({ ...p, bloco: e.target.value }))} required />

          <label htmlFor="numero">Numero</label>
          <input id="numero" value={form.numero} onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))} required />

          <label htmlFor="observacoes">Observacoes</label>
          <textarea
            id="observacoes"
            value={form.observacoes}
            onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
          />

          <div className="equipamentos">
            {recursos.map((recurso) => (
              <label key={recurso.id}>
                {recurso.nome}
                <input
                  type="number"
                  min="0"
                  value={form.equipamentos[recurso.id] || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      equipamentos: { ...prev.equipamentos, [recurso.id]: e.target.value },
                    }))
                  }
                />
              </label>
            ))}
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <button type="submit">Cadastrar local</button>
        </form>
      </section>

      <section className="card">
        <h2>Locais cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Bloco</th>
              <th>Numero</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {locais.map((local) => (
              <tr key={local.id}>
                <td>{local.nome}</td>
                <td>{local.tipo}</td>
                <td>{local.bloco}</td>
                <td>{local.numero}</td>
                <td>
                  <button type="button" onClick={() => deleteLocal(local.id)}>
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default DiretorLocaisPage
