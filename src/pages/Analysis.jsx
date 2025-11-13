import { useState } from 'react'
import { AlertTriangle, CheckCircle, Activity, Target, TrendingUp, RotateCcw } from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import Scanner from '../components/Scanner'
import './Analysis.css'

const Analysis = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState(null)

  const handleImageSelect = (image) => {
    setSelectedImage(image)
    setResult(null)
    
    if (image) {
      setIsScanning(true)
      
      setTimeout(() => {
        setResult({
          prediction: Math.random() > 0.5 ? 'Benigno' : 'Maligno',
          confidence: Math.floor(Math.random() * (98 - 75) + 75),
          details: {
            type: Math.random() > 0.5 ? 'Nevus Melanocítico' : 'Melanoma Superficial',
            risk: Math.random() > 0.7 ? 'Bajo' : Math.random() > 0.4 ? 'Medio' : 'Alto',
            recommendation: 'Consulta con un dermatólogo para evaluación profesional',
            characteristics: {
              asymmetry: Math.random() > 0.5 ? 'Detectada' : 'No detectada',
              border: Math.random() > 0.5 ? 'Irregular' : 'Regular',
              color: Math.random() > 0.5 ? 'Uniforme' : 'Variado',
              diameter: `${(Math.random() * 10 + 2).toFixed(1)}mm`
            }
          }
        })
        setIsScanning(false)
      }, 3500)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setIsScanning(false)
    setResult(null)
  }

  const isBenign = result?.prediction === 'Benigno'

  return (
    <div className="analysis-page">
      <div className="container">
        <section className="analysis-header">
          <h1 className="page-title">Sistema de Detección de Melanoma</h1>
        </section>

        {!result ? (
          // Vista sin resultados - Solo uploader centrado
          <div className="upload-only-section">
            <div className="upload-section cyber-card">
              <ImageUploader 
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                isScanning={isScanning}
              />
              
              {isScanning && (
                <div className="scanning-status">
                  <Scanner />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Vista con resultados - Grid 2x2
          <>
            <div className="results-grid-2x2">
              {/* Grid Item 1: Imagen procesada */}
              <div className="grid-item processed-image-card cyber-card">
                <h3 className="section-title">
                  <span className="icon">🔬</span>
                  Imagen Analizada
                </h3>
                <div className="image-preview">
                  <img src={selectedImage} alt="Imagen analizada" />
                </div>
              </div>

              {/* Grid Item 2: Resumen (PARTE 1) */}
              <div className="grid-item">
                <div className="result-summary cyber-card">
                  <div className={`result-header ${isBenign ? 'benign' : 'malignant'}`}>
                    <div className="result-icon">
                      {isBenign ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
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
              </div>

              {/* Grid Item 3: Detalles (PARTE 2) */}
              <div className="grid-item">
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
              </div>

              {/* Grid Item 4: Recomendación (PARTE 3) */}
              <div className="grid-item">
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

                  <button className="cyber-button reset-btn" onClick={handleReset}>
                    <RotateCcw size={20} />
                    <span>Analizar Nueva Imagen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer general */}
            <div className="disclaimer cyber-card">
              <AlertTriangle className="disclaimer-icon" size={24} />
              <div className="disclaimer-content">
                <h3>Aviso Importante</h3>
                <p>
                  Esta herramienta proporciona una <strong>evaluación preliminar</strong> basada en inteligencia artificial. 
                  Los resultados NO constituyen un diagnóstico médico definitivo y deben ser validados por un profesional de la salud.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Analysis
