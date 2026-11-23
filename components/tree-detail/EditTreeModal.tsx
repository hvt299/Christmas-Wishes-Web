'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, Loader2, Sparkles, X, Palette, TreePine } from 'lucide-react'
import ChristmasTreeScene from '@/components/tree-detail/ChristmasTreeScene'
import { getThemeConfig } from '@/constants/tree-decorations'
import type { TreeGift, TreeSceneItem, TreeTheme } from '@/types/tree-detail.types'

export interface EditTreeModalProps {
    isOpen: boolean
    treeName?: string
    treeTheme?: TreeTheme
    treeYear?: number
    mode?: 'edit' | 'create'
    existingGifts?: TreeGift[]
    onClose: () => void
    onSubmit: (payload: { name: string; theme: TreeTheme }) => Promise<void>
}

const THEME_OPTIONS: {
    key: TreeTheme
    name: string
    badge: string
    tagline: string
    icon: string
    previewGradient: string
}[] = [
    {
        key: 'classic',
        name: 'Cổ điển',
        badge: '🎄 Cổ điển',
        tagline: 'Lá thông xanh đậm, chuông vàng và quả đỏ truyền thống',
        icon: '🎄',
        previewGradient: 'from-emerald-950/70 via-[#103823] to-[#071d12]',
    },
    {
        key: 'winter',
        name: 'Mùa đông tuyết',
        badge: '❄️ Mùa đông',
        tagline: 'Tuyết phủ trắng cành thông, sao bạc và ánh sáng xanh băng',
        icon: '❄️',
        previewGradient: 'from-sky-950/70 via-[#102d42] to-[#071624]',
    },
    {
        key: 'aurora',
        name: 'Ánh cực quang',
        badge: '✨ Ánh cực quang',
        tagline: 'Sắc tím ngọc huyền ảo dưới dải cực quang phương Bắc',
        icon: '✨',
        previewGradient: 'from-indigo-950/70 via-[#221038] to-[#0a1820]',
    },
]

const ALL_8_PREVIEW_ITEMS: TreeSceneItem[] = [
    {
        id: 'preview-star',
        type: 'star',
        source: 'gift',
        position: { zone: 'canopy', x: 50, y: 22, rotation: -2, scale: 0.95 },
        gift: { _id: 'preview-1', ornamentType: 'star', theme: 'gold_box', sender: null },
    },
    {
        id: 'preview-bauble',
        type: 'bauble',
        source: 'gift',
        position: { zone: 'canopy', x: 38, y: 33, rotation: -6, scale: 0.95 },
        gift: { _id: 'preview-2', ornamentType: 'bauble', theme: 'red_box', sender: null },
    },
    {
        id: 'preview-bell',
        type: 'bell',
        source: 'gift',
        position: { zone: 'canopy', x: 62, y: 33, rotation: 5, scale: 0.95 },
        gift: { _id: 'preview-3', ornamentType: 'bell', theme: 'gold_box', sender: null },
    },
    {
        id: 'preview-candycane',
        type: 'candy_cane',
        source: 'gift',
        position: { zone: 'canopy', x: 27, y: 47, rotation: -7, scale: 0.98 },
        gift: { _id: 'preview-4', ornamentType: 'candy_cane', theme: 'red_box', sender: null },
    },
    {
        id: 'preview-giftbox',
        type: 'gift_box',
        source: 'gift',
        position: { zone: 'canopy', x: 50, y: 45, rotation: 1, scale: 1.02 },
        gift: { _id: 'preview-5', ornamentType: 'gift_box', theme: 'green_box', sender: null },
    },
    {
        id: 'preview-snowflake',
        type: 'snowflake',
        source: 'gift',
        position: { zone: 'canopy', x: 73, y: 47, rotation: 6, scale: 0.98 },
        gift: { _id: 'preview-6', ornamentType: 'snowflake', theme: 'blue_box', sender: null },
    },
    // 2 món quà tất len và thư được căn giữa ở tầng 4 giống như quả châu (38) và chuông vàng (62) ở tầng 2
    {
        id: 'preview-stocking',
        type: 'stocking',
        source: 'gift',
        position: { zone: 'canopy', x: 39, y: 63, rotation: -4, scale: 1.02 },
        gift: { _id: 'preview-7', ornamentType: 'stocking', theme: 'red_box', sender: null },
    },
    {
        id: 'preview-envelope',
        type: 'envelope',
        source: 'gift',
        position: { zone: 'canopy', x: 61, y: 63, rotation: 4, scale: 1.02 },
        gift: { _id: 'preview-8', ornamentType: 'envelope', theme: 'purple_box', sender: null },
    },
]

