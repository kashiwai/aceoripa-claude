
'use client'

import { useEffect, useRef } from 'react'

export default function DOPAParticles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const createParticle = () => {
      const particle = document.createElement('div')
      particle.className = 'dopa-particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 3 + 's'
      particle.style.animationDuration = (Math.random() * 2 + 3) + 's'
      
      container.appendChild(particle)
      
      setTimeout(() => {
        if (container.contains(particle)) {
          container.removeChild(particle)
        }
      }, 5000)
    }

    const interval = setInterval(createParticle, 200)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="dopa-particles fixed inset-0 pointer-events-none z-10"
    />
  )
}
  