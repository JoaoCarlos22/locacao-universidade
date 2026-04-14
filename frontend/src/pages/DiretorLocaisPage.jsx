import { useEffect, useState } from 'react'
import { Badge, Button, Card, Heading, Select, Text, TextArea, TextField } from '@radix-ui/themes'
import { api } from '../api/client'
import ConfirmModal from '../components/ConfirmModal'
import TableSkeleton from '../components/TableSkeleton'
import ToastStack from '../components/ToastStack'

function DiretorLocaisPage() {
  const [locais, setLocais] = useState([])
  const [recursos, setRecursos] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [localToDelete, setLocalToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({
    nome: '',
    tipo: 'sala_de_aula',
    bloco: '',
    numero: '',
    observacoes: '',
    equipamentos: {},
  })

  async function loadData() {
    setIsLoading(true)
    try {
      const { data } = await api.get('/diretor/locais')
      setLocais(data.locais)
      setRecursos(data.recursos)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData().catch(() => setError('Falha ao carregar locais.'))
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const timeout = setTimeout(() => {
      setMessage('')
      setError('')
    }, 4000)

    return () => clearTimeout(timeout)
  }, [message, error])

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

  const laboratorios = locais.filter((local) => local.tipo === 'laboratorio').length
  const salas = locais.filter((local) => local.tipo === 'sala_de_aula').length

  return (
    <div className="dashboard-grid">
      <section className="page-header">
        <div>
          <Heading as="h2" size="6">
            Gestao de Locais
          </Heading>
          <Text color="gray">Cadastre ambientes e configure os recursos disponiveis.</Text>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Total de locais</p>
          <p className="stat-value">{locais.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Laboratorios</p>
          <p className="stat-value">{laboratorios}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Salas de aula</p>
          <p className="stat-value">{salas}</p>
        </article>
      </section>

      <Card>
        <Heading as="h2" size="5" mb="3">
          Novo Local
        </Heading>
        <form className="grid-form" onSubmit={handleCreate}>
          <label htmlFor="nome">Nome</label>
          <TextField.Root id="nome" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} required />

          <label htmlFor="tipo">Tipo</label>
          <Select.Root value={form.tipo} onValueChange={(value) => setForm((p) => ({ ...p, tipo: value }))}>
            <Select.Trigger id="tipo" />
            <Select.Content>
              <Select.Item value="laboratorio">Laboratorio</Select.Item>
              <Select.Item value="sala_de_aula">Sala de Aula</Select.Item>
              <Select.Item value="auditorio">Auditorio</Select.Item>
            </Select.Content>
          </Select.Root>

          <label htmlFor="bloco">Bloco</label>
          <TextField.Root id="bloco" value={form.bloco} onChange={(e) => setForm((p) => ({ ...p, bloco: e.target.value }))} required />

          <label htmlFor="numero">Numero</label>
          <TextField.Root id="numero" value={form.numero} onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))} required />

          <label htmlFor="observacoes">Observacoes</label>
          <TextArea
            id="observacoes"
            value={form.observacoes}
            onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
          />

          <div className="equipamentos">
            {recursos.map((recurso) => (
              <label key={recurso.id}>
                {recurso.nome}
                <TextField.Root
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

          <Button type="submit" size="3">
            Cadastrar Local
          </Button>
        </form>
      </Card>

      <Card className="table-card">
        <Heading as="h2" size="5" mb="3">
          Locais cadastrados
        </Heading>
        <div className="table-wrap">
          <table className="app-table">
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
              {isLoading && <TableSkeleton rows={6} columns={5} />}
              {!isLoading && locais.map((local) => (
                <tr key={local.id}>
                  <td>{local.nome}</td>
                  <td>
                    <Badge color="gray" variant="soft">
                      {local.tipo}
                    </Badge>
                  </td>
                  <td>{local.bloco}</td>
                  <td>{local.numero}</td>
                  <td>
                    <div className="table-actions">
                      <Button type="button" variant="soft" color="red" onClick={() => setLocalToDelete(local)}>
                        Deletar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ToastStack error={error} message={message} onClearError={() => setError('')} onClearMessage={() => setMessage('')} />

      <ConfirmModal
        open={Boolean(localToDelete)}
        title="Confirmar exclusao"
        description={`Deseja realmente deletar o local ${localToDelete?.nome || ''}?`}
        confirmLabel="Deletar"
        onCancel={() => setLocalToDelete(null)}
        onConfirm={async () => {
          if (!localToDelete) return
          await deleteLocal(localToDelete.id)
          setLocalToDelete(null)
        }}
        danger
      />
    </div>
  )
}

export default DiretorLocaisPage
