import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-credits">
          <p className="copyright">
            © {currentYear} MELANOX. Todos los derechos reservados.
          </p>
          <p className="team">
            Desarrollado por <span className="team-name glow-text">Los Quackers</span>
          </p>
        </div>       
      </div>
    </footer>
  )
}

export default Footer
