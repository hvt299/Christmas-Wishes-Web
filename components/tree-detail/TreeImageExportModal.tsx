'use client'

// components/tree-detail/TreeImageExportModal.tsx
// Modal xuất hình ảnh cây thông Giáng Sinh dạng PNG / JPG tinh tế, gọn gàng, đậm chất thiệp Giáng Sinh
import { useState, useRef, useMemo } from 'react'
import { toPng, toJpeg } from 'html-to-image'
import { X, Download, Sparkles, Check, Loader2, Image, Camera, Snowflake } from 'lucide-react'
import ChristmasTreeScene from './ChristmasTreeScene'
import { getThemeConfig } from '@/constants/tree-decorations'
import type { TreeDetail, TreeGift, TreeTheme } from '@/types/tree-detail.types'

interface Props {
  isOpen: boolean
  tree: TreeDetail
  visibleGifts: TreeGift[]
  currentPage: number
  totalPages: number
  onClose: () => void
}

export default function TreeImageExportModal({
  isOpen,
  tree,
  visibleGifts,
  currentPage,
  totalPages,
  onClose,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [format, setFormat] = useState<'png' | 'jpg'>('png')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const activeTheme = (tree.theme || 'classic') as TreeTheme
  const themeConfig = getThemeConfig(activeTheme)
  const ownerName = tree.owner?.fullName || 'Chủ cây'

  // Danh sách tên người gửi có quà ở trang hiện tại (lọc duy nhất, tối đa 6 tên hiển thị tinh tế)
  const givers = useMemo(() => {
    const names = new Set<string>()
    for (const g of visibleGifts) {
      const sender = g.sender?.fullName || g.sender?.username || (g as any)?.senderName
      if (sender) names.add(sender)
    }
    return Array.from(names)
  }, [visibleGifts])

  if (!isOpen) return null

  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return
    setIsExporting(true)
    setExportSuccess(false)

    try {
      // Đợi render font/image ổn định
      await new Promise((r) => setTimeout(r, 150))

      const node = cardRef.current
      const width = node.offsetWidth
      const height = node.offsetHeight

      const dataUrl =
        format === 'png'
          ? await toPng(node, {
              cacheBust: true,
              pixelRatio: 2,
              backgroundColor: '#0f0506',
              width,
              height,
              style: {
                margin: '0',
                transform: 'none',
              },
            })
          : await toJpeg(node, {
              quality: 0.95,
              pixelRatio: 2,
              backgroundColor: '#0f0506',
              width,
              height,
              style: {
                margin: '0',
                transform: 'none',
              },
            })

      const fileName = `${tree.name.replace(/\s+/g, '-').toLowerCase()}-${tree.year}${
        totalPages > 1 ? `-trang-${currentPage}` : ''
      }.${format}`

      const link = document.createElement('a')
      link.download = fileName
      link.href = dataUrl
      link.click()

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch {
      /* noop */
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 px-3 py-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border-2 border-yellow-400/50 bg-[#160608] text-white shadow-[0_0_80px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-yellow-400/15 px-5 py-3.5 bg-black/30">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-yellow-300" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-yellow-200">
              Xuất Ảnh Thiệp Cây Thông
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Format selector pills */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-white/60 font-medium">Định dạng ảnh:</span>
            <div className="inline-flex rounded-full border border-yellow-400/25 bg-black/40 p-1">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`rounded-full px-3 py-1 font-bold transition ${
                  format === 'png'
                    ? 'bg-amber-400 text-red-950 shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                PNG (Nét cao)
              </button>
              <button
                type="button"
                onClick={() => setFormat('jpg')}
                className={`rounded-full px-3 py-1 font-bold transition ${
                  format === 'jpg'
                    ? 'bg-amber-400 text-red-950 shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                JPG (Nhẹ)
              </button>
            </div>
          </div>

          {/* THE CARD TO EXPORT (Render preview + export target) */}
          <div className="flex justify-center overflow-x-auto p-1">
            <div
              ref={cardRef}
              className="relative box-border w-[400px] max-w-full overflow-hidden rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-b from-[#1c0609] via-[#0d1612] to-[#06100b] p-4 text-center select-none shadow-[0_0_30px_rgba(234,179,8,0.15)]"
            >
              {/* Decorative Frame */}
              <div className="pointer-events-none absolute inset-2 rounded-xl border border-yellow-400/35" />
              <div className="pointer-events-none absolute inset-3 rounded-lg border border-yellow-400/20" />

              {/* Sparkle corner accents */}
              <span className="absolute top-3 left-3 text-xs text-yellow-300 opacity-60">✨</span>
              <span className="absolute top-3 right-3 text-xs text-yellow-300 opacity-60">✨</span>

              {/* Card Header */}
              <div className="relative pt-2 pb-1">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-300/80">
                  <Snowflake className="h-3 w-3 animate-spin" />
                  <span>Giáng Sinh {tree.year}</span>
                  <Snowflake className="h-3 w-3 animate-spin" />
                </div>

                <h4 className="mt-1 font-serif text-lg sm:text-xl font-black text-yellow-200 drop-shadow">
                  🎄 {tree.name}
                </h4>

                <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-white/70">
                  <span>Chủ cây: <strong className="text-yellow-100">{ownerName}</strong></span>
                  {totalPages > 1 && (
                    <>
                      <span>·</span>
                      <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-yellow-200 font-bold">
                        Trang {currentPage}/{totalPages}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* The Tree Scene Centerpiece */}
              <div className="relative mx-auto my-1 max-w-[320px] pointer-events-none">
                <ChristmasTreeScene
                  theme={activeTheme}
                  tree={tree}
                  gifts={visibleGifts}
                  items={visibleGifts}
                />
              </div>

              {/* Card Footer: Givers info (Clean, not cluttered) */}
              <div className="relative pt-1 pb-1 border-t border-yellow-400/20 text-xs">
                {givers.length > 0 ? (
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                      🎁 Món quà gửi từ
                    </p>
                    <p className="text-[11px] font-semibold text-yellow-200 line-clamp-2 px-3">
                      {givers.slice(0, 5).join(' · ')}
                      {givers.length > 5 ? ` và ${givers.length - 5} bạn khác` : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] italic text-yellow-100/70">
                    Trao gửi yêu thương · Gói trọn an lành
                  </p>
                )}

                <p className="mt-1 text-[9px] tracking-widest uppercase text-white/30">
                  Christmas Wishes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="border-t border-white/10 bg-black/40 px-5 py-3.5 flex items-center justify-between gap-3">
          <p className="text-[11px] text-white/50">
            {exportSuccess ? (
              <span className="inline-flex items-center gap-1 text-green-300 font-semibold">
                <Check className="h-3.5 w-3.5" /> Đã tải ảnh thành công!
              </span>
            ) : (
              'Ảnh sắc nét, sẵn sàng chia sẻ'
            )}
          </p>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-full border border-yellow-400/50 bg-gradient-to-r from-yellow-500 to-amber-400 px-5 py-2 text-xs sm:text-sm font-bold text-red-950 shadow-md transition hover:scale-105 hover:from-yellow-400 hover:to-yellow-300 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xử lý ảnh...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Tải ảnh {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
