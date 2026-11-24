'use client'

// app/mini-games/gift-guess/page.tsx — Đoán Quà Giáng Sinh (Chuẩn my-trees)
import { useState, useEffect, useRef } from 'react'
import { Sparkles, Gamepad2, History, Loader2, Gift, AlertCircle, Volume2, VolumeX, BookOpen } from 'lucide-react'
import confetti from 'canvas-confetti'
import { GameHeader } from '@/components/games/GameHeader'
import { GameFooter } from '@/components/games/GameFooter'
import { ChristmasAmbientBackground } from '@/components/games/ChristmasAmbientBackground'
import { GameResultModal } from '@/components/games/GameResultModal'
import { LedgerList } from '@/components/games/LedgerList'
import { GiftBoxesGrid, type BoxState } from '@/components/games/gift-guess/GiftBoxesGrid'
import { GameRulesModal } from '@/components/games/GameRulesModal'
import { gamesApi } from '@/lib/games-api'
import { useGameStore } from '@/store/useGameStore'
import { GIFT_GUESS_MODES, DEBUG_TEST_MODE, getHolidayDayMultiplier } from '@/constants/games'
import { soundEffects } from '@/lib/sound-effects'
import { saveLocalLedger } from '@/lib/local-ledger'
import type { GameStatus, GiftGuessMode, GiftGuessSummary } from '@/types/games'

type Tab = 'play' | 'history'

const sectionClass =
  'rounded-3xl border border-amber-200/15 bg-[#071b16]/45 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl'

