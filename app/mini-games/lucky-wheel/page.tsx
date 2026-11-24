'use client'

// app/mini-games/lucky-wheel/page.tsx — Vòng Quay May Mắn Giáng Sinh (Chuẩn my-trees)
import { useState, useEffect, useCallback, useRef } from 'react'
import { Sparkles, Gamepad2, History, RotateCw, Crown, Gift, AlertCircle, Volume2, VolumeX, BookOpen } from 'lucide-react'
import { GameHeader } from '@/components/games/GameHeader'
import { GameFooter } from '@/components/games/GameFooter'
import { ChristmasAmbientBackground } from '@/components/games/ChristmasAmbientBackground'
import { GameResultModal } from '@/components/games/GameResultModal'
import { GameRulesModal } from '@/components/games/GameRulesModal'
import { WheelSpinner } from '@/components/games/lucky-wheel/WheelSpinner'
import { LedgerList } from '@/components/games/LedgerList'
import { gamesApi } from '@/lib/games-api'
import { useGameStore } from '@/store/useGameStore'
import { useGameClock } from '@/hooks/useGameClock'
import { LUCKY_WHEEL_VIP_FEE, LUCKY_WHEEL_FREE, LUCKY_WHEEL_VIP, DEBUG_TEST_MODE, getHolidayDayMultiplier } from '@/constants/games'
import { soundEffects } from '@/lib/sound-effects'
import { saveLocalLedger } from '@/lib/local-ledger'
import type { GameStatus, LuckyWheelMode } from '@/types/games'

type Tab = 'play' | 'history'

const sectionClass =
  'rounded-3xl border border-amber-200/15 bg-[#071b16]/45 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl'

