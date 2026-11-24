'use client'

// app/snowflake-game/page.tsx — Săn Bông Tuyết (Bám sát bố cục & thiết kế my-trees)
import { useState, useEffect } from 'react'
import { Sparkles, Gamepad2, History, Snowflake, BookOpen, Volume2, VolumeX } from 'lucide-react'
import { GameHeader } from '@/components/games/GameHeader'
import { GameFooter } from '@/components/games/GameFooter'
import { ChristmasAmbientBackground } from '@/components/games/ChristmasAmbientBackground'
import { SnowflakeGameArea } from '@/components/games/snowflake/SnowflakeGameArea'
import { SnowflakeClosedState } from '@/components/games/snowflake/SnowflakeClosedState'
import { LedgerList } from '@/components/games/LedgerList'
import { GameRulesModal } from '@/components/games/GameRulesModal'
import { GameResultModal } from '@/components/games/GameResultModal'
import { gamesApi } from '@/lib/games-api'
import { useGameStore } from '@/store/useGameStore'
import { useGameClock } from '@/hooks/useGameClock'
import { getGameWindowStatus, getSnowflakeMultiplier, DEBUG_TEST_MODE } from '@/constants/games'
import { soundEffects } from '@/lib/sound-effects'
import type { SnowflakeResult } from '@/components/games/snowflake/SnowflakeGameArea'
import type { GameStatus } from '@/types/games'

type Tab = 'play' | 'history'

const sectionClass =
  'rounded-3xl border border-amber-200/15 bg-[#071b16]/45 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl'

