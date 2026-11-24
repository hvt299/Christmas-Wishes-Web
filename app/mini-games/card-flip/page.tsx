'use client'

// app/mini-games/card-flip/page.tsx — Lật thẻ Giáng Sinh (Chuẩn my-trees)
import { useState, useEffect, useRef } from 'react'
import { Sparkles, Gamepad2, History, Loader2, Play, AlertCircle, Volume2, VolumeX, BookOpen } from 'lucide-react'
import { GameHeader } from '@/components/games/GameHeader'
import { GameFooter } from '@/components/games/GameFooter'
import { ChristmasAmbientBackground } from '@/components/games/ChristmasAmbientBackground'
import { GameResultModal } from '@/components/games/GameResultModal'
import { LedgerList } from '@/components/games/LedgerList'
import { CardFlipGrid, type CardState } from '@/components/games/card-flip/CardFlipGrid'
import { GameRulesModal } from '@/components/games/GameRulesModal'
import { gamesApi } from '@/lib/games-api'
import { useGameStore } from '@/store/useGameStore'
import { useGameClock } from '@/hooks/useGameClock'
import { DEBUG_TEST_MODE, getCardFlipDailyQuota, getCardFlipMilestone } from '@/constants/games'
import { soundEffects } from '@/lib/sound-effects'
import { saveLocalLedger } from '@/lib/local-ledger'
import type { GameStatus } from '@/types/games'

type Tab = 'play' | 'history'

const sectionClass =
  'rounded-3xl border border-amber-200/15 bg-[#071b16]/45 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl'

