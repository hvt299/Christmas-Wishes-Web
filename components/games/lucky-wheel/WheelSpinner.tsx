// components/games/lucky-wheel/WheelSpinner.tsx
// Vòng quay may mắn Giáng Sinh — Bánh xe rực rỡ sắc đỏ/xanh/vàng Giáng sinh, viền đèn lấp lánh & âm thanh

'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { LUCKY_WHEEL_FREE, LUCKY_WHEEL_VIP } from '@/constants/games'
import { soundEffects } from '@/lib/sound-effects'
import type { LuckyWheelMode } from '@/types/games'

interface Props {
  mode: LuckyWheelMode
  isSpinning: boolean
  resultIndex: number | null
  onAnimEnd?: () => void
}

// Sắc màu Giáng Sinh:
// Free mode: Đỏ Giáng Sinh, Xanh Thông, Vàng Ấm
const FREE_SLICE_COLORS = [
  '#dc2626', // Đỏ tươi Noel
  '#15803d', // Xanh Thông
  '#d97706', // Vàng Hổ Phách
  '#b91c1c', // Đỏ Ruby
  '#166534', // Xanh Lục Rừng
  '#b45309', // Vàng Đồng
  '#991b1b', // Đỏ Rượu Vang
]

// VIP mode: Sang trọng quý tộc (Ruby Đậm, Vàng Kim Lá, Ngọc Lục Bảo Hoàng Gia, Mận Đậm)
const VIP_SLICE_COLORS = [
  '#831843', // Ruby Hoàng Gia
  '#065f46', // Ngọc Lục Bảo Quý Tộc
  '#b45309', // Vàng Hoàng Gia
  '#701a75', // Mận Quý Phái
  '#991b1b', // Đỏ Thẫm
  '#047857', // Xanh Ngọc
  '#9a3412', // Đồng Cổ
]

