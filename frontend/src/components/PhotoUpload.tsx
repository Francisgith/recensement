import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import Icon from './Icon'

interface PhotoUploadProps {
  value: string | null
  onChange: (photo: string | null) => void
  name?: string
}

export default function PhotoUpload({ value, onChange, name = 'Photo' }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(value)
  const [hovered, setHovered] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const max = 300
        const scale = Math.min(max / img.width, max / img.height, 1)
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        setPreview(compressed)
        onChange(compressed)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="d-flex flex-column align-items-center mb-4">
      <div
        className="position-relative"
        style={{ width: 120, height: 120 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="rounded-circle overflow-hidden border-3 border-light shadow-sm"
          style={{
            width: 120,
            height: 120,
            cursor: 'pointer',
            backgroundColor: '#f1f5f9',
            border: '3px solid #e2e8f0',
          }}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt={name}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
              <Icon name="user-group" size={32} className="mb-1 opacity-50" />
              <span className="small" style={{ fontSize: '0.65rem' }}>Ajouter</span>
            </div>
          )}
        </div>

        {hovered && preview && (
          <button
            type="button"
            className="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: 28, height: 28, padding: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
          >
            <Icon name="trash" size={12} />
          </button>
        )}

        {hovered && !preview && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', cursor: 'pointer' }}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="plus" size={24} className="text-primary" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="d-none"
        onChange={handleFileChange}
      />

      <span className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
        {preview ? 'Cliquer pour changer' : 'Importer une photo'}
      </span>
    </div>
  )
}
