'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    AlertCircle,
    ArrowLeft,
    Check,
    Copy,
    Gift,
    Heart,
    LogOut,
    Pencil,
    Share2,
    ShieldCheck,
    Snowflake,
    Sparkles,
    TreePine,
    UserRound,
} from 'lucide-react'
import api from '@/lib/api'
import { getValidAuthToken, clearAuthData } from '@/utils/auth'
import ChristmasTreeScene from '@/components/tree-detail/ChristmasTreeScene'
import TreePagination from '@/components/tree-detail/TreePagination'
import TreeCountdown from '@/components/tree-detail/TreeCountdown'
import GiftRevealModal from '@/components/tree-detail/GiftRevealModal'
import PublicGiftModal from '@/components/tree-detail/PublicGiftModal'
import SendGiftModal from '@/components/tree-detail/SendGiftModal'
import EditTreeModal from '@/components/tree-detail/EditTreeModal'
import { TREE_DECORATION_CATALOG, TREE_ITEMS_PER_PAGE, getThemeConfig } from '@/constants/tree-decorations'
import { getGiftColorClass, renderDecorationSvg } from '@/components/tree-detail/TreeDecoration'
import type {
    TreeDecorationType,
    TreeDetail,
    TreeGift,
    TreeGiftContent,
    TreeTheme,
    TreeWishContent,
} from '@/types/tree-detail.types'

const ITEMS_PER_PAGE = TREE_ITEMS_PER_PAGE

const sectionClass = 'rounded-3xl border border-amber-200/15 bg-[#071b16]/50 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl'
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/40 bg-black/25 px-4 py-2 text-sm font-semibold text-yellow-100 transition duration-300 hover:border-yellow-300/70 hover:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-50'
const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-yellow-200/40 bg-linear-to-r from-amber-400 to-yellow-300 px-6 py-3 text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-50'

type Notice = {
    type: 'success' | 'error' | 'info'
    text: string
}

type SendGiftPayload = {
    wishMessage: string
    ornamentType: TreeDecorationType
    theme?: string
}

type SendGiftResult = {
    giftCreated: true
    wishCreated?: boolean
    warning?: string
}

type GiftDetailResponse = TreeGiftContent & {
    gift?: TreeGiftContent | null
    wish?: TreeWishContent | null
}

const unwrapData = <T,>(response: unknown): T => {
    const root = response as { data?: { data?: unknown } }
    return (root?.data?.data ?? root?.data ?? response) as T
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string | string[] } } }).response
        const message = response?.data?.message

        if (Array.isArray(message)) return message.join(', ')
        if (typeof message === 'string') return message
    }

    if (error instanceof Error && error.message) return error.message
    return fallback
}

const getGiftId = (gift: TreeGift): string | undefined => {
    return gift.giftId || gift._id || gift.id || gift.gift?._id
}

const getThemeBar = (theme?: string) => {
    if (theme === 'winter') return 'bg-linear-to-r from-transparent via-sky-300 to-transparent'
    if (theme === 'aurora') return 'bg-linear-to-r from-transparent via-emerald-300 via-purple-300 to-transparent'
    return 'bg-linear-to-r from-transparent via-yellow-300 to-transparent'
}

const getGiftColor = (theme?: string): 'red' | 'green' | 'gold' | 'blue' | 'purple' => {
    if (theme === 'green_box' || theme === 'green') return 'green'
    if (theme === 'gold_box' || theme === 'gold') return 'gold'
    if (theme === 'blue_box' || theme === 'blue' || theme === 'winter') return 'blue'
    if (theme === 'purple_box' || theme === 'purple' || theme === 'aurora') return 'purple'
    return 'red'
}

