'use client'

import { useEffect, useState, type FormEvent } from 'react'
import {
    AlertCircle,
    CheckCircle2,
    Gift,
    Heart,
    Send,
    Sparkles,
    X,
    Palette,
} from 'lucide-react'
import type { TreeDecorationType } from '@/types/tree-detail.types'
import TreeDecoration from './TreeDecoration'

export interface SendGiftPayload {
    wishMessage: string
    ornamentType: TreeDecorationType
    theme?: string
}

export interface SendGiftResult {
    giftCreated: true
    wishCreated?: boolean
    warning?: string
}

interface SendGiftModalProps {
    isOpen: boolean
    recipientName: string
    onClose: () => void
    onSubmit: (payload: SendGiftPayload) => Promise<SendGiftResult>
}

const ORNAMENT_OPTIONS: { type: TreeDecorationType; label: string; icon: string; short: string }[] = [
    { type: 'gift_box', label: 'Hộp quà', icon: '🎁', short: 'Hộp quà ấm áp' },
    { type: 'bauble', label: 'Quả châu', icon: '🔴', short: 'Châu pha lê đỏ' },
    { type: 'bell', label: 'Chuông vàng', icon: '🔔', short: 'Chuông Giáng Sinh' },
    { type: 'candy_cane', label: 'Kẹo gậy', icon: '🍬', short: 'Kẹo gậy xoắn' },
    { type: 'snowflake', label: 'Bông tuyết', icon: '❄️', short: 'Bông tuyết băng' },
    { type: 'stocking', label: 'Tất len', icon: '🧦', short: 'Tất đón quà' },
    { type: 'star', label: 'Ngôi sao', icon: '⭐', short: 'Ngôi sao hy vọng' },
    { type: 'envelope', label: 'Thư Giáng Sinh', icon: '💌', short: 'Bao thư yêu thương' },
]

const BOX_COLOR_OPTIONS: { id: string; label: string; bgClass: string; ringColor: string }[] = [
    { id: 'red_box', label: 'Đỏ lễ hội', bgClass: 'bg-red-600', ringColor: 'ring-red-400' },
    { id: 'green_box', label: 'Xanh thông', bgClass: 'bg-emerald-600', ringColor: 'ring-emerald-400' },
    { id: 'gold_box', label: 'Vàng ánh kim', bgClass: 'bg-amber-400', ringColor: 'ring-amber-300' },
    { id: 'blue_box', label: 'Xanh băng giá', bgClass: 'bg-sky-500', ringColor: 'ring-sky-300' },
    { id: 'purple_box', label: 'Tím cực quang', bgClass: 'bg-purple-600', ringColor: 'ring-purple-400' },
]

const QUICK_WISHES = [
    '🎄 Chúc bạn một mùa Giáng Sinh an lành, hạnh phúc và ấm áp bên gia đình!',
    '⭐ Chúc mọi điều ước và hoài bão của bạn trong năm mới sẽ sớm thành hiện thực!',
    '🎁 Mong nụ cười luôn rạng rỡ trên môi bạn mỗi ngày. Giáng Sinh thật vui nhé!',
    '❄️ Chúc bạn mùa đông này không lạnh, luôn được yêu thương và chở che!',
]

