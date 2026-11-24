'use client'

// components/games/lucky-wheel/WheelOddsTable.tsx
// Hiển thị bảng xác suất trước khi quay VIP

import { LUCKY_WHEEL_FREE, LUCKY_WHEEL_VIP, LUCKY_WHEEL_VIP_FEE } from '@/constants/games'
import type { LuckyWheelMode } from '@/types/games'

interface Props {
    mode: LuckyWheelMode
}

export function WheelOddsTable({ mode }: Props) {
    const slots = mode === 'free' ? LUCKY_WHEEL_FREE : LUCKY_WHEEL_VIP
    const fee = mode === 'vip' ? LUCKY_WHEEL_VIP_FEE : 0

    return (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/30">
                Bảng xác suất – Vòng {mode === 'free' ? 'miễn phí' : 'VIP'}
                {fee > 0 && <span className="ml-1 text-yellow-300">({fee}❄️/lượt)</span>}
            </p>
            <div className="space-y-1.5">
                {slots.map((slot) => (
                    <div key={slot.value} className="flex items-center gap-3">
                        <div className="w-16 text-right text-sm font-bold text-white/80 tabular-nums">
                            {slot.value === 0 ? 'Trắng tay' : `+${slot.value}`}
                        </div>
                        <div className="flex-1 overflow-hidden rounded-full bg-white/8 h-2">
                            <div
                                className={`h-full rounded-full ${slot.value === 0 ? 'bg-white/20' : 'bg-yellow-400'}`}
                                style={{ width: `${slot.weight * 100}%` }}
                            />
                        </div>
                        <div className="w-12 text-xs text-white/40 tabular-nums">
                            {(slot.weight * 100).toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
            {mode === 'vip' && (
                <p className="mt-3 text-xs text-white/35">
                    ~82% lượt lỗ · ~18% hoà hoặc lãi (ô 60❄️ trở lên) · Kỳ vọng ~28❄️
                </p>
            )}
        </div>
    )
}
