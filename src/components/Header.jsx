import { Link, useLocation } from 'react-router-dom'

/**
 * Header - Barra de navegación principal
 * 
 * Sticky header con logo MELANOX y navegación entre páginas.
 * Resalta la página activa basándose en la ruta actual.
 * 
 * @returns {JSX.Element} Header con logo y navegación
 */
const Header = () => {
  const location = useLocation()

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
        </nav>

        <div className="header-decoration">
          <div className="scanline"></div>
        </div>
      </div>
    </header>
  )
}

export default Header
