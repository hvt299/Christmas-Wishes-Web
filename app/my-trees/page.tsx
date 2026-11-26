'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    TreePine,
    Snowflake,
    Sparkles,
    ArrowLeft,
    LogOut,
    Plus,
    Calendar,
    Gift,
    Loader2,
    AlertCircle,
    Check,
    ChevronRight,
    Trees,
    X,
    Pencil,
    Eye,
    UserRound,
} from 'lucide-react'
import api from '@/lib/api'
import { getVietnamDateParts, canCreateTree } from '@/utils/christmasHelper'
import { getValidAuthToken, clearAuthData } from '@/utils/auth'
import EditTreeModal from '@/components/tree-detail/EditTreeModal'
import { getGiftColorClass, renderDecorationSvg } from '@/components/tree-detail/TreeDecoration'
import { SnowflakeBalance } from '@/components/games/SnowflakeBalance'
import type { TreeDecorationType, TreeTheme } from '@/types/tree-detail.types'

type TreeItem = {
    _id?: string
    id?: string
    name: string
    year: number
    theme?: string
    status?: 'ACTIVE' | 'INACTIVE'
    createdAt?: string
    updatedAt?: string
}

type SentGiftItem = {
    _id: string
    id?: string
    content?: string
    theme?: string
    ornamentType?: string
    createdAt: string
    treeYear?: number
    contentsUnlocked?: boolean
    canEdit?: boolean
    receiverId?: {
        _id?: string
        id?: string
        fullName?: string
        avatar?: string
    }
    treeId?: {
        _id?: string
        id?: string
        name?: string
        year?: number
        theme?: string
        status?: string
    }
    wish?: {
        _id?: string
        message?: string
        decorationType?: string
    } | null
}

type Message = {
    type: 'success' | 'error'
    text: string
}

const ORNAMENT_CONFIG: Record<string, { label: string; icon: string }> = {
    gift_box: { label: 'Hộp quà', icon: '🎁' },
    bauble: { label: 'Quả châu', icon: '🔴' },
    bell: { label: 'Chuông vàng', icon: '🔔' },
    candy_cane: { label: 'Kẹo gậy', icon: '🍬' },
    snowflake: { label: 'Bông tuyết', icon: '❄️' },
    stocking: { label: 'Tất len', icon: '🧦' },
    star: { label: 'Ngôi sao', icon: '⭐' },
    envelope: { label: 'Thư Giáng Sinh', icon: '💌' },
}

const BOX_COLOR_OPTIONS: { id: string; label: string; bgClass: string; ringColor: string }[] = [
    { id: 'red_box', label: 'Đỏ lễ hội', bgClass: 'bg-red-600', ringColor: 'ring-red-400' },
    { id: 'green_box', label: 'Xanh thông', bgClass: 'bg-emerald-600', ringColor: 'ring-emerald-400' },
    { id: 'gold_box', label: 'Vàng ánh kim', bgClass: 'bg-amber-400', ringColor: 'ring-amber-300' },
    { id: 'blue_box', label: 'Xanh băng giá', bgClass: 'bg-sky-500', ringColor: 'ring-sky-300' },
    { id: 'purple_box', label: 'Tím cực quang', bgClass: 'bg-purple-600', ringColor: 'ring-purple-400' },
]

const getTreeDate = (date?: string) => {
    if (!date || Number.isNaN(new Date(date).getTime())) return 'Chưa rõ ngày'

    return new Date(date).toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
    ) {
        const response = (error as { response?: { data?: { message?: string | string[] } } }).response
        const message = response?.data?.message

        if (Array.isArray(message)) return message.join(', ')
        if (typeof message === 'string') return message
    }

    return fallback
}

