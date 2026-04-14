import * as Toast from '@radix-ui/react-toast'
import { Cross1Icon } from '@radix-ui/react-icons'
import { IconButton } from '@radix-ui/themes'

export default function ToastMessage({ type = 'success', text, onClose }) {
  if (!text) return null

  return (
    <Toast.Root className={`toast toast-${type}`} open={Boolean(text)} onOpenChange={(open) => !open && onClose?.()}>
      <Toast.Title className="toast-title">{text}</Toast.Title>
      <Toast.Close asChild>
        <IconButton type="button" variant="ghost" color="gray" size="1" aria-label="Fechar mensagem">
          <Cross1Icon />
        </IconButton>
      </Toast.Close>
    </Toast.Root>
  )
}