import { useEffect, useRef } from 'react'
import './MatrixRain.css'

function MatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let drops = []
    const fontSize = 16
    const chars = '01アイウエオカキクケコサシスセソタチツテト'
    const charArray = chars.split('')
    let lastTime = 0
    const fps = 20 // Controla la velocidad - más bajo = más lento

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
      ctx.fillStyle = 'rgba(10, 14, 39, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Color del texto Matrix - CYAN TECH
      ctx.fillStyle = '#00d9ff'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)]
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        // Reset de gotas con probabilidad - más lento
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0
        }
        drops[i] += 0.6 // Velocidad de caída más lenta (antes era 1)
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
