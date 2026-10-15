import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
  variant?: 'outline' | 'ghost' | 'pill'
}

export default function BackButton({
  to,
  label = 'Retour',
  className = '',
  variant = 'pill',
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      // If history exists, go back, otherwise go to home
      if (window.history.length > 1) {
        navigate(-1)
      } else {
        navigate('/')
      }
    }
  }

  const baseClasses =
    variant === 'pill'
      ? 'btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-xs transition-all'
      : variant === 'ghost'
        ? 'btn btn-sm text-secondary d-inline-flex align-items-center gap-1.5 px-2 py-1 rounded transition-all hover:bg-light'
        : 'btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClasses} ${className}`.trim()}
      title="Retourner à la page précédente"
      aria-label={label}
    >
      <Icon name="arrow-left" size={14} />
      <span className="fw-medium small">{label}</span>
    </button>
  )
}