export default function GiftGuessPage() {
  const [tab, setTab] = useState<Tab>('play')
  const [status, setStatus] = useState<GameStatus>('open')

  const [selectedMode, setSelectedMode] = useState<GiftGuessMode>('medium')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [error, setError] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)

  // In-game session state
  const [sessionId, setSessionId] = useState('')
  const [boxes, setBoxes] = useState<BoxState[]>([])
  const [fee, setFee] = useState(160)
  const [openLimit, setOpenLimit] = useState(4)
  const [openedCount, setOpenedCount] = useState(0)
  const [runningTotal, setRunningTotal] = useState(0)

  // Summary
  const [summary, setSummary] = useState<GiftGuessSummary | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const gameSectionRef = useRef<HTMLElement | null>(null)

  const { snowflakes, setSnowflakes, addTransaction, setGameQuotas } = useGameStore()

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await gamesApi.getStatus()
        const gg = data.find((g) => g.game === 'gift-guess')
        if (gg) {
          setStatus(gg.status as GameStatus)
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

  const currentModeConfig = GIFT_GUESS_MODES.find((m) => m.mode === selectedMode)!
  const canAfford = DEBUG_TEST_MODE ? true : snowflakes >= currentModeConfig.fee
  const isAvailable = DEBUG_TEST_MODE ? true : status === 'open'

  const handleStartGame = async () => {
    if (!canAfford || !isAvailable) return
    setError('')
    setIsStarting(true)
    setSummary(null)
    setShowResultModal(false)

    if (DEBUG_TEST_MODE) {
      setSessionId('mock-guess-' + Date.now())
      setFee(currentModeConfig.fee)
      setOpenLimit(currentModeConfig.openLimit)
      setOpenedCount(0)
      setRunningTotal(0)

      const initBoxes: BoxState[] = Array.from({ length: currentModeConfig.boxCount }, (_, i) => ({
        index: i,
        isOpened: false,
      }))
      setBoxes(initBoxes)
      setIsPlaying(true)
      setIsStarting(false)
      setTimeout(() => {
        gameSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return
    }

    try {
      const { data } = await gamesApi.giftGuessStart(selectedMode)
      setSessionId(data.sessionId)
      setFee(data.fee)
      setOpenLimit(data.openLimit)
      setOpenedCount(0)
      setRunningTotal(0)

      setSnowflakes(snowflakes - data.fee)
      addTransaction(-data.fee)
      saveLocalLedger('gift-guess', -data.fee, snowflakes - data.fee, 'spend')

      const initBoxes: BoxState[] = Array.from({ length: data.boxCount }, (_, i) => ({
        index: i,
        isOpened: false,
      }))
      setBoxes(initBoxes)
      setIsPlaying(true)
      setTimeout(() => {
        gameSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message || 'Không thể bắt đầu ván. Vui lòng thử lại.')
    } finally {
      setIsStarting(false)
    }
  }

  const handleOpenBox = async (index: number) => {
    if (isOpening || !isPlaying) return
    setIsOpening(true)

    if (DEBUG_TEST_MODE) {
      const holidayMult = getHolidayDayMultiplier()
      const roll = Math.random() * 100
      let picked: { emoji: string; label: string; reward: number; isJackpot: boolean }
      if (roll < 10) {
        picked = {
          emoji: '🪨',
          label: 'Than đá (-30% c)',
          reward: Math.round(-0.3 * currentModeConfig.c),
          isJackpot: false,
        }
      } else if (roll < 24) {
        picked = { emoji: '💨', label: 'Hộp rỗng (0 ❄️)', reward: 0, isJackpot: false }
      } else if (roll < 60) {
        const val = Math.round(0.8 * currentModeConfig.c) * holidayMult
        picked = {
          emoji: '🍬',
          label: `Quà nhỏ (+${val} ❄️)`,
          reward: val,
          isJackpot: false,
        }
      } else if (roll < 84) {
        const val = Math.round(1.6 * currentModeConfig.c) * holidayMult
        picked = {
          emoji: '🎁',
          label: `Quà vừa (+${val} ❄️)`,
          reward: val,
          isJackpot: false,
        }
      } else if (roll < 96) {
        const val = Math.round(3.2 * currentModeConfig.c) * holidayMult
        picked = {
          emoji: '🌟',
          label: `Quà lớn (+${val} ❄️)`,
          reward: val,
          isJackpot: false,
        }
      } else if (roll < 99.5) {
        const val = Math.round(6.0 * currentModeConfig.c) * holidayMult
        picked = {
          emoji: '👑',
          label: `Quà siêu lớn (+${val} ❄️)`,
          reward: val,
          isJackpot: false,
        }
      } else {
        const val = 2026 * holidayMult
        picked = { emoji: '🏆', label: `Jackpot ${val} ❄️`, reward: val, isJackpot: true }
      }

      soundEffects.playBoxOpen(picked.reward >= 0)
      if (picked.isJackpot) {
        confetti({ particleCount: 80, spread: 70 })
        soundEffects.playWinFanfare()
      }

      const nextOpenedCount = openedCount + 1
      const nextRunningTotal = runningTotal + picked.reward

      setBoxes((prev) =>
        prev.map((b) =>
          b.index === index
            ? {
                ...b,
                isOpened: true,
                emoji: picked.emoji,
                label: picked.label,
                reward: picked.reward,
                isJackpot: picked.isJackpot,
              }
            : b,
        ),
      )

      setOpenedCount(nextOpenedCount)
      setRunningTotal(nextRunningTotal)

      if (nextOpenedCount >= openLimit) {
        const netGain = nextRunningTotal - fee
        const nextBal = Math.max(0, (snowflakes || 300) + netGain)
        if (netGain >= 0) soundEffects.playWinFanfare()
        setSummary({
          fee,
          totalEarned: nextRunningTotal,
          netResult: netGain,
          isProfit: netGain > 0,
          hasJackpot: picked.isJackpot,
          newBalance: nextBal,
        })
        setSnowflakes(nextBal)
        addTransaction(netGain)
        saveLocalLedger('gift-guess', netGain, nextBal)
        setTimeout(() => {
          setIsPlaying(false)
          setShowResultModal(true)
        }, 1500)
      }

      setIsOpening(false)
      return
    }

    try {
      const { data } = await gamesApi.giftGuessOpen(sessionId, index)
      soundEffects.playBoxOpen(data.reward >= 0)
      if (data.isJackpot) {
        confetti({ particleCount: 80, spread: 70 })
        soundEffects.playWinFanfare()
      }

      setBoxes((prev) =>
        prev.map((b) =>
          b.index === index
            ? {
                ...b,
                isOpened: true,
                emoji: data.tierEmoji,
                label: data.tierLabel,
                reward: data.reward,
                isJackpot: data.isJackpot,
              }
            : b,
        ),
      )

      setOpenedCount(data.openedCount)
      setRunningTotal(data.runningTotal)

      if (data.isDone && data.summary) {
        if (data.summary.isProfit) soundEffects.playWinFanfare()
        setSummary(data.summary)
        setSnowflakes(data.summary.newBalance)
        addTransaction(data.summary.totalEarned)
        saveLocalLedger('gift-guess', data.summary.totalEarned, data.summary.newBalance)
        setTimeout(() => {
          setIsPlaying(false)
          setShowResultModal(true)
        }, 1500)
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message || 'Có lỗi khi mở hộp quà.')
    } finally {
      setIsOpening(false)
    }
  }

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
                <strong>Chế độ test giao diện (DEBUG_TEST_MODE = true):</strong> Mở khóa chơi thử trực tiếp trên trình duyệt. Để tắt, đặt <code className="rounded bg-black/40 px-1 py-0.5 text-yellow-300">DEBUG_TEST_MODE = false</code> trong <code className="rounded bg-black/40 px-1 py-0.5 text-yellow-300">constants/games.ts</code>.
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
            Đoán Quà Bất Ngờ
          </h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-red-100/70 sm:text-sm">
            Mở hộp quà bí mật Giáng Sinh, nhân bội số phần thưởng và săn Jackpot 2026 ❄️!
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
              <span>Bàn Mở Quà</span>
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
              className="flex items-center gap-1.5 rounded-full border border-yellow-400/35 bg-yellow-950/40 px-3 py-1.5 text-xs font-semibold text-yellow-200 hover:bg-yellow-900/50 transition shadow-sm"
              title="Xem luật chơi, gói cược & bảng thưởng"
            >
              <BookOpen className="h-3.5 w-3.5 text-yellow-300" />
              <span>Luật chơi & Bảng thưởng</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="mx-auto max-w-xl">
          {tab === 'play' ? (
            <div className="space-y-3">
              {/* Game Stage Card */}
              <section ref={gameSectionRef} className={`${sectionClass} relative overflow-hidden p-3.5 sm:p-5`}>
                <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-amber-300 to-transparent" />

                {error && (
                  <div className="mx-auto mb-4 flex max-w-md items-center justify-center gap-2 rounded-2xl border border-red-300/30 bg-red-950/70 p-2 text-center text-xs text-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />
                    <span>{error}</span>
                  </div>
                )}

                {!isPlaying ? (
                  <div className="space-y-4">
                    {/* Mode selection compact cards */}
                    <div>
                      <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-yellow-200/70">
                        Chọn cấp độ hộp quà Giáng Sinh
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {GIFT_GUESS_MODES.map((modeConfig) => {
                          const isSelected = selectedMode === modeConfig.mode
                          const hasEnough = snowflakes >= modeConfig.fee || DEBUG_TEST_MODE

                          return (
                            <button
                              key={modeConfig.mode}
                              type="button"
                              onClick={() => {
                                soundEffects.playClick()
                                setSelectedMode(modeConfig.mode)
                              }}
                              className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 transition duration-300 ${
                                isSelected
                                  ? 'border-yellow-400/80 bg-linear-to-b from-yellow-500/25 to-amber-900/40 text-yellow-100 shadow-[0_0_20px_rgba(250,204,21,0.25)] scale-[1.02]'
                                  : 'border-white/10 bg-black/25 text-white/50 hover:border-white/20'
                              }`}
                            >
                              <span className="text-2xl sm:text-3xl">
                                {modeConfig.mode === 'small'
                                  ? '🎁'
                                  : modeConfig.mode === 'medium'
                                  ? '🎀'
                                  : '👑'}
                              </span>
                              <span className="mt-1 font-serif text-sm sm:text-base font-bold text-white">
                                {modeConfig.label}
                              </span>
                              <span className="font-serif text-sm sm:text-base font-black text-yellow-300">
                                {modeConfig.fee} ❄️
                              </span>
                              <span className="text-[10px] text-white/50 mt-0.5">
                                {modeConfig.boxCount} hộp · mở {modeConfig.openLimit}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Start Game Action */}
                    <div className="flex flex-col items-center justify-center gap-1.5 pt-1 text-center">
                      <button
                        type="button"
                        disabled={(!canAfford && !DEBUG_TEST_MODE) || (!isAvailable && !DEBUG_TEST_MODE) || isStarting}
                        onClick={() => {
                          soundEffects.playClick()
                          handleStartGame()
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-400/50 bg-linear-to-r from-yellow-500 to-amber-400 px-8 py-2.5 text-sm sm:text-base font-bold text-red-950 shadow-xl transition hover:scale-105 hover:from-yellow-400 hover:to-yellow-300 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      >
                        {isStarting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Đang chuẩn bị bàn quà...
                          </span>
                        ) : !isAvailable && !DEBUG_TEST_MODE ? (
                          'Chưa mở (từ 24/12)'
                        ) : !canAfford && !DEBUG_TEST_MODE ? (
                          'Chưa đủ bông tuyết'
                        ) : (
                          <span className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            <span>Vào Bàn Mở Quà · {currentModeConfig.fee} ❄️</span>
                          </span>
                        )}
                      </button>
                      <span className="text-[11px] text-white/45">
                        Tỷ lệ hoàn vốn nâng cấp ~76% lãi/hoà · Không giới hạn số lần chơi
                      </span>
                    </div>
                  </div>
                ) : (
                  <GiftBoxesGrid
                    boxes={boxes}
                    openedCount={openedCount}
                    openLimit={openLimit}
                    runningTotal={runningTotal}
                    fee={fee}
                    disabled={isOpening}
                    onOpenBox={handleOpenBox}
                  />
                )}
              </section>
            </div>
          ) : (
            <section className={`${sectionClass} p-5 sm:p-6`}>
              <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-amber-300 to-transparent" />
              <div className="mb-4">
                <h3 className="font-serif text-lg font-bold text-yellow-200">
                  Lịch Sử Đoán Quà Giáng Sinh
                </h3>
                <p className="text-xs text-red-100/60">
                  Nhật ký các lượt mở hộp quà may mắn và số bông tuyết nhận được.
                </p>
              </div>
              <LedgerList game="gift-guess" />
            </section>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {summary && (
        <GameResultModal
          isOpen={showResultModal}
          score={summary.netResult}
          newBalance={summary.newBalance}
          isRecord={summary.hasJackpot}
          recordLabel="🏆 CHÚC MỪNG BẠN MỞ TRÚNG JACKPOT!"
          extra={
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs space-y-2">
              <div className="flex justify-between text-white/70">
                <span>Phí tham gia ván:</span>
                <span className="font-bold text-white">−{summary.fee} ❄️</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tổng thưởng mở được:</span>
                <span className="font-bold text-green-300">+{summary.totalEarned} ❄️</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm">
                <span>Lãi / Lỗ ròng:</span>
                <span className={summary.netResult >= 0 ? 'text-green-300' : 'text-red-400'}>
                  {summary.netResult >= 0 ? `+${summary.netResult}` : summary.netResult} ❄️
                </span>
              </div>
            </div>
          }
          onClose={() => {
            setShowResultModal(false)
            setSummary(null)
          }}
          onPlayAgain={canAfford ? handleStartGame : undefined}
          playAgainLabel={`Mở tiếp lượt mới (${currentModeConfig.fee} ❄️)`}
        />
      )}

      {/* Game Rules Modal */}
      <GameRulesModal
        isOpen={showRulesModal}
        defaultGame="gift-guess"
        onClose={() => setShowRulesModal(false)}
      />

      <GameFooter />
    </main>
  )
}
