function normalizeStatus(status) {
  return String(status || '').toLowerCase().trim()
}

export default function StatusBadge({ status }) {
  const normalized = normalizeStatus(status)
  const variant =
    normalized === 'aprovado'
      ? 'text-bg-success'
      : normalized === 'reprovado' || normalized === 'rejeitado'
        ? 'text-bg-danger'
        : normalized === 'pendente'
          ? 'text-bg-warning text-dark'
          : 'text-bg-secondary'

  return <span className={`badge ${variant}`}>{status || 'indefinido'}</span>
}