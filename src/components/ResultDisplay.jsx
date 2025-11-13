import { CheckCircle, AlertTriangle, RotateCcw, Activity, Target, TrendingUp } from 'lucide-react'
import './ResultDisplay.css'

const ResultDisplay = ({ result, onReset }) => {
  const isBenign = result.prediction === 'Benigno'

  return (
    <>
      {/* PARTE 1: Resumen (grid item 2) */}
      <div className="result-summary cyber-card">
        <div className={`result-header ${isBenign ? 'benign' : 'malignant'}`}>
          <div className="result-icon">
            {isBenign ? (
              <CheckCircle size={40} />
            ) : (
              <AlertTriangle size={40} />
            )}
          </div>
          <div className="result-header-text">
            <h2 className="result-title">Análisis Completado</h2>
            <p className="result-subtitle">Reporte Generado por IA</p>
          </div>
        </div>

        <div className="result-main">
          <div className="main-diagnosis">
            <span className="diagnosis-label">Diagnóstico Preliminar</span>
            <span className={`diagnosis-value ${isBenign ? 'benign' : 'malignant'}`}>
              {result.prediction}
            </span>
          </div>

          <div className="confidence-section">
            <div className="confidence-header">
              <Activity size={20} />
              <span>Nivel de Confianza</span>
              <span className="confidence-percentage">{result.confidence}%</span>
            </div>
            <div className="confidence-bar-container">
              <div 
                className={`confidence-bar ${isBenign ? 'benign' : 'malignant'}`}
                style={{ width: `${result.confidence}%` }}
              >
                <span className="confidence-label">{result.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PARTE 2: Detalles (grid item 3) */}
      <div className="result-details-section cyber-card">
        <h3 className="details-title">
          <Target size={20} />
          Detalles del Análisis
        </h3>

        <div className="details-grid">
          <div className="detail-card">
            <div className="detail-label">Tipo de Lesión</div>
            <div className="detail-value">{result.details.type}</div>
          </div>

          <div className="detail-card">
            <div className="detail-label">Nivel de Riesgo</div>
            <div className={`detail-value risk-badge risk-${result.details.risk.toLowerCase()}`}>
              {result.details.risk}
            </div>
          </div>

          {result.details.characteristics && (
            <>
              <div className="detail-card">
                <div className="detail-label">Asimetría</div>
                <div className="detail-value">{result.details.characteristics.asymmetry}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Bordes</div>
                <div className="detail-value">{result.details.characteristics.border}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Color</div>
                <div className="detail-value">{result.details.characteristics.color}</div>
              </div>

              <div className="detail-card">
                <div className="detail-label">Diámetro</div>
                <div className="detail-value">{result.details.characteristics.diameter}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PARTE 3: Recomendación (grid item 4) */}
      <div className="result-recommendation-box cyber-card">
        <div className="recommendation-section">
          <h3 className="recommendation-title">
            <TrendingUp size={20} />
            Recomendación Médica
          </h3>
          <p className="recommendation-text">
            {result.details.recommendation}
          </p>
        </div>

        <div className="result-disclaimer">
          <AlertTriangle size={60} />
          <p>
            Este resultado es una <strong>evaluación preliminar automatizada</strong>.
            NO reemplaza la evaluación de un profesional médico. Es <strong>indispensable consultar</strong> con un dermatólogo certificado para obtener 
            un diagnóstico definitivo y plan de tratamiento apropiado.
          </p>
        </div>

        <button className="cyber-button reset-btn" onClick={onReset}>
          <RotateCcw size={20} />
          <span>Analizar Nueva Imagen</span>
        </button>
      </div>
    </>
  )
}

export default ResultDisplay
