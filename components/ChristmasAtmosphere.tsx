'use client'

import { useEffect, useRef, useState } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  alpha: number
  alphaChange: number
  baseAlpha: number
  color: string
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  active: boolean
}

interface SleighParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  decay: number
  color: string
}

interface ChristmasAtmosphereProps {
  /** Cho phép ép bật hoặc chỉ định trạng thái mùa Giáng sinh */
  isChristmasSeason?: boolean
  forceActive?: boolean
  /** Chế độ xuất hiện: 'random' (kết hợp ngẫu nhiên SVG & GIF), 'gif', hoặc 'svg' */
  sleighMode?: 'random' | 'gif' | 'svg'
}

export default function ChristmasAtmosphere({
  isChristmasSeason = true,
  forceActive = false,
  sleighMode = 'random',
}: ChristmasAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [sleighVisible, setSleighVisible] = useState(false)
  const [sleighX, setSleighX] = useState(-380)
  const [sleighYPercent, setSleighYPercent] = useState(18)
  const [currentSleighType, setCurrentSleighType] = useState<'gif' | 'svg'>('gif')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const userInteractedRef = useRef(false)

  const isSeasonActive = isChristmasSeason || forceActive

  // Ghi nhận tương tác của người dùng để unlock audio
  useEffect(() => {
    const handleInteract = () => {
      userInteractedRef.current = true
      window.removeEventListener('pointerdown', handleInteract)
      window.removeEventListener('keydown', handleInteract)
    }

    window.addEventListener('pointerdown', handleInteract, { passive: true })
    window.addEventListener('keydown', handleInteract, { passive: true })

    const motionPref = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(motionPref.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    motionPref.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('pointerdown', handleInteract)
      window.removeEventListener('keydown', handleInteract)
      motionPref.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // Quản lý chu kỳ cỗ xe Santa bay qua (mỗi 45 - 60s khi trong mùa Giáng sinh)
  useEffect(() => {
    if (reduceMotion || !isSeasonActive) {
      setSleighVisible(false)
      return
    }

    let animationFrameId: number
    let timeoutId: NodeJS.Timeout
    let active = true

    const triggerSleighFlight = () => {
      if (!active) return

      // Random xuất hiện giữa bản GIF và bản SVG ánh vàng (hoặc theo cấu hình sleighMode)
      if (sleighMode === 'random') {
        setCurrentSleighType(Math.random() > 0.5 ? 'gif' : 'svg')
      } else {
        setCurrentSleighType(sleighMode)
      }

      // Chọn độ cao ngẫu nhiên trong khoảng 14% đến 24% chiều cao màn hình (1/3 trên)
      const randomY = 14 + Math.random() * 10
      setSleighYPercent(randomY)
      setSleighVisible(true)

      // Thử phát âm thanh chuông leng keng khẽ (nếu user đã tương tác)
      if (userInteractedRef.current && audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.volume = 0.28
        audioRef.current.play().catch(() => {
          // Bỏ qua nếu trình duyệt vẫn chặn autoplay
        })
      }

      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
      // Bay từ trái sang phải (đúng hướng đàn tuần lộc đang phi về phía trước bên phải)
      const startX = -380
      const endX = screenWidth + 380
      const duration = 12000 // 12 giây lướt qua bầu trời
      const startTime = performance.now()

      const step = (now: number) => {
        if (!active) return
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / duration)

        // Tính vị trí X theo thời gian
        const currentX = startX + (endX - startX) * progress
        setSleighX(currentX)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step)
        } else {
          setSleighVisible(false)
          // Lên lịch đợt bay tiếp theo (ngẫu nhiên 45s đến 60s)
          const nextDelay = 45000 + Math.random() * 15000
          timeoutId = setTimeout(triggerSleighFlight, nextDelay)
        }
      }

      animationFrameId = requestAnimationFrame(step)
    }

    // Lần đầu xuất hiện sau 8 giây khi trang vừa tải
    timeoutId = setTimeout(triggerSleighFlight, 8000)

    return () => {
      active = false
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationFrameId)
    }
  }, [reduceMotion, isSeasonActive])

  // Canvas render: Bụi sao vàng lấp lánh & Sao băng
  useEffect(() => {
    if (reduceMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const isMobile = width < 768
    const starCount = isMobile ? 35 : 70

    // Khởi tạo các vì sao lấp lánh ấm áp
    const starColors = ['#FFFDF0', '#FEF08A', '#FDE047', '#FBBF24']
    const stars: Star[] = Array.from({ length: starCount }, () => {
      const baseAlpha = 0.2 + Math.random() * 0.65
      return {
        x: Math.random() * width,
        y: Math.random() * (height * 0.75), // Tập trung ở 75% trên của màn hình
        radius: 0.8 + Math.random() * 1.6,
        alpha: baseAlpha,
        baseAlpha,
        alphaChange: (0.008 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1),
        color: starColors[Math.floor(Math.random() * starColors.length)],
      }
    })

    // Khởi tạo vệt sao băng
    const shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 120,
      speed: 14,
      angle: (Math.PI / 180) * 32, // Bay chéo 32 độ
      opacity: 0,
      active: false,
    }

    let nextShootingStarTime = performance.now() + 6000 + Math.random() * 10000

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height)

      // 1. Vẽ các vì sao lấp lánh (Warm Twinkling Stars)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        s.alpha += s.alphaChange
        if (s.alpha > 0.95 || s.alpha < 0.15) {
          s.alphaChange = -s.alphaChange
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha))
        ctx.fillStyle = s.color
        ctx.shadowColor = s.color
        ctx.shadowBlur = s.radius * 3

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 2. Kích hoạt & Vẽ sao băng (Shooting Star)
      if (!shootingStar.active && now > nextShootingStarTime) {
        shootingStar.active = true
        shootingStar.x = Math.random() * (width * 0.7)
        shootingStar.y = Math.random() * (height * 0.25)
        shootingStar.opacity = 0.95
        shootingStar.length = 100 + Math.random() * 60
        shootingStar.speed = 12 + Math.random() * 6
      }

      if (shootingStar.active) {
        const headX = shootingStar.x
        const headY = shootingStar.y
        const tailX = headX - Math.cos(shootingStar.angle) * shootingStar.length
        const tailY = headY - Math.sin(shootingStar.angle) * shootingStar.length

        const grad = ctx.createLinearGradient(headX, headY, tailX, tailY)
        grad.addColorStop(0, `rgba(254, 240, 138, ${shootingStar.opacity})`)
        grad.addColorStop(0.3, `rgba(253, 224, 71, ${shootingStar.opacity * 0.6})`)
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)')

        ctx.save()
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.8
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(headX, headY)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()
        ctx.restore()

        // Di chuyển sao băng
        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed
        shootingStar.opacity -= 0.016

        if (shootingStar.opacity <= 0 || shootingStar.x > width + 100 || shootingStar.y > height) {
          shootingStar.active = false
          nextShootingStarTime = now + 16000 + Math.random() * 15000
        }
      }

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [reduceMotion, isSeasonActive])

  if (reduceMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 6 }}
    >
      {/* Âm thanh chuông leng keng khẽ khi cỗ xe bay qua */}
      <audio ref={audioRef} src="/audio/sleigh-bells.wav" preload="auto" />

      {/* Canvas sao nhấp nháy & sao băng */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Cỗ xe Santa bay qua bầu trời */}
      {sleighVisible && (
        <div
          className="absolute will-change-transform"
          style={{
            left: 0,
            top: `${sleighYPercent}%`,
            transform: `translate3d(${sleighX}px, ${Math.sin(sleighX * 0.012) * 14}px, 0)`,
            transition: 'none',
          }}
        >
          {/* Vệt phát sáng mờ ảo của cỗ xe */}
          <div className="relative">
            {currentSleighType === 'gif' ? (
              <img
                src="/images/santa.gif"
                alt="Ông già Noel & Đàn tuần lộc"
                className="h-16 w-auto drop-shadow-[0_0_22px_rgba(253,224,71,0.6)] sm:h-20 md:h-24"
                draggable={false}
              />
            ) : (
              <img
                src="/images/santa-sleigh.svg"
                alt="Cỗ xe Santa Vector"
                className="h-14 w-auto drop-shadow-[0_0_18px_rgba(253,224,71,0.65)] sm:h-18 md:h-22"
                draggable={false}
              />
            )}
            {/* Đốm bụi vàng rực rỡ bám theo đuôi cỗ xe (bên trái cỗ xe khi bay từ trái qua phải) */}
            <div className="pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2">
              <span className="inline-block h-3 w-3 animate-ping rounded-full bg-yellow-300/60" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