export default function EditTreeModal({
    isOpen,
    treeName: initialName = '',
    treeTheme: initialTheme = 'classic',
    treeYear,
    mode = 'edit',
    existingGifts,
    onClose,
    onSubmit,
}: EditTreeModalProps) {
    const [name, setName] = useState(initialName)
    const [theme, setTheme] = useState<TreeTheme>(initialTheme)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const isCreateMode = mode === 'create'

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

    const activeThemeOption = useMemo(() => {
        return THEME_OPTIONS.find((opt) => opt.key === theme) || THEME_OPTIONS[0]
    }, [theme])

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
            setError(
                err instanceof Error
                    ? err.message
                    : isCreateMode
                    ? 'Không thể tạo cây. Vui lòng thử lại.'
                    : 'Không thể cập nhật cây. Vui lòng thử lại.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/80 px-3 py-4 sm:px-4 sm:py-6 backdrop-blur-md"
            onClick={() => !isSubmitting && onClose()}
        >
            <div
                className="my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-200/20 bg-[#160d12]/95 text-white shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                role="dialog"
                aria-modal="true"
                aria-label={isCreateMode ? 'Tạo cây Giáng Sinh' : 'Chỉnh sửa cây Giáng Sinh'}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Viền vàng chuyển sắc trên cùng */}
                <div className="h-1 bg-linear-to-r from-transparent via-amber-300/80 to-transparent" />

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-amber-200/10 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/[0.07] text-amber-200">
                            {isCreateMode ? (
                                <TreePine size={22} className="text-emerald-300" />
                            ) : (
                                <Palette size={22} />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/60">
                                {isCreateMode
                                    ? `Mùa lễ hội ${treeYear || new Date().getFullYear()}`
                                    : `Tùy chỉnh cây ${treeYear ? `(Năm ${treeYear})` : ''}`}
                            </p>
                            <h2 className="font-serif text-lg font-bold text-amber-100 sm:text-xl">
                                {isCreateMode ? 'Tạo cây Giáng Sinh mới' : 'Chỉnh sửa cây Giáng Sinh'}
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

                {/* Body - Grid 2 cột (Preview & Form) */}
                <div className="overflow-y-auto p-4 sm:p-6">
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        {/* CỘT PREVIEW CÂY THÔNG (lg:col-span-5) */}
                        <div className="flex flex-col items-center lg:col-span-5">
                            <div
                                className={`relative w-full overflow-hidden rounded-2xl border border-amber-200/20 p-4 shadow-inner transition-colors duration-500 ${
                                    theme === 'winter'
                                        ? 'bg-linear-to-b from-[#091b2e] via-[#0d2a45] to-[#061424]'
                                        : theme === 'aurora'
                                        ? 'bg-linear-to-b from-[#180a2b] via-[#0e2738] to-[#070e1f]'
                                        : 'bg-linear-to-b from-[#0a271a] via-[#072015] to-[#04110b]'
                                }`}
                            >
                                {/* Background Ambient Glow */}
                                <div
                                    className={`pointer-events-none absolute inset-0 opacity-40 blur-2xl transition-all duration-700 ${
                                        theme === 'winter'
                                            ? 'bg-sky-400/25'
                                            : theme === 'aurora'
                                            ? 'bg-linear-to-tr from-purple-500/25 via-teal-400/20 to-pink-500/20'
                                            : 'bg-emerald-500/25'
                                    }`}
                                />

                                {/* Preview Card Header */}
                                <div className="relative z-10 mb-2 flex items-center justify-between border-b border-white/10 pb-2.5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-200/90">
                                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                        <span>Xem trước cây thông</span>
                                    </div>
                                    <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                                        {activeThemeOption.badge}
                                    </span>
                                </div>

                                {/* Tree Name in Live Preview */}
                                <div className="relative z-10 mb-1 text-center">
                                    <p className="truncate font-serif text-sm font-bold text-yellow-100 drop-shadow sm:text-base">
                                        {name.trim() || 'Cây Giáng Sinh của bạn'}
                                    </p>
                                    <p className="text-[11px] text-red-100/60">
                                        {getThemeConfig(theme)?.shortDesc || activeThemeOption.tagline}
                                    </p>
                                </div>

                                {/* Christmas Tree Live Scene */}
                                <div className="relative z-10 mx-auto w-full max-w-55 pointer-events-none sm:max-w-62.5">
                                    <ChristmasTreeScene
                                        theme={theme}
                                        items={ALL_8_PREVIEW_ITEMS}
                                    />
                                </div>

                                {/* Footnote */}
                                <div className="relative z-10 mt-2 rounded-xl border border-white/5 bg-black/40 px-3 py-1.5 text-center text-[11px] text-amber-100/70 backdrop-blur-sm">
                                    ✨ Hiển thị trọn bộ 8 loại món quà & vật phẩm trang trí trên cây!
                                </div>
                            </div>
                        </div>

                        {/* CỘT CẤU HÌNH & NHẬP LIỆU (lg:col-span-7) */}
                        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-7">
                            {/* Tree Name Input */}
                            <div>
                                <label
                                    htmlFor="edit-tree-name-input"
                                    className="mb-2 block text-sm font-semibold text-amber-100/90"
                                >
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
                                    autoFocus
                                    placeholder="Ví dụ: Cây Giáng Sinh của tôi"
                                    className="w-full rounded-xl border border-amber-200/15 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-amber-200/40 focus:ring-2 focus:ring-amber-200/6 disabled:opacity-50"
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
                                                        ? 'border-amber-300/80 bg-linear-to-r ' +
                                                          opt.previewGradient +
                                                          ' shadow-lg shadow-black/40 ring-2 ring-amber-300/30'
                                                        : 'border-white/10 bg-black/25 hover:border-white/20 hover:bg-black/35'
                                                }`}
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl">
                                                    {opt.icon}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-serif text-sm font-bold text-amber-100 sm:text-base">
                                                            {opt.name}
                                                        </h4>
                                                        {isSelected && (
                                                            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                                                Đang chọn
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-red-100/60">
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
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 px-6 py-2.5 text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>
                                                {isCreateMode ? 'Đang tạo cây...' : 'Đang lưu...'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            {isCreateMode ? <TreePine size={16} /> : <Check size={16} />}
                                            <span>
                                                {isCreateMode ? 'Tạo cây Giáng Sinh' : 'Lưu thay đổi'}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
