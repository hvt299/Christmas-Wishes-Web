'use client'

// app/mini-games/page.tsx — Sảnh trò chơi Giáng Sinh (Bám sát bố cục & thiết kế my-trees)
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Gamepad2,
  Sparkles,
  History,
  Snowflake,
  ChevronRight,
  Calendar,
  BookOpen,
} from 'lucide-react'
import { GameHeader } from '@/components/games/GameHeader'
import { GameFooter } from '@/components/games/GameFooter'
import { ChristmasAmbientBackground } from '@/components/games/ChristmasAmbientBackground'
import { GameStatusBadge } from '@/components/games/GameStatusBadge'
import { LedgerList } from '@/components/games/LedgerList'
import { GameRulesModal } from '@/components/games/GameRulesModal'
import { gamesApi } from '@/lib/games-api'
import { useGameStore } from '@/store/useGameStore'
import { DEBUG_TEST_MODE } from '@/constants/games'
import type { GameStatus } from '@/types/games'

type Tab = 'games' | 'history'

const sectionClass =
  'rounded-3xl border border-amber-200/15 bg-[#071b16]/45 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl'

interface MiniGameItem {
  id: string
  title: string
  icon: string
  seasonLabel: string
  desc: string
  href: string
  badgeText: string
  accentGradient: string
  iconBg: string
  status: GameStatus
  quotaUsed?: number
  quotaMax?: number | null
}

