import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import Icon from './Icon'
import { useTheme } from '../context/ThemeContext'

export interface PhotoUploadProps {
  value: string | null
  onChange: (photo: string | null) => void
  name?: string
  label?: string
}

export default function PhotoUpload({
  value,
  onChange,
  name = 'Photo',
  label = "Photo d'identité ou profil",
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError('La photo est trop volumineuse (maximum 2 Mo).')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setError(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const initial = name ? name.trim().charAt(0).toUpperCase() : 'P'

  return (
    <div
      className="p-3 rounded-3 border mb-3 transition-colors"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
        borderColor: isDark ? '#334155' : '#e2e8f0',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        {/* Avatar Preview */}
        <div
          className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0 position-relative"
          style={{
            width: 64,
            height: 64,
            backgroundColor: '#0284c7',
            border: `2px solid ${isDark ? '#38bdf8' : '#ffffff'}`,
          }}
        >
          {value ? (
            <img
              src={value}
              alt={name}
              className="w-100 h-100 object-fit-cover"
            />
          ) : (
            <span style={{ fontSize: '1.4rem' }}>{initial}</span>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-grow-1">
          <div
            className="fw-semibold small mb-1"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
          >
            {label}
          </div>
          <div
            className="small mb-2"
            style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}
          >
            Format JPG, PNG ou WebP (max 2 Mo). Recommandé pour la fiche officielle.
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleFileChange}
          />

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2.5 rounded"
              style={{ fontSize: '0.76rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="award" size={13} />
              <span>{value ? 'Modifier la photo' : 'Importer une photo'}</span>
            </button>

            {value && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-2 rounded"
                style={{ fontSize: '0.76rem' }}
                onClick={handleRemove}
              >
                <Icon name="x" size={13} />
                <span>Supprimer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-1 px-2 mt-2 mb-0 small text-danger" style={{ fontSize: '0.75rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}
