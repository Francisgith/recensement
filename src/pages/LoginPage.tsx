import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Card, Form, Spinner } from '../components/ui'
import { Navigate, useNavigate } from 'react-router-dom'
import { getApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Icon from '../components/Icon'

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@recensement.mg')
  const [password, setPassword] = useState('Admin@1234')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!authLoading && user) {
    return <Navigate to="/" replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const fillAccount = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative"
      style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
      }}
    >
      {/* Theme Toggle Button on Login Screen */}
      <div className="position-absolute top-0 end-0 p-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-sm text-white d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)' }}
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          <span className="small fw-semibold">{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</span>
        </button>
      </div>
      <Card
        className="border-0 shadow-lg bg-white overflow-hidden"
        style={{ width: '100%', maxWidth: 440, borderRadius: '1rem' }}
      >
        <div
          className="p-4 text-center text-white"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2 p-2"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <Icon name="building" size={32} className="text-white" />
          </div>
          <h1 className="h5 fw-bold mb-1 tracking-tight text-white">FANISAM-BAHOAKA</h1>
          <p className="text-white text-opacity-80 small mb-0">
            Système National de Recensement de la Population · Madagascar
          </p>
        </div>

        <Card.Body className="p-4 p-md-4">
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="small fw-semibold text-secondary">Adresse e-mail</Form.Label>
              <Form.Control
                type="email"
                value={email}
                autoComplete="username"
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@recensement.mg"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="small fw-semibold text-secondary">Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={password}
                autoComplete="current-password"
                required
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 py-2 fw-semibold" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Connexion en cours...
                </>
              ) : (
                'Accéder au portail'
              )}
            </Button>
          </Form>

          {/* 1-click Demo credentials */}
          <div className="mt-4 p-3 bg-light rounded-3 border">
            <div className="fw-semibold small text-secondary mb-2 d-flex align-items-center gap-1">
              <Icon name="info" size={14} className="text-primary" />
              <span>Comptes de démonstration pré-configurés</span>
            </div>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center py-1 px-2"
                onClick={() => fillAccount('admin@recensement.mg', 'Admin@1234')}
              >
                <span className="small">
                  <strong>Admin</strong> : admin@recensement.mg
                </span>
                <span className="badge bg-dark" style={{ fontSize: '0.65rem' }}>
                  Cliquer pour remplir
                </span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center py-1 px-2"
                onClick={() => fillAccount('agent@recensement.mg', 'Agent@1234')}
              >
                <span className="small">
                  <strong>Agent</strong> : agent@recensement.mg
                </span>
                <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                  Cliquer pour remplir
                </span>
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
