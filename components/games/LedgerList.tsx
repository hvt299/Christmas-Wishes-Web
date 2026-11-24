'use client'

// components/games/LedgerList.tsx
// Danh sách lịch sử nhận thưởng với tab lọc và infinite scroll chuẩn my-trees
import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Loader2, Sparkles } from 'lucide-react'
import { gamesApi } from '@/lib/games-api'
import { getLocalLedger } from '@/lib/local-ledger'
import type { LedgerEntry, GameId } from '@/types/games'

const GAME_LABELS: Record<string, string> = {
  snowflake: '❄️ Săn Bông Tuyết',
  'card-flip': '🃏 Lật Thẻ Giáng Sinh',
  'gift-guess': '🎁 Đoán Quà Bất Ngờ',
  'lucky-wheel': '🎡 Vòng Quay May Mắn',
}

interface Props {
  game?: GameId
  initialEntries?: LedgerEntry[]
}

type Filter = 'all' | 'earn' | 'spend'

export function LedgerList({ game, initialEntries = [] }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [entries, setEntries] = useState<LedgerEntry[]>(initialEntries)
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchEntries = useCallback(
    async (reset = false) => {
      setIsLoading(true)
      try {
        const { data } = await gamesApi.getLedger({
          game,
          type: filter === 'all' ? undefined : filter,
          cursor: reset ? undefined : cursor ?? undefined,
        })
        const serverEntries = data.entries || []
        const localEntries = getLocalLedger(game, filter === 'all' ? undefined : filter)
        const combined = [...serverEntries]
        for (const loc of localEntries) {
          if (!combined.some((c) => c._id === loc._id)) {
            combined.push(loc)
          }
        }
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setEntries((prev) => (reset ? combined : [...prev, ...serverEntries]))
        setCursor(data.nextCursor)
        setHasMore(data.nextCursor !== null)
      } catch {
        const localEntries = getLocalLedger(game, filter === 'all' ? undefined : filter)
        setEntries((prev) => (reset ? localEntries : [...prev, ...localEntries]))
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [game, filter, cursor],
  )

  useEffect(() => {
    setEntries([])
    setCursor(null)
    setHasMore(true)
    fetchEntries(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, game])

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'earn', label: '+ Kiếm tuyết' },
    { key: 'spend', label: '− Tiêu tuyết' },
  ]

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Pill filter switcher */}
      <div className="mb-6 flex items-center justify-start">
        <div className="inline-flex rounded-full border border-amber-200/20 bg-black/40 p-1 backdrop-blur-xl">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filter === t.key
                  ? 'border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 text-[#35150e] shadow-md'
                  : 'text-amber-100/70 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {entries.length === 0 && !isLoading && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-300">
            <Sparkles className="h-8 w-8 text-yellow-300/60" />
          </div>
          <p className="font-serif text-lg text-yellow-200">Chưa có lịch sử nhận thưởng nào</p>
          <p className="mt-1 text-xs text-red-100/50">
            Mọi biến động điểm và lượt nhận thưởng sẽ được lưu lại tự động tại đây.
          </p>
        </div>
      )}

      {/* Entries List */}
      <ul className="space-y-3" aria-label="Lịch sử nhận thưởng bông tuyết">
        {entries.map((entry) => {
          const isPositive = entry.amount >= 0
          return (
            <li
              key={entry._id}
              className="flex items-center gap-4 rounded-2xl border border-yellow-400/10 bg-black/30 p-4 transition duration-300 hover:border-yellow-400/20 hover:bg-black/40"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  isPositive
                    ? 'border-green-400/30 bg-green-950/60 text-green-300'
                    : 'border-red-400/30 bg-red-950/60 text-red-300'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-serif text-base font-bold text-yellow-100 truncate">
                  {GAME_LABELS[entry.game] ?? entry.game}
                </p>
                <p className="text-xs text-white/40">{formatDate(entry.createdAt)}</p>
              </div>

              <div className="text-right">
                <p
                  className={`font-serif text-lg font-black tabular-nums ${
                    isPositive ? 'text-green-300' : 'text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {entry.amount} ❄️
                </p>
                <p className="text-xs text-white/40 tabular-nums">
                  Số dư sau đó: {entry.balanceAfter.toLocaleString('vi-VN')}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => fetchEntries()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/40 bg-black/25 px-6 py-2.5 text-sm font-semibold text-yellow-100 transition duration-300 hover:border-yellow-300/70 hover:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
          >
            Xem thêm lịch sử
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-300" />
        </div>
      )}
    </div>
  )
}
