'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import {
    CalendarDays,
    Gift,
    Heart,
    Mail,
    Snowflake,
    Sparkles,
    User,
    X,
} from 'lucide-react'
import type { TreeDecorationType, TreeGiftContent, TreeWishContent } from '@/types/tree-detail.types'
import { TREE_DECORATION_CATALOG } from '@/constants/tree-decorations'
import { renderDecorationSvg } from './TreeDecoration'
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

const CONFETTI_COLORS: Record<NonNullable<GiftRevealModalProps['giftColor']>, string[]> = {
    red: ['#ff0000', '#00ff00', '#ffffff'],
    green: ['#22c55e', '#bbf7d0', '#fde047', '#ffffff'],
    gold: ['#FFD700', '#FFA500', '#FFFFFF'],
    blue: ['#38bdf8', '#bae6fd', '#ffffff'],
    purple: ['#c084fc', '#e9d5ff', '#2dd4bf', '#ffffff'],
}

const COLOR_LABELS: Record<string, { label: string; badgeClass: string }> = {
    red: { label: 'Sắc Đỏ Giáng Sinh', badgeClass: 'border-red-400/30 bg-red-500/20 text-red-100' },
    green: { label: 'Sắc Xanh Thông', badgeClass: 'border-emerald-400/30 bg-emerald-500/20 text-emerald-100' },
    gold: { label: 'Sắc Vàng Kim', badgeClass: 'border-amber-400/30 bg-amber-500/20 text-amber-100' },
    blue: { label: 'Sắc Lam Băng Tuyết', badgeClass: 'border-sky-400/30 bg-sky-500/20 text-sky-100' },
    purple: { label: 'Sắc Tím Cực Quang', badgeClass: 'border-purple-400/30 bg-purple-500/20 text-purple-100' },
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
    const rafRef = useRef(0)

    useEffect(() => {
        if (isOpen) {
            setIsOpening(true)
            setShowContent(false)
        } else {
            setIsOpening(false)
            setShowContent(false)
        }
    }, [isOpen])

    // Dừng vòng lặp confetti khi đóng modal hoặc unmount
    useEffect(() => {
        if (!isOpen) cancelAnimationFrame(rafRef.current)
        return () => cancelAnimationFrame(rafRef.current)
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
            const colors = CONFETTI_COLORS[giftColor]

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 }, colors, zIndex: 200 })
                return
            }

            const end = Date.now() + 3000
            const frame = () => {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors, zIndex: 200 })
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors, zIndex: 200 })
                if (Date.now() < end) rafRef.current = requestAnimationFrame(frame)
            }
            frame()
        } catch {
            // Ignore if canvas unavailable
        }
    }, [giftColor])

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
    const colorInfo = COLOR_LABELS[giftColor] || COLOR_LABELS.red
    const displayMessage = wish?.message || giftContent?.content || 'Giáng Sinh an lành và hạnh phúc bên gia đình! ✨'
    const displaySender = senderName?.trim() || 'Người bí ẩn 🎅'

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md"
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
                <div className="h-1 bg-linear-to-r from-transparent via-amber-300/80 to-transparent" />

                {/* Giai đoạn 1: Hộp quà rung lắc mở nắp */}
                {isOpening && (
                    <div className="flex min-h-90 flex-col items-center justify-center p-8 text-center">
                        <GiftOpeningAnimation
                            isOpening={isOpening}
                            onComplete={handleOpeningComplete}
                            giftColor={giftColor}
                        />
                        <div className="mt-6 flex items-center gap-2 text-yellow-200">
                            <Sparkles className="animate-spin text-amber-300 motion-reduce:animate-none" size={18} />
                            <h2 className="font-serif text-xl font-bold">Đang mở món quà bí mật...</h2>
                            <Sparkles className="animate-spin text-amber-300 motion-reduce:animate-none" size={18} />
                        </div>
                        <p className="mt-1 text-xs text-red-100/60">
                            Điều kỳ diệu Giáng Sinh đang được mở ra dành riêng cho bạn!
                        </p>
                    </div>
                )}

                {/* Giai đoạn 2: Thiệp chúc mừng mở ra */}
                {showContent && (
                    <div className="origin-top animate-[cw-gift-letter-open_0.75s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none">
                        {/* Header Modal: Món quà thật sự và màu sắc */}
                        <div
                            className={`cw-tree-decoration--${giftColor} relative flex items-center justify-between overflow-hidden border-b border-amber-200/10 px-6 py-5`}
                            style={{ background: 'linear-gradient(130deg, var(--cw-gift-shadow), var(--cw-gift-color))' }}
                        >
                            <Snowflake className="pointer-events-none absolute left-2 top-2 h-6 w-6 animate-spin text-white/25 [animation-duration:14s] motion-reduce:animate-none" />
                            <Snowflake className="pointer-events-none absolute bottom-2 right-14 h-8 w-8 animate-pulse text-white/20 motion-reduce:animate-none" />

                            <div className="relative flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-black/30 p-2 shadow-inner">
                                    <div className="h-full w-full drop-shadow">
                                        {renderDecorationSvg(ornamentType, giftColor)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/80">
                                            Món quà đã hé lộ
                                        </p>
                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorInfo.badgeClass}`}>
                                            {colorInfo.label}
                                        </span>
                                    </div>
                                    <h2 className="font-serif text-lg font-bold text-amber-100 sm:text-xl">
                                        {ornamentInfo.label} ✨
                                    </h2>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Đóng cửa sổ"
                                className="relative rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-amber-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            {/* Thẻ người gửi & Món quà */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/15 bg-black/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300/25 bg-amber-400/10">
                                        {senderAvatar ? (
                                            <img
                                                src={senderAvatar}
                                                alt={displaySender}
                                                className="h-full w-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <span className="font-serif text-lg font-bold text-yellow-300">
                                                {Array.from(displaySender)[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Gửi từ</p>
                                        <p className="truncate font-serif text-base font-bold text-amber-100">
                                            {displaySender}
                                        </p>
                                        {formattedDate && (
                                            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                                                <CalendarDays size={12} />
                                                <span>{formattedDate}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                                    <div className="h-8 w-8 shrink-0">
                                        {renderDecorationSvg(ornamentType, giftColor)}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-serif text-xs font-bold text-amber-100">{ornamentInfo.label}</p>
                                        <p className="text-[10px] text-amber-200/70">{colorInfo.label}</p>
                                    </div>
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
                                <p className="whitespace-pre-wrap wrap-break-word font-handwriting text-2xl leading-relaxed text-gray-800">
                                    “{displayMessage}”
                                </p>
                                <div className="mt-3 text-right">
                                    <p className="font-handwriting text-lg font-bold text-red-950">
                                        — {displaySender}
                                    </p>
                                </div>
                            </div>

                            {/* Nút đóng / Cảm ơn */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 px-6 py-3 font-serif text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200"
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