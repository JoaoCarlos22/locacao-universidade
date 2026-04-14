function normalizeStatus(status) {
  return String(status || '').toLowerCase().trim()
}

export default function StatusBadge({ status }) {
  const normalized = normalizeStatus(status)
  const variant =
    normalized === 'aprovado'
      ? 'status-approved'
      : normalized === 'reprovado' || normalized === 'rejeitado'
        ? 'status-rejected'
        : normalized === 'pendente'
          ? 'status-pending'
          : 'status-default'

  return <span className={`status-badge ${variant}`}>{status || 'indefinido'}</span>
}