'use client'

// components/games/gift-guess/GiftOddsTable.tsx
import { GIFT_GUESS_MODES, GIFT_REWARD_TIERS, GIFT_JACKPOT_VALUE, GIFT_JACKPOT_WEIGHTS } from '@/constants/games'
import type { GiftGuessMode } from '@/types/games'

interface Props {
  selectedMode: GiftGuessMode
}

export function GiftOddsTable({ selectedMode }: Props) {
  const currentMode = GIFT_GUESS_MODES.find((m) => m.mode === selectedMode)!
  const jackpotWeight = GIFT_JACKPOT_WEIGHTS[selectedMode]

  return (
    <div className="rounded-2xl border border-red-500/20 bg-black/40 p-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <h4 className="font-serif text-sm font-bold text-yellow-300">
          🎁 Tỷ lệ & Thưởng chế độ {currentMode.label} (c = {currentMode.c})
        </h4>
        <span className="text-xs text-white/50">Phí: {currentMode.fee} ❄️</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-12 font-semibold text-white/40 pb-1 border-b border-white/5">
          <span className="col-span-5">Phần thưởng</span>
          <span className="col-span-4 text-center">Giá trị (❄️)</span>
          <span className="col-span-3 text-right">Xác suất</span>
        </div>

        {GIFT_REWARD_TIERS.filter((t) => t.id !== 'jackpot').map((tier) => {
          const val = Math.round(tier.multiplier * currentMode.c)
          const isNegative = val < 0
          return (
            <div key={tier.id} className="grid grid-cols-12 items-center py-0.5">
              <span className="col-span-5 flex items-center gap-1.5 text-white/80">
                <span>{tier.emoji}</span>
                <span className="truncate">{tier.label}</span>
              </span>
              <span
                className={`col-span-4 text-center font-bold tabular-nums ${
                  isNegative ? 'text-red-400' : val > 0 ? 'text-green-300' : 'text-white/40'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </span>
              <span className="col-span-3 text-right text-white/60 tabular-nums">
                {(tier.weight * 100).toFixed(1)}%
              </span>
            </div>
          )
        })}

        {/* Jackpot row */}
        <div className="grid grid-cols-12 items-center rounded-lg bg-yellow-500/10 px-1 py-1 font-bold text-yellow-300">
          <span className="col-span-5 flex items-center gap-1.5">
            <span>🏆</span>
            <span>Jackpot</span>
          </span>
          <span className="col-span-4 text-center text-yellow-200">+{GIFT_JACKPOT_VALUE}</span>
          <span className="col-span-3 text-right text-yellow-400">
            {(jackpotWeight * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-white/40">
        <span>Hoàn vốn kỳ vọng: ~70%</span>
        <span>Khả năng ván lỗ: ~70–77%</span>
      </div>
    </div>
  )
}
