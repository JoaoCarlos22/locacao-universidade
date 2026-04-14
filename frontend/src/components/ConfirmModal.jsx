import * as Dialog from '@radix-ui/react-dialog'
import { Button, Flex, Text } from '@radix-ui/themes'

export default function ConfirmModal({ open, title, description, confirmLabel, onCancel, onConfirm, danger = false }) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-card" aria-describedby="confirm-description">
          <Dialog.Title className="modal-title">{title}</Dialog.Title>
          <Dialog.Description asChild>
            <Text id="confirm-description" size="2" color="gray">
              {description}
            </Text>
          </Dialog.Description>
          <Flex justify="end" gap="2" mt="3">
            <Button type="button" variant="soft" color="gray" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" color={danger ? 'red' : 'cyan'} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}