export default function LuckyWheelPage() {
  const wheelRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<Tab>('play')
  const [status, setStatus] = useState<GameStatus>('open')
  const [freeUsed, setFreeUsed] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [resultIndex, setResultIndex] = useState<number | null>(null)
  const [pendingResult, setPendingResult] = useState<{
    value: number
    newBalance: number
    label: string
  } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [activeMode, setActiveMode] = useState<LuckyWheelMode>('free')
  const [error, setError] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)

  const { snowflakes, setSnowflakes, addTransaction, setGameQuotas } = useGameStore()
  const { countdownToMidnight, vnNow } = useGameClock()
  const holidayMult = getHolidayDayMultiplier(vnNow)

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await gamesApi.getStatus()
        const lw = data.find((g) => g.game === 'lucky-wheel')
        if (lw) {
          setStatus(lw.status as GameStatus)
          setFreeUsed(lw.quotaUsed >= 1)
          const qmap: Parameters<typeof setGameQuotas>[0] = {}
          for (const g of data) {
            qmap[g.game as keyof typeof qmap] = {
              used: g.quotaUsed,
              max: g.quotaMax,
              status: g.status as GameStatus,
            }
          }
          setGameQuotas(qmap)
        }
      } catch {
        /* noop */
      }
    }
    init()
  }, [setGameQuotas])

  const handleSpin = async () => {
    if (isSpinning) return
    setError('')
    setIsSpinning(true)
    setResultIndex(null)
    setShowResult(false)

    // Tự động cuộn màn hình ngay vị trí vòng quay
    setTimeout(() => {
      wheelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)

    if (DEBUG_TEST_MODE) {
      const slots = activeMode === 'vip' ? LUCKY_WHEEL_VIP : LUCKY_WHEEL_FREE
      const mockIndex = Math.floor(Math.random() * slots.length)
      const chosen = slots[mockIndex]
      const wonValue = chosen.value * holidayMult
      const netGain = activeMode === 'vip' ? wonValue - LUCKY_WHEEL_VIP_FEE : wonValue
      const simulatedBal = Math.max(0, (snowflakes || 200) + netGain)

      setTimeout(() => {
        setResultIndex(mockIndex)
        setPendingResult({
          value: wonValue,
          newBalance: simulatedBal,
          label: wonValue === 0 ? 'Trắng tay · Chúc may mắn lần sau' : `+${wonValue} ❄️`,
        })
        setSnowflakes(simulatedBal)
        addTransaction(netGain)
        saveLocalLedger('lucky-wheel', netGain, simulatedBal)
      }, 500)
      return
    }

    try {
      const { data } = await gamesApi.luckyWheelSpin(activeMode)
      setResultIndex(data.resultIndex)
      setPendingResult({
        value: data.value,
        newBalance: data.newBalance,
        label: data.label,
      })
      setSnowflakes(data.newBalance)
      const wheelGain = activeMode === 'vip' ? data.value - LUCKY_WHEEL_VIP_FEE : data.value
      addTransaction(wheelGain)
      saveLocalLedger('lucky-wheel', wheelGain, data.newBalance)
      if (activeMode === 'free') setFreeUsed(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'Lỗi khi quay. Vui lòng thử lại!')
      setIsSpinning(false)
    }
  }

  const handleAnimEnd = useCallback(() => {
    setIsSpinning(false)
    setShowResult(true)
  }, [])

  const canSpinFree = DEBUG_TEST_MODE ? true : (!freeUsed && status === 'open')
  const canSpinVip = DEBUG_TEST_MODE
    ? true
    : snowflakes >= LUCKY_WHEEL_VIP_FEE && (status === 'open' || status === 'quota_reached')

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
      <ChristmasAmbientBackground />

      <GameHeader
        backHref="/mini-games"
        backLabel="Sảnh trò chơi"
      />

      <div className="relative mx-auto w-full max-w-7xl grow px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
        {/* Test banner if active */}
        {DEBUG_TEST_MODE && (
          <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-base">🛠️</span>
              <span>
                <strong>Chế độ test giao diện (DEBUG_TEST_MODE = true):</strong> Quay thử không giới hạn ở cả 2 chế độ Miễn Phí và VIP ngay trên trình duyệt. Để tắt, đặt <code className="rounded bg-black/40 px-1 py-0.5 text-yellow-300">DEBUG_TEST_MODE = false</code> trong <code className="rounded bg-black/40 px-1 py-0.5 text-yellow-300">constants/games.ts</code>.
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
            Vòng Quay May Mắn
          </h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-red-100/70 sm:text-sm">
            Quay bánh xe Giáng Sinh để rinh về những bông tuyết may mắn mỗi ngày!
          </p>
        </div>

        {/* TAB SWITCHER & CONTROLS */}
        <div className="mx-auto mb-4 flex max-w-xl flex-wrap items-center justify-between gap-y-2 gap-x-2 px-1">
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
              <span>Bàn Quay Thưởng</span>
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

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted(soundEffects.toggleMute())}
              className="flex items-center gap-1 rounded-full border border-amber-200/20 bg-black/40 px-2.5 py-1.5 text-xs text-amber-200 hover:bg-black/60 transition"
              title="Bật/Tắt âm thanh tương tác"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-300" /> : <Volume2 className="h-3.5 w-3.5 text-yellow-300" />}
              <span className="hidden sm:inline">{isMuted ? 'Tắt âm' : 'Âm thanh'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-yellow-400/35 bg-yellow-950/40 px-2.5 py-1.5 text-xs font-semibold text-yellow-200 hover:bg-yellow-900/50 transition shadow-sm"
              title="Xem luật chơi & tỷ lệ thưởng"
            >
              <BookOpen className="h-3.5 w-3.5 text-yellow-300" />
              <span>Luật chơi & Tỷ lệ</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="mx-auto max-w-xl">
          {tab === 'play' ? (
            <div className="space-y-3">
              {/* Wheel Stage Card — Compact Fitting */}
              <section ref={wheelRef} className={`${sectionClass} relative overflow-hidden p-4 sm:p-5 text-center`}>
                <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-yellow-400 to-transparent" />

                {/* Mode Selector Pills */}
                <div className="inline-flex rounded-full border border-white/10 bg-black/40 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick()
                      setActiveMode('free')
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition ${
                      activeMode === 'free'
                        ? 'border border-yellow-400/50 bg-linear-to-r from-amber-400 to-yellow-300 text-red-950 shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Gift className="h-3.5 w-3.5" />
                    <span>Miễn Phí</span>
                    <span className="text-[10px] opacity-75">
                      ({freeUsed && !DEBUG_TEST_MODE ? 'Đã quay' : 'Free'})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick()
                      setActiveMode('vip')
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition ${
                      activeMode === 'vip'
                        ? 'border border-yellow-400/50 bg-linear-to-r from-yellow-500 to-amber-400 text-red-950 shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>Vòng VIP</span>
                    <span className="text-[10px] font-black text-amber-900 bg-yellow-200/90 rounded-full px-1.5">
                      {LUCKY_WHEEL_VIP_FEE}❄️
                    </span>
                  </button>
                </div>

                {/* Spinner */}
                <div className="my-2 flex justify-center">
                  <WheelSpinner
                    mode={activeMode}
                    isSpinning={isSpinning}
                    resultIndex={resultIndex}
                    onAnimEnd={handleAnimEnd}
                  />
                </div>

                {error && (
                  <div className="mx-auto mb-3 flex max-w-sm items-center justify-center gap-2 rounded-2xl border border-red-300/30 bg-red-950/70 p-2 text-center text-xs text-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Spin CTA Button */}
                <div className="mt-3 flex flex-col items-center justify-center gap-1.5">
                  {activeMode === 'free' ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick()
                        handleSpin()
                      }}
                      disabled={!canSpinFree || isSpinning}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-green-300/50 bg-linear-to-r from-green-700 to-green-600 px-8 py-2.5 text-sm sm:text-base font-bold text-white shadow-xl transition hover:scale-105 hover:from-green-600 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                    >
                      <RotateCw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
                      <span>{freeUsed && !DEBUG_TEST_MODE ? 'Đã quay hôm nay' : 'Quay Miễn Phí Ngay'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick()
                        handleSpin()
                      }}
                      disabled={!canSpinVip || isSpinning}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-400/50 bg-linear-to-r from-yellow-500 to-amber-400 px-8 py-2.5 text-sm sm:text-base font-bold text-red-950 shadow-xl transition hover:scale-105 hover:from-yellow-400 hover:to-yellow-300 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    >
                      <Crown className="h-4 w-4" />
                      <span>
                        {!canSpinVip && !DEBUG_TEST_MODE
                          ? 'Chưa đủ bông tuyết'
                          : `Quay VIP · Trừ ${LUCKY_WHEEL_VIP_FEE} ❄️`}
                      </span>
                    </button>
                  )}
                  <span className="text-[11px] text-white/45">
                    {activeMode === 'free'
                      ? 'Làm mới vào 00:00 GMT+7 mỗi ngày'
                      : 'Cơ hội nhận tới 500 bông tuyết · Không giới hạn lượt'}
                  </span>
                </div>
              </section>
            </div>
          ) : (
            <section className={`${sectionClass} p-5 sm:p-6`}>
              <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-yellow-400 to-transparent" />
              <div className="mb-4">
                <h3 className="font-serif text-lg font-bold text-yellow-200">
                  Lịch Sử Vòng Quay May Mắn
                </h3>
                <p className="text-xs text-red-100/60">
                  Danh sách những lần quay Free và VIP của bạn.
                </p>
              </div>
              <LedgerList game="lucky-wheel" />
            </section>
          )}
        </div>
      </div>

      {pendingResult && (
        <GameResultModal
          isOpen={showResult}
          score={
            activeMode === 'vip' ? pendingResult.value - LUCKY_WHEEL_VIP_FEE : pendingResult.value
          }
          newBalance={pendingResult.newBalance}
          isRecord={pendingResult.value >= 100}
          recordLabel="🌟 GIẢI THƯỞNG LỚN TỪ VÒNG QUAY!"
          extra={
            <p className="text-center text-sm font-semibold text-yellow-200">
              {pendingResult.label}
            </p>
          }
          onClose={() => {
            setShowResult(false)
            setPendingResult(null)
          }}
          onPlayAgain={
            canSpinVip && activeMode === 'vip'
              ? () => {
                  setShowResult(false)
                  setPendingResult(null)
                  handleSpin()
                }
              : undefined
          }
          playAgainLabel={`Quay tiếp (${LUCKY_WHEEL_VIP_FEE} ❄️)`}
        />
      )}

      {/* Game Rules Modal */}
      <GameRulesModal
        isOpen={showRulesModal}
        defaultGame="lucky-wheel"
        onClose={() => setShowRulesModal(false)}
      />

      <GameFooter />
    </main>
  )
}
