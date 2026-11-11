'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gift, Copy, Check, ExternalLink, ArrowLeft, Snowflake, Trash2, Edit2, Calendar, Inbox, Send, Sparkles, Loader2, Clock, AlertCircle, LogOut } from 'lucide-react'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import { getValidAuthToken, clearAuthData } from '@/utils/auth'

type GiftItem = {
    id?: string
    _id?: string
    senderId?: string | { _id?: string; id?: string }
    receiverId?: string | { _id?: string; id?: string }
    senderName?: string
    receiverName?: string
    content?: string
    theme?: string
    createdAt?: string
}

type UserInfo = {
    id?: string
    _id?: string
    username?: string
    fullName?: string
}

type Message = {
    type: 'success' | 'error'
    text: string
}

const getId = (value: GiftItem['senderId'] | GiftItem['receiverId'] | UserInfo | string | undefined): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return String(value._id || value.id || '')
}

const getGiftDate = (date?: string) => {
    if (!date || Number.isNaN(new Date(date).getTime())) {
        return 'Chưa rõ ngày'
    }

    return new Date(date).toLocaleDateString('vi-VN')
}

export default function MyGiftsPage() {
    const router = useRouter()

    const [gifts, setGifts] = useState<GiftItem[]>([])
    const [userId, setUserId] = useState('')
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent')
    const [selectedYear, setSelectedYear] = useState('all')
    const [message, setMessage] = useState<Message | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [currentYear, setCurrentYear] = useState<number | null>(null)

    useEffect(() => {
        const year = new Date().getFullYear()
        setCurrentYear(year)

        const token = getValidAuthToken()
        const userInfoString = localStorage.getItem('user_info')

        if (!token || !userInfoString) {
            clearAuthData()
            router.replace('/login?session_expired=true')
            return
        }

        try {
            const user: UserInfo = JSON.parse(userInfoString)
            const id = getId(user)

            if (!id) {
                setMessage({ type: 'error', text: 'Không xác định được tài khoản. Vui lòng đăng nhập lại.' })
                setLoading(false)
                return
            }

            setUserId(id)

            const fetchGifts = async () => {
                try {
                    const res = await api.get('/gifts')
                    const data = Array.isArray(res.data) ? res.data : res.data?.gifts
                    setGifts(Array.isArray(data) ? data : [])
                } catch (error) {
                    console.error('Lỗi khi tải danh sách quà:', error)
                    setMessage({ type: 'error', text: 'Không thể tải danh sách quà. Vui lòng thử lại.' })
                } finally {
                    setLoading(false)
                }
            }

            fetchGifts()
        } catch (error) {
            console.error('Lỗi khi đọc thông tin người dùng:', error)
            clearAuthData()
            router.replace('/login')
        }
    }, [router])

    const mySentGifts = useMemo(() => gifts.filter(gift => getId(gift.senderId) === userId), [gifts, userId])
    const myReceivedGifts = useMemo(() => gifts.filter(gift => getId(gift.receiverId) === userId), [gifts, userId])
    const currentList = activeTab === 'sent' ? mySentGifts : myReceivedGifts

    const years = useMemo(() => {
        return Array.from(
            new Set(
                currentList
                    .filter(gift => gift.createdAt && !Number.isNaN(new Date(gift.createdAt).getTime()))
                    .map(gift => new Date(gift.createdAt!).getFullYear().toString()),
            ),
        ).sort((a, b) => Number(b) - Number(a))
    }, [currentList])

    const filteredGifts = useMemo(() => {
        return selectedYear === 'all'
            ? currentList
            : currentList.filter(
                gift =>
                    gift.createdAt &&
                    !Number.isNaN(new Date(gift.createdAt).getTime()) &&
                    new Date(gift.createdAt).getFullYear().toString() === selectedYear,
            )
    }, [currentList, selectedYear])

    const handleTabChange = (tab: 'sent' | 'received') => {
        setActiveTab(tab)
        setSelectedYear('all')
        setMessage(null)
    }

    const handleCopyLink = async (giftId: string) => {
        try {
            const link = `${window.location.origin}/gifts/${giftId}`
            await navigator.clipboard.writeText(link)

            setCopiedId(giftId)
            setMessage({ type: 'success', text: 'Đã sao chép liên kết món quà!' })

            window.setTimeout(
                () => setCopiedId(current => current === giftId ? null : current),
                2000,
            )
        } catch {
            setMessage({ type: 'error', text: 'Không thể sao chép liên kết. Vui lòng kiểm tra quyền truy cập clipboard.' })
        }
    }

    const handleDelete = async (giftId: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn món quà này?')) {
            return
        }

        setDeletingId(giftId)
        setMessage(null)

        try {
            await api.delete(`/gifts/${giftId}`)
            setGifts(prev => prev.filter(gift => (gift._id || gift.id) !== giftId))
            setMessage({ type: 'success', text: 'Đã xóa món quà thành công!' })
        } catch (error) {
            console.error('Lỗi khi xóa quà:', error)
            setMessage({ type: 'error', text: 'Không thể xóa món quà. Vui lòng thử lại.' })
        } finally {
            setDeletingId(null)
        }
    }

    const handleEdit = (giftId: string) => {
        router.push(`/create?edit=${giftId}`)
    }

    const handleLogout = () => {
        clearAuthData()
        router.replace('/login')
    }

    const sectionClass = 'rounded-3xl border border-yellow-400/20 bg-black/30 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl'
    const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/40 bg-black/25 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition duration-300 hover:border-yellow-300/70 hover:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-50'

    if (loading) {
        return (
            <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-red-950 font-sans text-white">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-900/60 via-red-950 to-green-950/70" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                        <Snowflake className="h-12 w-12 animate-spin text-yellow-300" />
                    </div>

                    <p className="animate-pulse font-serif text-lg text-yellow-100">
                        Đang lục lọi trong túi quà...
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
            {/* BACKGROUND - ĐỒNG BỘ PROFILE, KHÔNG DÙNG ẢNH */}
            <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden bg-gradient-to-b from-red-950 via-red-950 to-green-950">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-[100px]" />
                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.04] blur-[120px]" />
                <Snowflake className="absolute left-[8%] top-[20%] h-10 w-10 text-yellow-100/15" />
                <Snowflake className="absolute right-[12%] top-[28%] h-14 w-14 animate-pulse text-yellow-100/15" />
                <Snowflake className="absolute bottom-[15%] left-[15%] h-9 w-9 text-white/10" />
                <Snowflake className="absolute bottom-[12%] right-[10%] h-8 w-8 text-yellow-100/15" />
                <Sparkles className="absolute left-[25%] top-[35%] h-5 w-5 text-yellow-300/20" />
                <Sparkles className="absolute bottom-[30%] right-[25%] h-6 w-6 text-yellow-300/20" />
            </div>

            {/* HEADER - ĐỒNG BỘ PROFILE */}
            <header className="fixed left-0 top-0 z-50 w-full border-b border-yellow-400/20 bg-red-950/40 px-4 py-3 shadow-lg backdrop-blur-xl md:px-8">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
                    <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 font-serif text-xl font-bold text-yellow-400 transition hover:scale-105 hover:text-yellow-200 md:text-2xl">
                        <Snowflake className="h-7 w-7 shrink-0 animate-spin md:h-8 md:w-8" />
                        <span className="hidden sm:inline">Christmas Wishes</span>
                    </Link>

                    <div className="flex min-w-0 items-center gap-1 rounded-full border border-yellow-400/30 bg-black/40 py-1 pl-1 pr-2 shadow-lg backdrop-blur-md md:gap-2">
                        <Link href="/" title="Quay lại trang chủ" className="group flex min-w-0 items-center gap-2 rounded-full px-2 py-2 text-sm text-white/80 transition hover:bg-red-900/50 hover:text-yellow-200 md:gap-3 md:px-3">
                            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                            <span className="hidden sm:inline">Trang chủ</span>
                        </Link>

                        <div className="mx-1 h-6 w-px shrink-0 bg-white/20" />

                        <button type="button" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất" className="shrink-0 rounded-full p-2 text-white/70 transition hover:bg-red-900/60 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </nav>
            </header>

            {/* MAIN CONTENT */}
            <div className="relative z-10 mx-auto w-full max-w-7xl grow px-4 pb-12 pt-28 sm:px-6 md:pt-32">
                {/* PAGE HEADING */}
                <div className="mb-8 text-center">
                    <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200 sm:text-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>Mùa yêu thương</span>
                        <Sparkles className="h-4 w-4" />
                    </div>

                    <h1 className="font-serif text-3xl font-black text-yellow-300 drop-shadow-md sm:text-4xl md:text-5xl">
                        Hộp Quà Của Tôi
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-red-100/80 sm:text-base">
                        Nơi lưu giữ những món quà bí mật và lời chúc ấm áp trong mùa lễ hội.
                    </p>

                    <div className="mx-auto mt-5 h-px w-32 bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />
                </div>

                {/* SUMMARY */}
                <div className="mx-auto mb-6 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className={`${sectionClass} flex items-center gap-4 p-5`}>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10 text-yellow-300">
                            <Send className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-xs text-white/50">Quà đã gửi</p>
                            <p className="font-serif text-2xl font-bold text-yellow-300">{mySentGifts.length}</p>
                        </div>
                    </div>

                    <div className={`${sectionClass} flex items-center gap-4 p-5`}>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-300/20 bg-green-400/10 text-green-200">
                            <Inbox className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-xs text-white/50">Quà đã nhận</p>
                            <p className="font-serif text-2xl font-bold text-green-200">{myReceivedGifts.length}</p>
                        </div>
                    </div>

                    <div className={`${sectionClass} flex items-center gap-4 p-5`}>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10 text-yellow-300">
                            <Gift className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-xs text-white/50">Tổng kỷ niệm</p>
                            <p className="font-serif text-2xl font-bold text-yellow-300">{mySentGifts.length + myReceivedGifts.length}</p>
                        </div>
                    </div>
                </div>

                {/* MESSAGE */}
                {message && (
                    <div role="status" aria-live="polite" className={`mx-auto mb-6 flex max-w-5xl items-start gap-3 rounded-xl border p-4 text-sm shadow-lg backdrop-blur-xl ${message.type === 'success' ? 'border-green-300/25 bg-green-950/60 text-green-100' : 'border-red-300/25 bg-red-950/70 text-red-100'}`}>
                        {message.type === 'success' ? (
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />
                        ) : (
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                        )}

                        <span className="flex-1 leading-relaxed">{message.text}</span>

                        <button type="button" onClick={() => setMessage(null)} aria-label="Đóng thông báo" className="rounded-lg px-2 text-lg transition hover:bg-white/10">
                            ×
                        </button>
                    </div>
                )}

                {/* FILTERS */}
                <section className={`${sectionClass} mx-auto mb-6 w-full max-w-5xl p-4 sm:p-5`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <h2 className="font-serif text-lg font-bold text-yellow-200 sm:text-xl">Bộ sưu tập kỷ niệm</h2>
                            <p className="mt-1 text-xs leading-relaxed text-red-100/60">Tìm lại những lời chúc và món quà của bạn.</p>
                        </div>

                        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(130px,0.8fr)_minmax(0,1.5fr)] lg:w-[410px] lg:shrink-0">
                            <div className="relative min-w-0">
                                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-200/60" />

                                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} aria-label="Lọc theo năm" className="h-10 w-full min-w-0 appearance-none rounded-xl border border-yellow-400/20 bg-black/25 py-0 pl-9 pr-8 text-sm text-white outline-none transition hover:border-yellow-300/35 focus:border-yellow-300/60 focus:ring-2 focus:ring-yellow-400/10 sm:w-36">
                                    <option value="all" className="bg-red-950">Tất cả năm</option>
                                    {years.map(year => (
                                        <option key={year} value={year} className="bg-red-950">{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex h-10 min-w-0 rounded-xl border border-yellow-400/20 bg-black/30 p-1">
                                <button type="button" onClick={() => handleTabChange('sent')} aria-pressed={activeTab === 'sent'} className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition sm:gap-2 ${activeTab === 'sent' ? 'bg-gradient-to-r from-yellow-500 to-yellow-300 text-red-950 shadow-md' : 'text-white/60 hover:bg-white/5 hover:text-yellow-200'}`}>
                                    <Send className="h-3.5 w-3.5 shrink-0" />
                                    <span className="whitespace-nowrap">Đã gửi</span>
                                    <span className="shrink-0 tabular-nums opacity-70">{mySentGifts.length}</span>
                                </button>

                                <button type="button" onClick={() => handleTabChange('received')} aria-pressed={activeTab === 'received'} className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition sm:gap-2 ${activeTab === 'received' ? 'bg-gradient-to-r from-yellow-500 to-yellow-300 text-red-950 shadow-md' : 'text-white/60 hover:bg-white/5 hover:text-yellow-200'}`}>
                                    <Inbox className="h-3.5 w-3.5 shrink-0" />
                                    <span className="whitespace-nowrap">Đã nhận</span>
                                    <span className="shrink-0 tabular-nums opacity-70">{myReceivedGifts.length}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* EMPTY STATE */}
                {!loading && filteredGifts.length === 0 && (
                    <section className={`${sectionClass} mx-auto max-w-5xl px-5 py-14 text-center sm:px-8 sm:py-20`}>
                        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_35px_rgba(234,179,8,0.08)]">
                            {activeTab === 'sent' ? (
                                <Gift className="h-12 w-12 text-yellow-300/80" />
                            ) : (
                                <Inbox className="h-12 w-12 text-yellow-300/80" />
                            )}
                            <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-yellow-200/70" />
                        </div>

                        <p className="font-serif text-xl font-bold text-yellow-200 sm:text-2xl">
                            {activeTab === 'sent' ? 'Chiếc hộp quà vẫn đang chờ bạn!' : 'Một món quà bất ngờ vẫn chưa ghé thăm'}
                        </p>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-100/65">
                            {selectedYear !== 'all'
                                ? `Không tìm thấy món quà nào trong năm ${selectedYear}.`
                                : activeTab === 'sent'
                                    ? 'Hãy gửi lời chúc chân thành và tạo nên một kỷ niệm thật đẹp.'
                                    : 'Hãy chia sẻ niềm vui Giáng Sinh cùng bạn bè và người thân nhé.'}
                        </p>

                        {activeTab === 'sent' && (
                            <Link href="/create" className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/70 bg-gradient-to-r from-yellow-500 to-yellow-300 px-6 py-3 text-sm font-bold text-red-950 shadow-lg transition hover:scale-[1.03] hover:from-yellow-300 hover:to-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200">
                                <Gift className="h-5 w-5" />
                                Gửi món quà đầu tiên
                            </Link>
                        )}
                    </section>
                )}

                {/* GIFT LIST */}
                {filteredGifts.length > 0 && (
                    <>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-sm text-white/60">
                                Tìm thấy <span className="font-bold text-yellow-300">{filteredGifts.length}</span> món quà
                            </p>

                            {selectedYear !== 'all' && (
                                <button type="button" onClick={() => setSelectedYear('all')} className="text-xs text-yellow-200/80 underline underline-offset-4 transition hover:text-yellow-100">
                                    Xóa bộ lọc năm
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredGifts.map(gift => {
                                const giftId = gift._id || gift.id || ''
                                const isSent = activeTab === 'sent'

                                return (
                                    <article key={giftId} className={`${sectionClass} group relative flex min-w-0 flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-yellow-300/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]`}>
                                        <div className={`h-1 w-full ${gift.theme === 'green_box' ? 'bg-gradient-to-r from-transparent via-green-400 to-transparent' : gift.theme === 'gold_box' ? 'bg-gradient-to-r from-transparent via-yellow-200 to-transparent' : 'bg-gradient-to-r from-transparent via-red-400 to-transparent'}`} />

                                        <div className="relative flex flex-1 flex-col p-5">
                                            <div className="pointer-events-none absolute right-4 top-4 opacity-20 transition group-hover:opacity-40">
                                                <Snowflake className="h-7 w-7 text-yellow-200" />
                                            </div>

                                            <div className="mb-4 flex items-start gap-3 pr-7">
                                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-inner ${gift.theme === 'green_box' ? 'bg-gradient-to-br from-green-500/40 to-green-950/70 text-green-100' : gift.theme === 'gold_box' ? 'bg-gradient-to-br from-yellow-400/40 to-yellow-800/40 text-yellow-100' : 'bg-gradient-to-br from-red-500/40 to-red-950/70 text-red-100'}`}>
                                                    <Gift className="h-6 w-6" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-100/50">{isSent ? 'Người nhận' : 'Người gửi'}</p>
                                                    <h3 className="mt-1 truncate font-serif text-lg font-bold text-yellow-200">{isSent ? gift.receiverName || 'Người nhận' : gift.senderName || 'Người gửi'}</h3>
                                                </div>
                                            </div>

                                            <div className="mb-4 flex items-center gap-2 text-xs text-white/45">
                                                <Clock className="h-3.5 w-3.5 shrink-0 text-yellow-200/60" />
                                                <span>{getGiftDate(gift.createdAt)}</span>
                                            </div>

                                            <div className="mb-5 flex-1 rounded-xl border border-yellow-400/10 bg-black/20 p-4">
                                                <p className="line-clamp-4 whitespace-pre-wrap break-words font-serif text-sm italic leading-relaxed text-red-50/85">
                                                    {gift.content ? `“${gift.content}”` : 'Món quà này chưa có lời nhắn.'}
                                                </p>
                                            </div>

                                            {/* ACTION BUTTONS - COMPACT */}
                                            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-yellow-400/10 pt-3">
                                                <button type="button" onClick={() => handleCopyLink(giftId)} disabled={!giftId} className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-2 text-xs font-semibold text-yellow-100 transition hover:border-yellow-300/50 hover:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:opacity-40">
                                                    {copiedId === giftId ? (
                                                        <Check className="h-3.5 w-3.5 shrink-0 text-green-300" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5 shrink-0" />
                                                    )}
                                                    <span className="truncate">{copiedId === giftId ? 'Đã sao chép' : 'Sao chép link'}</span>
                                                </button>

                                                <Link href={`/gifts/${giftId}`} className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-yellow-300/25 bg-red-900/20 px-2 text-xs font-semibold text-yellow-100 transition hover:border-yellow-300/50 hover:bg-red-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">Xem quà</span>
                                                </Link>
                                            </div>

                                            {isSent && (
                                                <div className="mt-2 grid grid-cols-2 gap-2">
                                                    <button type="button" onClick={() => handleEdit(giftId)} disabled={!giftId} className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-green-400/20 bg-green-500/5 px-2 text-xs font-medium text-green-100/90 transition hover:border-green-300/40 hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 disabled:opacity-40">
                                                        <Edit2 className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">Chỉnh sửa</span>
                                                    </button>

                                                    <button type="button" onClick={() => handleDelete(giftId)} disabled={!giftId || deletingId === giftId} className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-red-400/20 bg-red-500/5 px-2 text-xs font-medium text-red-100/90 transition hover:border-red-300/40 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-40">
                                                        {deletingId === giftId ? (
                                                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                                        )}
                                                        <span className="truncate">{deletingId === giftId ? 'Đang xóa...' : 'Xóa quà'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* FOOTER NOTE */}
                <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-3 text-center">
                    <Snowflake className="h-4 w-4 shrink-0 text-yellow-200/40" />
                    <p className="font-serif text-sm italic text-yellow-100/50">“Trao yêu thương, nhận hạnh phúc” ✨</p>
                    <Snowflake className="h-4 w-4 shrink-0 text-yellow-200/40" />
                </div>
            </div>

            {/* FOOTER - ĐỒNG BỘ PROFILE */}
            <footer className="relative z-10 mt-8 border-t border-yellow-400/10 bg-black/20 px-4 py-5 text-center text-xs text-white/50 backdrop-blur-sm md:text-sm">
                <p>© {currentYear ?? new Date().getFullYear()} Christmas Wishes</p>
                <p className="mt-1 text-yellow-100/40">Made with ❤️ for a magical Christmas</p>
            </footer>
        </main>
    )
}