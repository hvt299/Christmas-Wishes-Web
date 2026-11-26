'use client'

import { useEffect, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ChristmasCelebrationProps {
  currentYear: number | null
}

export default function ChristmasCelebration({ currentYear }: ChristmasCelebrationProps) {
  // Hàm bắn chùm sao vàng Giáng sinh (Fairy Starburst)
  const fireStarSparkle = useCallback(() => {
    // Chùm ánh sao màu vàng kim và trắng tuyết
    const colors = ['#FFFDF0', '#FEF08A', '#FDE047', '#EAB308', '#F59E0B']

    // Bắn nhẹ từ góc trái dưới
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { x: 0.25, y: 0.65 },
      colors,
      shapes: ['star', 'circle'],
      scalar: 1.1,
      gravity: 0.8,
      ticks: 220,
    })

    // Bắn nhẹ từ góc phải dưới
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { x: 0.75, y: 0.65 },
      colors,
      shapes: ['star', 'circle'],
      scalar: 1.1,
      gravity: 0.8,
      ticks: 220,
    })
  }, [])

  // Tự động bung nhẹ khi mount và định kỳ mỗi 25-30 giây
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    // Bung nhẹ sau khi trang tải 800ms
    const initialTimer = setTimeout(() => {
      fireStarSparkle()
    }, 800)

    // Chu kỳ bung sao nhẹ mỗi 28 giây
    const interval = setInterval(() => {
      fireStarSparkle()
    }, 28000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [fireStarSparkle])

  return (
    <div className="relative z-20 flex w-full max-w-xl flex-col items-center justify-center text-center px-3 py-2 sm:px-4">
      {/* HUY HIỆU ĐÊM THÁNH */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-gradient-to-r from-red-900/80 via-red-950/90 to-amber-950/80 px-4 py-1.5 shadow-[0_0_20px_rgba(234,179,8,0.25)] backdrop-blur-md">
        <Sparkles className="h-4 w-4 animate-spin text-yellow-300" style={{ animationDuration: '6s' }} />
        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-yellow-200">
          Đêm Thánh An Lành • Mùa Yêu Thương
        </span>
        <Sparkles className="h-4 w-4 animate-spin text-yellow-300" style={{ animationDuration: '6s' }} />
      </div>

      {/* TIÊU ĐỀ LỘNG LẪY */}
      <h1 className="mb-2 font-serif text-3xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-500 drop-shadow-[0_4px_16px_rgba(234,179,8,0.45)] sm:text-5xl md:text-6xl">
        Chúc Mừng
        <span className="block mt-1 bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-600 bg-clip-text text-transparent">
          Giáng Sinh
        </span>
      </h1>

      {/* NĂM LỄ HỘI */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-black/40 px-5 py-1 backdrop-blur-md shadow-lg">
        <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.3em] text-yellow-300">
          NOEL {currentYear ?? '••••'}
        </span>
      </div>

      {/* LỜI CHÚC ẤM ÁP */}
      <p className="max-w-md text-sm sm:text-base leading-relaxed text-red-100/90 drop-shadow-sm font-light">
        Cầu chúc bạn cùng những người thân yêu một mùa Giáng Sinh ngập tràn ấm áp, an lành, hạnh phúc và vạn sự như ý!
      </p>

      {/* CỤM NÚT TƯƠNG TÁC LỄ HỘI */}
      <div className="mt-5 flex items-center justify-center">
        <button
          type="button"
          onClick={fireStarSparkle}
          className="group relative inline-flex items-center gap-2 rounded-full border border-yellow-300/60 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-red-950 shadow-[0_0_20px_rgba(234,179,8,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
        >
          <Sparkles className="h-4 w-4 text-red-950 transition-transform group-hover:rotate-45" />
          <span>Tung Ngàn Vì Sao May Mắn</span>
        </button>
      </div>
    </div>
  )
}
