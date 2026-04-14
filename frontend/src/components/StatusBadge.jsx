import { Badge } from '@radix-ui/themes'

function normalizeStatus(status) {
  return String(status || '').toLowerCase().trim()
}

export default function StatusBadge({ status }) {
  const normalized = normalizeStatus(status)
  const color =
    normalized === 'aprovado'
      ? 'green'
      : normalized === 'reprovado' || normalized === 'rejeitado'
        ? 'red'
        : normalized === 'pendente'
          ? 'amber'
          : 'gray'

  return (
    <Badge color={color} variant="soft" radius="full" size="2">
      {status || 'indefinido'}
    </Badge>
  )
}