export default function TreeDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const treeId = Array.isArray(params?.id) ? params.id[0] : params?.id

    const [tree, setTree] = useState<TreeDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [hasSentGift, setHasSentGift] = useState(false)
    const [notice, setNotice] = useState<Notice | null>(null)
    const [copied, setCopied] = useState(false)

    // Pagination for tree items
    const [currentPage, setCurrentPage] = useState(1)

    // Modals
    const [showSendGift, setShowSendGift] = useState(false)
    const [showEditTree, setShowEditTree] = useState(false)
    const [selectedGift, setSelectedGift] = useState<TreeGift | null>(null)
    const [revealedGiftContent, setRevealedGiftContent] = useState<TreeGiftContent | null>(null)
    const [revealedWish, setRevealedWish] = useState<TreeWishContent | null>(null)
    const [openingGift, setOpeningGift] = useState(false)

    const loadTree = useCallback(async (showLoader = true, clearNotice = true) => {
        if (!treeId) {
            setTree(null)
            setNotice({ type: 'error', text: 'Không tìm thấy mã cây Giáng Sinh trong đường dẫn.' })
            setLoading(false)
            return
        }

        if (showLoader) setLoading(true)
        if (clearNotice) setNotice(null)

        try {
            const response = await api.get(`/trees/${treeId}`)
            const detail = unwrapData<TreeDetail>(response)

            if (!detail?._id) throw new Error('Dữ liệu cây Giáng Sinh không hợp lệ.')

            setTree(detail)

            // Auth verification
            let authenticated = false
            let localUser: { _id?: string; id?: string; userId?: string } | null = null

            try {
                const token = getValidAuthToken()
                const userInfo = localStorage.getItem('user_info')
                if (token && userInfo) {
                    localUser = JSON.parse(userInfo)
                    authenticated = true
                }
            } catch {
                localUser = null
                authenticated = false
            }

            setIsAuthenticated(authenticated)

            // Check owner & sent status from backend
            let ownerAccess = Boolean(detail.isOwner)
            if (!ownerAccess && authenticated) {
                const ownerId = detail.owner?._id ?? detail.owner?.id
                const localUserId = localUser?._id ?? localUser?.id ?? localUser?.userId
                ownerAccess = Boolean(ownerId && localUserId && String(ownerId) === String(localUserId))
            }

            setIsOwner(ownerAccess)
            setHasSentGift(Boolean(detail.hasSentGift))
        } catch (error) {
            console.error('Lỗi khi tải chi tiết cây:', error)
            setTree(null)
            setIsOwner(false)
            setNotice({ type: 'error', text: getErrorMessage(error, 'Không thể tải cây Giáng Sinh. Vui lòng thử lại.') })
        } finally {
            if (showLoader) setLoading(false)
        }
    }, [treeId])

    useEffect(() => {
        void loadTree()
    }, [loadTree])

    const gifts = useMemo(() => (Array.isArray(tree?.gifts) ? tree.gifts : []), [tree?.gifts])
    const totalPages = Math.max(1, Math.ceil(gifts.length / ITEMS_PER_PAGE))
    const visibleGifts = useMemo(
        () => gifts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
        [gifts, currentPage]
    )

    const contentsUnlocked = Boolean(tree?.contentsUnlocked)
    const canViewContents = isOwner && contentsUnlocked
    const isActive = tree?.status !== 'INACTIVE'
    const canSendGift = Boolean(tree && isAuthenticated && !isOwner && !hasSentGift && isActive)

    const themeConfig = getThemeConfig(tree?.theme)
    const currentTheme: TreeTheme = (tree?.theme === 'winter' || tree?.theme === 'aurora') ? tree.theme : 'classic'
    const ownerName = tree?.owner?.fullName || tree?.owner?.username || 'Chủ cây'

    const handleLogout = () => {
        clearAuthData()
        router.replace('/login')
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setNotice({ type: 'success', text: 'Đã sao chép liên kết cây Giáng Sinh!' })
            setTimeout(() => setCopied(false), 3000)
        } catch {
            setNotice({ type: 'error', text: 'Không thể sao chép tự động. Hãy sao chép liên kết từ thanh địa chỉ trình duyệt.' })
        }
    }

    const handleSelectGift = async (gift: TreeGift) => {
        setNotice(null)

        if (!canViewContents) {
            setSelectedGift(gift)
            return
        }

        const giftId = getGiftId(gift)
        if (!giftId) {
            setSelectedGift(gift)
            return
        }

        setOpeningGift(true)
        try {
            const response = await api.get(`/gifts/${giftId}`)
            const detail = unwrapData<GiftDetailResponse>(response)
            const giftContent = detail.gift ?? detail
            const wishContent = detail.wish ?? gift.wish ?? null

            setSelectedGift(gift)
            setRevealedGiftContent(giftContent)
            setRevealedWish(wishContent)
        } catch (error) {
            console.error('Lỗi khi mở quà:', error)
            setSelectedGift(gift)
        } finally {
            setOpeningGift(false)
        }
    }

    const handleCloseGift = () => {
        setSelectedGift(null)
        setRevealedGiftContent(null)
        setRevealedWish(null)
    }

    /**
     * Gửi quà và lời chúc riêng biệt qua 2 endpoint POST /gifts và POST /wishes (chuẩn backend).
     */
    const handleSendGift = async (payload: SendGiftPayload): Promise<SendGiftResult> => {
        if (!tree || !treeId) throw new Error('Không tìm thấy cây Giáng Sinh.')
        if (!isAuthenticated) throw new Error('Vui lòng đăng nhập để gửi quà.')
        if (isOwner) throw new Error('Bạn không thể gửi quà cho chính cây của mình.')
        if (!isActive) throw new Error('Cây hiện không nhận thêm quà.')

        const receiverId = tree.owner?._id ?? tree.owner?.id
        if (!receiverId) throw new Error('Không xác định được chủ sở hữu cây.')

        const wishMessage = payload.wishMessage.trim()
        if (!wishMessage) throw new Error('Vui lòng viết vài dòng thiệp chúc gửi đến bạn bè.')

        // 1. Tạo Gift (lưu lời chúc vào content để đảm bảo schema)
        const giftResponse = await api.post('/gifts', {
            treeId,
            receiverId,
            content: wishMessage,
            ornamentType: payload.ornamentType,
            theme: payload.theme || 'red_box',
        })

        const createdGift = unwrapData<{ _id?: string; id?: string }>(giftResponse)
        const createdGiftId = createdGift?._id ?? createdGift?.id
        let wishCreated = true
        let warning: string | undefined

        // 2. Nếu có lời chúc, tạo Wish liên kết với giftId vừa tạo
        if (wishMessage && createdGiftId) {
            try {
                await api.post('/wishes', {
                    giftId: createdGiftId,
                    message: wishMessage,
                    decorationType: payload.ornamentType,
                })
            } catch (wishErr) {
                console.error('Lỗi khi lưu lời chúc kèm quà:', wishErr)
                wishCreated = false
                warning = 'Món quà đã được gửi lên cây, nhưng lời chúc chưa được lưu thành công.'
            }
        }

        setShowSendGift(false)
        setHasSentGift(true)
        setCurrentPage(1)

        try {
            await loadTree(false, false)
        } catch (err) {
            console.error('Lỗi tải lại cây sau gửi quà:', err)
        }

        setNotice({
            type: 'success',
            text: wishMessage
                ? 'Đã gửi hộp quà và lời chúc Giáng Sinh thành công! Món quà đã được treo lên cây.'
                : 'Đã gửi hộp quà Giáng Sinh lên cây thành công!',
        })

        return { giftCreated: true, wishCreated, warning }
    }

    const handleUpdateTree = async (payload: { name: string; theme: TreeTheme }) => {
        if (!treeId) return
        try {
            await api.patch(`/trees/${treeId}`, payload)
            setTree((prev) => (prev ? { ...prev, name: payload.name, theme: payload.theme } : prev))
            setShowEditTree(false)
            setNotice({
                type: 'success',
                text: 'Cập nhật cây Giáng Sinh thành công!',
            })
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Không thể cập nhật cây Giáng Sinh.'))
        }
    }

    if (loading) {
        return (
            <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-red-950 font-sans text-white">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-red-900/60 via-red-950 to-green-950/70" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                        <Snowflake className="h-12 w-12 animate-spin text-yellow-300" />
                    </div>
                    <p className="animate-pulse font-serif text-lg text-yellow-100">
                        Đang thắp sáng cây Giáng Sinh...
                    </p>
                </div>
            </main>
        )
    }

    if (!tree) {
        return (
            <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-red-950 px-4 font-sans text-white">
                <div className="pointer-events-none fixed inset-0 bg-linear-to-b from-red-950 via-red-950 to-green-950" />
                <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-red-200/20 bg-red-500/10">
                        <AlertCircle className="h-10 w-10 text-red-200" />
                    </div>
                    <h1 className="font-serif text-3xl font-black text-yellow-200">
                        Không tìm thấy cây Giáng Sinh
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-red-100/70">
                        {notice?.text || 'Cây thông này có thể không tồn tại hoặc đường dẫn không chính xác.'}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <button type="button" onClick={() => void loadTree()} className={primaryButtonClass}>
                            Thử tải lại
                        </button>
                        <Link href="/" className={buttonClass}>
                            <ArrowLeft className="h-4 w-4" /> Trang chủ
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
            {/* BACKGROUND DECORATION - Đồng bộ với my-trees và trang chủ */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-linear-to-b from-red-950 via-red-950 to-green-950">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-[100px]" />
                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
                <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/4 blur-[120px]" />
                <Snowflake className="absolute left-[8%] top-[20%] h-10 w-10 text-yellow-100/15" />
                <Snowflake className="absolute right-[12%] top-[28%] h-14 w-14 animate-pulse text-yellow-100/15" />
                <Snowflake className="absolute bottom-[15%] left-[15%] h-9 w-9 text-white/10" />
                <Snowflake className="absolute bottom-[12%] right-[10%] h-8 w-8 text-yellow-100/15" />
                <Sparkles className="absolute left-[25%] top-[35%] h-5 w-5 text-yellow-300/20" />
                <Sparkles className="absolute bottom-[30%] right-[25%] h-6 w-6 text-yellow-300/20" />
            </div>

            {/* HEADER - Đồng bộ với các trang khác */}
            <header className="fixed left-0 top-0 z-50 w-full border-b border-yellow-400/20 bg-red-950/40 px-4 py-3 shadow-lg backdrop-blur-xl md:px-8">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="group flex min-w-0 shrink-0 items-center gap-2 font-serif text-xl font-bold text-yellow-400 transition hover:scale-105 hover:text-yellow-200 md:text-2xl"
                    >
                        <Snowflake className="h-7 w-7 shrink-0 animate-spin md:h-8 md:w-8" />
                        <span className="hidden sm:inline">Christmas Wishes</span>
                    </Link>

                    <div className="flex min-w-0 items-center gap-1 rounded-full border border-yellow-400/30 bg-black/40 py-1 pl-1 pr-2 shadow-lg backdrop-blur-md md:gap-2">
                        <Link
                            href={isAuthenticated ? '/my-trees' : '/'}
                            title={isAuthenticated ? 'Cây của tôi' : 'Trang chủ'}
                            className="group flex min-w-0 items-center gap-2 rounded-full px-2 py-2 text-sm text-white/80 transition hover:bg-red-900/50 hover:text-yellow-200 md:px-3"
                        >
                            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                            <span className="hidden sm:inline">{isAuthenticated ? 'Cây của tôi' : 'Trang chủ'}</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => void handleShare()}
                            title="Sao chép liên kết cây"
                            aria-label="Sao chép liên kết cây"
                            className="shrink-0 rounded-full p-2 text-white/70 transition hover:bg-yellow-400/10 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>

                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setShowEditTree(true)}
                                title="Đổi tên / phong cách cây"
                                aria-label="Đổi tên / phong cách cây"
                                className="shrink-0 rounded-full p-2 text-yellow-200/80 transition hover:bg-yellow-400/10 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}

                        <div className="mx-1 h-6 w-px shrink-0 bg-white/20" />

                        {isAuthenticated ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                title="Đăng xuất"
                                aria-label="Đăng xuất"
                                className="shrink-0 rounded-full p-2 text-white/70 transition hover:bg-red-900/60 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                title="Đăng nhập"
                                className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-yellow-100 transition hover:bg-yellow-400/10"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 mx-auto w-full max-w-5xl grow px-4 pb-16 pt-28 sm:px-6 md:pt-32">
                {/* HERO TITLE SECTION - Gọn gàng, tinh tế */}
                <div className="mb-8 text-center">
                    <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200 sm:text-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>Mùa yêu thương</span>
                        <Sparkles className="h-4 w-4" />
                    </div>

                    <h1 className="wrap-break-word font-serif text-3xl font-black text-yellow-300 drop-shadow-md sm:text-4xl md:text-5xl">
                        {tree.name}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-red-100/80">
                        <span>Mùa Giáng Sinh {tree.year}</span>
                        <span>·</span>
                        <span className="font-semibold text-yellow-200">{themeConfig.badge}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                            {tree.owner?.avatar ? (
                                <img
                                    src={tree.owner.avatar}
                                    alt={ownerName}
                                    className="h-5 w-5 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <UserRound className="h-4 w-4 text-yellow-300" />
                            )}
                            <span>{ownerName}</span>
                        </span>
                        {isOwner && (
                            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-green-300/30 bg-green-400/10 px-2 py-0.5 text-[10px] font-bold text-green-200">
                                <ShieldCheck className="h-3 w-3" /> Cây của bạn
                            </span>
                        )}
                    </div>

                    <div className="mx-auto mt-4 h-px w-32 bg-linear-to-r from-transparent via-yellow-400/70 to-transparent" />
                </div>

                {/* STATUS NOTICE TOAST */}
                {notice && (
                    <div
                        role="status"
                        aria-live="polite"
                        className={`mx-auto mb-6 flex max-w-4xl items-start gap-3 rounded-2xl border p-4 text-sm shadow-xl backdrop-blur-xl ${notice.type === 'success'
                                ? 'border-green-300/30 bg-green-950/70 text-green-100'
                                : notice.type === 'info'
                                    ? 'border-yellow-300/30 bg-yellow-950/70 text-yellow-100'
                                    : 'border-red-300/30 bg-red-950/70 text-red-100'
                            }`}
                    >
                        {notice.type === 'success' ? (
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />
                        ) : (
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-300" />
                        )}
                        <span className="flex-1 leading-relaxed">{notice.text}</span>
                        <button
                            type="button"
                            onClick={() => setNotice(null)}
                            aria-label="Đóng"
                            className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* SÂN KHẤU CÂY THÔNG TRUNG TÂM (TINH GỌN, ALL-IN-ONE LAYOUT) */}
                <section className={`${sectionClass} relative mx-auto max-w-4xl overflow-hidden`}>
                    {/* Top Theme Accent Bar */}
                    <div className={`h-1.5 w-full ${getThemeBar(tree.theme)}`} />

                    {/* Integrated Mini HUD: Trạng thái & Đếm ngược */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-200/10 bg-black/20 px-5 py-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-yellow-100">
                            <Gift className="h-4 w-4 text-yellow-300" />
                            <span>
                                <strong className="font-bold text-yellow-300">{gifts.length}</strong> món quà lấp lánh
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {contentsUnlocked ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300/30 bg-green-400/10 px-3 py-1 text-xs font-bold text-green-200">
                                    <Sparkles className="h-3.5 w-3.5" /> Đã mở khóa quà tặng!
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-200">
                                    Mở quà 00:00 · 25/12/{tree.year}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* The Christmas Tree Centerpiece */}
                    <div className="px-3 py-4 sm:px-6 sm:py-6">
                        <ChristmasTreeScene
                            theme={currentTheme}
                            tree={tree}
                            gifts={visibleGifts}
                            items={visibleGifts}
                            currentPage={currentPage}
                            canViewContents={canViewContents}
                            isOwner={isOwner}
                            onGiftClick={handleSelectGift}
                            onSelectGift={handleSelectGift}
                            onGiftSelect={handleSelectGift}
                        />

                        {/* Pagination if gifts > 12 */}
                        {gifts.length > ITEMS_PER_PAGE && (
                            <div className="mt-4">
                                <TreePagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={gifts.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>

                    {/* Integrated Action Hub directly below the tree */}
                    <div className="border-t border-yellow-200/10 bg-black/25 p-5 text-center sm:p-6">
                        {canSendGift ? (
                            <div className="mx-auto max-w-lg">
                                <p className="font-serif text-lg font-bold text-yellow-200 sm:text-xl">
                                    Gửi một món quà & điều ước đến {ownerName} 🎁
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-red-100/70 sm:text-sm">
                                    Món quà của bạn sẽ được treo lộng lẫy lên cây và mở ra vào đêm Giáng Sinh!
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowSendGift(true)}
                                    className={`${primaryButtonClass} mt-4 w-full sm:w-auto shadow-yellow-500/20 hover:scale-105`}
                                >
                                    <Gift className="h-4 w-4" />
                                    <span>Treo quà & viết lời chúc</span>
                                </button>
                            </div>
                        ) : hasSentGift && !isOwner ? (
                            <div className="mx-auto max-w-lg">
                                <p className="inline-flex items-center gap-2 font-serif text-base font-bold text-green-200">
                                    <Check className="h-5 w-5 text-green-300" />
                                    Bạn đã gửi một món quà lên cây này!
                                </p>
                                <p className="mt-1 text-xs text-white/60">
                                    Món quà và lời chúc của bạn đang nằm trên cây thông chờ {ownerName} mở vào 00:00 ngày 25/12.
                                </p>
                            </div>
                        ) : !isAuthenticated ? (
                            <div className="mx-auto max-w-lg">
                                <p className="font-serif text-lg font-bold text-yellow-200">
                                    Đăng nhập để gửi quà cho {ownerName}
                                </p>
                                <p className="mt-1 text-xs text-white/60">
                                    Hãy để lại món quà và lời chúc ý nghĩa của bạn trên cây thông này.
                                </p>
                                <Link href="/login" className={`${primaryButtonClass} mt-4 w-full sm:w-auto`}>
                                    <UserRound className="h-4 w-4" /> Đăng nhập để gửi quà
                                </Link>
                            </div>
                        ) : isOwner ? (
                            <div className="mx-auto max-w-lg">
                                <p className="font-serif text-base font-bold text-yellow-200">
                                    🎄 Cây Giáng Sinh của bạn đang chờ đón thêm yêu thương
                                </p>
                                <p className="mt-1 text-xs text-white/60">
                                    Hãy chia sẻ liên kết này đến bạn bè và người thân để cùng trang trí cây nhé!
                                </p>
                                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => void handleShare()}
                                        className={buttonClass}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditTree(true)}
                                        className={buttonClass}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Đổi phong cách cây</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-white/50">Cây hiện không nhận thêm quà.</p>
                        )}
                    </div>
                </section>

                {/* COUNTDOWN COMPONENT (ISOLATED TIMER - NO ROOT RE-RENDER LAG) */}
                {!contentsUnlocked && (
                    <div className="mx-auto mt-6 max-w-4xl">
                        <TreeCountdown
                            year={tree.year}
                            isOwner={isOwner}
                            contentsUnlocked={contentsUnlocked}
                            onUnlockTimeReached={() => void loadTree(false, false)}
                        />
                    </div>
                )}

                {/* GUESTBOOK / DANH SÁCH MÓN QUÀ & NGƯỜI GỬI */}
                <section className="mx-auto mt-10 max-w-4xl">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-yellow-200">
                                Quà tặng & Lời chúc gửi trao
                            </h3>
                            <p className="mt-0.5 text-xs text-red-100/60">
                                {gifts.length > 0
                                    ? `Có ${gifts.length} người bạn đã gửi gắm yêu thương lên cây`
                                    : 'Khu vườn đang chờ những món quà đầu tiên'}
                            </p>
                        </div>
                        <span className="rounded-full border border-yellow-300/20 bg-yellow-400/5 px-3 py-1 text-xs font-semibold text-yellow-200/80">
                            {gifts.length} món quà
                        </span>
                    </div>

                    {gifts.length === 0 ? (
                        <div className={`${sectionClass} px-5 py-12 text-center sm:px-8 sm:py-16`}>
                            <Gift className="mx-auto h-12 w-12 text-yellow-300/40" />
                            <h4 className="mt-3 font-serif text-lg font-bold text-yellow-200">
                                Chưa có món quà nào trên cây
                            </h4>
                            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-red-100/60 sm:text-sm">
                                {isOwner
                                    ? 'Hãy chia sẻ liên kết cây đến bạn bè để nhận những món quà và lời chúc đầu tiên nhé!'
                                    : 'Hãy là người đầu tiên trao gửi một món quà và lời chúc may mắn lên cây thông này!'}
                            </p>
                            {canSendGift && (
                                <button
                                    type="button"
                                    onClick={() => setShowSendGift(true)}
                                    className={`${primaryButtonClass} mt-5`}
                                >
                                    <Gift className="h-4 w-4" /> Gửi món quà đầu tiên
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {gifts.map((item, idx) => {
                                const sender = item.sender
                                const sName = sender?.fullName || sender?.username || 'Người gửi ẩn danh'
                                const sAvatar = sender?.avatar
                                const dateStr = item.createdAt
                                    ? new Date(item.createdAt).toLocaleDateString('vi-VN', {
                                        timeZone: 'Asia/Ho_Chi_Minh',
                                        day: '2-digit',
                                        month: '2-digit',
                                    })
                                    : ''

                                const rawOrnamentType = item.ornamentType || item.gift?.ornamentType
                                const ornamentType: TreeDecorationType =
                                    rawOrnamentType && rawOrnamentType in TREE_DECORATION_CATALOG
                                        ? (rawOrnamentType as TreeDecorationType)
                                        : 'gift_box'
                                const rawTheme = item.theme || item.gift?.theme
                                const colorClass = getGiftColorClass(rawTheme)
                                const ornamentDef = TREE_DECORATION_CATALOG[ornamentType] || TREE_DECORATION_CATALOG.gift_box

                                return (
                                    <div
                                        key={getGiftId(item) || idx}
                                        onClick={() => void handleSelectGift(item)}
                                        className={`${sectionClass} group relative flex cursor-pointer items-center gap-3.5 p-4 transition duration-200 hover:-translate-y-1 hover:border-yellow-300/40 hover:bg-black/40`}
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-yellow-300/20 bg-yellow-400/10">
                                            {sAvatar ? (
                                                <img
                                                    src={sAvatar}
                                                    alt={sName}
                                                    referrerPolicy="no-referrer"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserRound className="h-6 w-6 text-amber-200" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-serif text-sm font-bold text-white group-hover:text-yellow-200">
                                                {sName}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-red-100/60">
                                                <span className="truncate">{ornamentDef.label}</span>
                                                {dateStr && <span className="shrink-0">• {dateStr}</span>}
                                            </div>
                                        </div>

                                        {/* Món quà thật sự (Vector SVG Ornament tương ứng với món quà và màu sắc thực tế) */}
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10 p-1.5 text-yellow-300 shadow-inner transition duration-300 group-hover:scale-110 group-hover:border-yellow-300/50 group-hover:bg-yellow-400/20"
                                            title={ornamentDef.label}
                                        >
                                            <div className="h-7 w-7">
                                                {renderDecorationSvg(ornamentType, colorClass)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* FOOTER - Đồng bộ với các trang khác */}
            <footer className="relative z-10 mt-12 border-t border-yellow-400/10 bg-black/20 px-4 py-6 text-center text-xs text-white/50 backdrop-blur-sm md:text-sm">
                <p>© {tree.year} Christmas Wishes</p>
                <p className="mt-1 text-yellow-100/40">Made with ❤️ for a magical Christmas</p>
            </footer>

            {/* MODALS */}

            {/* 1. Modal Gửi Quà (SendGiftModal) */}
            <SendGiftModal
                isOpen={showSendGift}
                recipientName={ownerName}
                onClose={() => setShowSendGift(false)}
                onSubmit={handleSendGift}
            />

            {/* 2. Modal Đổi Tên / Phong Cách Cây (EditTreeModal) */}
            {isOwner && (
                <EditTreeModal
                    isOpen={showEditTree}
                    treeName={tree.name}
                    treeTheme={currentTheme}
                    treeYear={tree.year}
                    existingGifts={tree.gifts}
                    onClose={() => setShowEditTree(false)}
                    onSubmit={handleUpdateTree}
                />
            )}

            {/* 3. Modal Mở Quà (Chủ cây khi đến ngày 25/12) */}
            {selectedGift && canViewContents && (
                <GiftRevealModal
                    isOpen={Boolean(selectedGift)}
                    giftContent={revealedGiftContent}
                    wish={revealedWish}
                    senderName={selectedGift.sender?.fullName || selectedGift.sender?.username || 'Người gửi ẩn danh'}
                    senderAvatar={selectedGift.sender?.avatar}
                    createdAt={selectedGift.createdAt}
                    ornamentType={(selectedGift.ornamentType || selectedGift.gift?.ornamentType || revealedGiftContent?.ornamentType || 'gift_box') as TreeDecorationType}
                    giftColor={getGiftColor(revealedGiftContent?.theme || selectedGift.theme || selectedGift.gift?.theme)}
                    onClose={handleCloseGift}
                />
            )}

            {/* 4. Modal Quà Bí Mật (Khách xem hoặc chủ cây trước ngày 25/12) */}
            {selectedGift && !canViewContents && (
                <PublicGiftModal
                    isOpen={Boolean(selectedGift)}
                    gift={selectedGift}
                    treeYear={tree.year}
                    isOwner={isOwner}
                    onClose={handleCloseGift}
                />
            )}

            {/* Loading Indicator khi giải mã quà */}
            {openingGift && (
                <div className="fixed inset-0 z-130 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center gap-3 rounded-2xl border border-yellow-300/30 bg-[#160d14] px-6 py-4 text-yellow-200 shadow-2xl">
                        <Sparkles className="h-5 w-5 animate-spin text-yellow-300" />
                        <span className="font-serif text-sm font-semibold">Đang mở hộp quà bí mật...</span>
                    </div>
                </div>
            )}
        </main>
    )
}
