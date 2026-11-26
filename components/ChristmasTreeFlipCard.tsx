'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Gift, Calendar, Sparkles, RefreshCw, TreePine } from 'lucide-react'

interface ChristmasTreeFlipCardProps {
  isDecember: boolean
  isChristmasSeason: boolean
  currentYear: number | null
  /** Cho phép tắt tính năng lật thẻ để quay về giao diện tĩnh cũ */
  enableFlip?: boolean
}

export default function ChristmasTreeFlipCard({
  isDecember,
  isChristmasSeason,
  currentYear,
  enableFlip = true,
}: ChristmasTreeFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Chỉ cho phép lật khi đang trong mùa Giáng Sinh (25/12 - 31/12)
  const canFlip = isChristmasSeason && enableFlip

  // Giao diện tĩnh nguyên bản (Mặt trước)
  const renderFrontContent = () => {
    if (isDecember) {
      return (
        <div className="w-full rounded-2xl border border-yellow-400/25 bg-black/35 p-5 text-center shadow-2xl backdrop-blur-xl md:p-6">
          <div className="relative mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/50 bg-gradient-to-br from-red-800 to-red-950 shadow-[0_0_25px_rgba(234,179,8,0.15)]">
              <Gift className="h-9 w-9 text-yellow-300" />
            </div>
            {canFlip && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFlipped(true)
                }}
                title="Lật thẻ xem cây thông lung linh"
                aria-label="Lật thẻ xem cây thông lung linh"
                className="absolute right-0 top-0 flex items-center gap-1 rounded-full border border-yellow-300/40 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-yellow-200 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:border-yellow-300 hover:text-yellow-100"
              >
                <RefreshCw className="h-3 w-3 animate-spin text-yellow-300" style={{ animationDuration: '8s' }} />
                <span>Xem cây</span>
              </button>
            )}
          </div>

          <h2 className="mb-3 font-serif text-xl font-bold text-yellow-300 md:text-2xl">Cây Giáng Sinh</h2>
          <p className="text-sm leading-relaxed text-red-100/90">Mỗi mùa lễ hội, một cây quà mới, lưu giữ yêu thương qua năm tháng.</p>

          <div className="my-5 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

          <div className="space-y-3 text-left text-sm text-white/80">
            <p className="flex items-start gap-3"><span className="text-xl">🎄</span><span>Mỗi năm một cây, lưu giữ kỷ niệm riêng.</span></p>
            <p className="flex items-start gap-3"><span className="text-xl">🎁</span><span>Chia sẻ cây để bạn bè gửi quà và lời chúc.</span></p>
            <p className="flex items-start gap-3"><span className="text-xl">🔒</span><span>Mở quà sau ngày 25/12, giữ trọn bất ngờ.</span></p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full rounded-2xl border border-yellow-400/25 bg-black/40 p-5 text-center shadow-2xl backdrop-blur-xl md:p-6">
        <div className="relative mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/40 bg-gradient-to-br from-amber-700/60 to-red-950/80 shadow-[0_0_25px_rgba(234,179,8,0.15)]">
            <Calendar className="h-8 w-8 text-yellow-300" />
          </div>
        </div>

        <h2 className="mb-2 font-serif text-xl font-bold text-yellow-300 md:text-2xl">
          Hẹn Bạn Vào Tháng 12!
        </h2>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-yellow-400/35 to-transparent" />

        <div className="space-y-2.5 text-left text-xs sm:text-sm text-white/80">
          <p className="flex items-start gap-2.5">
            <span className="text-base">🎄</span>
            <span>Tạo và trang trí cây thông kỷ niệm riêng cho năm {currentYear ?? ''}.</span>
          </p>
          <p className="flex items-start gap-2.5">
            <span className="text-base">🎁</span>
            <span>Gửi và nhận những phần quà bất ngờ cùng lời chúc ấm áp.</span>
          </p>
          <p className="flex items-start gap-2.5">
            <span className="text-base">❄️</span>
            <span>Săn bông tuyết và tham gia các trò chơi nhận thưởng giới hạn.</span>
          </p>
        </div>
      </div>
    )
  }

  // Nếu không đủ điều kiện lật (chưa tới 25/12 hoặc tắt flip), trả về giao diện tĩnh 100%
  if (!canFlip) {
    return renderFrontContent()
  }

  return (
    <div
      className="group relative w-full [perspective:1200px]"
      style={{ minHeight: '330px' }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 ease-out [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* MẶT TRƯỚC (FRONT) - GIỮ NGUYÊN NỘI DUNG GỐC */}
        <div
          className="w-full [backface-visibility:hidden] cursor-pointer"
          onClick={() => setIsFlipped(true)}
        >
          {renderFrontContent()}
        </div>

        {/* MẶT SAU (BACK) - CÂY THÔNG GIF LUNG LINH */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl border border-yellow-400/35 bg-gradient-to-b from-red-950/90 via-black/75 to-green-950/85 p-5 text-center shadow-2xl backdrop-blur-xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-between cursor-pointer"
          onClick={() => setIsFlipped(false)}
        >
          {/* HEADER MẶT SAU */}
          <div className="flex w-full items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-300">
              <TreePine className="h-4 w-4 text-green-400" />
              <span>Cây Thông Diệu Kỳ</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsFlipped(false)
              }}
              title="Quay lại thông tin"
              aria-label="Quay lại thông tin"
              className="flex items-center gap-1 rounded-full border border-yellow-300/40 bg-black/50 px-2 py-0.5 text-[11px] font-medium text-yellow-200 transition-all hover:scale-105 hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Lật lại</span>
            </button>
          </div>

          {/* HÌNH ẢNH CÂY THÔNG GIF */}
          <div className="relative my-auto flex items-center justify-center py-2">
            <div className="relative">
              <img
                src="/images/christmas-tree.gif"
                alt="Cây thông Giáng Sinh lung linh"
                className="max-h-48 w-auto object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.35)] transition-transform duration-300 group-hover:scale-105"
                draggable={false}
              />
              {/* Ánh sáng lung linh nhẹ bao quanh cây */}
              <div className="pointer-events-none absolute inset-0 -m-2 rounded-full bg-yellow-400/10 blur-xl" />
            </div>
          </div>

          {/* FOOTER MẶT SAU */}
          <div className="w-full">
            <p className="font-serif text-sm font-semibold text-yellow-200">
              Chúc Bạn Một Mùa Noel Ấm Áp
            </p>
            <p className="mt-1 text-[11px] text-white/60">
              Nhấn vào thẻ để quay lại thông tin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
