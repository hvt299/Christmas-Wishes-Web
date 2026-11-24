// ============================================================
// CHRISTMAS WISHES — Game Types (Web)
// Kiểu TypeScript dùng chung giữa các component và API layer.
// ============================================================

import type { GameId, CardFlipMilestoneKey, GiftGuessMode } from '@/constants/games'
export type { GameId, GiftGuessMode }

// ------------------------------------------------------------
// Trạng thái game
// ------------------------------------------------------------
export type GameStatus =
  | 'open'          // đang trong cửa sổ, còn quota
  | 'coming_soon'   // chưa tới ngày mở
  | 'closed'        // đã qua ngày đóng
  | 'quota_reached' // trong cửa sổ nhưng hết lượt hôm nay

// ------------------------------------------------------------
// Sổ cái chung
// ------------------------------------------------------------
export interface LedgerEntry {
  _id: string
  game: GameId
  type: 'earn' | 'spend'
  /** Dương = cộng, âm = trừ */
  amount: number
  balanceAfter: number
  sessionId: string
  dayKey: string
  createdAt: string
}

// ------------------------------------------------------------
// GET /games/status
// ------------------------------------------------------------
export interface GameStatusItem {
  game: GameId
  status: GameStatus
  quotaUsed: number
  quotaMax: number | null
  windowOpen: string   // ISO string
  windowClose: string  // ISO string
}

export type GamesStatusResponse = GameStatusItem[]

// ------------------------------------------------------------
// Săn Bông Tuyết
// ------------------------------------------------------------
export interface SnowflakeStartResponse {
  sessionId: string
  seed: string
  dayKey: string
  multiplier: number
  /** Lịch rơi vật phẩm đã được tính sẵn từ seed (server trả để client spawn) */
  dropSchedule: DropEvent[]
}

export interface DropEvent {
  itemId: string
  /** Giây kể từ khi bắt đầu ván */
  spawnAt: number
  /** Vị trí ngang [0, 1] */
  x: number
  /** Giá trị thực của vật phẩm này */
  value: number
}

export interface CatchLogEntry {
  itemId: string
  caughtAt: number // giây kể từ khi bắt đầu
}

export interface SnowflakeFinishResponse {
  score: number
  newBalance: number
  isRecord: boolean
  todaySeason: number
  record: number
}

// ------------------------------------------------------------
// Lật thẻ
// ------------------------------------------------------------
export type CardValue =
  | { type: 'target'; emoji: string }
  | { type: 'bonus'; emoji: string }
  | { type: 'trap' }
  | { type: 'shield' }
  | { type: 'empty' }
  | { type: 'secret_gift'; rawScore: number }

export interface CardFlipStartResponse {
  sessionId: string
  milestone: CardFlipMilestoneKey
  multiplier: number
  previewDuration: number
  maxFlips: number
  trapCount: number
  targetCards: string[]   // emoji mục tiêu
  /** Layout 16 thẻ, chỉ trả khi preview (server úp lại sau đó) */
  previewLayout: Array<{ index: number; cardType: string; emoji?: string }>
}

export interface CardFlipFlipResponse {
  cardIndex: number
  card: CardValue
  rawScoreDelta: number
  cumulativeRaw: number
  flipsLeft: number
  shieldActive: boolean
  shieldUsed?: boolean
  isDone: boolean
  summary?: CardFlipFinishResponse
}

export interface CardFlipFinishResponse {
  rawScore: number
  finalScore: number
  newBalance: number
  isPerfect: boolean
  milestone: CardFlipMilestoneKey
}

// ------------------------------------------------------------
// Đoán quà
// ------------------------------------------------------------
export interface GiftGuessStartResponse {
  sessionId: string
  mode: GiftGuessMode
  fee: number
  boxCount: number
  openLimit: number
  c: number
}

export interface GiftGuessOpenResponse {
  boxIndex: number
  tierId: string
  tierEmoji: string
  tierLabel: string
  reward: number       // tuyết thực nhận (đã tính c * multiplier)
  isJackpot: boolean
  openedCount: number
  openLimit: number
  runningTotal: number // tổng thưởng tích lũy từ đầu ván
  isDone: boolean
  /** Chỉ có khi isDone = true */
  summary?: GiftGuessSummary
}

export interface GiftGuessSummary {
  fee: number
  totalEarned: number
  netResult: number   // totalEarned - fee
  isProfit: boolean
  hasJackpot: boolean
  newBalance: number
}

// ------------------------------------------------------------
// Quay may mắn
// ------------------------------------------------------------
export type LuckyWheelMode = 'free' | 'vip'

export interface LuckyWheelSpinResponse {
  mode: LuckyWheelMode
  value: number
  label: string
  newBalance: number
  /** Index của ô trúng (để animate vòng quay) */
  resultIndex: number
}

// ------------------------------------------------------------
// Sổ cái
// ------------------------------------------------------------
export interface LedgerResponse {
  entries: LedgerEntry[]
  nextCursor: string | null
}
