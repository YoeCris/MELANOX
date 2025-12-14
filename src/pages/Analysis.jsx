import { useState } from 'react'
import { AlertTriangle, CheckCircle, Activity, Target, TrendingUp, RotateCcw } from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import Scanner from '../components/Scanner'
import {
  ANALYSIS_CONFIG,
  PREDICTION_TYPES,
  RISK_LEVELS,
  LESION_TYPES,
  ABCDE_CHARACTERISTICS
} from '../constants'

/**
 * Analysis - Página de análisis de imágenes con IA (simulado)
 * 
 * Permite al usuario cargar una imagen de piel y recibe un análisis simulado
 * de melanoma. Los resultados son generados aleatoriamente para demostración
 * y NO representan un análisis médico real.
 * 
 * Flujo:
 * 1. Usuario carga imagen (drag & drop o click)
 * 2. Se inicia animación de escaneo (3500ms)
 * 3. Se generan resultados aleatorios
 * 4. Se muestra grid 2x2 con resultados
 * 
 * Tiempo de análisis: 3500ms (sincronizado con Scanner de 3200ms + buffer)
 * 
 * @returns {JSX.Element} Página de análisis con uploader y resultados
 */
const Analysis = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState(null)

  /**
   * Maneja la selección de imagen y dispara el análisis simulado
   * @param {string|null} image - Data URL de la imagen seleccionada
   */
  const handleImageSelect = (image) => {
    setSelectedImage(image)
    setResult(null)

    if (image) {
      setIsScanning(true)

      // Simular análisis de IA con timeout de 3500ms
      // En producción, aquí se haría una llamada a la API del modelo
      setTimeout(() => {
        // Generar resultados aleatorios para demostración
        setResult({
          prediction: Math.random() > 0.5 ? PREDICTION_TYPES.benign : PREDICTION_TYPES.malignant,
          confidence: Math.floor(
            Math.random() * (ANALYSIS_CONFIG.maxConfidence - ANALYSIS_CONFIG.minConfidence) +
            ANALYSIS_CONFIG.minConfidence
          ),
          details: {
            type: Math.random() > 0.5 ? LESION_TYPES.nevusMelanocytic : LESION_TYPES.melanoma,
            risk: Math.random() > 0.7
              ? RISK_LEVELS.low
              : Math.random() > 0.4
                ? RISK_LEVELS.medium
                : RISK_LEVELS.high,
            recommendation: 'Consulta con un dermatólogo para evaluación profesional',
            characteristics: {
              asymmetry: Math.random() > 0.5
                ? ABCDE_CHARACTERISTICS.asymmetry.detected
                : ABCDE_CHARACTERISTICS.asymmetry.notDetected,
              border: Math.random() > 0.5
                ? ABCDE_CHARACTERISTICS.border.irregular
                : ABCDE_CHARACTERISTICS.border.regular,
              color: Math.random() > 0.5
                ? ABCDE_CHARACTERISTICS.color.uniform
                : ABCDE_CHARACTERISTICS.color.varied,
              diameter: `${(
                Math.random() * (ANALYSIS_CONFIG.maxDiameterMm - ANALYSIS_CONFIG.minDiameterMm) +
                ANALYSIS_CONFIG.minDiameterMm
              ).toFixed(1)}mm`
            }
          }
        })
        setIsScanning(false)
      }, ANALYSIS_CONFIG.durationMs)
    }
  }

  /**
   * Reinicia el estado para permitir un nuevo análisis
   */
  const handleReset = () => {
    setSelectedImage(null)
    setIsScanning(false)
    setResult(null)
  }

  const isBenign = result?.prediction === PREDICTION_TYPES.benign

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
