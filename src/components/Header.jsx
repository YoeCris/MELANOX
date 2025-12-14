import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Header - Barra de navegación principal
 * 
 * Sticky header con logo MELANOX y navegación entre páginas.
 * Resalta la página activa basándose en la ruta actual.
 * Muestra menú de usuario si está autenticado.
 * 
 * @returns {JSX.Element} Header con logo y navegación
 */
const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">🔬</span>
          <span className="logo-text">MELANOX</span>
        </div>

        <nav className="nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link
            to="/analisis"
            className={`nav-link ${location.pathname === '/analisis' ? 'active' : ''}`}
          >
            Análisis
          </Link>

          {/* Menú de usuario */}
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
                  alt={user?.user_metadata?.full_name || user?.email}
                  className="user-avatar"
                />
                <span className="user-name">
                  {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <img
                      src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
                      alt={user?.user_metadata?.full_name || user?.email}
                    />
                    <div>
                      <p className="user-dropdown-name">
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className="user-dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <button className="user-dropdown-item" onClick={handleLogout}>
                    <span>🚪</span>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-link login-link">
              Iniciar sesión
            </Link>
          )}
        </nav>

        <div className="header-decoration">
          <div className="scanline"></div>
        </div>
      </div>
    </header>
  )
}

export default Header
