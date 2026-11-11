'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Check, Loader2, Sparkles, X, Palette, TreePine } from 'lucide-react'
import type { TreeTheme } from '@/types/tree-detail.types'

interface EditTreeModalProps {
    isOpen: boolean
    treeName: string
    treeTheme: TreeTheme
    onClose: () => void
    onSubmit: (payload: { name: string; theme: TreeTheme }) => Promise<void>
}

const THEME_OPTIONS: {
    key: TreeTheme
    name: string
    tagline: string
    icon: string
    previewGradient: string
}[] = [
    {
        key: 'classic',
        name: 'Cổ điển',
        tagline: 'Lá thông xanh đậm, chuông vàng và quả đỏ truyền thống',
        icon: '🎄',
        previewGradient: 'from-emerald-950/70 via-[#103823] to-[#071d12]',
    },
    {
        key: 'winter',
        name: 'Mùa đông tuyết',
        tagline: 'Tuyết phủ trắng cành thông, sao bạc và ánh sáng xanh băng',
        icon: '❄️',
        previewGradient: 'from-sky-950/70 via-[#102d42] to-[#071624]',
    },
    {
        key: 'aurora',
        name: 'Ánh cực quang',
        tagline: 'Sắc tím ngọc huyền ảo dưới dải cực quang phương Bắc',
        icon: '✨',
        previewGradient: 'from-indigo-950/70 via-[#221038] to-[#0a1820]',
    },
]

export default function EditTreeModal({
    isOpen,
    treeName: initialName,
    treeTheme: initialTheme,
    onClose,
    onSubmit,
}: EditTreeModalProps) {
    const [name, setName] = useState(initialName)
    const [theme, setTheme] = useState<TreeTheme>(initialTheme)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setName(initialName)
            setTheme(initialTheme)
            setError('')
            setIsSubmitting(false)
        }
    }, [isOpen, initialName, initialTheme])

    useEffect(() => {
        if (!isOpen) return

        const prevOverflow = document.body.style.overflow
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSubmitting) onClose()
        }

        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = prevOverflow
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, isSubmitting, onClose])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) {
            setError('Vui lòng nhập tên cây Giáng Sinh.')
            return
        }

        setError('')
        setIsSubmitting(true)

        try {
            await onSubmit({ name: trimmed, theme })
            onClose()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Không thể cập nhật cây. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md"
            onClick={() => !isSubmitting && onClose()}
        >
            <div
                className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-amber-200/20 bg-[#160d12]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-white"
                role="dialog"
                aria-modal="true"
                aria-label="Chỉnh sửa cây Giáng Sinh"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Viền vàng chuyển sắc trên cùng */}
                <div className="h-1 bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-200/10 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/[0.07] text-amber-200">
                            <Palette size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/60">
                                Tùy chỉnh cây
                            </p>
                            <h2 className="font-serif text-xl font-bold text-amber-100">
                                Chỉnh sửa cây Giáng Sinh
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
                    {/* Tree Name Input */}
                    <div>
                        <label htmlFor="edit-tree-name-input" className="mb-2 block text-sm font-semibold text-amber-100/90">
                            Tên cây Giáng Sinh <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="edit-tree-name-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            disabled={isSubmitting}
                            required
                            placeholder="Ví dụ: Cây Ước Nguyện Của Tôi"
                            className="w-full rounded-xl border border-amber-200/15 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-amber-200/40 focus:ring-2 focus:ring-amber-200/[0.06] disabled:opacity-50"
                        />
                        <p className="mt-1.5 text-right text-xs text-white/35">
                            {name.length}/100 ký tự
                        </p>
                    </div>

                    {/* Theme Selector */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-amber-100/90">
                            Chọn phong cách cây (3 chủ đề)
                        </label>
                        <div className="space-y-2.5">
                            {THEME_OPTIONS.map((opt) => {
                                const isSelected = theme === opt.key
                                return (
                                    <div
                                        key={opt.key}
                                        onClick={() => !isSubmitting && setTheme(opt.key)}
                                        className={`group relative flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-amber-300/80 bg-gradient-to-r ' + opt.previewGradient + ' shadow-lg shadow-black/40 ring-2 ring-amber-300/30'
                                                : 'border-white/10 bg-black/25 hover:border-white/20 hover:bg-black/35'
                                        }`}
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl">
                                            {opt.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-serif text-base font-bold text-amber-100">
                                                    {opt.name}
                                                </h4>
                                                {isSelected && (
                                                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                                        Đang chọn
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-xs leading-relaxed text-red-100/60">
                                                {opt.tagline}
                                            </p>
                                        </div>
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30">
                                            {isSelected && (
                                                <div className="h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-200">
                            {error}
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
                            disabled={isSubmitting || !name.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-2.5 text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    <span>Lưu thay đổi</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
