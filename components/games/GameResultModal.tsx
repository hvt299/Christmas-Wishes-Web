'use client'

// components/games/GameResultModal.tsx
// Modal kết quả dùng chung phong cách Giáng Sinh ấm cúng theo my-trees
import { useEffect, useRef } from 'react'
import { X, Trophy, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Props {
  isOpen: boolean
  score: number
  newBalance: number
  isRecord?: boolean
  recordLabel?: string
  extra?: React.ReactNode
  onClose: () => void
  onPlayAgain?: () => void
  playAgainLabel?: string
}

export function GameResultModal({
  isOpen,
  score,
  newBalance,
  isRecord = false,
  recordLabel = '🎉 Kỷ lục mới!',
  extra,
  onClose,
  onPlayAgain,
  playAgainLabel = 'Chơi lại',
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isPositive = score >= 0

  useEffect(() => {
    if (!isOpen || !isRecord) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const shoot = () => {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#f59e0b', '#ffffff', '#86efac'],
        scalar: 0.9,
      })
    }
    const t1 = setTimeout(shoot, 100)
    const t2 = setTimeout(shoot, 500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [isOpen, isRecord])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      <div
        className="relative my-auto w-full max-w-md sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-yellow-400/60 bg-linear-to-b from-[#250b10] via-[#16070a] to-[#08170e] p-6 text-center shadow-[0_0_80px_rgba(0,0,0,0.85)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gold bar */}
        <div className="absolute left-0 top-0 h-1.5 w-full bg-linear-to-r from-transparent via-yellow-300 to-transparent" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          aria-label="Đóng kết quả"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 text-center">
          {isRecord && (
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-yellow-400/50 bg-yellow-400/15 px-3.5 py-1 text-xs sm:text-sm font-bold text-yellow-300 animate-pulse shadow-md">
              <Sparkles className="h-4 w-4" />
              <span>{recordLabel}</span>
            </div>
          )}

          <div className="mb-3 flex justify-center">
            <div
              className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border shadow-inner ${
                isRecord
                  ? 'border-yellow-400/60 bg-yellow-400/20 text-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.3)]'
                  : isPositive
                  ? 'border-green-400/50 bg-green-500/20 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                  : 'border-red-400/50 bg-red-500/20 text-red-300 shadow-[0_0_20px_rgba(248,113,113,0.2)]'
              }`}
            >
              {isRecord ? (
                <Trophy className="h-9 w-9 sm:h-11 sm:w-11 text-yellow-300 drop-shadow" />
              ) : isPositive ? (
                <TrendingUp className="h-9 w-9 sm:h-11 sm:w-11 text-green-400 drop-shadow" />
              ) : (
                <TrendingDown className="h-9 w-9 sm:h-11 sm:w-11 text-red-400 drop-shadow" />
              )}
            </div>
          </div>

          <h2 id="result-modal-title" className="font-serif text-2xl sm:text-3xl font-black text-yellow-200">
            Tổng Kết Ván Chơi
          </h2>
        </div>

        {/* Score display — Spacious & Airy */}
        <div
          className={`mb-4 rounded-2xl border p-5 sm:p-6 text-center ${
            isPositive
              ? 'border-green-400/40 bg-linear-to-b from-green-950/60 to-black/50 shadow-inner'
              : 'border-red-400/40 bg-linear-to-b from-red-950/60 to-black/50 shadow-inner'
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-white/60 font-semibold">Bông Tuyết Nhận Được</p>
          <p
            className={`mt-1 font-serif text-5xl sm:text-6xl font-black tabular-nums tracking-tight ${
              isPositive ? 'text-green-300 drop-shadow-[0_2px_10px_rgba(74,222,128,0.3)]' : 'text-red-400'
            }`}
          >
            {isPositive && score > 0 ? `+${score}` : score}
          </p>
          <p className="mt-1.5 text-xs sm:text-sm font-bold text-yellow-200/70">❄️ Bông tuyết mùa đông</p>
        </div>

        {/* New balance */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/15 bg-black/45 px-4 sm:px-5 py-3.5">
          <span className="text-xs sm:text-sm text-white/70">Số dư tài khoản hiện tại:</span>
          <span className="font-serif text-base sm:text-lg font-bold tabular-nums text-sky-200">
            ❄️ {newBalance.toLocaleString('vi-VN')}
          </span>
        </div>

        {/* Extra details */}
        {extra && <div className="mb-5">{extra}</div>}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          {onPlayAgain && (
            <button
              type="button"
              onClick={onPlayAgain}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-yellow-300/50 bg-linear-to-r from-yellow-500 via-amber-400 to-yellow-400 py-3 text-sm sm:text-base font-bold text-red-950 shadow-xl transition hover:scale-[1.02] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <span>{playAgainLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 text-xs sm:text-sm text-white/70 transition hover:bg-white/10 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            Đóng / Xem lại bàn chơi
          </button>
        </div>
      </div>
    </div>
  )
}
