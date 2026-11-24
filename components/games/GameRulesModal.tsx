'use client'

// components/games/GameRulesModal.tsx
// Modal Luật Chơi đầy đủ — tích hợp tỷ lệ, mốc tuần, bảng thưởng, đặc quyền Giáng Sinh
import { useState, useEffect, useRef } from 'react'
import { X, BookOpen, Sparkles, CheckCircle2, Info, Trophy, Calendar, Star } from 'lucide-react'
import type { GameId } from '@/constants/games'
import {
  CARD_FLIP_MILESTONES,
  GIFT_GUESS_MODES,
  GIFT_REWARD_TIERS,
  LUCKY_WHEEL_FREE,
  LUCKY_WHEEL_VIP,
  LUCKY_WHEEL_VIP_FEE,
} from '@/constants/games'

interface Props {
  isOpen: boolean
  defaultGame?: GameId
  onClose: () => void
}

export function GameRulesModal({ isOpen, defaultGame = 'snowflake', onClose }: Props) {
  const [activeGame, setActiveGame] = useState<GameId>(defaultGame)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setActiveGame(defaultGame)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, defaultGame])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const tabClass = (id: GameId) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap border ${
      activeGame === id
        ? 'border-amber-300/60 bg-linear-to-r from-amber-400 to-yellow-300 text-red-950 shadow-[0_2px_12px_rgba(250,204,21,0.25)] scale-[1.02]'
        : 'border-white/5 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white hover:border-white/15'
    }`

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
    >
      <div
        className="relative my-auto w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border-2 border-yellow-400/50 bg-linear-to-b from-[#21090c] via-[#150709] to-[#07130b] text-white shadow-[0_0_80px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Line */}
        <div className="absolute left-0 top-0 h-1.5 w-full bg-linear-to-r from-transparent via-yellow-300 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-yellow-400/15 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-400/10 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 id="rules-modal-title" className="font-serif text-lg sm:text-xl font-bold text-yellow-200">
                Luật Chơi & Tỷ Lệ Xác Suất
              </h2>
              <p className="text-xs text-red-100/60">
                Quy tắc, bảng thưởng & đặc quyền bùng nổ 24/12 – 25/12
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-yellow-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            aria-label="Đóng bảng luật chơi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Game Selector Tabs — Fixed grid layout, completely stable without layout shifts */}
        <div className="border-b border-white/10 bg-black/40 p-2 sm:p-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button type="button" onClick={() => setActiveGame('snowflake')} className={tabClass('snowflake')}>
              <span className="text-sm sm:text-base">❄️</span>
              <span>Săn Tuyết</span>
            </button>
            <button type="button" onClick={() => setActiveGame('card-flip')} className={tabClass('card-flip')}>
              <span className="text-sm sm:text-base">🃏</span>
              <span>Lật Thẻ</span>
            </button>
            <button type="button" onClick={() => setActiveGame('gift-guess')} className={tabClass('gift-guess')}>
              <span className="text-sm sm:text-base">🎁</span>
              <span>Đoán Quà</span>
            </button>
            <button type="button" onClick={() => setActiveGame('lucky-wheel')} className={tabClass('lucky-wheel')}>
              <span className="text-sm sm:text-base">🎡</span>
              <span>Vòng Quay</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm">

          {/* Christmas Privilege Banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-yellow-400/40 bg-linear-to-r from-amber-500/20 via-yellow-500/15 to-red-500/20 p-3.5">
            <Sparkles className="h-5 w-5 text-yellow-300 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <p className="font-bold text-yellow-200 text-xs sm:text-sm">
                🎄 Đặc Quyền Giáng Sinh
              </p>
              <p className="text-[11px] sm:text-xs text-white/70 mt-0.5 leading-relaxed">
                Toàn bộ bông tuyết nhận được ở cả 4 trò chơi sẽ được <strong className="text-yellow-300">nhân ×2</strong> vào Đêm Giáng Sinh <strong>(24/12)</strong> và <strong className="text-yellow-300">nhân ×3</strong> vào Ngày Giáng Sinh <strong>(25/12)</strong>!
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              1. SĂN BÔNG TUYẾT
          ════════════════════════════════════════ */}
          {activeGame === 'snowflake' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="h-4 w-4 text-sky-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Cách Chơi</h3>
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed pl-6">
                  Trong vòng <strong>60 giây</strong>, di chuyển chiếc giỏ bằng <strong>chuột / ngón tay / phím ← →</strong> để hứng bông tuyết rơi. Điểm van luôn ≥ 0 — số dư không bao giờ âm.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-amber-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Tốc Độ & Cao Trào</h3>
                </div>
                <div className="space-y-1.5 pl-6 text-xs text-white/70 leading-relaxed">
                  <p>• <strong className="text-white/90">0 – 25 giây:</strong> Tốc độ bình thường, thoải mái thu thập.</p>
                  <p>• <strong className="text-white/90">25 – 42 giây:</strong> Tăng tốc dần lên ×1.35 — cẩn thận hơn!</p>
                  <p>• <strong className="text-yellow-300">⚡ 42 – 60 giây (Cao trào):</strong> Tốc độ tăng vọt lên ×2.1 — Bão tuyết bùng nổ!</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Bảng Vật Phẩm & Tỷ Lệ</h3>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-xl border border-sky-400/25 bg-sky-950/30 p-2.5">
                    <span className="text-xl">❄️</span>
                    <div>
                      <p className="font-bold text-sky-200 text-xs">Tuyết thường · +1 đến +2 ❄️</p>
                      <p className="text-[10px] text-white/55">Tỷ lệ: ~44% · Rơi chậm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-cyan-400/25 bg-cyan-950/30 p-2.5">
                    <span className="text-xl">💎</span>
                    <div>
                      <p className="font-bold text-cyan-200 text-xs">Tuyết pha lê · +3 đến +5 ❄️</p>
                      <p className="text-[10px] text-white/55">Tỷ lệ: ~11% · Tốc độ vừa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-amber-950/30 p-2.5">
                    <span className="text-xl">🌟</span>
                    <div>
                      <p className="font-bold text-amber-200 text-xs">Tuyết vàng · +6 đến +10 ❄️</p>
                      <p className="text-[10px] text-white/55">Tỷ lệ: ~7% · Rơi nhanh, hiếm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-950/30 p-2.5">
                    <span className="text-xl">🪨</span>
                    <div>
                      <p className="font-bold text-red-300 text-xs">Than đá · −2 ❄️</p>
                      <p className="text-[10px] text-white/55">Bẫy trừ điểm · Tỷ lệ: ~21%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-purple-500/25 bg-purple-950/30 p-2.5 sm:col-span-2">
                    <span className="text-xl">🌑</span>
                    <div>
                      <p className="font-bold text-purple-300 text-xs">Bóng đen bí ẩn · −4 ❄️ + tối màn 1.2s</p>
                      <p className="text-[10px] text-white/55">Làm tối đen màn chơi, che khuất vật phẩm 1.2 giây · Tỷ lệ: ~17%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/65 space-y-1">
                <p>📅 <strong>Thời gian mở:</strong> 01/12 – 25/12 · 1 lượt chơi mỗi ngày.</p>
                <p>🛡️ <strong>Bảo vệ số dư:</strong> Điểm ván có sàn 0, số dư ❄️ không bao giờ bị âm.</p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              2. LẬT THẺ GIÁNG SINH
          ════════════════════════════════════════ */}
          {activeGame === 'card-flip' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="h-4 w-4 text-emerald-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Cách Chơi</h3>
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed pl-6">
                  Bàn gồm <strong>16 thẻ</strong> Giáng Sinh úp mặt. Đầu ván bàn mở ngửa vài giây để bạn ghi nhớ. Sau khi úp lại, dùng số lần lật được phép để lật trúng <strong>4 thẻ Mục Tiêu 🎯</strong> mà không dính Bẫy 💀.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Điểm Từng Loại Thẻ</h3>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-4">
                  {[
                    { emoji: '🎯', name: 'Mục tiêu', val: '+4 ❄️', color: 'border-yellow-400/30 bg-yellow-950/30 text-yellow-200' },
                    { emoji: '🎁', name: 'Thưởng nhỏ', val: '+2 ❄️', color: 'border-green-400/30 bg-green-950/30 text-green-200' },
                    { emoji: '💀', name: 'Bẫy', val: '−5 ❄️', color: 'border-red-400/30 bg-red-950/30 text-red-300' },
                    { emoji: '🎅', name: 'Khiên', val: 'Chặn 1 bẫy', color: 'border-blue-400/30 bg-blue-950/30 text-blue-200' },
                  ].map((t) => (
                    <div key={t.name} className={`rounded-xl border p-2 text-center ${t.color}`}>
                      <span className="text-2xl">{t.emoji}</span>
                      <p className="font-bold mt-1 text-[11px]">{t.name}</p>
                      <p className="font-black text-white mt-0.5 text-xs">{t.val}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 pl-1 text-[11px] text-white/55">
                  ✨ <strong>Thưởng hoàn hảo:</strong> Tìm đủ 4 mục tiêu, không dính bẫy → nhận thêm bonus tăng dần theo mốc (từ +6 đến +20 ❄️).
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-sky-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Lịch Mốc Tuần & Thưởng Tăng Dần</h3>
                </div>
                <div className="space-y-1.5">
                  {CARD_FLIP_MILESTONES.map((m) => (
                    <div
                      key={m.key}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                        m.key === 'xmas_eve' || m.key === 'xmas_day'
                          ? 'border-yellow-400/40 bg-yellow-950/30'
                          : 'border-white/10 bg-black/25'
                      }`}
                    >
                      <div>
                        <span className={`font-bold ${m.key === 'xmas_eve' || m.key === 'xmas_day' ? 'text-yellow-300' : 'text-white/90'}`}>
                          {m.key === 'xmas_eve' ? '🎄 ' : m.key === 'xmas_day' ? '🎅 ' : ''}{m.label}
                        </span>
                        <p className="text-[10px] text-white/50 mt-0.5">
                          {m.from} → {m.to} · {m.targetDescription} · Xem {m.previewSec}s · {m.trapCount} bẫy · Bonus hoàn hảo +{m.perfectBonus}❄️
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded bg-sky-950/70 px-2 py-0.5 border border-sky-400/30 text-sky-200 font-semibold text-[10px]">
                          {m.dailyQuota} lượt/ngày
                        </span>
                        <span className="rounded bg-emerald-950/70 px-2 py-0.5 border border-emerald-400/30 text-emerald-300 font-bold text-[10px]">
                          {m.maxFlips} lần lật
                        </span>
                        <span className="rounded bg-yellow-950/70 px-2 py-0.5 border border-yellow-400/30 text-yellow-300 font-black text-[10px]">
                          ×{m.multiplier}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/65 space-y-1">
                <p>📅 <strong>Thời gian mở:</strong> 01/12 – 25/12. Số lượt và lần lật tăng dần theo tuần.</p>
                <p>🛡️ <strong>Điểm sàn:</strong> −10 ❄️ / ván (không về âm sâu hơn).</p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              3. ĐOÁN QUÀ BẤT NGỜ
          ════════════════════════════════════════ */}
          {activeGame === 'gift-guess' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="h-4 w-4 text-amber-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Cách Chơi</h3>
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed pl-6">
                  Mở cửa từ <strong>24/12 đến hết 31/12</strong>, không giới hạn số lần chơi trong ngày. Chọn gói cược, bước vào bàn và mở số hộp theo giới hạn của gói. Tổng bông tuyết trong các hộp được mở sẽ cộng thẳng vào ví bạn!
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-amber-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">3 Gói Cước & Phần Thưởng</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {GIFT_GUESS_MODES.map((cfg) => (
                    <div key={cfg.mode} className="rounded-xl border border-yellow-400/20 bg-black/30 p-3 text-center">
                      <span className="text-3xl">
                        {cfg.mode === 'small' ? '🎁' : cfg.mode === 'medium' ? '🎀' : '👑'}
                      </span>
                      <p className="font-bold text-yellow-200 mt-1 text-xs">{cfg.label}</p>
                      <p className="font-black text-yellow-300 text-lg">{cfg.fee} ❄️</p>
                      <p className="text-[10px] text-white/55 mt-0.5">{cfg.boxCount} hộp · Mở {cfg.openLimit} hộp</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Bảng Phần Thưởng & Tỷ Lệ Hộp</h3>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {GIFT_REWARD_TIERS.map((tier) => (
                    <div key={tier.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2.5">
                      <span className="text-2xl shrink-0">{tier.emoji}</span>
                      <div>
                        <p className="font-bold text-white text-[11px]">{tier.label}</p>
                        <p className="text-[10px] text-white/50">Tỷ lệ: {(tier.weight * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-white/55 pl-1">
                  ⚠️ Tỷ lệ trên áp dụng cho từng hộp. Jackpot 🏆 có tỷ lệ cực thấp nhưng phần thưởng rất lớn.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/65 space-y-1">
                <p>📅 <strong>Thời gian mở:</strong> 24/12 – 31/12 · Không giới hạn lượt chơi/ngày.</p>
                <p>💡 <strong>Mẹo:</strong> Gói Hộp Vương có phần thưởng trung bình cao nhất nhưng cần nhiều ❄️ hơn.</p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              4. VÒNG QUAY MAY MẮN
          ════════════════════════════════════════ */}
          {activeGame === 'lucky-wheel' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="h-4 w-4 text-green-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Cách Chơi</h3>
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed pl-6">
                  Mỗi ngày bạn nhận <strong>1 lượt quay MIỄN PHÍ</strong> (làm mới lúc 00:00 GMT+7). Ngoài ra có thể quay <strong>Vòng VIP ({LUCKY_WHEEL_VIP_FEE} ❄️/lượt)</strong> không giới hạn với giải thưởng cao hơn nhiều!
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-amber-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">So Sánh 2 Chế Độ Quay</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Free */}
                  <div className="rounded-xl border border-green-500/35 bg-green-950/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎁</span>
                      <h4 className="font-bold text-green-300 text-xs uppercase tracking-wider">Vòng Miễn Phí</h4>
                      <span className="rounded-full bg-green-700/50 px-2 py-0.5 text-[10px] text-green-200 font-semibold ml-auto">1 lượt/ngày</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {LUCKY_WHEEL_FREE.map((s, i) => (
                        <div key={i} className="flex justify-between border-b border-white/5 py-0.5 last:border-0">
                          <span className="text-white/80">{s.value === 0 ? '😶 Trắng tay' : `+${s.value} ❄️`}</span>
                          <span className="font-bold text-green-200">{(s.weight * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* VIP */}
                  <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👑</span>
                      <h4 className="font-bold text-yellow-300 text-xs uppercase tracking-wider">Vòng VIP</h4>
                      <span className="rounded-full bg-amber-700/50 px-2 py-0.5 text-[10px] text-yellow-200 font-semibold ml-auto">{LUCKY_WHEEL_VIP_FEE} ❄️/lượt</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {LUCKY_WHEEL_VIP.map((s, i) => (
                        <div key={i} className="flex justify-between border-b border-white/5 py-0.5 last:border-0">
                          <span className="text-white/80">{s.value === 0 ? '😶 Trắng tay' : `+${s.value} ❄️`}</span>
                          <span className="font-bold text-yellow-200">{(s.weight * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-300 shrink-0" />
                  <h3 className="font-serif text-sm font-bold text-yellow-300">Chiến Lược Gợi Ý</h3>
                </div>
                <div className="space-y-1.5 pl-1 text-xs text-white/70 leading-relaxed">
                  <p>🟢 <strong>Vòng Miễn Phí:</strong> Luôn quay để không bỏ lỡ lượt miễn phí mỗi ngày.</p>
                  <p>🟡 <strong>Vòng VIP:</strong> Phù hợp khi bạn đã có nhiều ❄️ và muốn tăng tốc — xác suất thưởng lớn cao hơn rõ rệt.</p>
                  <p>🎄 <strong>24/12 & 25/12:</strong> Nhân thưởng ×2 và ×3 — đây là thời điểm vàng để quay VIP!</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/65 space-y-1">
                <p>📅 <strong>Lượt Free:</strong> Làm mới vào 00:00 GMT+7 mỗi ngày · Không tích lũy sang ngày hôm sau.</p>
                <p>🔄 <strong>Vòng VIP:</strong> Không giới hạn số lượt · Trừ {LUCKY_WHEEL_VIP_FEE} ❄️ mỗi lần quay.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/10 bg-black/40 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full border border-yellow-400/50 bg-linear-to-r from-yellow-500 to-amber-400 px-6 py-2 text-xs sm:text-sm font-bold text-red-950 shadow-md transition hover:scale-105"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Đã hiểu luật chơi!</span>
          </button>
        </div>
      </div>
    </div>
  )
}
