// ============================================================
// CHRISTMAS WISHES — Game Constants
// Tất cả hằng số game tập trung tại đây, dùng chung cả Web & kiểm thử.
// Tiền tố class UI: cw-
// Giờ chuẩn: Asia/Ho_Chi_Minh (GMT+7), do server quyết định.
// ============================================================

// ============================================================
// CHẾ ĐỘ TEST GIAO DIỆN MÀN CHƠI (UI PREVIEW MODE)
// - Bật true: Mở khóa toàn bộ màn chơi ngay lập tức, không phụ thuộc ngày mở (1/12 hay 24/12)
//   hoặc số dư tuyết/quota, có sẵn giả lập để chơi test UI trực tiếp trên trình duyệt.
// - CÁCH TẮT: Đổi DEBUG_TEST_MODE = false bên dưới.
// ============================================================
export const DEBUG_TEST_MODE = false

export type GameId = 'snowflake' | 'card-flip' | 'gift-guess' | 'lucky-wheel'

// ------------------------------------------------------------
// CỬA SỔ THỜI GIAN (theo GMT+7, so sánh với vnDayKey "YYYY-MM-DD")
// "hết 25/12" = đóng lúc 00:00 ngày 26/12
// ------------------------------------------------------------
export const GAME_WINDOWS: Record<
  GameId,
  { openDay: string; closeDay: string }
> = {
  'snowflake':     { openDay: '12-01', closeDay: '12-26' }, // [12-01, 12-26)
  'card-flip':     { openDay: '12-01', closeDay: '12-26' },
  'gift-guess':    { openDay: '12-24', closeDay: '01-01' }, // sang năm mới
  'lucky-wheel':   { openDay: '12-01', closeDay: '01-01' },
}

// ------------------------------------------------------------
// QUOTA HÀNG NGÀY
// ------------------------------------------------------------
export const DAILY_QUOTAS: Record<GameId, number | null> = {
  'snowflake':   1,
  'card-flip':   3,
  'gift-guess':  null, // không giới hạn
  'lucky-wheel': 1,    // vòng free; VIP không giới hạn
}

// ------------------------------------------------------------
// SĂN BÔNG TUYẾT — Vật phẩm rơi
// ------------------------------------------------------------
export type SnowflakeItemType = 'snow' | 'crystal' | 'gold' | 'coal' | 'shadow'

export interface SnowflakeItem {
  id: SnowflakeItemType
  emoji: string
  label: string
  /** min value (có thể âm). Giá trị thực do server chọn từ [min, max]. */
  min: number
  max: number
  /** Tốc độ rơi tính bằng giây (thời gian rơi hết màn) */
  fallDurationMin: number
  fallDurationMax: number
  /** Tỉ lệ spawn (tổng = 1) */
  weight: number
  /** Hiệu ứng đặc biệt */
  effect?: 'darken'
}

export const SNOWFLAKE_ITEMS: SnowflakeItem[] = [
  {
    id: 'snow',
    emoji: '❄️',
    label: 'Tuyết thường',
    min: 1, max: 2,
    fallDurationMin: 5, fallDurationMax: 6,
    weight: 0.44,
  },
  {
    id: 'crystal',
    emoji: '💎',
    label: 'Tuyết pha lê',
    min: 3, max: 5,
    fallDurationMin: 3.5, fallDurationMax: 4.5,
    weight: 0.11,
  },
  {
    id: 'gold',
    emoji: '🌟',
    label: 'Tuyết vàng',
    min: 6, max: 10,
    fallDurationMin: 2, fallDurationMax: 2.5,
    weight: 0.07,
  },
  {
    id: 'coal',
    emoji: '🪨',
    label: 'Cục than',
    min: -2, max: -2,
    fallDurationMin: 3.5, fallDurationMax: 4.5,
    weight: 0.21,
  },
  {
    id: 'shadow',
    emoji: '🌑',
    label: 'Bóng đen',
    min: -4, max: -4,
    fallDurationMin: 3.5, fallDurationMax: 4.5,
    weight: 0.17,
    effect: 'darken',
  },
]

/** Hệ số nhân theo ngày (nhân cả tuyết lẫn bẫy) */
export const SNOWFLAKE_DAY_MULTIPLIERS: Record<string, number> = {
  '12-24': 2,
  '12-25': 3,
}
export const SNOWFLAKE_DEFAULT_MULTIPLIER = 1

/** Sàn điểm ván (trước khi nhân hệ số) — 0 theo quyết định đã chốt */
export const SNOWFLAKE_FLOOR = 0

/** Thời lượng ván (giây) */
export const SNOWFLAKE_DURATION = 60

// ------------------------------------------------------------
// LẬT THẺ GIÁNG SINH — Mốc theo ngày
// ------------------------------------------------------------
export type CardFlipMilestoneKey = 'week1' | 'week2' | 'week3' | 'week4' | 'xmas_eve' | 'xmas_day'

