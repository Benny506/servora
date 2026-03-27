import { Modal } from 'react-bootstrap'

export default function ConfirmActionModal({
  show,
  icon,
  title,
  subText,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  isBusy = false,
}) {
  return (
    <Modal
      show={show}
      onHide={isBusy ? undefined : onCancel}
      centered
      contentClassName="sv-confirm-modal"
    >
      <div className="sv-confirm-modal__body">
        <div className="sv-confirm-modal__icon" aria-hidden="true">
          {icon}
        </div>
        <div className="sv-confirm-modal__title">{title}</div>
        {subText ? <div className="sv-confirm-modal__sub">{subText}</div> : null}
      </div>
      <div className="sv-confirm-modal__footer">
        <button
          type="button"
          className="btn btn-outline-primary sv-confirm-modal__btn"
          onClick={onCancel}
          disabled={isBusy}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`btn btn-${confirmVariant} sv-confirm-modal__btn`}
          onClick={onConfirm}
          disabled={isBusy}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

