// components/games/card-flip/CardFlipGrid.tsx
// 3D Flip Card animation, festive Christmas aesthetics & interactive audio

'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { soundEffects } from '@/lib/sound-effects'

export interface CardState {
  index: number
  isFlipped: boolean
  cardType?: string
  emoji?: string
  scoreDelta?: number
  shieldUsed?: boolean
}

interface Props {
  cards: CardState[]
  isPreview: boolean
  previewSecondsLeft: number
  flipsLeft: number
  shieldActive: boolean
  targetCards: string[]
  targetsFound: number
  rawScore: number
  disabled: boolean
  onCardClick: (index: number) => void
}

export function CardFlipGrid({
  cards,
  isPreview,
  previewSecondsLeft,
  flipsLeft,
  shieldActive,
  targetCards,
  targetsFound,
  rawScore,
  disabled,
  onCardClick,
}: Props) {
  const getCardDisplay = (card: CardState) => {
    if (card.cardType === 'trap') {
      return {
        emoji: '💀',
        label: 'Bẫy −5',
        frontBg: 'border-2 border-red-500/80 bg-linear-to-br from-red-950 via-[#260307] to-black text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.5)] ring-1 ring-red-400/30',
        badgeBg: 'bg-red-500/30 text-red-200 border-red-500/50',
      }
    }
    if (card.cardType === 'shield') {
      return {
        emoji: '🎅',
        label: 'Khiên bảo vệ',
        frontBg: 'border-2 border-cyan-300/90 bg-linear-to-br from-cyan-950 via-[#041a24] to-blue-950 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.5)] ring-1 ring-cyan-400/40',
        badgeBg: 'bg-cyan-500/30 text-cyan-100 border-cyan-400/50',
      }
    }
    if (card.cardType === 'target') {
      return {
        emoji: card.emoji || '🔔',
        label: 'Mục tiêu +4',
        frontBg: 'border-2 border-yellow-300 bg-linear-to-br from-amber-900/90 via-yellow-950 to-[#231502] text-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.65)] ring-1 ring-yellow-300/50',
        badgeBg: 'bg-yellow-400/30 text-yellow-100 border-yellow-400/60',
      }
    }
    if (card.cardType === 'bonus' || card.cardType === 'secret_gift' || card.cardType === 'big_gift') {
      return {
        emoji: card.emoji || '🎁',
        label: 'Thưởng +2',
        frontBg: 'border-2 border-emerald-400/90 bg-linear-to-br from-emerald-950 via-[#032115] to-green-950 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.5)] ring-1 ring-emerald-400/40',
        badgeBg: 'bg-emerald-500/30 text-emerald-100 border-emerald-400/50',
      }
    }
    return {
      emoji: '❄️',
      label: 'Trống',
      frontBg: 'border-2 border-white/20 bg-linear-to-br from-slate-900 via-[#0f172a] to-slate-950 text-white/50 shadow-md',
      badgeBg: 'bg-white/10 text-white/40 border-white/10',
    }
  }

  const handleCardClick = (card: CardState) => {
    if (disabled || isPreview || card.isFlipped) return
    soundEffects.playCardFlip()
    onCardClick(card.index)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* HUD Info — Ultra Compact Single Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/20 bg-black/50 px-3.5 py-2 backdrop-blur-md">
        {/* Targets progress */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-white/60">Mục tiêu:</span>
          <div className="flex items-center gap-1 font-bold text-yellow-300">
            {targetCards.slice(0, 4).map((t, idx) => (
              <span
                key={idx}
                className={`text-base transition-transform ${
                  idx < targetsFound ? 'scale-110 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]' : 'opacity-35 grayscale'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs font-black text-yellow-300">
            {targetsFound}/4
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              shieldActive
                ? 'border-blue-400/40 bg-blue-500/20 text-blue-200'
                : 'border-white/10 bg-white/5 text-white/30'
            }`}
            title="Khiên bảo hộ chống 1 bẫy"
          >
            <Shield className={`h-3.5 w-3.5 ${shieldActive ? 'text-blue-300 fill-blue-300/40' : 'text-white/20'}`} />
            <span>{shieldActive ? 'Khiên Sẵn Sàng' : 'Hết Khiên'}</span>
          </div>

          <div className="text-right text-xs">
            <span className="text-white/50">Lượt: </span>
            <span
              className={`font-black tabular-nums ${
                flipsLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-yellow-300'
              }`}
            >
              {flipsLeft}
            </span>
          </div>

          <div className="border-l border-white/15 pl-2.5 text-right text-xs">
            <span className="text-white/50">Điểm: </span>
            <span
              className={`font-black tabular-nums ${
                rawScore > 0 ? 'text-green-300' : rawScore < 0 ? 'text-red-400' : 'text-white/80'
              }`}
            >
              {rawScore > 0 ? `+${rawScore}` : rawScore}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Timer Banner */}
      {isPreview && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-yellow-400/50 bg-yellow-500/15 py-1.5 text-center text-xs sm:text-sm font-bold text-yellow-300 animate-pulse shadow-md">
          <span>👀 Ghi nhớ vị trí thẻ quà! Bàn cờ sẽ úp lại sau {previewSecondsLeft}s</span>
        </div>
      )}

      {/* 4x4 Grid with 3D Flip */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {cards.map((card) => {
          const isShowFront = isPreview || card.isFlipped
          const display = getCardDisplay(card)

          return (
            <div
              key={card.index}
              className="relative aspect-square w-full"
              style={{ perspective: '800px' }}
            >
              <motion.div
                role="button"
                tabIndex={disabled || isPreview || card.isFlipped ? -1 : 0}
                onClick={() => handleCardClick(card)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCardClick(card)
                  }
                }}
                animate={{ rotateY: isShowFront ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={!disabled && !isPreview && !card.isFlipped ? { scale: 1.05 } : {}}
                whileTap={!disabled && !isPreview && !card.isFlipped ? { scale: 0.95 } : {}}
                className={`relative h-full w-full rounded-2xl select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                  disabled || isPreview || card.isFlipped ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                aria-label={
                  isShowFront
                    ? `Thẻ ${card.index + 1}: ${display.label}`
                    : `Thẻ úp số ${card.index + 1}`
                }
              >
                {/* CARD BACK (Mặt úp) */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-300/60 bg-linear-to-br from-red-800 via-[#200508] to-red-950 p-1 shadow-lg transition-all hover:border-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-yellow-400/35 bg-black/40">
                    {/* Corner golden sparkles */}
                    <span className="absolute top-1 left-1 text-[8px] text-yellow-300/50">✦</span>
                    <span className="absolute top-1 right-1 text-[8px] text-yellow-300/50">✦</span>
                    <span className="absolute bottom-1 left-1 text-[8px] text-yellow-300/50">✦</span>
                    <span className="absolute bottom-1 right-1 text-[8px] text-yellow-300/50">✦</span>

                    {/* Ornate inner diamond frame */}
                    <div className="absolute inset-1.5 rounded-lg border border-yellow-400/15" />

                    <span className="relative z-10 text-2xl sm:text-3xl drop-shadow-[0_2px_8px_rgba(250,204,21,0.5)]">
                      ❄️
                    </span>
                    <span className="relative z-10 mt-0.5 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-1.5 py-0.2 text-[8px] font-black uppercase tracking-widest text-yellow-200">
                      NOEL
                    </span>
                  </div>
                </div>

                {/* CARD FRONT (Mặt ngửa) */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-1 ${display.frontBg}`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-black/20 p-1">
                    <span className="text-2xl sm:text-3xl drop-shadow-md">{display.emoji}</span>
                    <span className={`mt-1 rounded-full border px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold ${display.badgeBg} line-clamp-1`}>
                      {display.label}
                    </span>
                  </div>

                  {card.shieldUsed && (
                    <span className="absolute -top-1.5 -right-1.5 rounded-full border border-blue-400 bg-blue-600 px-1.5 py-0.2 text-[8px] font-black text-white shadow-md animate-bounce">
                      Đã chặn 🛡️
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