export interface CardFlipMilestone {
  key: CardFlipMilestoneKey
  label: string
  /** Ngày bắt đầu (MM-DD, inclusive) */
  from: string
  /** Ngày kết thúc (MM-DD, inclusive) */
  to: string
  multiplier: number
  maxFlips: number
  trapCount: number
  previewSec: number
  dailyQuota: number
  perfectBonus: number
  targetDescription: string
}

export const CARD_FLIP_MILESTONES: CardFlipMilestone[] = [
  {
    key: 'week1', label: 'Tuần 1: Khởi động',
    from: '12-01', to: '12-07',
    multiplier: 1, maxFlips: 7, trapCount: 5,
    previewSec: 4, dailyQuota: 3, perfectBonus: 6,
    targetDescription: '4 thẻ cùng 1 loại',
  },
  {
    key: 'week2', label: 'Tuần 2: Tăng tốc',
    from: '12-08', to: '12-14',
    multiplier: 1.25, maxFlips: 8, trapCount: 5,
    previewSec: 3.5, dailyQuota: 3, perfectBonus: 8,
    targetDescription: '2 loại, mỗi loại 2 thẻ',
  },
  {
    key: 'week3', label: 'Tuần 3: Nhiệm màu',
    from: '12-15', to: '12-21',
    multiplier: 1.5, maxFlips: 8, trapCount: 6,
    previewSec: 3, dailyQuota: 4, perfectBonus: 10,
    targetDescription: '2 loại, mỗi loại 2 thẻ',
  },
  {
    key: 'week4', label: 'Tuần 4: Chờ đón Noel',
    from: '12-22', to: '12-23',
    multiplier: 1.75, maxFlips: 9, trapCount: 5,
    previewSec: 3, dailyQuota: 4, perfectBonus: 12,
    targetDescription: '3 loại (2+1+1)',
  },
  {
    key: 'xmas_eve', label: 'Đêm Giáng Sinh (24/12)',
    from: '12-24', to: '12-24',
    multiplier: 2, maxFlips: 10, trapCount: 4,
    previewSec: 3.5, dailyQuota: 5, perfectBonus: 15,
    targetDescription: '4 thẻ 🌟, tặng thẻ bí mật',
  },
  {
    key: 'xmas_day', label: 'Ngày Giáng Sinh (25/12)',
    from: '12-25', to: '12-25',
    multiplier: 3, maxFlips: 10, trapCount: 3,
    previewSec: 4, dailyQuota: 5, perfectBonus: 20,
    targetDescription: '4 thẻ 🎅, tặng thẻ quà siêu lớn',
  },
]

/** Điểm thô từng loại thẻ */
export const CARD_FLIP_SCORES = {
  target: 4,
  bonus: 2,
  trap: -5,
  perfect_bonus: 6,
  xmas_eve_secret: 6,
  xmas_day_big: 8,
} as const

/** Sàn điểm thô trước khi nhân hệ số */
export const CARD_FLIP_FLOOR = -10

// ------------------------------------------------------------
// ĐOÁN QUÀ — 3 chế độ
// ------------------------------------------------------------
export type GiftGuessMode = 'small' | 'medium' | 'large'

export interface GiftGuessConfig {
  mode: GiftGuessMode
  label: string
  fee: number
  boxCount: number
  openLimit: number
  /** Hệ số c để tính thưởng: thưởng = multiplier * c */
  c: number
}

export const GIFT_GUESS_MODES: GiftGuessConfig[] = [
  { mode: 'small',  label: 'Nhỏ',  fee: 60,  boxCount: 6,  openLimit: 2, c: 30 },
  { mode: 'medium', label: 'Vừa',  fee: 160, boxCount: 9,  openLimit: 4, c: 40 },
  { mode: 'large',  label: 'Lớn',  fee: 360, boxCount: 12, openLimit: 6, c: 60 },
]

export interface GiftRewardTier {
  id: string
  label: string
  emoji: string
  /** Hệ số nhân c (có thể âm) */
  multiplier: number
  /** Xác suất [0, 1] */
  weight: number
}

export const GIFT_REWARD_TIERS: GiftRewardTier[] = [
  { id: 'coal',       label: 'Than đá (-30% c)',  emoji: '🪨', multiplier: -0.3, weight: 0.10 },
  { id: 'empty',      label: 'Hộp rỗng',           emoji: '📦', multiplier:  0,   weight: 0.14 },
  { id: 'small',      label: 'Quà nhỏ (+0.8c)',    emoji: '🎁', multiplier:  0.8, weight: 0.36 },
  { id: 'medium',     label: 'Quà vừa (+1.6c)',    emoji: '🎀', multiplier:  1.6, weight: 0.24 },
  { id: 'large',      label: 'Quà lớn (+3.2c)',    emoji: '🎊', multiplier:  3.2, weight: 0.12 },
  { id: 'super',      label: 'Quà siêu lớn (+6c)', emoji: '🌟', multiplier:  6,   weight: 0.035 },
  // Jackpot xác suất riêng theo mode — xử lý ở server
  { id: 'jackpot',    label: 'Jackpot!',            emoji: '🏆', multiplier:  0,   weight: 0.005 },
]

