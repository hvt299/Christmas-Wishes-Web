'use client'

import { useState, useEffect } from 'react'
import { Clock, Sparkles } from 'lucide-react'
import { checkChristmasState, ChristmasState } from '@/utils/christmasHelper'

export default function ChristmasCountdown() {
  const [christmasState, setChristmasState] = useState<ChristmasState | null>(null)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setChristmasState(checkChristmasState())

    const timer = setInterval(() => {
      const currentState = checkChristmasState()
      setChristmasState(currentState)

      if (!currentState.isChristmasSeason) {
        const now = new Date().getTime()
        const diff = currentState.targetDate - now

        if (diff > 0) {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          })
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isClient || !christmasState) return null

  if (christmasState.isChristmasSeason) {
    return (
      <div className="mb-8 flex items-center justify-center gap-2 font-serif text-2xl font-bold text-yellow-200 drop-shadow-[0_0_15px_rgba(253,224,71,0.25)] sm:text-3xl md:text-5xl">
        <Sparkles className="h-5 w-5 shrink-0 animate-pulse text-yellow-300 md:h-7 md:w-7" />
        <span className="animate-pulse">Merry Christmas {christmasState.currentYear}! 🎅🎄</span>
        <Sparkles className="h-5 w-5 shrink-0 animate-pulse text-yellow-300 md:h-7 md:w-7" />
      </div>
    )
  }

  const countdownItems = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds }
  ]

  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-200/90 sm:text-sm">
        <Clock className="h-4 w-4 animate-pulse text-yellow-300" />
        <span>Sắp đến Giáng Sinh rồi</span>
        <Sparkles className="h-3.5 w-3.5 text-yellow-300/80" />
      </div>

      <div className="flex w-full justify-center gap-2 sm:gap-3 md:gap-4">
        {countdownItems.map(({ label, value }) => (
          <div key={label} className="group min-w-0 flex-1 max-w-20 rounded-xl border border-yellow-300/25 bg-linear-to-b from-red-900/75 to-red-950/85 p-2.5 text-center shadow-[0_4px_15px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-yellow-300/50 hover:shadow-[0_6px_20px_rgba(234,179,8,0.12)] sm:max-w-22 sm:p-3">
            <div className="font-mono text-2xl font-bold tabular-nums text-yellow-50 drop-shadow-sm sm:text-3xl">
              {value.toString().padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] font-semibold tracking-wide text-yellow-200/75 sm:text-xs">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}