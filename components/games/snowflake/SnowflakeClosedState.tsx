'use client'

// components/games/snowflake/SnowflakeClosedState.tsx
// Hiển thị trạng thái đóng / chưa mở / hết lượt chuẩn phong cách my-trees
import { useGameClock } from '@/hooks/useGameClock'
import { Lock, Clock, PackageCheck, Sparkles } from 'lucide-react'

type State = 'coming_soon' | 'closed' | 'quota_reached'

interface Props {
  state: State
}

const TARGET_YEAR = new Date().getFullYear()

function getCountdownToOpen(): string {
  const now = new Date()
  const target = new Date(`${TARGET_YEAR}-12-01T00:00:00+07:00`)
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return days > 0 ? `${days} ngày ${hours} giờ` : `${hours} giờ`
}

export function SnowflakeClosedState({ state }: Props) {
  const { countdownToMidnight } = useGameClock()

  return (
    <div className="py-12 px-4 text-center sm:py-16">
      <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_35px_rgba(234,179,8,0.1)]">
        {state === 'coming_soon' && <Lock className="h-12 w-12 text-yellow-300/80" />}
        {state === 'closed' && <PackageCheck className="h-12 w-12 text-amber-300/80" />}
        {state === 'quota_reached' && <Clock className="h-12 w-12 text-sky-300/80" />}
        <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-yellow-200/70" />
      </div>

      <div>
        {state === 'coming_soon' && (
          <>
            <h3 className="font-serif text-2xl font-bold text-yellow-200 sm:text-3xl">
              Mùa Săn Tuyết Sắp Khởi Động
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-100/70 sm:text-base">
              Cổng săn tuyết chính thức mở từ <span className="font-bold text-yellow-300">01/12</span> đến hết ngày <span className="font-bold text-yellow-300">25/12</span>.
              <br />
              Thời gian đếm ngược: <span className="font-bold text-green-300">{getCountdownToOpen()}</span>.
            </p>
          </>
        )}

        {state === 'closed' && (
          <>
            <h3 className="font-serif text-2xl font-bold text-yellow-200 sm:text-3xl">
              Mùa Săn Tuyết Đã Khép Lại
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-100/70 sm:text-base">
              Sự kiện Săn Bông Tuyết đã chính thức kết thúc vào 00:00 ngày 26/12.
              Bạn vẫn có thể xem lại lịch sử nhận thưởng và tham gia các trò chơi khác tại Sảnh Mini Games!
            </p>
          </>
        )}

        {state === 'quota_reached' && (
          <>
            <h3 className="font-serif text-2xl font-bold text-yellow-200 sm:text-3xl">
              Bạn Đã Dùng Hết Lượt Hôm Nay
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-100/70 sm:text-base">
              Mỗi ngày bạn có 1 lượt hứng tuyết miễn phí. Lượt mới sẽ được làm mới sau:
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-black/40 px-5 py-2">
              <Clock className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span className="font-serif text-lg font-bold text-yellow-300 tabular-nums">
                {countdownToMidnight}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
