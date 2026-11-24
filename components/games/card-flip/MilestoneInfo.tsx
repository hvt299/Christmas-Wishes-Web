'use client'

// components/games/card-flip/MilestoneInfo.tsx
import { CARD_FLIP_MILESTONES, getCardFlipMilestone } from '@/constants/games'
import type { CardFlipMilestoneKey } from '@/constants/games'

interface Props {
  milestoneKey?: CardFlipMilestoneKey | null
  multiplier?: number
}

export function MilestoneInfo({ milestoneKey, multiplier }: Props) {
  const keyToFind = typeof milestoneKey === 'string'
    ? milestoneKey
    : (milestoneKey as any)?.key || null

  const current =
    (keyToFind ? CARD_FLIP_MILESTONES.find((m) => m.key === keyToFind) : null) ||
    getCardFlipMilestone() ||
    CARD_FLIP_MILESTONES[0]

  if (!current) return null

  return (
    <div className="rounded-2xl border border-green-500/20 bg-green-950/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎄</span>
          <div>
            <h3 className="font-serif text-sm font-bold text-green-300 md:text-base">
              Mốc: {current.label} ({current.from} → {current.to})
            </h3>
            <p className="text-xs text-green-200/70">
              Nhiệm vụ: {current.targetDescription} · Xem trước {current.previewSec}s
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-1 text-center">
          <span className="text-xs text-yellow-200/80">Hệ số</span>
          <p className="text-sm font-black text-yellow-300">
            ×{multiplier ?? current.multiplier}
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-white/50">
        <span className="rounded-md bg-white/5 px-2 py-0.5">🎯 Mục tiêu: +4</span>
        <span className="rounded-md bg-white/5 px-2 py-0.5">🎁 Thưởng: +2</span>
        <span className="rounded-md bg-white/5 px-2 py-0.5">💀 Bẫy: −5 ({current.trapCount} bẫy)</span>
        <span className="rounded-md bg-white/5 px-2 py-0.5">🛡️ Khiên: chặn 1 bẫy</span>
        <span className="rounded-md bg-white/5 px-2 py-0.5">✨ Hoàn hảo: +{current.perfectBonus ?? 6}</span>
        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-300/70">📅 {current.dailyQuota ?? 3} lượt/ngày · {current.maxFlips} lần lật</span>
      </div>
    </div>
  )
}