export default function SnowflakeGamePage() {
  const [tab, setTab] = useState<Tab>('play')
  const [status, setStatus] = useState<GameStatus>('open')
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [stats, setStats] = useState({ today: 0, record: 0, season: 0 })
  const [isMuted, setIsMuted] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [snowflakeResult, setSnowflakeResult] = useState<SnowflakeResult | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const { setSnowflakes, setGameQuotas } = useGameStore()
  const { vnNow } = useGameClock()
  const multiplier = getSnowflakeMultiplier(vnNow)

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await gamesApi.getStatus()
        const sf = data.find((g) => g.game === 'snowflake')
        if (sf) {
          setStatus(sf.status as GameStatus)
          setQuotaUsed(sf.quotaUsed)

          const quotaMap: Record<string, { used: number; max: number | null; status: GameStatus }> = {}
          for (const g of data) {
            quotaMap[g.game] = {
              used: g.quotaUsed,
              max: g.quotaMax,
              status: g.status as GameStatus,
            }
          }
          setGameQuotas(quotaMap as Parameters<typeof setGameQuotas>[0])
        }
      } catch {
        const clientStatus = getGameWindowStatus('snowflake', vnNow)
        setStatus(clientStatus)
      }
    }
    init()
  }, [vnNow, setGameQuotas])

  // Lấy số dư từ user_info trong localStorage & khôi phục thống kê thành tích
  useEffect(() => {
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo)
        if (typeof parsed.snowflakes === 'number') {
          setSnowflakes(parsed.snowflakes)
        }
      } catch {
        /* noop */
      }
    }

    const savedStats = localStorage.getItem('snowflake_stats')
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats)
        if (parsed && typeof parsed.record === 'number') {
          setStats(parsed)
        }
      } catch {
        /* noop */
      }
    }

    // Đồng bộ thành tích chuẩn xác từ lịch sử nhận thưởng
    gamesApi.getLedger({ game: 'snowflake', limit: 100 })
      .then(({ data }) => {
        if (data?.entries && data.entries.length > 0) {
          const nowStr = new Date().toISOString().slice(0, 10)
          let todaySum = 0
          let maxScore = 0
          let seasonSum = 0
          for (const e of data.entries) {
            if (e.amount > 0) {
              seasonSum += e.amount
              if (e.createdAt?.slice(0, 10) === nowStr) {
                todaySum += e.amount
              }
              if (e.amount > maxScore) {
                maxScore = e.amount
              }
            }
          }
          setStats((prev) => {
            const next = {
              today: todaySum || prev.today,
              record: Math.max(maxScore, prev.record),
              season: seasonSum || prev.season,
            }
            localStorage.setItem('snowflake_stats', JSON.stringify(next))
            return next
          })
        }
      })
      .catch(() => { /* noop */ })
  }, [setSnowflakes])

  const handleScoreUpdate = (today: number, record: number) => {
    setStats((prev) => {
      const next = {
        today: prev.today + today,
        record: Math.max(prev.record, record),
        season: prev.season + today,
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('snowflake_stats', JSON.stringify(next))
      }
      return next
    })
    if (today > 0) setQuotaUsed(1)
  }

  const handleResult = (res: SnowflakeResult) => {
    setSnowflakeResult(res)
    setShowResultModal(true)
  }

  const isPlayable = DEBUG_TEST_MODE ? true : status === 'open'
  const closedReason =
    DEBUG_TEST_MODE
      ? null
      : status === 'coming_soon'
      ? 'coming_soon'
      : status === 'closed'
      ? 'closed'
      : status === 'quota_reached'
      ? 'quota_reached'
      : null

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
      {/* 1. Ambient Background chuẩn phong cách my-trees */}
      <ChristmasAmbientBackground />

      {/* 2. Top Header tinh gọn với logo, nút quay lại, số bông tuyết và nút đăng xuất */}
      <GameHeader
        backHref="/"
        backLabel="Trang chủ"
      />

      {/* 3. Main Content Container */}
      <div className="relative mx-auto w-full max-w-7xl grow px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
        {/* Test banner if active */}
        {DEBUG_TEST_MODE && (
          <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between gap-3 rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-base">🛠️</span>
              <span>
                <strong>Chế độ test giao diện (DEBUG_TEST_MODE = true):</strong> Mở khóa chơi thử trực tiếp trên trình duyệt. Để tắt chế độ này, vào <code className="rounded bg-black/40 px-1 py-0.5 text-yellow-300">constants/games.ts</code> đổi thành <code className="text-yellow-300">DEBUG_TEST_MODE = false</code>.
              </span>
            </div>
          </div>
        )}

        {/* HEADING SECTION — Compact & Responsive */}
        <div className="mb-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-200 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mùa Lễ Hội Giáng Sinh</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h1 className="font-serif text-2xl font-black text-yellow-300 drop-shadow-md sm:text-3xl md:text-4xl">
            Săn Bông Tuyết Rơi
          </h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-red-100/70 sm:text-sm">
            Hứng bông tuyết pha lê và tuyết vàng lấp lánh, né tránh than đá và bóng tối!
          </p>
        </div>

        {/* TAB SWITCHER & CONTROLS */}
        <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-2 px-1">
          <div className="inline-flex rounded-full border border-amber-200/20 bg-black/40 p-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setTab('play')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
                tab === 'play'
                  ? 'border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 text-[#35150e] shadow-md'
                  : 'text-amber-100/70 hover:text-white'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Khu Săn Tuyết</span>
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
              <span>Lịch Sử</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(soundEffects.toggleMute())}
              className="flex items-center gap-1 rounded-full border border-amber-200/20 bg-black/40 px-3 py-1.5 text-xs text-amber-200 hover:bg-black/60 transition"
              title="Bật/Tắt âm thanh tương tác"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-300" /> : <Volume2 className="h-3.5 w-3.5 text-yellow-300" />}
              <span className="hidden sm:inline">{isMuted ? 'Tắt âm' : 'Âm thanh'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-yellow-400/35 bg-yellow-950/40 px-3.5 py-1.5 text-xs font-semibold text-yellow-200 hover:bg-yellow-900/50 transition shadow-sm"
              title="Xem luật chơi & tỷ lệ thưởng"
            >
              <BookOpen className="h-3.5 w-3.5 text-yellow-300" />
              <span>Luật chơi</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="mx-auto max-w-3xl">
          {tab === 'play' ? (
            <div className="space-y-3">
              {/* Compact Metrics Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-yellow-400/20 bg-black/40 px-4 py-2 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-yellow-300 font-bold">Thành tích:</span>
                  {multiplier > 1 && (
                    <span className="rounded-full border border-yellow-400/40 bg-yellow-400/20 px-2 py-0.2 text-[10px] font-bold text-yellow-300 animate-pulse">
                      ✨ ×{multiplier} Giáng Sinh
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-sky-400/25 bg-sky-950/40 px-2.5 py-0.5 text-sky-200">
                    Hôm nay: <strong className="text-white">{stats.today > 0 ? `+${stats.today}` : stats.today} ❄️</strong>
                  </span>
                  <span className="rounded-full border border-amber-400/25 bg-amber-950/40 px-2.5 py-0.5 text-amber-200">
                    Kỷ lục: <strong className="text-white">{stats.record} ❄️</strong>
                  </span>
                  <span className="rounded-full border border-green-400/25 bg-green-950/40 px-2.5 py-0.5 text-green-200">
                    Tổng mùa: <strong className="text-white">{stats.season} ❄️</strong>
                  </span>
                </div>
              </div>

              {/* Game Stage Card — Compact Fitting */}
              <section className={`${sectionClass} relative overflow-hidden p-3.5 sm:p-5`}>
                <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-sky-300 to-transparent" />
                <Snowflake className="pointer-events-none absolute right-4 top-4 h-10 w-10 text-yellow-200 opacity-15" />

                {isPlayable ? (
                  <SnowflakeGameArea
                    multiplier={multiplier}
                    onScoreUpdate={handleScoreUpdate}
                    onResult={handleResult}
                  />
                ) : closedReason ? (
                  <SnowflakeClosedState state={closedReason} />
                ) : null}
              </section>
            </div>
          ) : (
            <section className={`${sectionClass} p-6 sm:p-8`}>
              <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-yellow-300 to-transparent" />
              <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-yellow-200">
                    Lịch Sử Săn Tuyết Của Bạn
                  </h3>
                  <p className="text-xs text-red-100/60">
                    Nhật ký các lượt hứng bông tuyết theo ngày của bạn.
                  </p>
                </div>
              </div>
              <LedgerList game="snowflake" />
            </section>
          )}
        </div>
      </div>

      {/* Result Modal — hiển thị ở page level, ngoài section khung chơi */}
      {snowflakeResult && (
        <GameResultModal
          isOpen={showResultModal}
          score={snowflakeResult.score}
          newBalance={snowflakeResult.newBalance}
          isRecord={snowflakeResult.isRecord}
          recordLabel={multiplier > 1 ? `✨ Nhân ×${multiplier} ngày hội Giáng Sinh!` : '🎉 Kỷ lục cá nhân mới!'}
          extra={
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-sky-400/20 bg-sky-950/40 p-2.5 text-center">
                <span className="text-white/60">Kỷ lục:</span>
                <p className="font-bold text-yellow-300">{snowflakeResult.record} ❄️</p>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-amber-950/40 p-2.5 text-center">
                <span className="text-white/60">Hệ số ngày:</span>
                <p className="font-bold text-yellow-300">×{multiplier}</p>
              </div>
            </div>
          }
          onClose={() => {
            setShowResultModal(false)
            setSnowflakeResult(null)
          }}
          onPlayAgain={DEBUG_TEST_MODE ? () => {
            setShowResultModal(false)
            setSnowflakeResult(null)
          } : undefined}
          playAgainLabel="Chơi lại ván mới (Test)"
        />
      )}

      {/* Rules Modal */}
      <GameRulesModal
        isOpen={showRulesModal}
        defaultGame="snowflake"
        onClose={() => setShowRulesModal(false)}
      />

      <GameFooter />
    </main>
  )
}
