import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Card, Form, Spinner } from '../components/ui'
import { Navigate, useNavigate } from 'react-router-dom'
import { getApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Icon from '../components/Icon'
import PhotoUpload from '../components/PhotoUpload'
import { MADAGASCAR_DIVISIONS } from '../data/madagascarGeo'

const FONCTIONS_DISPONIBLES = [
  'Agent recenseur de terrain',
  'Enquêteur démographique',
  'Superviseur communal',
  'Chef d\'équipe de recensement',
  'Opérateur de saisie et validation',
  'Démographe analyste',
]

export default function LoginPage() {
  const { login, register, user, loading: authLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // Login states (no prefilled credentials, clean and serious)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Registration states
  const [regPhoto, setRegPhoto] = useState<string | null>(null)
  const [regNom, setRegNom] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regTelephone, setRegTelephone] = useState('')
  const [regFonction, setRegFonction] = useState(FONCTIONS_DISPONIBLES[0])
  const [regProvince, setRegProvince] = useState('Antananarivo')
  const [regRegion, setRegRegion] = useState('Analamanga')
  const [regDistrict, setRegDistrict] = useState('Antananarivo Renivohitra')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Feedback states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Cascading geographic selections
  const currentProvinceData = useMemo(() => {
    return MADAGASCAR_DIVISIONS.find((p) => p.nom === regProvince) || MADAGASCAR_DIVISIONS[0]
  }, [regProvince])

  const availableRegions = useMemo(() => {
    return currentProvinceData.regions.map((r) => r.nom)
  }, [currentProvinceData])

  const currentRegionData = useMemo(() => {
    return currentProvinceData.regions.find((r) => r.nom === regRegion) || currentProvinceData.regions[0]
  }, [currentProvinceData, regRegion])

  const availableDistricts = useMemo(() => {
    return currentRegionData?.districts.map((d) => d.nom) || []
  }, [currentRegionData])

  const handleProvinceChange = (newProv: string) => {
    setRegProvince(newProv)
    const provData = MADAGASCAR_DIVISIONS.find((p) => p.nom === newProv)
    if (provData && provData.regions.length > 0) {
      const firstReg = provData.regions[0]
      setRegRegion(firstReg.nom)
      if (firstReg.districts.length > 0) {
        setRegDistrict(firstReg.districts[0].nom)
      } else {
        setRegDistrict('')
      }
    }
  }

  const handleRegionChange = (newReg: string) => {
    setRegRegion(newReg)
    const regData = currentProvinceData.regions.find((r) => r.nom === newReg)
    if (regData && regData.districts.length > 0) {
      setRegDistrict(regData.districts[0].nom)
    } else {
      setRegDistrict('')
    }
  }

  if (!authLoading && user) {
    return <Navigate to="/" replace />
  }

  // Handle Login submission
  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await login(loginEmail.trim(), loginPassword)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Register submission
  const handleRegisterSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (regPassword !== regPasswordConfirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    if (regPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        nom: regNom.trim(),
        email: regEmail.trim(),
        password: regPassword,
        photo: regPhoto,
        telephone: regTelephone.trim() || undefined,
        fonction: regFonction,
        province: regProvince,
        region: regRegion,
        district: regDistrict,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (newMode: 'login' | 'register') => {
    setError('')
    setSuccess('')
    setMode(newMode)
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)'
          : 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
      }}
    >
      {/* Theme Toggle Button */}
      <div className="position-absolute top-0 end-0 p-3 z-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-sm text-white d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)' }}
          title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={15} />
          <span className="small fw-semibold">{isDark ? 'Mode Clair' : 'Mode Sombre'}</span>
        </button>
      </div>

      <Card
        className="border-0 shadow-lg overflow-hidden transition-all"
        style={{
          width: '100%',
          maxWidth: mode === 'register' ? 640 : 440,
          borderRadius: '1rem',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderColor: isDark ? '#334155' : 'transparent',
        }}
      >
        {/* Card Header */}
        <div
          className="p-4 text-center text-white position-relative"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2 p-2"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <Icon name={mode === 'register' ? 'user' : 'building'} size={30} className="text-white" />
          </div>
          <h1 className="h5 fw-bold mb-1 tracking-tight text-white">FANISAM-BAHOAKA</h1>
          <p className="text-white text-opacity-80 small mb-0">
            {mode === 'register'
              ? 'Enregistrement Officiel d\'un Nouvel Agent · Madagascar'
              : 'Système National de Recensement de la Population · Madagascar'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className="d-flex border-bottom"
          style={{
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            borderColor: isDark ? '#334155' : '#e2e8f0',
          }}
        >
          <button
            type="button"
            className="flex-fill py-2.5 px-3 border-0 fw-semibold small d-flex align-items-center justify-content-center gap-1.5 transition-colors"
            style={{
              backgroundColor: mode === 'login' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
              color: mode === 'login' ? '#0284c7' : (isDark ? '#94a3b8' : '#64748b'),
              borderBottom: mode === 'login' ? '2px solid #0284c7' : '2px solid transparent',
            }}
            onClick={() => switchMode('login')}
          >
            <Icon name="log-in" size={16} />
            <span>Connexion</span>
          </button>
          <button
            type="button"
            className="flex-fill py-2.5 px-3 border-0 fw-semibold small d-flex align-items-center justify-content-center gap-1.5 transition-colors"
            style={{
              backgroundColor: mode === 'register' ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
              color: mode === 'register' ? '#0284c7' : (isDark ? '#94a3b8' : '#64748b'),
              borderBottom: mode === 'register' ? '2px solid #0284c7' : '2px solid transparent',
            }}
            onClick={() => switchMode('register')}
          >
            <Icon name="user-check" size={16} />
            <span>Créer un compte</span>
          </button>
        </div>

        <Card.Body className="p-4 p-md-4">
          {error && (
            <div
              className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-2"
              role="alert"
            >
              <Icon name="alert-triangle" size={16} className="flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div
              className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-2"
              role="alert"
            >
              <Icon name="check" size={16} className="flex-shrink-0" />
              <div>{success}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LOGIN FORM */}
          {/* ========================================================= */}
          {mode === 'login' ? (
            <Form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <p className="small mb-3" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                  Connectez-vous avec vos identifiants pour accéder au tableau de bord de recensement.
                </p>
              </div>

              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label
                  className="small fw-semibold"
                  style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                >
                  Adresse e-mail
                </Form.Label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <Icon name="mail" size={15} />
                  </span>
                  <Form.Control
                    type="email"
                    value={loginEmail}
                    autoComplete="username"
                    required
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: agent@recensement.mg"
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                    }}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="loginPassword">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label
                    className="small fw-semibold mb-0"
                    style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                  >
                    Mot de passe
                  </Form.Label>
                </div>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <Icon name="lock" size={15} />
                  </span>
                  <Form.Control
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    autoComplete="current-password"
                    required
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                      color: isDark ? '#cbd5e1' : '#475569',
                    }}
                    onClick={() => setShowLoginPassword((v) => !v)}
                    title={showLoginPassword ? 'Masquer' : 'Afficher'}
                  >
                    <Icon name={showLoginPassword ? 'eye-off' : 'eye'} size={15} />
                  </button>
                </div>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <Icon name="log-in" size={16} />
                    <span>Accéder au portail</span>
                  </>
                )}
              </Button>

              {/* Account Creation Prompt */}
              <div
                className="mt-4 pt-3 text-center border-top"
                style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}
              >
                <div
                  className="small mb-2"
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                >
                  Vous n'avez pas encore de compte d'accès ?
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-semibold"
                  onClick={() => switchMode('register')}
                >
                  <Icon name="user-check" size={14} />
                  <span>Créer un compte d'agent ou enquêteur</span>
                </button>
              </div>
            </Form>
          ) : (
            /* ========================================================= */
            /* REGISTRATION FORM (Full with Photo, Nom, Contacts, Zone) */
            /* ========================================================= */
            <Form onSubmit={handleRegisterSubmit}>
              <div className="mb-3">
                <p className="small mb-3" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                  Renseignez les informations requises pour créer votre profil d'agent recenseur officiel.
                </p>
              </div>

              {/* 1. Photo d'identité / Profil */}
              <PhotoUpload
                value={regPhoto}
                onChange={setRegPhoto}
                name={regNom || 'Agent'}
                label="Photo officielle du profil"
              />

              {/* 2. Nom complet & Téléphone */}
              <div className="row g-2 mb-3">
                <div className="col-12 col-md-7">
                  <Form.Group controlId="regNom">
                    <Form.Label
                      className="small fw-semibold mb-1"
                      style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                    >
                      Nom complet et prénom(s) <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{
                          backgroundColor: isDark ? '#334155' : '#f1f5f9',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                          color: isDark ? '#94a3b8' : '#64748b',
                        }}
                      >
                        <Icon name="user" size={14} />
                      </span>
                      <Form.Control
                        type="text"
                        required
                        value={regNom}
                        onChange={(e) => setRegNom(e.target.value)}
                        placeholder="ex: RAKOTOMANANA Hery"
                        style={{
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                        }}
                      />
                    </div>
                  </Form.Group>
                </div>

                <div className="col-12 col-md-5">
                  <Form.Group controlId="regTelephone">
                    <Form.Label
                      className="small fw-semibold mb-1"
                      style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                    >
                      Téléphone
                    </Form.Label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{
                          backgroundColor: isDark ? '#334155' : '#f1f5f9',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                          color: isDark ? '#94a3b8' : '#64748b',
                        }}
                      >
                        <Icon name="phone" size={14} />
                      </span>
                      <Form.Control
                        type="tel"
                        value={regTelephone}
                        onChange={(e) => setRegTelephone(e.target.value)}
                        placeholder="034 00 000 00"
                        style={{
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                        }}
                      />
                    </div>
                  </Form.Group>
                </div>
              </div>

              {/* 3. Fonction / Rôle d'affectation */}
              <div className="mb-3">
                <Form.Label
                  className="small fw-semibold mb-1"
                  style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                >
                  Fonction / Rôle opérationnel <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <Icon name="award" size={14} />
                  </span>
                  <Form.Select
                    value={regFonction}
                    onChange={(e) => setRegFonction(e.target.value)}
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                    }}
                  >
                    {FONCTIONS_DISPONIBLES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>

              {/* 4. Rattachement géographique (Madagascar) */}
              <div
                className="p-3 rounded-2 border mb-3"
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <div
                  className="small fw-semibold mb-2 d-flex align-items-center gap-1.5"
                  style={{ color: isDark ? '#38bdf8' : '#0284c7' }}
                >
                  <Icon name="map-pin" size={14} />
                  <span>Zone d'affectation territoriale (Madagascar)</span>
                </div>
                <div className="row g-2">
                  <div className="col-12 col-md-4">
                    <Form.Group controlId="regProvince">
                      <Form.Label
                        className="small mb-1"
                        style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}
                      >
                        Province
                      </Form.Label>
                      <Form.Select
                        className="form-select-sm"
                        value={regProvince}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                        }}
                      >
                        {MADAGASCAR_DIVISIONS.map((p) => (
                          <option key={p.nom} value={p.nom}>
                            {p.nom}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-12 col-md-4">
                    <Form.Group controlId="regRegion">
                      <Form.Label
                        className="small mb-1"
                        style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}
                      >
                        Région
                      </Form.Label>
                      <Form.Select
                        className="form-select-sm"
                        value={regRegion}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                        }}
                      >
                        {availableRegions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-12 col-md-4">
                    <Form.Group controlId="regDistrict">
                      <Form.Label
                        className="small mb-1"
                        style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}
                      >
                        District
                      </Form.Label>
                      <Form.Select
                        className="form-select-sm"
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                        }}
                      >
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* 5. Identifiants & Sécurité */}
              <Form.Group className="mb-3" controlId="regEmail">
                <Form.Label
                  className="small fw-semibold mb-1"
                  style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                >
                  Adresse e-mail de connexion <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <Icon name="mail" size={14} />
                  </span>
                  <Form.Control
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="votre.nom@recensement.mg"
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderColor: isDark ? '#475569' : '#cbd5e1',
                    }}
                  />
                </div>
              </Form.Group>

              <div className="row g-2 mb-4">
                <div className="col-12 col-md-6">
                  <Form.Group controlId="regPassword">
                    <Form.Label
                      className="small fw-semibold mb-1"
                      style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                    >
                      Mot de passe <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{
                          backgroundColor: isDark ? '#334155' : '#f1f5f9',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                          color: isDark ? '#94a3b8' : '#64748b',
                        }}
                      >
                        <Icon name="lock" size={14} />
                      </span>
                      <Form.Control
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Au moins 6 car."
                        style={{
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center"
                        style={{
                          backgroundColor: isDark ? '#334155' : '#f1f5f9',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                          color: isDark ? '#cbd5e1' : '#475569',
                        }}
                        onClick={() => setShowRegPassword((v) => !v)}
                        title={showRegPassword ? 'Masquer' : 'Afficher'}
                      >
                        <Icon name={showRegPassword ? 'eye-off' : 'eye'} size={14} />
                      </button>
                    </div>
                  </Form.Group>
                </div>

                <div className="col-12 col-md-6">
                  <Form.Group controlId="regPasswordConfirm">
                    <Form.Label
                      className="small fw-semibold mb-1"
                      style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                    >
                      Confirmer le mot de passe <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{
                          backgroundColor: isDark ? '#334155' : '#f1f5f9',
                          borderColor: isDark ? '#475569' : '#cbd5e1',
                          color: isDark ? '#94a3b8' : '#64748b',
                        }}
                      >
                        <Icon name="lock" size={14} />
                      </span>
                      <Form.Control
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        style={{
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#0f172a',
                          borderColor:
                            regPasswordConfirm.length > 0 && regPassword !== regPasswordConfirm
                              ? '#ef4444'
                              : isDark
                              ? '#475569'
                              : '#cbd5e1',
                        }}
                      />
                    </div>
                    {regPasswordConfirm.length > 0 && regPassword !== regPasswordConfirm && (
                      <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>
                        Les mots de passe ne correspondent pas.
                      </div>
                    )}
                  </Form.Group>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Création du compte en cours...</span>
                  </>
                ) : (
                  <>
                    <Icon name="user-check" size={16} />
                    <span>Créer mon compte et accéder</span>
                  </>
                )}
              </Button>

              {/* Back to Login Prompt */}
              <div
                className="mt-4 pt-3 text-center border-top"
                style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}
              >
                <div
                  className="small mb-2"
                  style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                >
                  Vous avez déjà un compte officiel ?
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-semibold"
                  onClick={() => switchMode('login')}
                >
                  <Icon name="log-in" size={14} />
                  <span>Se connecter</span>
                </button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
