import { useEffect, useState } from 'react'
import { Button, Spinner } from './ui'
import Icon from './Icon'

interface DeleteConfirmModalProps {
  show: boolean
  name: string
  message?: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  show,
  name,
  message,
  deleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      setLeaving(false)
    } else if (visible) {
      setLeaving(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setLeaving(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!visible) return null

  const handleCancel = () => {
    if (deleting) return
    setLeaving(true)
    setTimeout(() => {
      setVisible(false)
      setLeaving(false)
      onCancel()
    }, 200)
  }

  const handleConfirm = () => {
    setLeaving(true)
    setTimeout(() => {
      setVisible(false)
      setLeaving(false)
      onConfirm()
    }, 200)
  }

  return (
    <div
      className={`modal-backdrop-animated ${leaving ? 'modal-backdrop-leaving' : ''}`}
      onClick={handleCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 1055,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className={`modal-content-animated ${leaving ? 'modal-content-leaving' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '420px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div className="p-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 flex-shrink-0"
              style={{ width: 48, height: 48 }}
            >
              <Icon name="trash" size={22} className="text-danger" />
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1">Confirmer la suppression</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                {message || `Êtes-vous sûr de vouloir supprimer « ${name} » ? Cette action est irréversible.`}
              </p>
            </div>
          </div>
        </div>
        <div
          className="d-flex justify-content-end gap-2 px-4 py-3 bg-light"
          style={{ borderTop: '1px solid #f1f5f9' }}
        >
          <Button variant="secondary" onClick={handleCancel} disabled={deleting}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              <>
                <Icon name="trash" size={14} className="me-1" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
