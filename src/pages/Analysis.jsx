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
   * Maneja la selección de imagen y dispara el análisis real con la API
   * @param {string|null} image - Data URL de la imagen seleccionada
   */
  const handleImageSelect = async (image) => {
    setSelectedImage(image)
    setResult(null)

    if (image) {
      setIsScanning(true)

      try {
        // Importar dinámicamente el servicio API
        const { analyzeImage } = await import('../services/apiService')

        // Llamar a la API real
        const apiResult = await analyzeImage(image)

        // Formatear resultados para el componente
        setResult({
          prediction: apiResult.prediction,
          confidence: apiResult.confidence,
          details: {
            type: apiResult.details.type,
            risk: apiResult.details.risk,
            recommendation: apiResult.details.recommendation,
            characteristics: apiResult.details.characteristics
          },
          // Datos adicionales del análisis CV
          lesionDetected: apiResult.lesion_detected,
          lesionLocation: apiResult.lesion_location,
          lesionMetrics: apiResult.lesion_metrics,
          abcdeAnalysis: apiResult.abcde_analysis,
          processedImage: apiResult.processed_image
        })

        setIsScanning(false)
      } catch (error) {
        console.error('Error en análisis:', error)
        setIsScanning(false)

        // Mostrar error al usuario
        setResult({
          error: true,
          errorMessage: error.message || 'Error al analizar la imagen. Verifica que el servidor backend esté ejecutándose.'
        })
      }
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
        ) : result.error ? (
          // Vista de error
          <div className="error-section">
            <div className="error-card cyber-card">
              <AlertTriangle size={60} className="error-icon" />
              <h2>Error en el Análisis</h2>
              <p className="error-message">{result.errorMessage}</p>
              <button className="cyber-button reset-btn" onClick={handleReset}>
                <RotateCcw size={20} />
                <span>Intentar de Nuevo</span>
              </button>
            </div>
          </div>
        ) : (
          // Vista con resultados - Grid 2x2
          <>
            <div className="results-grid-2x2">
              {/* Grid Item 1: Imagen procesada con overlay */}
              <div className="grid-item processed-image-card cyber-card">
                <h3 className="section-title">
                  <span className="icon">🔬</span>
                  {result.processedImage ? 'Imagen Procesada' : 'Imagen Analizada'}
                </h3>
                <div className="image-preview">
                  <img
                    src={result.processedImage || selectedImage}
                    alt={result.processedImage ? "Imagen con bordes detectados" : "Imagen analizada"}
                  />
                </div>
                {result.lesionDetected && result.lesionMetrics && (
                  <div className="lesion-info">
                    <p><strong>Diámetro:</strong> {result.lesionMetrics.diameter_mm}mm</p>
                    <p><strong>Área:</strong> {result.lesionMetrics.area_pixels}px²</p>
                  </div>
                )}
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
          </>
        )}
      </div>
    </div>
  )
}

export default Analysis
