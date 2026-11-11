'use client'

import { useCallback, useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import {
    CalendarDays,
    Gift,
    Heart,
    Mail,
    Sparkles,
    User,
    X,
} from 'lucide-react'
import type { TreeDecorationType, TreeGiftContent, TreeWishContent } from '@/types/tree-detail.types'
import { TREE_DECORATION_CATALOG } from '@/constants/tree-decorations'
import GiftOpeningAnimation from './GiftOpeningAnimation'

interface GiftRevealModalProps {
    isOpen: boolean
    giftContent: TreeGiftContent | null
    wish: TreeWishContent | null
    senderName: string
    senderAvatar?: string | null
    createdAt?: string | null
    ornamentType?: TreeDecorationType
    giftColor?: 'red' | 'green' | 'gold' | 'blue' | 'purple'
    onClose: () => void
}

export default function GiftRevealModal({
    isOpen,
    giftContent,
    wish,
    senderName,
    senderAvatar,
    createdAt,
    ornamentType = 'gift_box',
    giftColor = 'red',
    onClose,
}: GiftRevealModalProps) {
    const [isOpening, setIsOpening] = useState(false)
    const [showContent, setShowContent] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsOpening(true)
            setShowContent(false)
        } else {
            setIsOpening(false)
            setShowContent(false)
        }
    }, [isOpen])

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

    const handleOpeningComplete = useCallback(() => {
        setIsOpening(false)
        setShowContent(true)

        // Pháo hoa giấy chúc mừng Giáng Sinh
        try {
            const colors = ['#f59e0b', '#ef4444', '#10b981', '#38bdf8', '#ffffff']
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors,
            })
        } catch {
            // Ignore if canvas unavailable
        }
    }, [])

    if (!isOpen) return null

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null

    const ornamentInfo = TREE_DECORATION_CATALOG[ornamentType] || TREE_DECORATION_CATALOG.gift_box
    const displayMessage = wish?.message || giftContent?.content || 'Giáng Sinh an lành và hạnh phúc bên gia đình! ✨'

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-amber-200/20 bg-[#160d12]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-white"
                role="dialog"
                aria-modal="true"
                aria-label="Khám phá món quà Giáng Sinh"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Viền vàng chuyển sắc trên cùng */}
                <div className="h-1 bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

                {/* Giai đoạn 1: Hộp quà rung lắc mở nắp */}
                {isOpening && (
                    <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                        <GiftOpeningAnimation
                            isOpening={isOpening}
                            onComplete={handleOpeningComplete}
                            giftColor={giftColor}
                        />
                        <div className="mt-6 flex items-center gap-2 text-yellow-200">
                            <Sparkles className="animate-spin text-amber-300" size={18} />
                            <h2 className="font-serif text-xl font-bold">Đang mở món quà bí mật...</h2>
                            <Sparkles className="animate-spin text-amber-300" size={18} />
                        </div>
                        <p className="mt-1 text-xs text-red-100/60">
                            Điều kỳ diệu Giáng Sinh đang được mở ra dành riêng cho bạn!
                        </p>
                    </div>
                )}

                {/* Giai đoạn 2: Thiệp chúc mừng mở ra */}
                {showContent && (
                    <div>
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-amber-200/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/[0.07] text-amber-200">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/60">
                                        Món quà đã hé lộ
                                    </p>
                                    <h2 className="font-serif text-xl font-bold text-amber-100">
                                        Giáng Sinh An Lành ✨
                                    </h2>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Đóng cửa sổ"
                                className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-amber-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            {/* Thẻ người gửi */}
                            <div className="flex items-center gap-3.5 rounded-2xl border border-amber-200/15 bg-black/30 p-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300/25 bg-amber-400/10">
                                    {senderAvatar ? (
                                        <img
                                            src={senderAvatar}
                                            alt={senderName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-serif text-lg font-bold text-yellow-300">
                                            {senderName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Gửi từ</p>
                                    <p className="truncate font-serif text-base font-bold text-amber-100">
                                        {senderName}
                                    </p>
                                    {formattedDate && (
                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                                            <CalendarDays size={12} />
                                            <span>{formattedDate}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl">{ornamentInfo.icon}</span>
                                    <span className="mt-0.5 text-[10px] text-white/50">{ornamentInfo.label}</span>
                                </div>
                            </div>

                            {/* Thiệp viết tay */}
                            <div className="rounded-2xl border border-amber-200/20 bg-[#fef8ea] p-5 text-gray-900 shadow-lg">
                                <div className="mb-3 flex items-center justify-between border-b border-amber-200/60 pb-2">
                                    <div className="flex items-center gap-2 text-red-900">
                                        <Mail size={16} />
                                        <span className="font-serif text-xs font-bold uppercase tracking-widest">
                                            Thiệp chúc viết tay
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-red-700">
                                        <Heart size={14} fill="currentColor" />
                                        <span>With love</span>
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed text-gray-800 italic">
                                    "{displayMessage}"
                                </p>
                                <div className="mt-3 text-right">
                                    <p className="font-serif text-xs font-bold text-red-950">
                                        — {senderName}
                                    </p>
                                </div>
                            </div>

                            {/* Nút đóng / Cảm ơn */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3 font-serif text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200"
                                >
                                    Cảm ơn món quà ❤️
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
