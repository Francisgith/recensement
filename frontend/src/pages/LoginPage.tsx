import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Card, Form, Spinner } from '../components/ui'
import { Navigate, useNavigate } from 'react-router-dom'
import { getApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth()
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

  return (
    <div className="auth-bg min-vh-100 d-flex align-items-center justify-content-center p-3">
      <Card className="border-0 shadow-lg" style={{ width: '100%', maxWidth: 420 }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div style={{ fontSize: 44 }}>🏘️</div>
            <h1 className="h4 fw-bold mb-1">FANISAM-BAHOAKA</h1>
            <p className="text-muted small mb-0">Recensement de la population</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Adresse e-mail</Form.Label>
              <Form.Control
                type="email"
                value={email}
                autoComplete="username"
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.mg"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
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

            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? <Spinner size="sm" animation="border" /> : 'Se connecter'}
            </Button>
          </Form>

          <div className="mt-4 p-3 bg-light rounded small text-muted">
            <div className="fw-semibold mb-1">Comptes de démonstration</div>
            <div>Admin : admin@recensement.mg / Admin@1234</div>
            <div>Agent : agent@recensement.mg / Agent@1234</div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
