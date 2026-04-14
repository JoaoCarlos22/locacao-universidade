import * as Toast from '@radix-ui/react-toast'
import ToastMessage from './ToastMessage'

export default function ToastStack({ error, message, onClearError, onClearMessage }) {
  return (
    <Toast.Provider swipeDirection="right" duration={4000}>
      <ToastMessage type="error" text={error} onClose={onClearError} />
      <ToastMessage type="success" text={message} onClose={onClearMessage} />
      <Toast.Viewport className="toast-viewport" />
    </Toast.Provider>
  )
}
