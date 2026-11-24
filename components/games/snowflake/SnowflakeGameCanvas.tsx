// components/games/snowflake/SnowflakeGameCanvas.tsx
// Canvas khu chơi Săn Bông Tuyết — 60 giây, giỏ hứng, vật phẩm rơi với hiệu ứng phát sáng & âm thanh

import { useRef, useEffect, useCallback, useState } from 'react'
import type { DropEvent, CatchLogEntry } from '@/types/games'
import { SNOWFLAKE_ITEMS } from '@/constants/games'
import { soundEffects } from '@/lib/sound-effects'

interface Props {
    dropSchedule: DropEvent[]
    duration?: number
    onFinish: (catchLog: CatchLogEntry[], score: number) => void
}

const ITEM_EMOJI: Record<string, string> = {
    snow:    '❄️',
    crystal: '💎',
    gold:    '🌟',
    coal:    '🪨',
    shadow:  '🌑',
}

interface FallingItem {
    id: string
    itemId: string
    value: number
    x: number         // 0–1 relative
    y: number         // 0–1 relative
    spawnAt: number
    fallDuration: number
    emoji: string
    caught: boolean
    missed: boolean
}

const BASKET_W = 100
const BASKET_H = 40
const CATCH_RADIUS = 55

export function SnowflakeGameCanvas({ dropSchedule, duration = 60, onFinish }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const stateRef = useRef({
        basketX: 0.5,
        items: [] as FallingItem[],
        catchLog: [] as CatchLogEntry[],
        score: 0,
        timeLeft: duration,
        startTime: 0,
        lastTime: 0,
        isDarkened: false,
        darkenEnd: 0,
        animFrame: 0,
        finished: false,
        scoreFlashes: [] as { text: string; x: number; y: number; born: number; color: string }[],
    })
    const [timeLeft, setTimeLeft] = useState(duration)
    const [score, setScore] = useState(0)
    const prefersReduced = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false

    // Khởi tạo items từ dropSchedule
    useEffect(() => {
        const items: FallingItem[] = dropSchedule.map((ev, idx) => {
            const itemDef = SNOWFLAKE_ITEMS.find((i) => i.id === ev.itemId)
            const fallDuration = itemDef
                ? itemDef.fallDurationMin + Math.random() * (itemDef.fallDurationMax - itemDef.fallDurationMin)
                : 4
            return {
                id: `item-${idx}`,
                itemId: ev.itemId,
                value: ev.value,
                x: ev.x,
                y: -0.05,
                spawnAt: ev.spawnAt,
                fallDuration,
                emoji: ITEM_EMOJI[ev.itemId] ?? '❄️',
                caught: false,
                missed: false,
            }
        })
        stateRef.current.items = items
        stateRef.current.startTime = performance.now() / 1000
        stateRef.current.finished = false
        stateRef.current.score = 0
        stateRef.current.catchLog = []
    }, [dropSchedule])

    // Controls
    const handleMove = useCallback((relX: number) => {
        stateRef.current.basketX = Math.max(0.08, Math.min(0.92, relX))
    }, [])

    const onMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        handleMove((e.clientX - rect.left) / rect.width)
    }, [handleMove])

    const onTouchMove = useCallback((e: TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas || !e.touches[0]) return
        const rect = canvas.getBoundingClientRect()
        handleMove((e.touches[0].clientX - rect.left) / rect.width)
    }, [handleMove])

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            stateRef.current.basketX = Math.max(0.08, stateRef.current.basketX - 0.06)
        } else if (e.key === 'ArrowRight') {
            stateRef.current.basketX = Math.min(0.92, stateRef.current.basketX + 0.06)
        }
    }, [])

    // Animation loop
    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const W = canvas.width
        const H = canvas.height
        const s = stateRef.current
        const now = performance.now() / 1000
        if (!s.lastTime) s.lastTime = now
        const dt = Math.min(0.08, now - s.lastTime)
        s.lastTime = now
        const elapsed = now - s.startTime

        // Tốc độ rơi tăng dần kịch tính, bùng nổ ở 18 giây cuối
        let speedMult = 1.0
        if (elapsed > 42) {
            // Giai đoạn cao trào (1.35x -> 2.1x)
            speedMult = 1.35 + ((elapsed - 42) / 18) * 0.75
        } else if (elapsed > 25) {
            // Tăng tốc dần (1.0x -> 1.35x)
            speedMult = 1.0 + ((elapsed - 25) / 17) * 0.35
        }

        // Background: Rich Winter Night Sky (Brighter & High Contrast)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H)
        skyGrad.addColorStop(0, '#0c2438')   // Deep twilight cyan-blue
        skyGrad.addColorStop(0.5, '#0a1d2e') // Midnight blue
        skyGrad.addColorStop(1, '#071624')   // Horizon blue
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, W, H)

        // Snowbank at bottom
        const snowbankGrad = ctx.createLinearGradient(0, H - 45, 0, H)
        snowbankGrad.addColorStop(0, 'rgba(186, 230, 253, 0)')
        snowbankGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.15)')
        snowbankGrad.addColorStop(1, 'rgba(224, 242, 254, 0.35)')
        ctx.fillStyle = snowbankGrad
        ctx.fillRect(0, H - 45, W, 45)

        // Thông báo cao trào bão tuyết ở 18 giây cuối
        if (elapsed > 42 && !s.isDarkened) {
            ctx.save()
            ctx.font = 'bold 12px sans-serif'
            ctx.fillStyle = Math.floor(now * 3) % 2 === 0 ? '#fde047' : '#f87171'
            ctx.shadowColor = '#facc15'
            ctx.shadowBlur = 8
            ctx.textAlign = 'center'
            ctx.fillText('⚡ CAO TRÀO BÃO TUYẾT · TỐC ĐỘ GẤP ĐÔI! ⚡', W / 2, 26)
            ctx.restore()
        }

        // Kiểm tra hiệu ứng tối màn khi dính bóng đen
        const isBlackout = !prefersReduced && s.isDarkened && now < s.darkenEnd
        if (!isBlackout) {
            s.isDarkened = false
        }

        // Update & draw items
        for (const item of s.items) {
            if (item.caught || item.missed) continue
            if (elapsed < item.spawnAt) continue

            // Tốc độ rơi tăng dần theo nhịp thời gian
            item.y += (dt / item.fallDuration) * speedMult

            const px = item.x * W
            const py = item.y * H

            // Biến mất ngay lập tức khi chạm viền dưới
            if (item.y >= 0.98 || py >= H - 8) {
                item.missed = true
                continue
            }

            // Kiểm tra bắt được
            const basketPx = s.basketX * W
            const basketPy = H - BASKET_H - 10
            const dist = Math.hypot(px - basketPx, py - basketPy)

            if (dist < CATCH_RADIUS) {
                item.caught = true
                s.score += item.value
                s.catchLog.push({ itemId: item.itemId, caughtAt: parseFloat(elapsed.toFixed(2)) })
                setScore(Math.max(0, s.score))

                // Âm thanh tương tác
                soundEffects.playCatch(item.itemId as any)

                // Hiệu ứng bóng đen: Tối đen toàn bộ màn hình 1 giây
                if (item.itemId === 'shadow' && !prefersReduced) {
                    s.isDarkened = true
                    s.darkenEnd = now + 1.2
                }

                // Flash text
                if (!prefersReduced) {
                    s.scoreFlashes.push({
                        text: item.value > 0 ? `+${item.value}` : `${item.value}`,
                        x: px, y: py,
                        born: now,
                        color: item.value > 0 ? '#4ade80' : '#f87171',
                    })
                }
                continue
            }

            // Vẽ emoji sắc nét (Không vẽ hình tròn màu xanh phía sau)
            if (!isBlackout) {
                ctx.save()
                if (item.itemId === 'gold') {
                    ctx.shadowColor = '#fde047'
                    ctx.shadowBlur = 18
                    ctx.font = '40px serif'
                } else if (item.itemId === 'crystal') {
                    ctx.shadowColor = '#38bdf8'
                    ctx.shadowBlur = 16
                    ctx.font = '36px serif'
                } else if (item.itemId === 'snow') {
                    ctx.shadowColor = '#e0f2fe'
                    ctx.shadowBlur = 14
                    ctx.font = '36px serif'
                } else if (item.itemId === 'coal') {
                    ctx.shadowColor = '#ea580c'
                    ctx.shadowBlur = 14
                    ctx.font = '36px serif'
                } else { // shadow
                    ctx.shadowColor = '#c084fc'
                    ctx.shadowBlur = 16
                    ctx.font = '36px serif'
                }

                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(item.emoji, px, py)
                ctx.restore()
            }
        }

        // Nếu dính bóng đen: Phủ màn đen tuyền che khuất toàn bộ vật phẩm (vẫn tính tương tác bắt)
        if (isBlackout) {
            ctx.fillStyle = '#030712'
            ctx.fillRect(0, 0, W, H)
            ctx.fillStyle = 'rgba(239, 68, 68, 0.45)'
            ctx.font = 'bold 15px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('🌑 BÓNG TỐI CHE KHUẤT...', W / 2, H / 2 - 10)
        }

        // Score flashes
        s.scoreFlashes = s.scoreFlashes.filter((f) => now - f.born < 1)
        for (const f of s.scoreFlashes) {
            const age = now - f.born
            ctx.save()
            ctx.globalAlpha = Math.max(0, 1 - age)
            ctx.font = 'bold 22px sans-serif'
            ctx.fillStyle = f.color
            ctx.shadowColor = f.color
            ctx.shadowBlur = 10
            ctx.textAlign = 'center'
            ctx.fillText(f.text, f.x, f.y - age * 45)
            ctx.restore()
        }

        // Giỏ Giáng Sinh ấm áp phát sáng phong cách nghệ thuật
        const bx = s.basketX * W
        const by = H - BASKET_H - 10
        const bw = BASKET_W
        const bh = BASKET_H

        ctx.save()

        // 1. Vầng sáng ấm áp tỏa dưới đáy giỏ
        ctx.shadowColor = '#facc15'
        ctx.shadowBlur = 18
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)'
        ctx.beginPath()
        ctx.ellipse(bx, by + bh + 2, bw / 2 + 12, 10, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.save()
        // 2. Quai giỏ mây uốn cong phía trên
        ctx.beginPath()
        ctx.arc(bx, by + 12, bw * 0.42, Math.PI, 0, false)
        ctx.strokeStyle = '#92400e'
        ctx.lineWidth = 6
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(bx, by + 12, bw * 0.42, Math.PI, 0, false)
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Nơ đỏ trang trí trên đỉnh quai giỏ
        ctx.font = '16px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🎀', bx, by + 12 - bw * 0.42)

        // 3. Thân giỏ mây hình thang vát cạnh tinh tế (thắt hẹp dưới, nở rộng trên)
        const topW = bw
        const botW = bw * 0.74
        const halfTop = topW / 2
        const halfBot = botW / 2

        ctx.beginPath()
        ctx.moveTo(bx - halfTop, by + 4)
        ctx.lineTo(bx + halfTop, by + 4)
        ctx.quadraticCurveTo(bx + halfTop + 2, by + bh * 0.6, bx + halfBot, by + bh)
        ctx.quadraticCurveTo(bx, by + bh + 4, bx - halfBot, by + bh)
        ctx.quadraticCurveTo(bx - halfTop - 2, by + bh * 0.6, bx - halfTop, by + 4)
        ctx.closePath()

        // Gradient màu mây ấm áp nhiều tầng
        const basketGrad = ctx.createLinearGradient(0, by, 0, by + bh)
        basketGrad.addColorStop(0, '#d97706')   // Amber gold
        basketGrad.addColorStop(0.35, '#b45309') // Rich chestnut
        basketGrad.addColorStop(0.75, '#92400e') // Deep oak
        basketGrad.addColorStop(1, '#78350f')   // Dark wood base
        ctx.fillStyle = basketGrad
        ctx.fill()

        // Viền ánh vàng sang trọng
        ctx.strokeStyle = '#fde047'
        ctx.lineWidth = 2.5
        ctx.stroke()

        // 4. Họa tiết nan đan mây chéo nghệ thuật
        ctx.save()
        ctx.clip() // Giới hạn nan mây nằm bên trong thân giỏ
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.28)'
        ctx.lineWidth = 1.5
        for (let xOffset = -halfTop; xOffset <= halfTop; xOffset += 14) {
            ctx.beginPath()
            ctx.moveTo(bx + xOffset, by)
            ctx.lineTo(bx + xOffset + 18, by + bh)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(bx + xOffset, by)
            ctx.lineTo(bx + xOffset - 18, by + bh)
            ctx.stroke()
        }

        // Dải ruy băng Giáng Sinh màu đỏ bọc ngang thân giỏ
        const ribbonY = by + bh * 0.52
        const ribbonH = 10
        const ribGrad = ctx.createLinearGradient(0, ribbonY, 0, ribbonY + ribbonH)
        ribGrad.addColorStop(0, '#ef4444')
        ribGrad.addColorStop(0.5, '#dc2626')
        ribGrad.addColorStop(1, '#991b1b')
        ctx.fillStyle = ribGrad
        ctx.fillRect(bx - halfTop, ribbonY, topW, ribbonH)

        ctx.strokeStyle = '#facc15'
        ctx.lineWidth = 1
        ctx.strokeRect(bx - halfTop, ribbonY, topW, ribbonH)
        ctx.restore()

        // 5. Chuông vàng lấp lánh chính giữa ruy băng
        ctx.font = '14px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🔔', bx, ribbonY + ribbonH / 2)

        // 6. Lớp tuyết trắng bồng bềnh phủ trên miệng giỏ
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(186, 230, 253, 0.8)'
        ctx.shadowBlur = 6
        ctx.beginPath()
        const snowY = by + 2
        const segCount = 6
        const segW = topW / segCount
        ctx.moveTo(bx - halfTop - 2, snowY)
        for (let i = 0; i < segCount; i++) {
            const startX = bx - halfTop - 2 + i * segW
            ctx.quadraticCurveTo(startX + segW / 2, snowY + 6, startX + segW, snowY)
        }
        ctx.lineTo(bx + halfTop + 2, by - 2)
        ctx.lineTo(bx - halfTop - 2, by - 2)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = '#bae6fd'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.restore()

        // Thời gian còn lại
        const remaining = Math.max(0, duration - elapsed)
        setTimeLeft(Math.ceil(remaining))

        if (remaining <= 0 && !s.finished) {
            s.finished = true
            cancelAnimationFrame(s.animFrame)
            soundEffects.playWinFanfare()
            onFinish(s.catchLog, Math.max(0, s.score))
            return
        }

        s.animFrame = requestAnimationFrame(draw)
    }, [duration, onFinish, prefersReduced])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.addEventListener('mousemove', onMouseMove)
        canvas.addEventListener('touchmove', onTouchMove, { passive: true })
        window.addEventListener('keydown', onKeyDown)

        stateRef.current.animFrame = requestAnimationFrame(draw)

        return () => {
            canvas.removeEventListener('mousemove', onMouseMove)
            canvas.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('keydown', onKeyDown)
            cancelAnimationFrame(stateRef.current.animFrame)
        }
    }, [draw, onMouseMove, onTouchMove, onKeyDown])

    const pct = (timeLeft / duration) * 100
    const timerColor = timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-400' : 'bg-sky-400'

    return (
        <div className="relative overflow-hidden rounded-3xl border border-sky-300/30 bg-[#081827] shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            {/* Timer bar */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-white/10">
                <div
                    className={`h-full transition-all duration-1000 ${timerColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* HUD */}
            <div className="absolute left-3 top-3.5 z-10 flex items-center gap-2">
                <span
                    aria-live="polite"
                    aria-label={`Thời gian còn ${timeLeft} giây`}
                    className={`rounded-full px-3.5 py-1 text-xs font-black tabular-nums shadow-md backdrop-blur-md ${
                        timeLeft <= 10 ? 'bg-red-500/90 text-white animate-pulse' : 'border border-amber-200/20 bg-black/60 text-yellow-200'
                    }`}
                >
                    ⏱ {timeLeft}s
                </span>
            </div>
            <div className="absolute right-3 top-3.5 z-10">
                <span
                    aria-live="polite"
                    aria-label={`Điểm hiện tại: ${score}`}
                    className="rounded-full border border-sky-300/30 bg-black/60 px-4 py-1 text-sm font-black tabular-nums text-sky-200 shadow-md backdrop-blur-md"
                >
                    ❄️ {score}
                </span>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={480}
                height={380}
                className="w-full touch-none"
                tabIndex={0}
                aria-label="Khu vực chơi Săn Bông Tuyết. Dùng chuột, ngón tay hoặc phím mũi tên để di chuyển giỏ."
                style={{ display: 'block' }}
            />

            {/* Hướng dẫn */}
            <p className="border-t border-sky-200/10 bg-black/40 px-4 py-2 text-center text-xs text-sky-100/60">
                💡 Rê chuột, lướt ngón tay hoặc bấm phím mũi tên ← → để hứng tuyết
            </p>
        </div>
    )
}