/** Giá trị jackpot cố định */
export const GIFT_JACKPOT_VALUE = 2026

/** Xác suất jackpot theo mode */
export const GIFT_JACKPOT_WEIGHTS: Record<GiftGuessMode, number> = {
  small:  0.005,
  medium: 0.008,
  large:  0.015,
}

// ------------------------------------------------------------
// QUAY MAY MẮN
// ------------------------------------------------------------
export interface LuckyWheelSlot {
  value: number
  label: string
  weight: number
}

export const LUCKY_WHEEL_FREE: LuckyWheelSlot[] = [
  { value: 0,   label: 'Chúc bạn may mắn lần sau', weight: 0.35 },
  { value: 2,   label: '+2 ❄️',  weight: 0.24 },
  { value: 5,   label: '+5 ❄️',  weight: 0.18 },
  { value: 10,  label: '+10 ❄️', weight: 0.13 },
  { value: 20,  label: '+20 ❄️', weight: 0.07 },
  { value: 50,  label: '+50 ❄️', weight: 0.024 },
  { value: 100, label: '+100 ❄️', weight: 0.006 },
]

export const LUCKY_WHEEL_VIP_FEE = 40

export const LUCKY_WHEEL_VIP: LuckyWheelSlot[] = [
  { value: 0,   label: 'Chúc bạn may mắn lần sau', weight: 0.38 },
  { value: 10,  label: '+10 ❄️',  weight: 0.26 },
  { value: 30,  label: '+30 ❄️',  weight: 0.18 },
  { value: 60,  label: '+60 ❄️',  weight: 0.10 },
  { value: 120, label: '+120 ❄️', weight: 0.055 },
  { value: 250, label: '+250 ❄️', weight: 0.02 },
  { value: 500, label: '+500 ❄️', weight: 0.005 },
]

// ------------------------------------------------------------
// TIỆN ÍCH THỜI GIAN (phía client, chỉ dùng để hiển thị)
// Server mới là nguồn sự thật về giờ.
// ------------------------------------------------------------

/** Trả "YYYY-MM-DD" theo múi giờ Asia/Ho_Chi_Minh */
export function getVnDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date)
}

/** Trả "MM-DD" theo múi giờ Asia/Ho_Chi_Minh */
export function getVnMonthDay(date = new Date()): string {
  const full = getVnDayKey(date) // "YYYY-MM-DD"
  return full.slice(5) // "MM-DD"
}

type GameWindowStatus = 'open' | 'coming_soon' | 'closed'

/**
 * Kiểm tra trạng thái cửa sổ game phía client (chỉ hiển thị).
 * openDay/closeDay dạng "MM-DD".
 */
export function getGameWindowStatus(
  gameId: GameId,
  now = new Date(),
): GameWindowStatus {
  if (DEBUG_TEST_MODE) return 'open'
  const { openDay, closeDay } = GAME_WINDOWS[gameId]
  const md = getVnMonthDay(now)
  if (md >= openDay && md < closeDay) return 'open'
  if (md < openDay) return 'coming_soon'
  return 'closed'
}

/** Lấy mốc lật thẻ theo ngày */
export function getCardFlipMilestone(now = new Date()): CardFlipMilestone | null {
  const md = getVnMonthDay(now)
  return (
    CARD_FLIP_MILESTONES.find((m) => md >= m.from && md <= m.to) ?? (DEBUG_TEST_MODE ? CARD_FLIP_MILESTONES[0] : null)
  )
}

/** Hệ số nhân Săn tuyết theo ngày */
export function getSnowflakeMultiplier(now = new Date()): number {
  const md = getVnMonthDay(now)
  return SNOWFLAKE_DAY_MULTIPLIERS[md] ?? SNOWFLAKE_DEFAULT_MULTIPLIER
}

/** Hệ số nhân mùa Giáng Sinh dùng chung (24/12: ×2, 25/12: ×3) */
export function getHolidayDayMultiplier(now = new Date()): number {
  const md = getVnMonthDay(now)
  if (md === '12-24') return 2
  if (md === '12-25') return 3
  return 1
}

/** Lấy giới hạn lượt lật thẻ theo ngày (3 -> 4 -> 5 lượt) */
export function getCardFlipDailyQuota(now = new Date()): number {
  const milestone = getCardFlipMilestone(now)
  return milestone?.dailyQuota ?? 3
}
