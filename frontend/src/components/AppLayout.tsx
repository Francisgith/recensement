import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Icon from './Icon'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' active fw-semibold' : ''}`

export default function AppLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark brand-gradient shadow-sm">
        <div className="container-xl">
          <NavLink to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <Icon name="building" size={22} />
            <span>FANISAM-BAHOAKA</span>
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            aria-label="Basculer la navigation"
            onClick={() => setNavOpen((value) => !value)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink to="/" end className={linkClass}>
                  Tableau de bord
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/individus" className={linkClass}>
                  Chefs de famille
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/membres" className={linkClass}>
                  Membres
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/population" className={linkClass}>
                  Recherche population
                </NavLink>
              </li>
              {hasRole('ROLE_ADMIN') && (
                <li className="nav-item">
                  <NavLink to="/users" className={linkClass}>
                    Utilisateurs
                  </NavLink>
                </li>
              )}
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown" ref={menuRef}>
                <button
                  type="button"
                  className="nav-link dropdown-toggle"
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  {user?.nom ?? 'Compte'}
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${menuOpen ? 'show' : ''}`}>
                  <li>
                    <span className="dropdown-item-text text-muted small">{user?.email}</span>
                  </li>
                  <li>
                    <span className="dropdown-item-text small">
                      {hasRole('ROLE_ADMIN') ? 'Administrateur' : 'Agent de terrain'}
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" type="button" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1 py-4">
        <div className="container-xl">
          <Outlet />
        </div>
      </main>

      <footer className="text-center text-muted small py-4">
        &copy; RAKOTOMENA Christelle — modernisé en React + Symfony
      </footer>
    </div>
  )
}
