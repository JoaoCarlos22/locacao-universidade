export default function ConfirmModal({ open, title, description, confirmLabel, onCancel, onConfirm, danger = false }) {
  if (!open) return null

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="modal-title">{title}</h3>
        <p>{description}</p>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className={danger ? 'btn-danger' : ''} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}