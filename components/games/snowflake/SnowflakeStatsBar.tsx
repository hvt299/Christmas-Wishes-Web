'use client'

// components/games/snowflake/SnowflakeStatsBar.tsx
// Dải 3 ô thống kê chuẩn phong cách my-trees
import { Snowflake, Trophy, Sparkles } from 'lucide-react'

interface Props {
  today: number
  record: number
  season: number
  multiplier: number
}

const sectionClass =
  'rounded-3xl border border-amber-200/15 bg-[#071b16]/45 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl'

export function SnowflakeStatsBar({ today, record, season, multiplier }: Props) {
  return (
    <div className="mx-auto mb-6 flex flex-col gap-4 max-w-5xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Tuyết hôm nay */}
        <div className={`${sectionClass} flex items-center gap-4 p-5`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.1)]">
            <Snowflake className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-white/50">Tuyết hôm nay</p>
            <p className="font-serif text-2xl font-bold text-sky-200 tabular-nums">
              {today > 0 ? `+${today.toLocaleString('vi-VN')}` : today.toLocaleString('vi-VN')} ❄️
            </p>
          </div>
        </div>

        {/* Card 2: Kỷ lục */}
        <div className={`${sectionClass} flex items-center gap-4 p-5`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Trophy className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <p className="text-xs text-white/50">Kỷ lục cá nhân</p>
            <p className="font-serif text-2xl font-bold text-amber-200 tabular-nums">
              {record.toLocaleString('vi-VN')} ❄️
            </p>
          </div>
        </div>

        {/* Card 3: Tổng mùa này */}
        <div className={`${sectionClass} flex items-center gap-4 p-5`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-300/20 bg-green-400/10 text-green-200 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <Sparkles className="h-6 w-6 text-green-300" />
          </div>
          <div>
            <p className="text-xs text-white/50">Tổng mùa này</p>
            <p className="font-serif text-2xl font-bold text-green-200 tabular-nums">
              {season.toLocaleString('vi-VN')} ❄️
            </p>
          </div>
        </div>
      </div>

      {multiplier > 1 && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/30 bg-linear-to-r from-yellow-500/15 via-amber-400/20 to-yellow-500/15 py-3 text-center text-sm font-bold text-yellow-300 shadow-md">
          <Sparkles className="h-4 w-4 text-yellow-300 animate-spin" />
          <span>SỰ KIỆN ĐẶC BIỆT: Hệ số nhân điểm hôm nay ×{multiplier}!</span>
        </div>
      )}
    </div>
  )
}