export default function SendGiftModal({
    isOpen,
    recipientName,
    onClose,
    onSubmit,
}: SendGiftModalProps) {
    const [wishMessage, setWishMessage] = useState('')
    const [ornamentType, setOrnamentType] = useState<TreeDecorationType>('gift_box')
    const [boxColor, setBoxColor] = useState('red_box')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<SendGiftResult | null>(null)

    useEffect(() => {
        if (!isOpen) return

        setWishMessage('')
        setOrnamentType('gift_box')
        setBoxColor('red_box')
        setError('')
        setResult(null)
        setIsSubmitting(false)
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const previousOverflow = document.body.style.overflow

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) onClose()
        }

        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, isSubmitting, onClose])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const trimmedWish = wishMessage.trim()

        if (!trimmedWish) {
            setError('Vui lòng viết vài dòng thiệp chúc Giáng Sinh gửi đến bạn bè.')
            return
        }

        setError('')
        setIsSubmitting(true)

        try {
            const response = await onSubmit({
                wishMessage: trimmedWish,
                ornamentType,
                theme: boxColor,
            })

            setResult(response)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể gửi món quà. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md"
            onClick={() => !isSubmitting && onClose()}
        >
            <div
                className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-amber-200/20 bg-[#160d12]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-white"
                role="dialog"
                aria-modal="true"
                aria-label="Treo quà lên cây Giáng Sinh"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Viền vàng chuyển sắc trên cùng */}
                <div className="h-1 bg-linear-to-r from-transparent via-amber-300/80 to-transparent" />

                {result ? (
                    <div className="p-8 text-center">
                        {result.wishCreated === false ? (
                            <AlertCircle size={56} className="mx-auto mb-4 text-amber-400" />
                        ) : (
                            <CheckCircle2 size={56} className="mx-auto mb-4 text-emerald-400" />
                        )}

                        <h2 className="font-serif text-2xl font-bold text-yellow-200">
                            {result.wishCreated === false ? 'Món quà đã được gửi!' : 'Gửi quà thành công! ✨'}
                        </h2>

                        <p className="mt-3 text-sm leading-relaxed text-red-100/70">
                            {result.wishCreated === false
                                ? 'Hộp quà đã được treo lên cây thông. Tuy nhiên, lời chúc chưa được lưu thành công.'
                                : `Món quà và thiệp chúc của bạn đã được gắn lộng lẫy lên cây thông của ${recipientName}!`}
                        </p>

                        {result.warning && (
                            <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
                                {result.warning}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 px-8 py-3 text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200"
                        >
                            Hoàn tất
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-amber-200/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/[0.07] text-amber-200">
                                    <Gift size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/60">
                                        Trao gửi yêu thương
                                    </p>
                                    <h2 className="font-serif text-xl font-bold text-amber-100">
                                        Treo quà & gửi thiệp chúc
                                    </h2>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                aria-label="Đóng cửa sổ"
                                className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-amber-100 disabled:opacity-40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            {/* Live Ornament Preview Badge */}
                            <div className="flex items-center justify-between rounded-2xl border border-amber-200/15 bg-black/30 p-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 p-1">
                                        <TreeDecoration
                                            type={ornamentType}
                                            colorClass={boxColor.includes('green') ? 'green' : boxColor.includes('gold') ? 'gold' : boxColor.includes('blue') ? 'blue' : boxColor.includes('purple') ? 'purple' : 'red'}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/60">Vật phẩm treo cây</p>
                                        <p className="font-serif text-sm font-bold text-yellow-200">
                                            {ORNAMENT_OPTIONS.find((o) => o.type === ornamentType)?.short}
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                    Tới: {recipientName}
                                </span>
                            </div>

                            {/* 1. Chọn kiểu trang trí */}
                            <div>
                                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                                    <Sparkles size={14} className="text-amber-400" />
                                    1. Chọn vật trang trí trên cây
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ORNAMENT_OPTIONS.map((option) => {
                                        const isSelected = ornamentType === option.type
                                        return (
                                            <button
                                                key={option.type}
                                                type="button"
                                                onClick={() => setOrnamentType(option.type)}
                                                aria-pressed={isSelected}
                                                className={`flex flex-col items-center gap-1 rounded-2xl border p-2.5 transition ${
                                                    isSelected
                                                        ? 'border-amber-300 bg-amber-400/15 shadow-md shadow-amber-400/10 ring-2 ring-amber-300/40'
                                                        : 'border-white/10 bg-black/25 hover:border-white/20 hover:bg-white/5'
                                                }`}
                                            >
                                                <span className="text-2xl">{option.icon}</span>
                                                <span className="text-center text-[11px] font-semibold text-white/80">
                                                    {option.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 2. Chọn màu sắc chủ đạo */}
                            <div>
                                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                                    <Palette size={14} className="text-amber-400" />
                                    2. Sắc màu hộp quà
                                </label>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    {BOX_COLOR_OPTIONS.map((c) => {
                                        const isSelected = boxColor === c.id
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setBoxColor(c.id)}
                                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                                    isSelected
                                                        ? `border-amber-300 bg-white/15 ring-2 ${c.ringColor} text-white`
                                                        : 'border-white/10 bg-black/20 text-white/60 hover:border-white/25'
                                                }`}
                                            >
                                                <span className={`h-3 w-3 rounded-full ${c.bgClass}`} />
                                                <span>{c.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 3. Lời chúc Giáng Sinh viết tay (Bắt buộc - Duy nhất) */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="gift-wish-input" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                                        <Heart size={14} className="text-red-400" />
                                        3. Thiệp chúc viết tay
                                        <span className="text-red-400">*</span>
                                    </label>
                                    <span className="text-[10px] text-white/40">{wishMessage.length}/1000 ký tự</span>
                                </div>
                                <textarea
                                    id="gift-wish-input"
                                    value={wishMessage}
                                    onChange={(e) => setWishMessage(e.target.value)}
                                    maxLength={1000}
                                    rows={3}
                                    required
                                    placeholder="Viết những lời chúc chân thành, tâm tư ấm áp nhất gửi đến chủ cây..."
                                    disabled={isSubmitting}
                                    className="w-full resize-none rounded-xl border border-amber-200/15 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-amber-200/40 focus:ring-2 focus:ring-amber-200/6 disabled:opacity-50"
                                />

                                {/* Gợi ý lời chúc nhanh */}
                                <div className="mt-2 space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-amber-200/60 font-semibold">Gợi ý nhanh:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_WISHES.map((chip, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setWishMessage(chip)}
                                                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition hover:border-amber-300/40 hover:bg-white/10 hover:text-white"
                                            >
                                                {chip.slice(0, 32)}...
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-200" role="alert">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Actions Buttons */}
                            <div className="flex items-center justify-end gap-3 border-t border-amber-200/10 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/40 bg-black/25 px-5 py-2.5 text-sm font-semibold text-yellow-100 transition duration-300 hover:border-yellow-300/70 hover:bg-yellow-400/10 disabled:opacity-40"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !wishMessage.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 px-6 py-2.5 text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Sparkles size={16} className="animate-spin" />
                                            <span>Đang gửi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Treo lên cây</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
