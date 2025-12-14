import { useState, useEffect } from 'react'
import { SCANNER_CONFIG } from '../constants'

/**
 * Scanner - Componente de animación de análisis
 * 
 * Muestra una barra de progreso con 4 fases de análisis simulado:
 * 1. Preprocesamiento (0-25%) - 500ms
 * 2. Extracción de características (25-50%) - 1000ms
 * 3. Clasificación neural (50-75%) - 1000ms
 * 4. Generación de resultados (75-100%) - 700ms
 * 
 * Duración total: 3200ms
 * Sincronizado con Analysis.jsx (3500ms con buffer)
 * 
 * @returns {JSX.Element} Interfaz de escaneo con barra de progreso y pasos
 */
function Scanner() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  // Etiquetas de las 4 fases del análisis (desde constantes)
  const steps = SCANNER_CONFIG.phaseLabels

  useEffect(() => {
    // Fase 1: Preprocesamiento (0-25% a los 500ms)
    const step1 = setTimeout(() => {
      setCurrentStep(1)
      setProgress(SCANNER_CONFIG.phases[0].progress)
    }, SCANNER_CONFIG.phases[0].delay)

    // Fase 2: Extracción de características (25-50% a los 1500ms)
    const step2 = setTimeout(() => {
      setCurrentStep(2)
      setProgress(SCANNER_CONFIG.phases[1].progress)
    }, SCANNER_CONFIG.phases[1].delay)

    // Fase 3: Clasificación neural (50-75% a los 2500ms)
    const step3 = setTimeout(() => {
      setCurrentStep(3)
      setProgress(SCANNER_CONFIG.phases[2].progress)
    }, SCANNER_CONFIG.phases[2].delay)

    // Fase 4: Generación de resultados (75-100% a los 3200ms)
    const step4 = setTimeout(() => {
      setCurrentStep(4)
      setProgress(SCANNER_CONFIG.phases[3].progress)
    }, SCANNER_CONFIG.phases[3].delay)

    // Cleanup: Limpiar timeouts si el componente se desmonta
    return () => {
      clearTimeout(step1)
      clearTimeout(step2)
      clearTimeout(step3)
      clearTimeout(step4)
    }
  }, [])

  return (
    <div className="scanner-container">
      <div className="scanner-status">
        <div className="status-light"></div>
        <h3>Analizando Imagen...</h3>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {progress < 100 ? 'Procesando datos...' : 'Análisis completado'}
        </div>
      </div>

      <div className="analysis-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${index < currentStep ? 'active' : ''}`}
          >
            <span className="step-number">0{index + 1}</span>
            <span className="step-text">{step}</span>
          </div>
        ))}
      </div>

      <div className="loading-ring-container">
        <div className="loading-ring"></div>
      </div>
    </div>
  )
}

export default Scanner