export default function CardFlipPage() {
  const [tab, setTab] = useState<Tab>('play')
  const [status, setStatus] = useState<GameStatus>('open')
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)

  // Game state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [cards, setCards] = useState<CardState[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const [previewSecLeft, setPreviewSecLeft] = useState(0)
  const [flipsLeft, setFlipsLeft] = useState(7)
  const [shieldActive, setShieldActive] = useState(true)
  const [targetCards, setTargetCards] = useState<string[]>([])
  const [targetsFound, setTargetsFound] = useState(0)
  const [rawScore, setRawScore] = useState(0)
  const [milestone, setMilestone] = useState<any>(null)
  const [multiplier, setMultiplier] = useState(1)
  const [error, setError] = useState('')

  // Result
  const [result, setResult] = useState<{
    rawScore: number
    finalScore: number
    newBalance: number
    isPerfect: boolean
  } | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const { snowflakes, setSnowflakes, addTransaction, incrementQuota, setGameQuotas } = useGameStore()
  const { countdownToMidnight, vnNow } = useGameClock()
  const dailyQuota = getCardFlipDailyQuota(vnNow)
  const currentMilestone = getCardFlipMilestone(vnNow)
  const gameSectionRef = useRef<HTMLElement | null>(null)
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mockLayoutRef = useRef<{ index: number; cardType: string; emoji: string }[]>([])
  const trapCountRef = useRef(0)

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await gamesApi.getStatus()
        const cf = data.find((g) => g.game === 'card-flip')
        if (cf) {
          setStatus(cf.status as GameStatus)
          setQuotaUsed(cf.quotaUsed)
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

  const handleStartGame = async () => {
    if (!DEBUG_TEST_MODE && quotaUsed >= 3) return
    setError('')
    setIsStarting(true)
    setShowResultModal(false)
    setResult(null)

    if (DEBUG_TEST_MODE) {
      const pool = [
        { cardType: 'target', emoji: '🔔' },
        { cardType: 'target', emoji: '🔔' },
        { cardType: 'target', emoji: '🔔' },
        { cardType: 'target', emoji: '🔔' },
        { cardType: 'bonus', emoji: '🍬' },
        { cardType: 'bonus', emoji: '🍬' },
        { cardType: 'shield', emoji: '🎅' },
        { cardType: 'trap', emoji: '🪨' },
        { cardType: 'trap', emoji: '🪨' },
        { cardType: 'trap', emoji: '🪨' },
        { cardType: 'trap', emoji: '🪨' },
        { cardType: 'trap', emoji: '🪨' },
        { cardType: 'empty', emoji: '❄️' },
        { cardType: 'empty', emoji: '❄️' },
        { cardType: 'empty', emoji: '❄️' },
        { cardType: 'empty', emoji: '❄️' },
      ].sort(() => Math.random() - 0.5)

      const initialCards: CardState[] = pool.map((p, i) => ({
        index: i,
        isFlipped: false,
        cardType: p.cardType as any,
        emoji: p.emoji,
      }))
      mockLayoutRef.current = initialCards.map((c) => ({
        index: c.index,
        cardType: (c.cardType as string) || 'empty',
        emoji: c.emoji || '',
      }))
      trapCountRef.current = 0

      setSessionId('mock-session-' + Date.now())
      setMilestone('week1')
      setMultiplier(1)
      setFlipsLeft(7)
      setTargetCards(['🔔', '🔔', '🔔', '🔔'])
      setTargetsFound(0)
      setRawScore(0)
      setShieldActive(true)
      setCards(initialCards)
      setIsPlaying(true)
      setIsPreview(true)
      setPreviewSecLeft(3)

      setTimeout(() => {
        gameSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)

      let rem = 3
      if (previewTimerRef.current) clearInterval(previewTimerRef.current)
      previewTimerRef.current = setInterval(() => {
        rem -= 1
        setPreviewSecLeft(rem)
        if (rem <= 0) {
          if (previewTimerRef.current) clearInterval(previewTimerRef.current)
          setIsPreview(false)
        }
      }, 1000)
      setIsStarting(false)
      return
    }

    try {
      const { data } = await gamesApi.cardFlipStart()
      setSessionId(data.sessionId)
      setMilestone(typeof data.milestone === 'string' ? data.milestone : (data.milestone as any)?.key || 'week1')
      setMultiplier(data.multiplier)
      setFlipsLeft(data.maxFlips)
      setTargetCards(data.targetCards)
      setTargetsFound(0)
      setRawScore(0)
      setShieldActive(true)

      const initialCards: CardState[] = data.previewLayout.map((p) => ({
        index: p.index,
        isFlipped: false,
        cardType: p.cardType,
        emoji: p.emoji,
      }))
      setCards(initialCards)
      setIsPlaying(true)
      setIsPreview(true)
      setPreviewSecLeft(Math.ceil(data.previewDuration))

      setTimeout(() => {
        gameSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)

      let remaining = data.previewDuration
      if (previewTimerRef.current) clearInterval(previewTimerRef.current)
      previewTimerRef.current = setInterval(() => {
        remaining -= 1
        setPreviewSecLeft(Math.ceil(remaining))
        if (remaining <= 0) {
          if (previewTimerRef.current) clearInterval(previewTimerRef.current)
          setIsPreview(false)
        }
      }, 1000)

      setQuotaUsed((prev) => prev + 1)
      incrementQuota('card-flip')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message || 'Không thể bắt đầu ván. Vui lòng thử lại.')
    } finally {
      setIsStarting(false)
    }
  }

  const handleFlipCard = async (index: number) => {
    if (isFlipping || !isPlaying || isPreview) return
    setIsFlipping(true)

    if (DEBUG_TEST_MODE) {
      const cardData = mockLayoutRef.current[index]
      if (!cardData) {
        setIsFlipping(false)
        return
      }

      let delta = 0
      let shieldUsed = false
      let newShieldActive = shieldActive

      if (cardData.cardType === 'target') {
        delta = 4
      } else if (cardData.cardType === 'bonus') {
        delta = 2
      } else if (cardData.cardType === 'shield') {
        delta = 0
        newShieldActive = true
      } else if (cardData.cardType === 'trap') {
        trapCountRef.current += 1
        if (shieldActive) {
          shieldUsed = true
          newShieldActive = false
          delta = 0
        } else {
          delta = -5
        }
      }

      const nextFlipsLeft = flipsLeft - 1
      const nextTargetsFound = cardData.cardType === 'target' ? targetsFound + 1 : targetsFound
      const nextRawScore = Math.max(-10, rawScore + delta)

      setCards((prev) =>
        prev.map((c) =>
          c.index === index
            ? {
                ...c,
                isFlipped: true,
                cardType: cardData.cardType as any,
                emoji: cardData.emoji,
                scoreDelta: delta,
                shieldUsed,
              }
            : c,
        ),
      )

      setFlipsLeft(nextFlipsLeft)
      setRawScore(nextRawScore)
      setShieldActive(newShieldActive)
      if (cardData.cardType === 'target') {
        setTargetsFound(nextTargetsFound)
        soundEffects.playCardMatch()
      } else if (cardData.cardType === 'trap') {
        if (shieldUsed) {
          soundEffects.playShieldBlock()
        } else {
          soundEffects.playTrapHit()
        }
      } else if (cardData.cardType === 'shield') {
        soundEffects.playShieldBlock()
      }

      const isDone = nextFlipsLeft <= 0 || nextTargetsFound >= 4
      if (isDone) {
        soundEffects.playWinFanfare()
        const isPerfect = nextTargetsFound >= 4 && trapCountRef.current === 0
        const finalScore = Math.max(0, nextRawScore * multiplier + (isPerfect ? 6 : 0))
        const nextBalance = (snowflakes || 150) + finalScore

        setResult({
          rawScore: nextRawScore,
          finalScore,
          newBalance: nextBalance,
          isPerfect,
        })
        setSnowflakes(nextBalance)
        addTransaction(finalScore)
        saveLocalLedger('card-flip', finalScore, nextBalance)
        setTimeout(() => {
          setIsPlaying(false)
          setShowResultModal(true)
        }, 1500)
      }

      setIsFlipping(false)
      return
    }

    try {
      const { data } = await gamesApi.cardFlipFlip(sessionId, index)

      setCards((prev) =>
        prev.map((c) =>
          c.index === index
            ? {
                ...c,
                isFlipped: true,
                cardType: data.card.type,
                emoji: 'emoji' in data.card ? data.card.emoji : undefined,
                scoreDelta: data.rawScoreDelta,
                shieldUsed: data.shieldUsed,
              }
            : c,
        ),
      )

      setFlipsLeft(data.flipsLeft)
      setRawScore(data.cumulativeRaw)
      setShieldActive(data.shieldActive)
      if (data.card.type === 'target') {
        setTargetsFound((prev) => prev + 1)
        soundEffects.playCardMatch()
      } else if (data.card.type === 'trap') {
        if (data.shieldUsed) {
          soundEffects.playShieldBlock()
        } else {
          soundEffects.playTrapHit()
        }
      } else if (data.card.type === 'shield') {
        soundEffects.playShieldBlock()
      }

      if (data.isDone && data.summary) {
        soundEffects.playWinFanfare()
        setResult(data.summary)
        setSnowflakes(data.summary.newBalance)
        addTransaction(data.summary.finalScore)
        saveLocalLedger('card-flip', data.summary.finalScore, data.summary.newBalance)
        setTimeout(() => {
          setIsPlaying(false)
          setShowResultModal(true)
        }, 1500)
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message || 'Có lỗi khi lật thẻ.')
    } finally {
      setIsFlipping(false)
    }
  }

  const canPlay = DEBUG_TEST_MODE ? true : quotaUsed < dailyQuota && (status === 'open' || status === 'quota_reached')

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
                <strong>Chế độ test giao diện (DEBUG_TEST_MODE = true):</strong> Mở khóa chơi thử trực tiếp trên trình duyệt. Để tắt, vào <code className="rounded bg-black/40 px-1 py-0.5 text-yellow-300">constants/games.ts</code> đổi thành <code className="text-yellow-300">DEBUG_TEST_MODE = false</code>.
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
            Lật Thẻ Tìm Quà
          </h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-red-100/70 sm:text-sm">
            Ghi nhớ bố cục thẻ Giáng Sinh, lật đúng 4 thẻ mục tiêu và né tránh bẫy!
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
              <span>Bàn Lật Thẻ</span>
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
              title="Xem luật chơi, mốc tuần & tỷ lệ thẻ"
            >
              <BookOpen className="h-3.5 w-3.5 text-yellow-300" />
              <span>Luật chơi & Mốc tuần</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="mx-auto max-w-xl">
          {tab === 'play' ? (
            <div className="space-y-3">
              {/* Main Game Card */}
              <section ref={gameSectionRef} className={`${sectionClass} relative overflow-hidden p-3.5 sm:p-5`}>
                <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-emerald-300 to-transparent" />

                {error && (
                  <div className="mx-auto mb-4 flex max-w-md items-center justify-center gap-2 rounded-2xl border border-red-300/30 bg-red-950/70 p-2.5 text-center text-xs text-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />
                    <span>{error}</span>
                  </div>
                )}

                {!isPlaying ? (
                  <div className="py-6 text-center">
                    <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                      <span className="text-3xl">🃏</span>
                      <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-yellow-300 animate-spin" />
                    </div>

                    <h3 className="font-serif text-xl font-bold text-yellow-200 sm:text-2xl">
                      Bàn 16 Thẻ Bài Giáng Sinh
                    </h3>
                    <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-red-100/70 sm:text-sm">
                      Ghi nhớ vị trí thẻ quà trong vài giây, sau đó lật tối đa {currentMilestone?.maxFlips ?? 7} lần để tìm đủ 4 thẻ mục tiêu!
                    </p>

                    <div className="mt-5 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        disabled={!canPlay || isStarting}
                        onClick={handleStartGame}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-green-300/50 bg-linear-to-r from-green-700 to-green-600 px-7 py-2.5 text-sm sm:text-base font-bold text-white shadow-xl transition hover:scale-105 hover:from-green-600 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                      >
                        {isStarting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Đang chuẩn bị...
                          </span>
                        ) : quotaUsed >= dailyQuota && !DEBUG_TEST_MODE ? (
                          `Hết lượt hôm nay · Làm mới sau ${countdownToMidnight}`
                        ) : (
                          <span className="flex items-center gap-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span>Bắt đầu lật thẻ ({quotaUsed}/{dailyQuota} lượt)</span>
                          </span>
                        )}
                      </button>
                      <span className="text-[11px] text-white/45">
                        {currentMilestone?.label}: {dailyQuota} lượt/ngày · Tối đa {currentMilestone?.maxFlips ?? 7} lần lật · Thưởng ×{currentMilestone?.multiplier ?? 1}
                      </span>
                    </div>
                  </div>
                ) : (
                  <CardFlipGrid
                    cards={cards}
                    isPreview={isPreview}
                    previewSecondsLeft={previewSecLeft}
                    flipsLeft={flipsLeft}
                    shieldActive={shieldActive}
                    targetCards={targetCards}
                    targetsFound={targetsFound}
                    rawScore={rawScore}
                    disabled={isFlipping}
                    onCardClick={handleFlipCard}
                  />
                )}
              </section>
            </div>
          ) : (
            <section className={`${sectionClass} p-6 sm:p-8`}>
              <div className="h-1 w-full absolute top-0 left-0 bg-linear-to-r from-transparent via-emerald-300 to-transparent" />
              <div className="mb-6">
                <h3 className="font-serif text-xl font-bold text-yellow-200">
                  Lịch Sử Lật Thẻ Giáng Sinh
                </h3>
                <p className="text-xs text-red-100/60">
                  Nhật ký các ván lật thẻ và điểm số thưởng nhận được.
                </p>
              </div>
              <LedgerList game="card-flip" />
            </section>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <GameResultModal
          isOpen={showResultModal}
          score={result.finalScore}
          newBalance={result.newBalance}
          isRecord={result.isPerfect}
          recordLabel="✨ XUẤT SẮC! Hoàn thành không dính bẫy (+6 thưởng)"
          extra={
            <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center text-xs space-y-1">
              <p className="text-white/70">
                Điểm thô: <span className="font-bold text-white">{result.rawScore > 0 ? `+${result.rawScore}` : result.rawScore}</span>
              </p>
              <p className="text-white/70">
                Hệ số mốc tuần: <span className="font-bold text-yellow-300">×{multiplier}</span>
              </p>
            </div>
          }
          onClose={() => {
            setShowResultModal(false)
            setResult(null)
          }}
          onPlayAgain={canPlay ? handleStartGame : undefined}
          playAgainLabel={`Lật tiếp lượt mới (${quotaUsed}/3)`}
        />
      )}

      {/* Game Rules Modal */}
      <GameRulesModal
        isOpen={showRulesModal}
        defaultGame="card-flip"
        onClose={() => setShowRulesModal(false)}
      />

      <GameFooter />
    </main>
  )
}
