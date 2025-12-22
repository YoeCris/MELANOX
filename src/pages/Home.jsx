import { Link } from 'react-router-dom'

/**
 * Home - Página de inicio con información educativa sobre melanoma
 * 
 * Presenta información sobre:
 * - Regla ABCDE para identificar melanomas
 * - Señales de alerta
 * - Factores de riesgo
 * - Prevención
 * 
 * Incluye CTA para iniciar análisis.
 * 
 * @returns {JSX.Element} Página de inicio con contenido educativo
 */
const Home = () => {
  const infoCards = [
    {
      id: '1',
      title: 'Regla ABCDE',
      icon: '🔍',
      description: 'Criterios para identificar melanomas',
      content: [
        'Asimetría: Una mitad del lunar no coincide con la otra',
        'Bordes: Bordes irregulares, dentados o mal definidos',
        'Color: Variedad de colores (marrón, negro, rojo, blanco, azul)',
        'Diámetro: Mayor a 6mm (tamaño de un borrador)',
        'Evolución: Cambios en tamaño, forma o color con el tiempo'
      ]
    },
    {
      id: '2',
      title: 'Señales de Alerta',
      icon: '⚠️',
      description: 'Cuándo consultar a un dermatólogo',
      content: [
        'Lunar que sangra o produce picazón',
        'Aparición de nuevo lunar después de los 30 años',
        'Lunar que cambia rápidamente',
        'Mancha oscura bajo la uña',
        'Lesión que no cicatriza'
      ]
    },
    {
      id: '3',
      title: 'Factores de Riesgo',
      icon: '☀️',
      description: 'Condiciones que aumentan el riesgo',
      content: [
        'Exposición excesiva al sol sin protección',
        'Historial de quemaduras solares',
        'Piel clara y tendencia a quemarse',
        'Más de 50 lunares en el cuerpo',
        'Antecedentes familiares de melanoma'
      ]
    },
    {
      id: '4',
      title: 'Prevención',
      icon: '🛡️',
      description: 'Cómo protegerte del melanoma',
      content: [
        'Usar protector solar SPF 50+ diariamente',
        'Evitar el sol entre 10am y 4pm',
        'Usar ropa protectora y sombrero',
        'Revisar tus lunares mensualmente',
        'Consultar al dermatólogo anualmente'
      ]
    }
  ]

  return (
    <div className="home-page">
      <div className="container">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title glow-text">
              MELANOX
            </h1>
          </div>
        </section>

        <section className="info-section">
          <h2 className="section-title">
            <span className="glow-text">¿Qué es el Melanoma?</span>
          </h2>
          <div className="melanoma-intro cyber-card">
            <p>
              El melanoma es el tipo más grave de cáncer de piel. Se origina en los melanocitos,
              las células que producen melanina (el pigmento que da color a la piel). Aunque es
              menos común que otros tipos de cáncer de piel, es más peligroso porque puede
              propagarse a otras partes del cuerpo si no se detecta temprano.
            </p>
            <p className="highlight">
              La detección temprana es crucial: el melanoma tiene una tasa de curación del 85%
              cuando se detecta en etapas iniciales.
            </p>
          </div>
        </section>

        <section className="cards-section">
          <h2 className="section-title">
            <span className="glow-text">Guía de Identificación</span>
          </h2>
          <div className="cards-grid">
            {infoCards.map((card) => (
              <div key={card.id} className="info-card cyber-card">
                <div className="card-header">
                  <span className="card-icon">{card.icon}</span>
                  <h3>{card.title}</h3>
                </div>
                <p className="card-description">{card.description}</p>
                <ul className="card-content">
                  {card.content.map((item, index) => (
                    <li key={index}>
                      <span className="bullet">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-card cyber-card">
            <h2>¿Tienes dudas sobre un lunar?</h2>
            <p>Usa nuestro sistema de análisis con IA para obtener una evaluación preliminar</p>
            <Link to="/analisis" className="cyber-button">
              <span>Iniciar Análisis</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
