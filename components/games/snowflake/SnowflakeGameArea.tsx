'use client'

// components/games/snowflake/SnowflakeGameArea.tsx
// Khu vực bắt đầu / điều khiển trò chơi Săn Bông Tuyết phong cách my-trees
import { useState, useCallback, useRef } from 'react'
import { Loader2, Sparkles, Play, ShieldAlert } from 'lucide-react'
import { SnowflakeGameCanvas } from './SnowflakeGameCanvas'
import { gamesApi } from '@/lib/games-api'
import { useGameStore } from '@/store/useGameStore'
import { DEBUG_TEST_MODE } from '@/constants/games'
import { saveLocalLedger } from '@/lib/local-ledger'
import type { DropEvent, CatchLogEntry } from '@/types/games'

function generateMockDropSchedule(): DropEvent[] {
  const items: DropEvent[] = []
  let spawnAt = 0.5
  const regularTypes: Array<{ itemId: string; val: number }> = [
    { itemId: 'snow', val: 2 },
    { itemId: 'snow', val: 1 },
    { itemId: 'crystal', val: 4 },
    { itemId: 'coal', val: -2 },
  ]
  const frenzyTypes: Array<{ itemId: string; val: number }> = [
    { itemId: 'snow', val: 2 },
    { itemId: 'crystal', val: 4 },
    { itemId: 'crystal', val: 5 },
    { itemId: 'gold', val: 8 },
    { itemId: 'gold', val: 10 },
    { itemId: 'coal', val: -2 },
    { itemId: 'shadow', val: -4 },
    { itemId: 'shadow', val: -4 },
  ]

  while (spawnAt < 58.5) {
    const isFrenzy = spawnAt > 38
    const list = isFrenzy ? frenzyTypes : regularTypes
    const picked = list[Math.floor(Math.random() * list.length)]
    items.push({
      itemId: picked.itemId,
      spawnAt: parseFloat(spawnAt.toFixed(2)),
      x: Math.random() * 0.8 + 0.1,
      value: picked.val,
    })
    // Tần suất rơi tăng mạnh ở các giây cuối để tạo cao trào kịch tính
    const interval = isFrenzy ? 0.65 + Math.random() * 0.8 : 1.3 + Math.random() * 1.8
    spawnAt += interval
  }
  return items
}

type Phase = 'idle' | 'starting' | 'playing' | 'submitting' | 'done'

export interface SnowflakeResult {
  score: number
  newBalance: number
  isRecord: boolean
  record: number
}

interface Props {
  onScoreUpdate: (today: number, record: number) => void
  /** Callback khi ván kết thúc — page sẽ hiển thị modal tổng kết */
  onResult: (result: SnowflakeResult) => void
  multiplier: number
}

export function SnowflakeGameArea({ onScoreUpdate, onResult, multiplier }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [dropSchedule, setDropSchedule] = useState<DropEvent[]>([])
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState('')

  const { setSnowflakes, addTransaction, incrementQuota } = useGameStore()

  const handleStart = async () => {
    setError('')
    setPhase('starting')

    // Tự động cuộn màn hình xuống vùng chơi để người chơi thấy rõ giỏ hứng
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)

    if (DEBUG_TEST_MODE) {
      setTimeout(() => {
        setDropSchedule(generateMockDropSchedule())
        setSessionId('mock-test-session')
        setPhase('playing')
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }, 400)
      return
    }

    try {
      const { data } = await gamesApi.snowflakeStart()
      setDropSchedule(data.dropSchedule)
      setSessionId(data.sessionId)
      setPhase('playing')
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      const msg = e?.response?.data?.message ?? 'Không thể bắt đầu ván. Vui lòng thử lại.'
      setError(msg)
      setPhase('idle')
    }
  }

  const handleFinish = useCallback(
    async (catchLog: CatchLogEntry[]) => {
      setPhase('submitting')

      if (DEBUG_TEST_MODE) {
        let mockScore = 0
        for (const log of catchLog) {
          const it = dropSchedule.find((d) => d.itemId === log.itemId)
          if (it) mockScore += it.value
        }
        mockScore = Math.max(0, Math.round(mockScore * multiplier))
        const currentSnowflakes = useGameStore.getState().snowflakes
        const newBal = currentSnowflakes + mockScore
        setSnowflakes(newBal)
        addTransaction(mockScore)
        saveLocalLedger('snowflake', mockScore, newBal)
        const res: SnowflakeResult = {
          score: mockScore,
          newBalance: newBal,
          isRecord: true,
          record: Math.max(88, mockScore),
        }
        onScoreUpdate(mockScore, Math.max(88, mockScore))
        setPhase('idle')
        onResult(res)
        return
      }

      try {
        const { data } = await gamesApi.snowflakeFinish(sessionId, catchLog)
        setSnowflakes(data.newBalance)
        addTransaction(data.score)
        saveLocalLedger('snowflake', data.score, data.newBalance)
        incrementQuota('snowflake')
        const res: SnowflakeResult = {
          score: data.score,
          newBalance: data.newBalance,
          isRecord: data.isRecord,
          record: data.record,
        }
        onScoreUpdate(data.score, data.record)
        setPhase('idle')
        onResult(res)
      } catch {
        setPhase('idle')
        onResult({ score: 0, newBalance: 0, isRecord: false, record: 0 })
      }
    },
    [sessionId, dropSchedule, multiplier, setSnowflakes, addTransaction, incrementQuota, onScoreUpdate, onResult],
  )

  const handleReset = () => {
    setPhase('idle')
    setError('')
  }

  return (
    <div ref={containerRef}>
      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-4 py-4 px-2 text-center">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-300/30 bg-red-950/70 px-4 py-2 text-xs text-red-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-300" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            <span className="text-3xl">🧺</span>
            <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-yellow-300 animate-spin" />
          </div>

          <div className="max-w-md">
            <h3 className="font-serif text-xl font-bold text-yellow-200 sm:text-2xl">
              Giỏ Quà Giáng Sinh Đã Sẵn Sàng!
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-red-100/70 sm:text-sm">
              Bạn có <span className="font-bold text-yellow-300">60 giây</span> để di chuyển chiếc giỏ và hứng trọn bông tuyết nhiệm màu!
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-green-300/50 bg-linear-to-r from-green-700 to-green-600 px-7 py-2.5 text-sm sm:text-base font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:border-green-200 hover:from-green-600 hover:to-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Bắt Đầu Hứng Tuyết</span>
            </button>
            <span className="text-[11px] text-white/45">
              1 lượt duy nhất hôm nay · Điểm ván luôn ≥ 0
            </span>
          </div>
        </div>
      )}

      {phase === 'starting' && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-sky-200" />
          </div>
          <p className="font-serif text-lg text-yellow-100">
            Đang tạo bầu trời tuyết rơi nhiệm màu...
          </p>
        </div>
      )}

      {phase === 'playing' && (
        <SnowflakeGameCanvas
          dropSchedule={dropSchedule}
          duration={60}
          onFinish={(log) => handleFinish(log)}
        />
      )}

      {phase === 'submitting' && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-300/30 bg-green-400/10 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-green-200" />
          </div>
          <p className="font-serif text-lg text-yellow-100">
            Đang xác minh thành tích và cộng bông tuyết...
          </p>
        </div>
      )}
    </div>
  )
}
