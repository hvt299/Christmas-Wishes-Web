'use client'

import { useEffect } from 'react'
import { Calendar, Check, Clock, Gift, Lock, Sparkles, User, X } from 'lucide-react'
import { TREE_DECORATION_CATALOG } from '@/constants/tree-decorations'
import { getGiftColorClass, renderDecorationSvg } from '@/components/tree-detail/TreeDecoration'
import type { TreeDecorationType, TreeGift } from '@/types/tree-detail.types'

interface PublicGiftModalProps {
    isOpen: boolean
    gift: TreeGift | null
    treeYear?: number
    isOwner?: boolean
    onClose: () => void
    onOpenSendGift?: () => void
    canSendGift?: boolean
}

const COLOR_LABELS: Record<string, { label: string; badgeClass: string }> = {
    red: { label: 'Sắc Đỏ Giáng Sinh', badgeClass: 'border-red-400/30 bg-red-500/15 text-red-200' },
    green: { label: 'Sắc Xanh Thông', badgeClass: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200' },
    gold: { label: 'Sắc Vàng Kim', badgeClass: 'border-amber-400/30 bg-amber-500/15 text-amber-200' },
    blue: { label: 'Sắc Lam Băng Tuyết', badgeClass: 'border-sky-400/30 bg-sky-500/15 text-sky-200' },
    purple: { label: 'Sắc Tím Cực Quang', badgeClass: 'border-purple-400/30 bg-purple-500/15 text-purple-200' },
}

const getVietnamDate = (date?: string | null) => {
    if (!date || Number.isNaN(new Date(date).getTime())) return 'Gần đây'

    return new Date(date).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function PublicGiftModal({
    isOpen,
    gift,
    treeYear = new Date().getFullYear(),
    isOwner = false,
    onClose,
    onOpenSendGift,
    canSendGift = false,
}: PublicGiftModalProps) {
    useEffect(() => {
        if (!isOpen) return

        const previousOverflow = document.body.style.overflow

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }

        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen || !gift) return null

    const senderName = gift.sender?.fullName || gift.sender?.username || 'Người bí ẩn 🎅'
    const ornamentType = (gift.ornamentType || gift.gift?.ornamentType || 'gift_box') as TreeDecorationType
    const ornamentDef = TREE_DECORATION_CATALOG[ornamentType] || TREE_DECORATION_CATALOG.gift_box
    const rawTheme = gift.theme || gift.gift?.theme
    const colorClass = getGiftColorClass(rawTheme)
    const colorInfo = COLOR_LABELS[colorClass] || COLOR_LABELS.red

    return (
        <div
            className="fixed inset-0 z-120 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-gift-title"
        >
            <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-amber-200/25 bg-linear-to-b from-[#182a22] to-[#0c1813] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-7">
                {/* Viền sáng trên cùng */}
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent" />

                {/* Nút đóng */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label="Đóng cửa sổ"
                >
                    <X size={18} />
                </button>

                {/* Tiêu đề & Món quà thật sự kèm màu sắc */}
                <div className="text-center">
                    <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-300/30 bg-linear-to-b from-amber-400/15 to-black/40 p-3.5 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                        <div className="h-full w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                            {renderDecorationSvg(ornamentType, colorClass)}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/80">
                            Món quà yêu thương
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorInfo.badgeClass}`}>
                            {colorInfo.label}
                        </span>
                    </div>
                    <h3 id="public-gift-title" className="mt-1 font-serif text-2xl font-bold text-amber-100">
                        {isOwner ? 'Món Quà Bí Mật' : 'Một Món Quà Đã Gửi'}
                    </h3>
                </div>

                {/* Thẻ người gửi */}
                <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-black/25 p-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300/25 bg-amber-400/10 text-amber-200">
                        {gift.sender?.avatar ? (
                            <img src={gift.sender.avatar} alt={senderName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <User size={22} />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Người gửi</p>
                        <p className="truncate font-semibold text-amber-100 sm:text-base">{senderName}</p>
                        <p className="flex items-center gap-1.5 text-xs text-white/50">
                            <Clock size={12} />
                            {getVietnamDate(gift.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Thẻ vật phẩm trang trí trên cây */}
                <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/35 p-2 shadow-inner">
                            <div className="h-full w-full">
                                {renderDecorationSvg(ornamentType, colorClass)}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-white/50">Vật phẩm treo trên cây</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-serif text-sm font-bold text-amber-200">{ornamentDef.label}</p>
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorInfo.badgeClass}`}>
                                    {colorInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Sparkles size={16} className="text-amber-300/60" />
                </div>

                {/* Hộp quà niêm phong */}
                <div className="mt-5 rounded-2xl border border-yellow-300/20 bg-black/35 p-5 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
                        <Lock size={18} />
                    </div>
                    <h4 className="mt-3 font-serif text-lg font-bold text-amber-100">
                        {isOwner ? 'Bí mật đang được niêm phong' : 'Dành riêng cho chủ cây'}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-emerald-100/70 sm:text-sm">
                        {isOwner
                            ? `Nội dung món quà và lời chúc thân thương sẽ mở khóa vào đúng 00:00 ngày 25/12/${treeYear} (giờ Việt Nam).`
                            : 'Nội dung chi tiết của món quà và lời chúc chỉ dành riêng cho chủ nhân cây thông khám phá vào đêm Giáng Sinh.'}
                    </p>
                </div>

                {/* Nút hành động */}
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                        <Check size={16} />
                        Đóng
                    </button>
                    {canSendGift && onOpenSendGift && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose()
                                onOpenSendGift()
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-amber-300/50 bg-linear-to-r from-amber-400 to-yellow-300 px-4 py-2.5 text-sm font-bold text-red-950 shadow-lg transition hover:scale-[1.02]"
                        >
                            <Gift size={16} />
                            Gửi quà của bạn
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
