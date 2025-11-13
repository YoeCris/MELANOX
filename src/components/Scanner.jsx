import { useState, useEffect } from 'react'
import './Scanner.css'

function Scanner() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    'Preprocesamiento',
    'Extracción de características',
    'Clasificación neural',
    'Generación de resultados'
  ]

  useEffect(() => {
    // Paso 1: 0-25%
    const step1 = setTimeout(() => {
      setCurrentStep(1)
      setProgress(25)
    }, 500)

    // Paso 2: 25-50%
    const step2 = setTimeout(() => {
      setCurrentStep(2)
      setProgress(50)
    }, 1500)

    // Paso 3: 50-75%
    const step3 = setTimeout(() => {
      setCurrentStep(3)
      setProgress(75)
    }, 2500)

    // Paso 4: 75-100%
    const step4 = setTimeout(() => {
      setCurrentStep(4)
      setProgress(100)
    }, 3200)

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
