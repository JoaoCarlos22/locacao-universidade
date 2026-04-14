export default function ToastMessage({ type = 'success', text, onClose }) {
  if (!text) return null

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span>{text}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Fechar mensagem">
        x
      </button>
    </div>
  )
}