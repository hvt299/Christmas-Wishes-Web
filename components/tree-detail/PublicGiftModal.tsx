'use client'

import { useEffect } from 'react'
import { Calendar, Check, Clock, Gift, Lock, Sparkles, User, X } from 'lucide-react'
import { TREE_DECORATION_CATALOG } from '@/constants/tree-decorations'
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

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-gift-title"
        >
            <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-amber-200/25 bg-gradient-to-b from-[#182a22] to-[#0c1813] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-7">
                {/* Viền sáng trên cùng */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                {/* Nút đóng */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label="Đóng cửa sổ"
                >
                    <X size={18} />
                </button>

                {/* Tiêu đề & Icon */}
                <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 shadow-[0_0_25px_rgba(251,191,36,0.15)] text-amber-300">
                        <Gift size={28} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/80">
                        Món quà yêu thương
                    </p>
                    <h3 id="public-gift-title" className="mt-1 font-serif text-2xl font-bold text-amber-100">
                        {isOwner ? 'Món Quà Bí Mật' : 'Một Món Quà Đã Gửi'}
                    </h3>
                </div>

                {/* Thẻ người gửi */}
                <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-black/25 p-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300/25 bg-amber-400/10 text-amber-200">
                        {gift.sender?.avatar ? (
                            <img src={gift.sender.avatar} alt={senderName} className="h-full w-full object-cover" />
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
                <div className="mt-3.5 flex items-center justify-between rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{ornamentDef.icon}</span>
                        <div>
                            <p className="text-xs text-white/50">Vật phẩm treo trên cây</p>
                            <p className="font-semibold text-amber-200">{ornamentDef.label}</p>
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
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2.5 text-sm font-bold text-red-950 shadow-lg transition hover:scale-[1.02]"
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
