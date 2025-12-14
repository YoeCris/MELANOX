import { useEffect, useRef } from 'react'
import { MATRIX_CONFIG } from '../constants'

/**
 * MatrixRain - Componente de fondo animado estilo Matrix
 * 
 * Renderiza caracteres japoneses cayendo en un canvas de pantalla completa.
 * Optimizado para rendimiento con control de FPS y fade effect.
 * 
 * Configuración:
 * - FPS: 40 (controla velocidad de animación)
 * - Velocidad de caída: 0.6 (más bajo = más lento)
 * - Fade alpha: 0.08 (transparencia del efecto de estela)
 * - Color: #00d9ff (cyan tech)
 * 
 * @returns {JSX.Element} Canvas con animación Matrix de fondo
 */
function MatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let drops = []
    // Configuración desde constantes centralizadas
    const { fontSize, fps, chars, fadeAlpha, color, resetProbability, dropSpeed } = MATRIX_CONFIG
    const charArray = chars.split('')
    let lastTime = 0

    const initCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const columns = canvas.width / fontSize
      drops = []
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * canvas.height / fontSize
      }
    }

    initCanvas()

    function draw(currentTime) {
      animationFrameId = requestAnimationFrame(draw)

      const elapsed = currentTime - lastTime
      if (elapsed < 1000 / fps) return
      lastTime = currentTime

      // Fondo con fade muy sutil para efecto de estela
      // Alpha desde configuración crea el efecto de "rastro" de los caracteres
      ctx.fillStyle = `rgba(10, 14, 39, ${fadeAlpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Color del texto Matrix desde configuración
      ctx.fillStyle = color
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)]
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        // Reset de gotas con probabilidad desde configuración
        if (drops[i] * fontSize > canvas.height && Math.random() > resetProbability) {
          drops[i] = 0
        }
        drops[i] += dropSpeed // Velocidad de caída desde configuración
      }
    }

    draw(0)

    const handleResize = () => {
      initCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="matrix-rain" />
}

export default MatrixRain
