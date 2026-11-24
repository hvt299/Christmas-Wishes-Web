// components/games/gift-guess/GiftBoxesGrid.tsx
// Hộp quà 3D Giáng Sinh có nơ vàng, hiệu ứng mở nắp & âm thanh tương tác

'use client'

import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { soundEffects } from '@/lib/sound-effects'

export interface BoxState {
  index: number
  isOpened: boolean
  emoji?: string
  label?: string
  reward?: number
  isJackpot?: boolean
}

interface Props {
  boxes: BoxState[]
  openedCount: number
  openLimit: number
  runningTotal: number
  fee: number
  disabled: boolean
  onOpenBox: (index: number) => void
}

export function GiftBoxesGrid({
  boxes,
  openedCount,
  openLimit,
  runningTotal,
  fee,
  disabled,
  onOpenBox,
}: Props) {
  const turnsLeft = openLimit - openedCount
  const netRunning = runningTotal - fee

  const handleBoxClick = (idx: number) => {
    if (disabled || boxes[idx]?.isOpened || turnsLeft <= 0) return
    soundEffects.playClick()
    onOpenBox(idx)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* HUD Info — Compact Single Row */}
      <div className="flex items-center justify-between rounded-2xl border border-amber-200/20 bg-black/50 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Lượt mở còn:</span>
          <span className="text-sm font-black text-yellow-300 tabular-nums">
            {turnsLeft} / {openLimit}
          </span>
        </div>

        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-white/50">Tích luỹ:</span>
          <span
            className={`text-sm font-black tabular-nums ${
              runningTotal > 0 ? 'text-green-300' : 'text-white/70'
            }`}
          >
            +{runningTotal} ❄️
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              netRunning > 0
                ? 'bg-green-500/20 text-green-300'
                : netRunning < 0
                ? 'bg-red-500/20 text-red-300'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {netRunning > 0 ? `Lãi +${netRunning}` : netRunning < 0 ? `Lỗ ${netRunning}` : 'Hoà'}
          </span>
        </div>
      </div>

      {/* Grid Boxes */}
      <div
        className={`grid gap-2 sm:gap-2.5 ${
          boxes.length === 6
            ? 'grid-cols-3'
            : boxes.length === 9
            ? 'grid-cols-3'
            : 'grid-cols-4'
        }`}
      >
        {boxes.map((box) => {
          const isOpened = box.isOpened

          return (
            <motion.button
              key={box.index}
              type="button"
              disabled={disabled || isOpened || turnsLeft <= 0}
              onClick={() => handleBoxClick(box.index)}
              whileHover={!disabled && !isOpened && turnsLeft > 0 ? { scale: 1.05, rotate: [0, -2, 2, 0] } : {}}
              whileTap={!disabled && !isOpened && turnsLeft > 0 ? { scale: 0.95 } : {}}
              className={`relative aspect-square w-full rounded-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 p-1.5 ${
                isOpened
                  ? box.isJackpot
                    ? 'border-2 border-yellow-300 bg-linear-to-b from-yellow-400/30 via-yellow-950/80 to-black shadow-[0_0_30px_rgba(250,204,21,0.8)] ring-2 ring-yellow-400/40 animate-pulse'
                    : (box.reward ?? 0) < 0
                    ? 'border-2 border-red-500/80 bg-linear-to-br from-red-950/80 via-[#260307] to-black shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'border-2 border-emerald-400/80 bg-linear-to-br from-emerald-950/70 via-[#032014] to-black shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                  : 'border-2 border-amber-300/50 bg-linear-to-br from-red-800 via-[#200508] to-red-950 shadow-lg hover:border-yellow-300 hover:shadow-[0_0_22px_rgba(250,204,21,0.4)]'
              }`}
              aria-label={
                isOpened
                  ? `Hộp ${box.index + 1}: ${box.label} (${box.reward} ❄️)`
                  : `Hộp quà số ${box.index + 1}`
              }
            >
              {isOpened ? (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14 }}
                  className="flex h-full flex-col items-center justify-center rounded-xl bg-black/25 p-1 text-center"
                >
                  <span className="text-2xl sm:text-3xl drop-shadow-md">{box.emoji}</span>
                  <span className="mt-1 text-[10px] font-bold text-white/80 line-clamp-1">
                    {box.label}
                  </span>
                  <span
                    className={`text-xs font-black tabular-nums ${
                      (box.reward ?? 0) > 0
                        ? 'text-green-300'
                        : (box.reward ?? 0) < 0
                        ? 'text-red-400'
                        : 'text-white/40'
                    }`}
                  >
                    {(box.reward ?? 0) > 0
                      ? `+${box.reward} ❄️`
                      : (box.reward ?? 0) < 0
                      ? `${box.reward} ❄️`
                      : '0 ❄️'}
                  </span>
                </motion.div>
              ) : (
                <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-yellow-400/30 bg-black/25 shadow-inner">
                  {/* Dải nơ vàng chữ thập 3D */}
                  <div className="absolute inset-y-0 w-3.5 bg-linear-to-r from-amber-300 via-yellow-200 to-amber-500 shadow-md border-x border-yellow-100/40 opacity-90" />
                  <div className="absolute inset-x-0 h-3.5 bg-linear-to-b from-amber-300 via-yellow-200 to-amber-500 shadow-md border-y border-yellow-100/40 opacity-90" />

                  {/* Nơ Giáng Sinh sang trọng ở giữa */}
                  <div className="relative z-10 flex flex-col items-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
                    <span className="text-2xl sm:text-3xl drop-shadow-[0_2px_6px_rgba(250,204,21,0.6)]">🎀</span>
                    <span className="mt-0.5 rounded-full border border-yellow-300/60 bg-linear-to-r from-yellow-400 to-amber-500 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider text-red-950 shadow">
                      MỞ
                    </span>
                  </div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