export default function MyTreesPage() {
    const router = useRouter()

    const [trees, setTrees] = useState<TreeItem[]>([])
    const [sentGifts, setSentGifts] = useState<SentGiftItem[]>([])
    const [activeTab, setActiveTab] = useState<'trees' | 'sent-gifts'>('trees')
    const [loading, setLoading] = useState(true)
    const [currentYear, setCurrentYear] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState<number | null>(null)
    const [message, setMessage] = useState<Message | null>(null)

    // Tree creation modal state
    const [showCreateForm, setShowCreateForm] = useState(false)

    // Tree editing modal state
    const [editingTree, setEditingTree] = useState<TreeItem | null>(null)

    // Sent gift view & edit states
    const [viewingGift, setViewingGift] = useState<SentGiftItem | null>(null)
    const [editingGift, setEditingGift] = useState<SentGiftItem | null>(null)
    const [editGiftContent, setEditGiftContent] = useState('')
    const [editGiftOrnament, setEditGiftOrnament] = useState('gift_box')
    const [editGiftTheme, setEditGiftTheme] = useState('red_box')
    const [updatingGift, setUpdatingGift] = useState(false)

    useEffect(() => {
        const now = Date.now()
        setCurrentTime(now)
        setCurrentYear(getVietnamDateParts(new Date(now)).year)

        const validToken = getValidAuthToken()
        const userInfo = localStorage.getItem('user_info')

        if (!validToken || !userInfo) {
            clearAuthData()
            router.replace('/login?session_expired=true')
            return
        }

        let isMounted = true

        const fetchData = async () => {
            try {
                const [treesRes, giftsRes] = await Promise.all([
                    api.get('/trees/my-trees'),
                    api.get('/gifts').catch(err => {
                        console.warn('Lỗi khi tải danh sách quà đã gửi:', err)
                        return { data: { data: [] } }
                    }),
                ])

                const treesData = treesRes.data?.data
                const giftsData = giftsRes.data?.data

                if (isMounted) {
                    setTrees(Array.isArray(treesData) ? treesData : [])
                    setSentGifts(Array.isArray(giftsData) ? giftsData : [])
                }
            } catch (error: any) {
                console.error('Lỗi khi tải dữ liệu cây:', error)

                if (isMounted) {
                    if (error?.response?.status === 401) {
                        clearAuthData()
                        setMessage({
                            type: 'error',
                            text: 'Phiên đăng nhập đã hết hạn. Đang chuyển hướng về trang đăng nhập...',
                        })
                        setTimeout(() => {
                            router.replace('/login?session_expired=true')
                        }, 1200)
                    } else {
                        setMessage({
                            type: 'error',
                            text: getErrorMessage(error, 'Không thể tải danh sách cây. Vui lòng thử lại.'),
                        })
                    }
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        try {
            JSON.parse(userInfo)
            void fetchData()
        } catch {
            clearAuthData()
            router.replace('/login')
        }

        return () => {
            isMounted = false
        }
    }, [router])

    const sortedTrees = useMemo(
        () => [...trees].sort((a, b) => b.year - a.year),
        [trees],
    )

    const currentTree = currentYear === null
        ? undefined
        : trees.find(tree => tree.year === currentYear)

    const canCreateCurrentTree = currentYear !== null
        && currentTime !== null
        && !currentTree
        && canCreateTree(currentYear, currentTime)

    const sectionClass = 'rounded-3xl border border-amber-200/15 bg-[#071b16]/45 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl'
    const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/40 bg-black/25 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition duration-300 hover:border-yellow-300/70 hover:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-50'

    const handleLogout = () => {
        clearAuthData()
        router.replace('/login')
    }

    const handleOpenEditModal = (tree: TreeItem) => {
        setEditingTree(tree)
        setMessage(null)
    }

    const handleCreateTreeSubmit = async ({ name, theme }: { name: string; theme: TreeTheme }) => {
        if (currentYear === null || !canCreateTree(currentYear)) {
            throw new Error('Chỉ được tạo cây từ ngày 01/12 đến trước 00:00 ngày 25/12 theo giờ Việt Nam.')
        }

        if (trees.some(tree => tree.year === currentYear)) {
            throw new Error(`Bạn đã có cây Giáng Sinh năm ${currentYear}.`)
        }

        try {
            const response = await api.post('/trees', {
                name,
                theme,
                year: currentYear,
            })

            const createdTree: TreeItem | undefined = response.data?.data

            if (createdTree) {
                setTrees(previous => [
                    createdTree,
                    ...previous.filter(tree => tree.year !== createdTree.year),
                ])
            } else {
                const refreshed = await api.get('/trees/my-trees')
                setTrees(Array.isArray(refreshed.data?.data) ? refreshed.data.data : [])
            }

            setShowCreateForm(false)
            setMessage({
                type: 'success',
                text: response.data?.message || `Đã tạo cây Giáng Sinh năm ${currentYear} thành công!`,
            })
        } catch (error) {
            console.error('Lỗi khi tạo cây:', error)
            throw new Error(getErrorMessage(error, 'Không thể tạo cây. Vui lòng thử lại.'))
        }
    }

    const handleUpdateTreeSubmit = async ({ name, theme }: { name: string; theme: TreeTheme }) => {
        if (!editingTree) return

        const treeId = editingTree._id || editingTree.id
        if (!treeId) {
            throw new Error('Không tìm thấy ID cây Giáng Sinh.')
        }

        try {
            const response = await api.patch(`/trees/${treeId}`, {
                name,
                theme,
            })

            const updatedTree: TreeItem = response.data?.data

            setTrees(previous =>
                previous.map(tree =>
                    (tree._id || tree.id) === treeId
                        ? { ...tree, ...updatedTree }
                        : tree
                )
            )

            setEditingTree(null)
            setMessage({
                type: 'success',
                text: response.data?.message || 'Cập nhật cây Giáng Sinh thành công!',
            })
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Không thể cập nhật cây Giáng Sinh.'))
        }
    }

    // Handlers for sent gift view & edit
    const handleOpenEditGift = (gift: SentGiftItem) => {
        setEditingGift(gift)
        setEditGiftContent(gift.content || gift.wish?.message || '')
        setEditGiftOrnament(gift.ornamentType || gift.wish?.decorationType || 'gift_box')
        setEditGiftTheme(gift.theme || 'red_box')
        setViewingGift(null)
        setMessage(null)
    }

    const handleUpdateGift = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!editingGift) return

        const giftId = editingGift._id || editingGift.id
        if (!giftId) return

        const trimmedContent = editGiftContent.trim()
        if (!trimmedContent) {
            setMessage({ type: 'error', text: 'Nội dung thiệp chúc không được để trống.' })
            return
        }

        setUpdatingGift(true)
        setMessage(null)

        try {
            const response = await api.patch(`/gifts/${giftId}`, {
                content: trimmedContent,
                ornamentType: editGiftOrnament,
                theme: editGiftTheme,
            })

            const updatedData = response.data?.data

            setSentGifts(prev =>
                prev.map(g => {
                    if ((g._id || g.id) === giftId) {
                        return {
                            ...g,
                            ...updatedData,
                            content: trimmedContent,
                            ornamentType: editGiftOrnament,
                            theme: editGiftTheme,
                            wish: g.wish
                                ? { ...g.wish, message: trimmedContent, decorationType: editGiftOrnament }
                                : { message: trimmedContent, decorationType: editGiftOrnament },
                        }
                    }
                    return g
                })
            )

            setEditingGift(null)
            setMessage({
                type: 'success',
                text: 'Đã cập nhật món quà và lời chúc Giáng Sinh thành công!',
            })
        } catch (error) {
            console.error('Lỗi khi cập nhật quà:', error)
            setMessage({
                type: 'error',
                text: getErrorMessage(error, 'Không thể cập nhật món quà. Vui lòng thử lại.'),
            })
        } finally {
            setUpdatingGift(false)
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
                        Đang tìm lại những mùa Giáng Sinh...
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
            {/* BACKGROUND */}
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

            {/* HEADER */}
            <header className="fixed left-0 top-0 z-50 w-full border-b border-yellow-400/20 bg-red-950/40 px-3 py-2 shadow-lg backdrop-blur-xl transition-all sm:px-4 sm:py-2.5 md:px-8 md:py-3">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 sm:gap-3">
                    <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-1.5 font-serif text-lg font-bold text-yellow-400 drop-shadow-md transition hover:scale-105 hover:text-yellow-200 sm:gap-2 sm:text-xl md:text-2xl">
                        <Snowflake className="h-6 w-6 shrink-0 animate-spin text-yellow-300 md:h-7 md:w-7" style={{ animationDuration: '10s' }} />
                        <span className="hidden sm:inline">Christmas Wishes</span>
                    </Link>

                    <div className="flex items-center gap-1 rounded-full border border-yellow-400/30 bg-black/40 py-0.5 pl-1 pr-1.5 shadow-xl backdrop-blur-md sm:gap-2 sm:py-1 sm:pl-1.5 sm:pr-2">
                        <Link href="/" title="Quay lại trang chủ" className="group flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-white/80 transition hover:bg-yellow-400/10 hover:text-yellow-200 sm:gap-2 sm:px-2.5 sm:text-sm">
                            <ArrowLeft className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-x-1 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline sm:inline">Trang chủ</span>
                        </Link>
                        <div className="h-4 w-px shrink-0 bg-yellow-400/20 sm:h-5" />
                        <SnowflakeBalance />
                        <div className="h-4 w-px shrink-0 bg-yellow-400/20 sm:h-5" />
                        <button type="button" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất" className="shrink-0 rounded-full p-1 text-white/60 transition hover:bg-red-900/40 hover:text-red-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 sm:p-1.5">
                            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                    </div>
                </nav>
            </header>

            {/* MAIN */}
            <div className="relative mx-auto w-full max-w-7xl grow px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
                {/* HEADING - Gọn gàng, tinh tế & đồng bộ với các trang game */}
                <div className="mb-4 text-center">
                    <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-200 sm:text-xs">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Mùa yêu thương</span>
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <h1 className="font-serif text-2xl font-black text-yellow-300 drop-shadow-md sm:text-3xl md:text-4xl">
                        Không Gian Giáng Sinh Của Tôi
                    </h1>
                    <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-red-100/75 sm:text-sm">
                        Quản lý cây thông Giáng Sinh và những món quà bí mật, lời chúc ấm áp bạn đã gửi trao đến bạn bè.
                    </p>
                    <div className="mx-auto mt-2.5 h-px w-28 bg-linear-to-r from-transparent via-yellow-400/70 to-transparent" />
                </div>

                {/* SUMMARY METRICS — Scaled & Compact */}
                <div className="mx-auto mb-4 grid max-w-5xl grid-cols-3 gap-2 sm:gap-3">
                    <div className={`${sectionClass} flex items-center gap-2.5 p-3 sm:gap-3.5 sm:p-4`}>
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-green-300/20 bg-green-400/10 text-green-200">
                            <Trees className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs text-white/50 truncate">Cây của tôi</p>
                            <p className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-green-200">{trees.length}</p>
                        </div>
                    </div>

                    <div className={`${sectionClass} flex items-center gap-2.5 p-3 sm:gap-3.5 sm:p-4`}>
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-200">
                            <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs text-white/50 truncate">Quà đã gửi</p>
                            <p className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-amber-200">{sentGifts.length}</p>
                        </div>
                    </div>

                    <div className={`${sectionClass} flex items-center gap-2.5 p-3 sm:gap-3.5 sm:p-4`}>
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10 text-yellow-300">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs text-white/50 truncate">Mùa Giáng Sinh</p>
                            <p className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-yellow-300">{currentYear ?? '—'}</p>
                        </div>
                    </div>
                </div>

                {/* TAB SWITCHER — Compact */}
                <div className="mx-auto mb-4 flex max-w-5xl items-center justify-center">
                    <div className="inline-flex rounded-full border border-amber-200/20 bg-black/40 p-1 backdrop-blur-xl">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('trees'); setMessage(null) }}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition ${activeTab === 'trees'
                                    ? 'border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 text-[#35150e] shadow-md'
                                    : 'text-amber-100/70 hover:text-white'
                                }`}
                        >
                            <TreePine className="h-3.5 w-3.5" />
                            <span>Cây thông ({trees.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveTab('sent-gifts'); setMessage(null) }}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition ${activeTab === 'sent-gifts'
                                    ? 'border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 text-[#35150e] shadow-md'
                                    : 'text-amber-100/70 hover:text-white'
                                }`}
                        >
                            <Gift className="h-3.5 w-3.5" />
                            <span>Quà đã gửi ({sentGifts.length})</span>
                        </button>
                    </div>
                </div>

                {/* MESSAGE */}
                {message && (
                    <div role="status" aria-live="polite" className={`mx-auto mb-6 flex max-w-5xl items-start gap-3 rounded-xl border p-4 text-sm shadow-lg backdrop-blur-xl ${message.type === 'success' ? 'border-green-300/25 bg-green-950/60 text-green-100' : 'border-red-300/25 bg-red-950/70 text-red-100'}`}>
                        {message.type === 'success'
                            ? <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />
                            : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />}
                        <span className="flex-1 leading-relaxed">{message.text}</span>
                        <button type="button" onClick={() => setMessage(null)} aria-label="Đóng thông báo" className="rounded-lg px-2 text-lg transition hover:bg-white/10">
                            ×
                        </button>
                    </div>
                )}

                {/* TAB CONTENT: MY TREES */}
                {activeTab === 'trees' && (
                    <>
                        {/* CREATE CURRENT YEAR TREE BANNER */}
                        {canCreateCurrentTree && (
                            <section className={`${sectionClass} mx-auto mb-5 max-w-5xl overflow-hidden`}>
                                <div className="h-1 w-full bg-linear-to-r from-transparent via-green-300 to-transparent" />
                                <div className="flex flex-col items-center gap-3.5 p-4 text-center sm:p-5 md:flex-row md:text-left">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-300/25 bg-green-400/10 text-green-200 shadow-[0_0_20px_rgba(34,197,94,0.08)]">
                                        <TreePine className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-200/70">Mùa lễ hội {currentYear}</p>
                                        <h2 className="mt-0.5 font-serif text-lg font-bold text-green-200 sm:text-xl">Tạo cây Giáng Sinh của bạn</h2>
                                        <p className="mt-1 text-xs leading-relaxed text-red-100/70">
                                            Bắt đầu một kỷ niệm mới và mời bạn bè gửi những món quà bất ngờ đến cây của bạn.
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => { setShowCreateForm(true); setMessage(null) }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-green-300/50 bg-linear-to-r from-green-700 to-green-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:border-green-200 hover:from-green-600 hover:to-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300">
                                        <Plus className="h-4 w-4" />
                                        Tạo cây mới
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* TREE COLLECTION */}
                        <section className="mx-auto max-w-5xl">
                            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-yellow-200 sm:text-2xl">Bộ sưu tập cây</h2>
                                    <p className="mt-1 text-sm text-red-100/60">Những mùa Giáng Sinh được lưu giữ qua năm tháng.</p>
                                </div>
                                <p className="text-sm text-white/50">
                                    Tổng cộng <span className="font-bold text-yellow-300">{trees.length}</span> cây
                                </p>
                            </div>

                            {sortedTrees.length === 0 ? (
                                <div className={`${sectionClass} px-4 py-8 text-center sm:px-6 sm:py-12`}>
                                    <div className="relative mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_25px_rgba(234,179,8,0.08)]">
                                        <TreePine className="h-8 w-8 text-yellow-300/80" />
                                        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-yellow-200/70" />
                                    </div>
                                    <h3 className="font-serif text-lg font-bold text-yellow-200 sm:text-xl">Khu vườn vẫn đang chờ cây đầu tiên</h3>
                                    <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-red-100/65 sm:text-sm">
                                        {canCreateCurrentTree
                                            ? 'Hãy tạo cây Giáng Sinh đầu tiên để bắt đầu lưu giữ những món quà và lời chúc.'
                                            : currentYear !== null && currentTime !== null && !currentTree
                                                ? `Bạn có thể tạo cây năm ${currentYear} từ ngày 01/12 đến trước 00:00 ngày 25/12 theo giờ Việt Nam.`
                                                : 'Khi bạn có cây Giáng Sinh, chúng sẽ xuất hiện tại đây để lưu giữ kỷ niệm mỗi mùa lễ hội.'}
                                    </p>
                                    {canCreateCurrentTree && (
                                        <button type="button" onClick={() => setShowCreateForm(true)} className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-green-300/50 bg-linear-to-r from-green-700 to-green-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:scale-[1.03] hover:from-green-600 hover:to-green-500">
                                            <Plus className="h-4 w-4" />
                                            Tạo cây đầu tiên
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {sortedTrees.map(tree => {
                                        const treeId = tree._id || tree.id || ''
                                        const isCurrentYear = tree.year === currentYear
                                        const isActive = tree.status !== 'INACTIVE'

                                        return (
                                            <article key={treeId || `${tree.year}-${tree.name}`} className={`${sectionClass} group relative flex min-w-0 flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-yellow-300/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]`}>
                                                <div className={`h-1 w-full ${tree.theme === 'winter' ? 'bg-linear-to-r from-transparent via-sky-300 to-transparent' : tree.theme === 'aurora' ? 'bg-linear-to-r from-transparent via-green-300 to-transparent' : 'bg-linear-to-r from-transparent via-yellow-300 to-transparent'}`} />

                                                <div className="relative flex flex-1 flex-col p-5">
                                                    <Snowflake className="pointer-events-none absolute right-4 top-4 h-7 w-7 text-yellow-200 opacity-20 transition group-hover:opacity-40" />

                                                    <div className="mb-5 flex items-start gap-3 pr-7">
                                                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-inner ${tree.theme === 'winter' ? 'bg-linear-to-br from-sky-400/30 to-sky-950/70 text-sky-100' : tree.theme === 'aurora' ? 'bg-linear-to-br from-green-400/30 to-green-950/70 text-green-100' : 'bg-linear-to-br from-yellow-400/30 to-red-950/70 text-yellow-100'}`}>
                                                            <TreePine className="h-8 w-8 transition duration-300 group-hover:scale-110" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-100/50">Mùa Giáng Sinh</p>
                                                            <h3 className="mt-1 font-serif text-2xl font-black text-yellow-200">{tree.year}</h3>
                                                        </div>
                                                        {isCurrentYear && (
                                                            <span className="shrink-0 rounded-full border border-green-300/25 bg-green-400/10 px-2.5 py-1 text-[10px] font-bold text-green-200">
                                                                Năm nay
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="mb-2 wrap-break-word font-serif text-lg font-bold text-white">{tree.name}</h4>

                                                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/45">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-yellow-200/60" />
                                                            {getTreeDate(tree.createdAt)}
                                                        </span>
                                                        <span className={`rounded-full border px-2 py-0.5 ${isActive ? 'border-green-300/20 bg-green-400/5 text-green-200/80' : 'border-white/10 bg-white/5 text-white/45'}`}>
                                                            {isActive ? 'Đang hoạt động' : 'Đã ngừng hoạt động'}
                                                        </span>
                                                    </div>

                                                    <div className="mb-5 flex-1 rounded-xl border border-yellow-400/10 bg-black/20 p-4">
                                                        <p className="text-sm leading-relaxed text-red-50/75">
                                                            {isCurrentYear
                                                                ? 'Cây Giáng Sinh của mùa lễ hội hiện tại, sẵn sàng lưu giữ những lời chúc và món quà.'
                                                                : `Kỷ niệm từ mùa Giáng Sinh năm ${tree.year}, được lưu giữ trong bộ sưu tập của bạn.`}
                                                        </p>
                                                    </div>

                                                    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-yellow-400/10 pt-3">
                                                        {treeId ? (
                                                            <>
                                                                <Link
                                                                    href={`/my-trees/${treeId}`}
                                                                    className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-yellow-300/25 bg-yellow-400/5 px-2 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-300/50 hover:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
                                                                >
                                                                    <TreePine className="h-4 w-4 shrink-0" />
                                                                    <span className="truncate">Xem cây</span>
                                                                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenEditModal(tree)}
                                                                    className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-amber-200/20 bg-amber-300/5 px-2 py-2.5 text-sm font-semibold text-amber-100/90 transition hover:border-amber-200/40 hover:bg-amber-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                                                                >
                                                                    <Pencil className="h-4 w-4 shrink-0" />
                                                                    <span>Chỉnh sửa</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <p className="col-span-2 text-center text-xs text-white/40">
                                                                Không tìm thấy mã cây
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* TAB CONTENT: SENT GIFTS */}
                {activeTab === 'sent-gifts' && (
                    <section className="mx-auto max-w-5xl">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-amber-200 sm:text-2xl">Món quà bạn đã gửi tới cây bạn bè</h2>
                                <p className="mt-1 text-sm text-red-100/60">
                                    Xem lại lời chúc và tinh chỉnh món quà bất cứ lúc nào trước 00:00 ngày 25/12.
                                </p>
                            </div>
                            <p className="text-sm text-white/50">
                                Tổng cộng <span className="font-bold text-amber-300">{sentGifts.length}</span> món quà
                            </p>
                        </div>

                        {sentGifts.length === 0 ? (
                            <div className={`${sectionClass} px-5 py-14 text-center sm:px-8 sm:py-20`}>
                                <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 shadow-[0_0_35px_rgba(245,158,11,0.08)]">
                                    <Gift className="h-12 w-12 text-amber-300/80" />
                                    <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-amber-200/70" />
                                </div>
                                <h3 className="font-serif text-xl font-bold text-amber-200 sm:text-2xl">Chưa có món quà nào được gửi đi</h3>
                                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-100/65">
                                    Hãy ghé thăm cây Giáng Sinh của bạn bè và gửi tặng những món quà bí mật kèm theo những lời chúc chân thành nhất!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {sentGifts.map((gift) => {
                                    const giftId = gift._id || gift.id || ''
                                    const receiverName = gift.receiverId?.fullName || 'Bạn bè'
                                    const treeName = gift.treeId?.name || 'Cây Giáng Sinh'
                                    const treeYear = gift.treeYear || gift.treeId?.year || 2026
                                    const ornamentKey = gift.ornamentType || gift.wish?.decorationType || 'gift_box'
                                    const ornamentInfo = ORNAMENT_CONFIG[ornamentKey] || { label: 'Hộp quà', icon: '🎁' }
                                    const canEdit = Boolean(gift.canEdit)
                                    const wishMessage = gift.content || gift.wish?.message || 'Lời chúc bí mật'

                                    return (
                                        <article
                                            key={giftId}
                                            className={`${sectionClass} group relative flex min-w-0 flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]`}
                                        >
                                            <div className="h-1 w-full bg-linear-to-r from-transparent via-amber-300 to-transparent" />

                                            <div className="relative flex flex-1 flex-col p-5">
                                                {/* Header info */}
                                                <div className="mb-4 flex items-start gap-3">
                                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-300/30 bg-amber-400/10 text-amber-200 shadow-sm">
                                                        {gift.receiverId?.avatar ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={gift.receiverId.avatar}
                                                                alt={receiverName}
                                                                className="h-full w-full object-cover"
                                                                referrerPolicy="no-referrer"
                                                            />
                                                        ) : (
                                                            <UserRound className="h-6 w-6 text-amber-200" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200/60">
                                                            Gửi đến
                                                        </p>
                                                        <h3 className="truncate font-serif text-lg font-bold text-amber-100">
                                                            {receiverName}
                                                        </h3>
                                                        <p className="truncate text-xs text-white/50">
                                                            {treeName} ({treeYear})
                                                        </p>
                                                    </div>

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-400/10 text-xl shadow-inner" title={ornamentInfo.label}>
                                                        {ornamentInfo.icon}
                                                    </div>
                                                </div>

                                                {/* Status & Date */}
                                                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${canEdit
                                                            ? 'border-amber-300/30 bg-amber-400/10 text-amber-200'
                                                            : 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                                                        }`}>
                                                        {canEdit ? '⏳ Có thể sửa (trước 25/12)' : '✨ Đã mở quà'}
                                                    </span>
                                                    <span className="text-white/40">
                                                        {getTreeDate(gift.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Message preview */}
                                                <div className="mb-4 flex-1 rounded-xl border border-amber-200/10 bg-black/25 p-3.5">
                                                    <p className="line-clamp-3 text-xs italic leading-relaxed text-amber-50/85">
                                                        “{wishMessage}”
                                                    </p>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-amber-200/10 pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingGift(gift)}
                                                        className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-amber-200/20 bg-amber-300/5 px-2 py-2 text-xs font-semibold text-amber-100 transition hover:border-amber-200/40 hover:bg-amber-300/10"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 shrink-0" />
                                                        <span>Xem lại</span>
                                                    </button>

                                                    {canEdit ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditGift(gift)}
                                                            className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-yellow-300/40 bg-linear-to-r from-amber-400/90 to-yellow-300/90 px-2 py-2 text-xs font-bold text-[#35150e] shadow transition hover:from-amber-300 hover:to-yellow-200"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 shrink-0" />
                                                            <span>Sửa thiệp</span>
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={gift.treeId?._id ? `/my-trees/${gift.treeId._id}` : '#'}
                                                            className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-300/25 bg-emerald-400/5 px-2 py-2 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/10"
                                                        >
                                                            <TreePine className="h-3.5 w-3.5 shrink-0" />
                                                            <span>Tới cây</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* MODAL: VIEW SENT GIFT */}
                {viewingGift && (
                    <div
                        className="fixed inset-x-0 bottom-0 top-18 z-40 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/65 px-4 py-6 backdrop-blur-md"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setViewingGift(null)
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-amber-200/20 bg-[#160d12]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                        >
                            <div className="h-1 bg-linear-to-r from-transparent via-amber-300/80 to-transparent" />

                            <div className="flex items-start justify-between border-b border-amber-200/10 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-400/8 p-2 text-amber-200">
                                        <div className="h-full w-full">
                                            {renderDecorationSvg(
                                                (viewingGift.ornamentType || viewingGift.wish?.decorationType || 'gift_box') as TreeDecorationType,
                                                getGiftColorClass(viewingGift.theme)
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/60">
                                            Món quà gửi bạn bè
                                        </p>
                                        <h2 className="mt-0.5 font-serif text-xl font-bold text-amber-100">
                                            Gửi tới {viewingGift.receiverId?.fullName || 'Bạn bè'}
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setViewingGift(null)}
                                    aria-label="Đóng"
                                    className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-amber-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4 p-6">
                                <div className="rounded-2xl border border-amber-200/15 bg-black/30 p-4">
                                    <div className="mb-2 flex items-center justify-between text-xs text-white/50">
                                        <span>Cây: {viewingGift.treeId?.name} ({viewingGift.treeYear || viewingGift.treeId?.year})</span>
                                        <span>Ngày gửi: {getTreeDate(viewingGift.createdAt)}</span>
                                    </div>
                                    <div className="mb-3 flex items-center gap-2 text-xs">
                                        <span className="rounded-full border border-amber-200/20 bg-amber-400/5 px-2.5 py-1 text-amber-200">
                                            Vật phẩm: {ORNAMENT_CONFIG[viewingGift.ornamentType || viewingGift.wish?.decorationType || 'gift_box']?.label || 'Hộp quà'}
                                        </span>
                                        <span className={`rounded-full border px-2.5 py-1 ${viewingGift.canEdit
                                                ? 'border-amber-300/30 bg-amber-400/10 text-amber-200'
                                                : 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                                            }`}>
                                            {viewingGift.canEdit ? 'Chưa mở (trước 25/12)' : 'Đã mở'}
                                        </span>
                                    </div>
                                    <div className="rounded-xl border border-amber-200/10 bg-[#071b16]/40 p-4">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-200/70">
                                            💌 Thiệp chúc viết tay
                                        </p>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-50">
                                            {viewingGift.content || viewingGift.wish?.message || 'Không có nội dung'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setViewingGift(null)}
                                        className={buttonClass}
                                    >
                                        Đóng
                                    </button>

                                    {viewingGift.canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditGift(viewingGift)}
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 px-5 py-2.5 text-sm font-bold text-[#35150e] transition hover:from-amber-300 hover:to-yellow-200"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span>Chỉnh sửa thiệp</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* MODAL: EDIT SENT GIFT */}
                {editingGift && (
                    <div
                        className="fixed inset-x-0 bottom-0 top-18 z-40 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/65 px-4 py-6 backdrop-blur-md"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !updatingGift) setEditingGift(null)
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-amber-200/20 bg-[#160d12]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                        >
                            <div className="h-1 bg-linear-to-r from-transparent via-amber-300/80 to-transparent" />

                            <div className="flex items-start justify-between border-b border-amber-200/10 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-400/8 text-amber-200">
                                        <Pencil className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/60">
                                            Chỉnh sửa món quà & lời chúc
                                        </p>
                                        <h2 className="mt-0.5 font-serif text-xl font-bold text-amber-100">
                                            Gửi tới {editingGift.receiverId?.fullName || 'Bạn bè'}
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEditingGift(null)}
                                    disabled={updatingGift}
                                    aria-label="Đóng"
                                    className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-amber-100 disabled:opacity-40"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateGift} className="space-y-5 p-6">
                                <p className="text-xs leading-relaxed text-amber-100/70">
                                    💡 Bạn có thể chỉnh sửa nội dung thiệp và vật phẩm trang trí bất cứ lúc nào trước 00:00 ngày 25/12.
                                </p>

                                {/* Ornament selection */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-200/70">
                                        Vật phẩm treo cây
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(ORNAMENT_CONFIG).map(([typeKey, opt]) => {
                                            const selected = editGiftOrnament === typeKey
                                            return (
                                                <button
                                                    key={typeKey}
                                                    type="button"
                                                    onClick={() => setEditGiftOrnament(typeKey)}
                                                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition ${selected
                                                            ? 'border-amber-300 bg-amber-400/20 text-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                                            : 'border-white/10 bg-black/30 text-white/70 hover:border-white/20'
                                                        }`}
                                                >
                                                    <span className="text-xl">{opt.icon}</span>
                                                    <span className="truncate text-[11px]">{opt.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Box color */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-200/70">
                                        Màu sắc hộp quà
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {BOX_COLOR_OPTIONS.map((c) => {
                                            const selected = editGiftTheme === c.id
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => setEditGiftTheme(c.id)}
                                                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${selected
                                                            ? 'border-amber-300 bg-amber-400/20 text-yellow-100 ring-2 ring-amber-300/40'
                                                            : 'border-white/10 bg-black/30 text-white/70 hover:border-white/20'
                                                        }`}
                                                >
                                                    <span className={`h-3 w-3 rounded-full ${c.bgClass}`} />
                                                    <span>{c.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Wish content */}
                                <div>
                                    <label htmlFor="edit-gift-content" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-200/70">
                                        Thiệp chúc viết tay (bắt buộc)
                                    </label>
                                    <textarea
                                        id="edit-gift-content"
                                        rows={4}
                                        value={editGiftContent}
                                        onChange={(e) => setEditGiftContent(e.target.value)}
                                        maxLength={2000}
                                        required
                                        placeholder="Viết những lời chúc ấm áp nhất..."
                                        className="w-full rounded-xl border border-amber-200/15 bg-black/30 p-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-amber-200/40 focus:ring-2 focus:ring-amber-200/6"
                                    />
                                    <p className="mt-1 text-right text-xs text-white/35">
                                        {editGiftContent.length}/2000 ký tự
                                    </p>
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-amber-200/10 pt-4 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setEditingGift(null)}
                                        disabled={updatingGift}
                                        className={buttonClass}
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={updatingGift || !editGiftContent.trim()}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/40 bg-linear-to-r from-amber-400 to-yellow-300 px-6 py-2.5 text-sm font-bold text-[#35150e] transition hover:from-amber-300 hover:to-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updatingGift ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Đang lưu...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                <span>Lưu thay đổi</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {/* MODAL: CREATE TREE */}
                {showCreateForm && canCreateCurrentTree && (
                    <EditTreeModal
                        isOpen={showCreateForm}
                        mode="create"
                        treeName=""
                        treeTheme="classic"
                        treeYear={currentYear ?? new Date().getFullYear()}
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={handleCreateTreeSubmit}
                    />
                )}

                {/* MODAL: EDIT TREE */}
                {editingTree && (
                    <EditTreeModal
                        isOpen={Boolean(editingTree)}
                        mode="edit"
                        treeName={editingTree.name}
                        treeTheme={(editingTree.theme as TreeTheme) || 'classic'}
                        treeYear={editingTree.year}
                        existingGifts={(editingTree as any).gifts}
                        onClose={() => setEditingTree(null)}
                        onSubmit={handleUpdateTreeSubmit}
                    />
                )}
            </div>

            {/* FOOTER */}
            <footer className="relative z-10 mt-8 border-t border-yellow-400/10 bg-black/20 px-4 py-5 text-center text-xs text-white/50 backdrop-blur-sm md:text-sm">
                <p>© {currentYear ?? new Date().getFullYear()} Christmas Wishes</p>
                <p className="mt-1 text-yellow-100/40">Made with ❤️ for a magical Christmas</p>
            </footer>
        </main>
    )
}
