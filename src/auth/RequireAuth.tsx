import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Spinner } from '../components/ui'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-2 text-muted small">Chargement de la session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function RequireAdmin() {
  const { user, loading, hasRole } = useAuth()

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner />
      </div>
    )
  }

  if (!user || !hasRole('ROLE_ADMIN')) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