export function WheelSpinner({ mode, isSpinning, resultIndex, onAnimEnd }: Props) {
  const controls = useAnimationControls()
  const currentRotationRef = useRef(0)
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const slots = mode === 'free' ? LUCKY_WHEEL_FREE : LUCKY_WHEEL_VIP
  const sliceAngle = 360 / slots.length

  useEffect(() => {
    if (!isSpinning || resultIndex === null) return

    if (prefersReduced) {
      soundEffects.playWheelWin()
      onAnimEnd?.()
      return
    }

    // Sound ticking effect while spinning
    let tickCount = 0
    let delay = 60
    const runTicks = () => {
      soundEffects.playWheelTick()
      tickCount++
      if (tickCount < 26) {
        delay = Math.min(300, delay * 1.08)
        tickIntervalRef.current = setTimeout(runTicks, delay)
      }
    }
    tickIntervalRef.current = setTimeout(runTicks, delay)

    // Tính toán góc quay chuẩn xác: Luôn quay tiến TỐI THIỂU 5 vòng (1800 độ) mỗi lượt
    const targetSectorAngle = (360 - resultIndex * sliceAngle - sliceAngle / 2) % 360
    const currentAngle = currentRotationRef.current % 360
    const diff = (targetSectorAngle - currentAngle + 360) % 360
    const minExtraSpins = 5 * 360 // Tối thiểu 5 vòng (1800 độ)
    const targetDeg = currentRotationRef.current + minExtraSpins + diff
    currentRotationRef.current = targetDeg

    controls
      .start({
        rotate: targetDeg,
        transition: { duration: 3.6, ease: [0.15, 0.85, 0.25, 1] },
      })
      .then(() => {
        if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)
        soundEffects.playWheelWin()
        onAnimEnd?.()
      })

    return () => {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)
    }
  }, [isSpinning, resultIndex, controls, sliceAngle, prefersReduced, onAnimEnd])

  const cx = 150
  const cy = 150
  const r = 122

  // 18 đèn trang trí viền vòng tròn
  const bulbCount = 18
  const bulbs = Array.from({ length: bulbCount }, (_, idx) => {
    const angle = (idx * (360 / bulbCount) - 90) * (Math.PI / 180)
    const bx = cx + 140 * Math.cos(angle)
    const by = cy + 140 * Math.sin(angle)
    const color =
      mode === 'vip'
        ? idx % 3 === 0
          ? '#fde047'
          : idx % 3 === 1
          ? '#fbbf24'
          : '#34d399'
        : idx % 3 === 0
        ? '#ef4444'
        : idx % 3 === 1
        ? '#22c55e'
        : '#facc15'
    return { bx, by, color, idx }
  })

  const sliceColors = mode === 'vip' ? VIP_SLICE_COLORS : FREE_SLICE_COLORS

  return (
    <div className="relative mx-auto w-64 sm:w-72 select-none">
      {/* Kim chỉ vòng quay: Mũi tên Vàng Giáng Sinh nạm đá quý 3D */}
      <div className="absolute left-1/2 -top-4 z-20 -translate-x-1/2 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
        <div className="h-4 w-5 bg-linear-to-b from-yellow-200 via-amber-400 to-yellow-600 rounded-t-sm border border-yellow-200/90 shadow-md" />
        <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-md" />
        <div
          className={`absolute top-1.5 h-2.5 w-2.5 rounded-full border border-yellow-100 shadow-inner ${
            mode === 'vip' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-red-600 shadow-[0_0_6px_#ef4444]'
          }`}
        />
      </div>

      {/* Khung viền đài quay Giáng Sinh */}
      <div
        className={`relative rounded-full p-2 transition-all duration-500 ${
          mode === 'vip'
            ? 'bg-linear-to-b from-yellow-300/40 via-amber-600/30 to-amber-950/60 shadow-[0_0_50px_rgba(245,158,11,0.35)] border-2 border-yellow-300/80 ring-2 ring-yellow-400/20'
            : 'bg-linear-to-b from-yellow-400/30 via-red-950/30 to-green-950/40 shadow-[0_0_40px_rgba(250,204,21,0.25)] border-2 border-yellow-400/60'
        }`}
      >
        <motion.div animate={controls} className="select-none">
          <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
            <defs>
              {/* Metallic Gold Ring Gradient */}
              <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="25%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="75%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* VIP Royal Ring Gradient */}
              <linearGradient id="vipGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="60%" stopColor="#b45309" />
                <stop offset="85%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>

              <radialGradient id="centerHub" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="40%" stopColor="#fde047" />
                <stop offset="80%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>

              <radialGradient id="vipCenterHub" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#eab308" />
                <stop offset="75%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#451a03" />
              </radialGradient>
            </defs>

            {/* Vòng đai vàng ngoài cùng */}
            <circle
              cx={cx}
              cy={cy}
              r={147}
              fill="none"
              stroke={mode === 'vip' ? 'url(#vipGoldRim)' : 'url(#goldRim)'}
              strokeWidth="5"
            />
            <circle
              cx={cx}
              cy={cy}
              r={124}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.75"
            />

            {/* Các nan bánh xe */}
            {slots.map((slot, i) => {
              const startAngle = (i * sliceAngle - 90) * (Math.PI / 180)
              const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180)
              const x1 = cx + r * Math.cos(startAngle)
              const y1 = cy + r * Math.sin(startAngle)
              const x2 = cx + r * Math.cos(endAngle)
              const y2 = cy + r * Math.sin(endAngle)

              const midAngle = ((i + 0.5) * sliceAngle - 90) * (Math.PI / 180)
              const tx = cx + r * 0.66 * Math.cos(midAngle)
              const ty = cy + r * 0.66 * Math.sin(midAngle)
              const rotation = (i + 0.5) * sliceAngle

              const sliceFill = sliceColors[i % sliceColors.length]

              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={sliceFill}
                    stroke={mode === 'vip' ? '#fde047' : '#facc15'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={slot.value === 0 ? '#fecaca' : '#ffffff'}
                    fontSize={slot.value === 0 ? '11' : slot.value >= 100 ? '13' : '14'}
                    fontWeight="900"
                    fontFamily="serif"
                    transform={`rotate(${rotation}, ${tx}, ${ty})`}
                    style={{
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.9))',
                    }}
                  >
                    {slot.value === 0 ? 'Trắng tay' : `+${slot.value}❄️`}
                  </text>
                </g>
              )
            })}

            {/* Vòng trang trí trung tâm (Center Medallion) */}
            <circle
              cx={cx}
              cy={cy}
              r={29}
              fill={mode === 'vip' ? 'url(#vipCenterHub)' : 'url(#centerHub)'}
              stroke="#fde047"
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
            />
            <circle
              cx={cx}
              cy={cy}
              r={21}
              fill={mode === 'vip' ? '#451a03' : '#78350f'}
              stroke="#facc15"
              strokeWidth="1.2"
            />
            <text
              x={cx}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="17"
              fill="#fef08a"
              style={{
                filter: mode === 'vip' ? 'drop-shadow(0 0 5px rgba(251,191,36,0.9))' : 'drop-shadow(0 0 4px rgba(250,204,21,0.8))',
              }}
            >
              {mode === 'vip' ? '👑' : '⭐'}
            </text>
          </svg>
        </motion.div>

        {/* Đèn trang trí xung quanh */}
        <div className="absolute inset-0 pointer-events-none">
          {bulbs.map((b) => (
            <div
              key={b.idx}
              className="absolute w-2 h-2 rounded-full border border-yellow-200/40 shadow-sm animate-pulse"
              style={{
                left: `${(b.bx / 300) * 100}%`,
                top: `${(b.by / 300) * 100}%`,
                backgroundColor: b.color,
                boxShadow: `0 0 8px ${b.color}`,
                transform: 'translate(-50%, -50%)',
                animationDuration: `${1.1 + (b.idx % 3) * 0.35}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
