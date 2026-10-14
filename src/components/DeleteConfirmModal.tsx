import { useEffect } from 'react'
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
  useEffect(() => {
    if (!show) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show, deleting, onCancel])

  if (!show) return null

  return (
    <div
      className="modal-backdrop-animated"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!deleting) onCancel()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1055,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modal-content-animated"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '0.875rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '440px',
          width: '100%',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        <div className="p-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 flex-shrink-0"
              style={{ width: 44, height: 44 }}
            >
              <Icon name="trash" size={20} className="text-danger" />
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                Confirmer la suppression
              </h5>
              <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                {message || (
                  <>
                    Êtes-vous sûr de vouloir supprimer <strong>« {name} »</strong> ? Cette action est irréversible et supprimera également les données associées.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div
          className="d-flex justify-content-end gap-2 px-4 py-3"
          style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}
        >
          <Button variant="secondary" onClick={onCancel} disabled={deleting} size="sm">
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting} size="sm">
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              <>
                <Icon name="trash" size={14} className="me-1" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
