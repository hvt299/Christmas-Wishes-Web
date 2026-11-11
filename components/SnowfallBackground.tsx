'use client'

import { useEffect, useState } from 'react'
import Snowfall from 'react-snowfall'

export default function SnowfallBackground() {
  const [snowflakeCount, setSnowflakeCount] = useState(100)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)')
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateSettings = () => {
      setSnowflakeCount(isMobile.matches ? 55 : 100)
      setReduceMotion(motionPreference.matches)
    }

    updateSettings()

    isMobile.addEventListener('change', updateSettings)
    motionPreference.addEventListener('change', updateSettings)

    return () => {
      isMobile.removeEventListener('change', updateSettings)
      motionPreference.removeEventListener('change', updateSettings)
    }
  }, [])

  if (reduceMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 5 }}
    >
      <Snowfall
        snowflakeCount={snowflakeCount}
        color="#FFF9E8"
        radius={[0.5, 2.2]}
        speed={[0.4, 1.6]}
        wind={[-0.3, 0.5]}
        rotationSpeed={[-0.5, 0.5]}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}