export default function MiniGamesPage() {
  const [tab, setTab] = useState<Tab>('games')
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [gameStatuses, setGameStatuses] = useState<
    Record<string, { status: GameStatus; quotaUsed: number; quotaMax: number | null }>
  >({})

  const { setGameQuotas } = useGameStore()

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await gamesApi.getStatus()
        const map: Record<string, { status: GameStatus; quotaUsed: number; quotaMax: number | null }> = {}
        const quotaMap: Parameters<typeof setGameQuotas>[0] = {}

        for (const g of data) {
          map[g.game] = {
            status: g.status as GameStatus,
            quotaUsed: g.quotaUsed,
            quotaMax: g.quotaMax,
          }
          quotaMap[g.game as keyof typeof quotaMap] = {
            used: g.quotaUsed,
            max: g.quotaMax,
            status: g.status as GameStatus,
          }
        }
        setGameStatuses(map)
        setGameQuotas(quotaMap)
      } catch {
        /* noop */
      }
    }
    init()
  }, [setGameQuotas])

  const gameConfigs: Omit<MiniGameItem, 'status' | 'quotaUsed' | 'quotaMax'>[] = [
    {
      id: 'lucky-wheel',
      title: 'Quay May Mắn',
      icon: '🎡',
      seasonLabel: '01/12 đến 31/12',
      badgeText: '1 lượt quay miễn phí/ngày · VIP thả ga',
      desc: 'Mỗi ngày nhận 1 lượt quay hoàn toàn MIỄN PHÍ! Hoặc tham gia vòng VIP 40❄️ không giới hạn với giải thưởng tới 500❄️. Đặc biệt nhân ×2 vào 24/12 & ×3 vào 25/12.',
      href: '/mini-games/lucky-wheel',
      accentGradient: 'from-transparent via-purple-300 to-transparent',
      iconBg: 'bg-linear-to-br from-purple-400/30 to-purple-950/70 text-purple-100',
    },
    {
      id: 'card-flip',
      title: 'Lật Thẻ Giáng Sinh',
      icon: '🃏',
      seasonLabel: '01/12 đến 25/12',
      badgeText: 'Lượt & thẻ tăng theo tuần · Mở 1/12',
      desc: 'Ghi nhớ nhanh vị trí 16 thẻ quà trong vài giây, sau đó lật thẻ để tìm 4 mục tiêu yêu cầu. Lượt chơi & thưởng tăng dần theo mốc tuần, nhân ×2 vào 24/12 & ×3 vào 25/12!',
      href: '/mini-games/card-flip',
      accentGradient: 'from-transparent via-emerald-300 to-transparent',
      iconBg: 'bg-linear-to-br from-green-400/30 to-green-950/70 text-green-100',
    },
    {
      id: 'gift-guess',
      title: 'Đoán Quà Bất Ngờ',
      icon: '🎁',
      seasonLabel: '24/12 đến 31/12',
      badgeText: 'Săn Jackpot 2026 ❄️',
      desc: 'Mở các hộp quà bí mật Giáng Sinh với 3 cấp độ: Nhỏ, Vừa và Lớn. Khám phá các phần quà nhân bội số và săn giải độc đắc 2026 ❄️! Nhân ×2 vào 24/12 & ×3 vào 25/12.',
      href: '/mini-games/gift-guess',
      accentGradient: 'from-transparent via-amber-300 to-transparent',
      iconBg: 'bg-linear-to-br from-yellow-400/30 to-red-950/70 text-yellow-100',
    },
  ]

  const games: MiniGameItem[] = gameConfigs.map((cfg) => ({
    ...cfg,
    status: DEBUG_TEST_MODE ? 'open' : (gameStatuses[cfg.id]?.status ?? 'coming_soon'),
    quotaUsed: gameStatuses[cfg.id]?.quotaUsed,
    quotaMax: gameStatuses[cfg.id]?.quotaMax,
  }))

  const openCount = games.filter(
    (g) => g.status === 'open' || g.status === 'quota_reached',
  ).length

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
      {/* 1. Ambient Background chuẩn my-trees */}
      <ChristmasAmbientBackground />

      {/* 2. Header tinh gọn với logo, nút quay lại, số bông tuyết và nút đăng xuất */}
      <GameHeader
        backHref="/"
        backLabel="Trang chủ"
      />

      {/* 3. Main Content Container */}
      <div className="relative mx-auto w-full max-w-7xl grow px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
        {/* HEADING SECTION — Compact */}
        <div className="mb-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-200 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Khu Vui Chơi Lễ Hội Giáng Sinh</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h1 className="font-serif text-2xl font-black text-yellow-300 drop-shadow-md sm:text-3xl md:text-4xl">
            Sảnh Trò Chơi
          </h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-red-100/70 sm:text-sm">
            Thử thách bản thân, so tài may mắn và tích lũy bông tuyết nhiệm màu!
          </p>

          {DEBUG_TEST_MODE && (
            <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/10 p-2.5 text-center text-xs text-amber-200">
              🛠️ <strong>Đang bật chế độ TEST UI (DEBUG_TEST_MODE = true):</strong> Mở sẵn toàn bộ trò chơi để bạn trải nghiệm. Để tắt, đặt <code className="rounded bg-black/40 px-1.5 py-0.5 text-yellow-300">DEBUG_TEST_MODE = false</code> trong <code className="rounded bg-black/40 px-1.5 py-0.5 text-yellow-300">constants/games.ts</code>.
            </div>
          )}
        </div>

        {/* TAB SWITCHER & RULES */}
        <div className="mx-auto mb-4 flex max-w-xl flex-wrap items-center justify-center gap-2">
          <div className="inline-flex rounded-full border border-amber-200/20 bg-black/40 p-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setTab('games')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
                tab === 'games'
                  ? 'border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 text-[#35150e] shadow-md'
                  : 'text-amber-100/70 hover:text-white'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Danh Sách Trò Chơi ({games.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('history')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
                tab === 'history'
                  ? 'border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 text-[#35150e] shadow-md'
                  : 'text-amber-100/70 hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Lịch Sử Nhận Thưởng</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="flex items-center gap-1.5 rounded-full border border-yellow-400/35 bg-yellow-950/40 px-3.5 py-1.5 text-xs font-semibold text-yellow-200 hover:bg-yellow-900/50 transition shadow-sm backdrop-blur-xl"
            title="Xem luật chơi & tỷ lệ thưởng của tất cả trò chơi"
          >
            <BookOpen className="h-3.5 w-3.5 text-yellow-300" />
            <span>Luật chơi</span>
          </button>
        </div>

        {/* TAB CONTENT: GAMES GRID */}
        {tab === 'games' ? (
          <section className="mx-auto max-w-5xl">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-yellow-200 sm:text-2xl">
                  Chọn Trò Chơi Giáng Sinh
                </h2>
                <p className="mt-1 text-sm text-red-100/60">
                  Nhấp vào từng trò chơi để tham gia trải nghiệm và nhận thưởng.
                </p>
              </div>
              <p className="text-sm text-white/50">
                Đang mở <span className="font-bold text-yellow-300">{openCount}</span> trò chơi
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => {
                const isOpen = game.status === 'open' || game.status === 'quota_reached'

                return (
                  <article
                    key={game.id}
                    className={`${sectionClass} group relative flex min-w-0 flex-col overflow-hidden transition duration-300 ${
                      isOpen
                        ? 'hover:-translate-y-1 hover:border-yellow-300/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]'
                        : 'grayscale opacity-75 hover:border-white/20'
                    }`}
                  >
                    {/* Top accent line */}
                    <div
                      className={`h-1 w-full bg-linear-to-r ${
                        isOpen ? game.accentGradient : 'from-transparent via-white/20 to-transparent'
                      }`}
                    />

                    <div className="relative flex flex-1 flex-col p-6">
                      {/* Background faint snowflake */}
                      <Snowflake className="pointer-events-none absolute right-4 top-4 h-8 w-8 text-yellow-200 opacity-15 transition group-hover:opacity-30" />

                      {/* Card header */}
                      <div className="mb-4 flex items-start gap-3.5 pr-6">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-inner text-3xl transition duration-300 ${
                            isOpen ? 'group-hover:scale-110' : ''
                          } ${game.iconBg}`}
                        >
                          {game.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <GameStatusBadge status={game.status} />
                          </div>
                          <h3 className="mt-1 font-serif text-xl font-black text-yellow-200 group-hover:text-yellow-100">
                            {game.title}
                          </h3>
                        </div>
                      </div>

                      {/* Timeline & Quota badges */}
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/45">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-yellow-200/60" />
                          {game.seasonLabel}
                        </span>
                        <span className="rounded-full border border-yellow-400/20 bg-yellow-400/5 px-2 py-0.5 text-[11px] text-yellow-200/80">
                          {game.badgeText}
                        </span>
                      </div>

                      {/* Description box */}
                      <div className="mb-5 flex-1 rounded-2xl border border-yellow-400/10 bg-black/25 p-4">
                        <p className="text-sm leading-relaxed text-red-50/75">
                          {game.desc}
                        </p>
                        {game.quotaMax && (
                          <p className="mt-2 text-xs font-semibold text-yellow-300/80">
                            Đã dùng: {game.quotaUsed ?? 0}/{game.quotaMax} lượt hôm nay
                          </p>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="mt-auto border-t border-yellow-400/10 pt-3">
                        <Link
                          href={game.href}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 ${
                            isOpen
                              ? 'border-yellow-300/25 bg-yellow-400/10 text-yellow-100 hover:border-yellow-300/50 hover:bg-yellow-400/20 focus-visible:ring-yellow-300 cursor-pointer'
                              : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:border-white/20 focus-visible:ring-white/20 cursor-not-allowed hover:cursor-not-allowed'
                          }`}
                        >
                          <span>Vào chơi ngay</span>
                          <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ) : (
          /* TAB CONTENT: HISTORY / LEDGER */
          <section className={`${sectionClass} mx-auto max-w-5xl p-6 sm:p-8`}>
            <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-yellow-300 to-transparent" />
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-yellow-200">
                  Lịch Sử Nhận Thưởng Toàn Bộ Trò Chơi
                </h3>
                <p className="text-xs text-red-100/60">
                  Theo dõi mọi biến động bông tuyết từ các trò chơi trong mùa Giáng Sinh.
                </p>
              </div>
            </div>
            <LedgerList />
          </section>
        )}
      </div>

      {/* Global Rules Modal */}
      <GameRulesModal
        isOpen={showRulesModal}
        defaultGame="lucky-wheel"
        onClose={() => setShowRulesModal(false)}
      />

      <GameFooter />
    </main>
  )
}
