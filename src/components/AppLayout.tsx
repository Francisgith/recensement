import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

export default function AppLayout() {
  const { user, logout, hasRole } = useAuth()
  const { theme, toggleTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link px-2.5 py-1.5 rounded transition-all ${
      isActive
        ? 'active bg-white bg-opacity-20 text-white fw-semibold'
        : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
    }`

  return (
    <div className="min-vh-100 d-flex flex-column position-relative">
      {/* Top Navbar */}
      <nav
        className="navbar navbar-expand-xl navbar-dark shadow-sm sticky-top"
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg, #090e17 0%, #0f172a 50%, #1e293b 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0369a1 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="container-xl">
          {/* Brand Logo */}
          <NavLink to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2 me-2 text-white">
            <div
              className="d-flex align-items-center justify-content-center rounded-2 text-white flex-shrink-0"
              style={{ width: 32, height: 32, backgroundColor: '#059669' }}
            >
              <Icon name="building" size={18} />
            </div>
            <div className="d-flex flex-column" style={{ lineHeight: 1.1 }}>
              <span className="fw-bold tracking-tight" style={{ fontSize: '0.95rem', letterSpacing: '0.02em' }}>
                FANISAM-BAHOAKA
              </span>
              <span className="text-white text-opacity-60" style={{ fontSize: '0.62rem' }}>
                Recensement · Madagascar
              </span>
            </div>
          </NavLink>

          {/* ALWAYS VISIBLE ACTION CONTROLS (Theme Switcher & User Account) */}
          <div className="d-flex align-items-center gap-2 ms-auto ms-xl-2 order-xl-last">
            {/* Highly Visible Segmented Theme Toggle Pill */}
            <div
              className="d-flex align-items-center p-0.5 rounded-pill shadow-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`btn btn-sm d-flex align-items-center gap-1 px-2 py-0.5 rounded-pill border-0 transition-all ${
                  theme === 'light'
                    ? 'bg-white text-dark shadow-sm fw-bold'
                    : 'text-white text-opacity-80 hover:text-white'
                }`}
                style={{ fontSize: '0.74rem' }}
                title="Activer le mode clair"
                aria-pressed={theme === 'light'}
              >
                <Icon name="sun" size={13} />
                <span>Clair</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`btn btn-sm d-flex align-items-center gap-1 px-2 py-0.5 rounded-pill border-0 transition-all ${
                  theme === 'dark'
                    ? 'bg-white text-dark shadow-sm fw-bold'
                    : 'text-white text-opacity-80 hover:text-white'
                }`}
                style={{ fontSize: '0.74rem' }}
                title="Activer le mode sombre"
                aria-pressed={theme === 'dark'}
              >
                <Icon name="moon" size={13} />
                <span>Sombre</span>
              </button>
            </div>

            {/* User Dropdown */}
            <div className="dropdown" ref={menuRef}>
              <button
                type="button"
                className="btn btn-sm text-white d-flex align-items-center gap-1.5 border-0 px-2 py-1 rounded"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 24, height: 24, backgroundColor: '#0284c7', fontSize: '0.7rem' }}
                >
                  {user?.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="small text-truncate d-none d-sm-inline" style={{ maxWidth: 100 }}>
                  {user?.nom ?? 'Compte'}
                </span>
                <Icon name="chevron-down" size={12} className="text-white text-opacity-70" />
              </button>

              <ul
                className={`dropdown-menu dropdown-menu-end shadow border-0 p-2 ${menuOpen ? 'show' : ''}`}
                style={{ minWidth: 220 }}
              >
                <li className="px-3 py-2 border-bottom mb-1">
                  <div className="fw-semibold text-dark small">{user?.nom}</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
                  <span className="badge bg-light text-secondary border mt-1" style={{ fontSize: '0.68rem' }}>
                    {hasRole('ROLE_ADMIN') ? 'Administrateur' : 'Agent de terrain'}
                  </span>
                </li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center justify-content-between rounded py-2 small"
                    type="button"
                    onClick={toggleTheme}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
                      <span>{theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}</span>
                    </span>
                    <span className="badge bg-secondary text-white" style={{ fontSize: '0.65rem' }}>
                      {theme === 'dark' ? 'Sombre' : 'Clair'}
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger d-flex align-items-center gap-2 rounded py-2 small"
                    type="button"
                    onClick={handleLogout}
                  >
                    <Icon name="logout" size={15} />
                    <span>Se déconnecter</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Mobile / Tablet Hamburger Toggler */}
            <button
              className="navbar-toggler border-0 p-1 ms-1"
              type="button"
              aria-label="Basculer la navigation"
              onClick={() => setNavOpen((value) => !value)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          {/* Collapsible Navigation Links */}
          <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-xl-0 gap-1 align-items-xl-center">
              <li className="nav-item">
                <NavLink to="/" end className={linkClass} onClick={() => setNavOpen(false)}>
                  <span className="d-flex align-items-center gap-1.5">
                    <Icon name="dashboard" size={14} />
                    <span>Tableau de bord</span>
                  </span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/regions" className={linkClass} onClick={() => setNavOpen(false)}>
                  <span className="d-flex align-items-center gap-1.5">
                    <Icon name="map" size={14} />
                    <span>Territoires &amp; Régions</span>
                  </span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/individus" className={linkClass} onClick={() => setNavOpen(false)}>
                  <span className="d-flex align-items-center gap-1.5">
                    <Icon name="home" size={14} />
                    <span>Chefs de famille</span>
                  </span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/membres" className={linkClass} onClick={() => setNavOpen(false)}>
                  <span className="d-flex align-items-center gap-1.5">
                    <Icon name="user-group" size={14} />
                    <span>Membres</span>
                  </span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/population" className={linkClass} onClick={() => setNavOpen(false)}>
                  <span className="d-flex align-items-center gap-1.5">
                    <Icon name="search" size={14} />
                    <span>Recherche population</span>
                  </span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/documents" className={linkClass} onClick={() => setNavOpen(false)}>
                  <span className="d-flex align-items-center gap-1.5">
                    <Icon name="file-text" size={14} />
                    <span>Actes &amp; Documents</span>
                  </span>
                </NavLink>
              </li>
              {hasRole('ROLE_ADMIN') && (
                <li className="nav-item">
                  <NavLink to="/users" className={linkClass} onClick={() => setNavOpen(false)}>
                    <span className="d-flex align-items-center gap-1.5">
                      <Icon name="users" size={14} />
                      <span>Utilisateurs</span>
                    </span>
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Page Body */}
      <main className="flex-grow-1 py-4">
        <div className="container-xl">
          <Outlet />
        </div>
      </main>

      {/* FLOATING QUICK THEME SWITCHER (Always Accessible Anywhere) */}
      <div
        className="position-fixed no-print d-flex align-items-center"
        style={{ bottom: 22, right: 22, zIndex: 1040 }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-sm shadow-lg d-flex align-items-center gap-2 px-3 py-2 rounded-pill border transition-all"
          style={{
            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
          }}
          title={theme === 'dark' ? 'Basculer en mode Clair' : 'Basculer en mode Sombre'}
          aria-label="Basculer le thème"
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 22,
              height: 22,
              backgroundColor: theme === 'dark' ? '#3b82f6' : '#f59e0b',
              color: '#ffffff',
            }}
          >
            <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={13} />
          </div>
          <span className="small fw-semibold font-mono" style={{ fontSize: '0.78rem' }}>
            {theme === 'dark' ? 'Sombre' : 'Clair'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="text-center text-muted small py-4 border-top mt-auto no-print">
        <div className="container-xl">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span>&copy; FANISAM-BAHOAKA · Système National de Recensement</span>
            <span className="text-secondary">
              République de Madagascar · Ministère de l'Économie et du Plan
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
