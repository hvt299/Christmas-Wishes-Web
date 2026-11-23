'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Camera, Lock, Save, Snowflake, Loader2, Settings, KeyRound, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff, Gift, LogOut } from 'lucide-react'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import { getValidAuthToken, clearAuthData, setAuthSession } from '@/utils/auth'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

type UserInfo = {
    _id?: string
    fullName?: string
    username?: string
    email?: string
    avatar?: string
    role?: string
    isActive?: boolean
    isVerified?: boolean
    createdAt?: string
    updatedAt?: string
    coins?: number
    snowflakes?: number
}

type Message = {
    type: 'success' | 'error'
    text: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

    const [loading, setLoading] = useState(false)
    const [profileLoading, setProfileLoading] = useState(true)
    const [message, setMessage] = useState<Message | null>(null)
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [username, setUsername] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        const userInfoStr = localStorage.getItem('user_info')
        const token = getValidAuthToken()

        if (!userInfoStr || !token) {
            clearAuthData()
            router.replace('/login?session_expired=true')
            return
        }

        try {
            const user: UserInfo = JSON.parse(userInfoStr)
            setUserInfo(user)
            setFullName(user.fullName || user.username || '')
            setAvatarUrl(user.avatar || '')
            setUsername(user.username || '')
        } catch (error) {
            console.error('Lỗi đọc thông tin người dùng:', error)
            localStorage.removeItem('user_info')
            router.replace('/login')
        } finally {
            setProfileLoading(false)
        }
    }, [router])

    const handleLogout = () => {
        clearAuthData()
        router.replace('/login')
    }

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const res = await api.patch('/users/profile', {
                fullName: fullName.trim(),
                avatar: avatarUrl.trim(),
            })

            const updatedUser = res.data.user || res.data
            const currentUserStr = localStorage.getItem('user_info')

            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr)
                const nextUser = {
                    ...currentUser,
                    fullName: updatedUser.fullName ?? fullName.trim(),
                    avatar: updatedUser.avatar ?? avatarUrl.trim(),
                }

                if (res.data.access_token) {
                    setAuthSession(res.data.access_token, nextUser)
                } else {
                    localStorage.setItem('user_info', JSON.stringify(nextUser))
                }
                setUserInfo(nextUser)
                setFullName(nextUser.fullName || '')
                setAvatarUrl(nextUser.avatar || '')
                setUsername(nextUser.username || '')
            }

            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' })
        } catch (error: any) {
            const errorMsg = error.response?.data?.message
            setMessage({ type: 'error', text: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || 'Cập nhật hồ sơ thất bại!' })
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMessage(null)

        if (!currentPassword) {
            setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại!' })
            return
        }

        if (!passwordRegex.test(newPassword)) {
            setMessage({ type: 'error', text: 'Mật khẩu cần tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.' })
            return
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' })
            return
        }

        if (currentPassword === newPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải khác mật khẩu hiện tại!' })
            return
        }

        setLoading(true)

        try {
            await api.put('/auth/change-password', { currentPassword, newPassword })
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            const errorMsg = error.response?.data?.message
            setMessage({ type: 'error', text: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || 'Đổi mật khẩu thất bại!' })
        } finally {
            setLoading(false)
        }
    }

    const inputClass = 'w-full rounded-xl border border-yellow-400/15 bg-black/25 py-3 pl-11 pr-4 font-sans text-sm text-white outline-none transition duration-300 placeholder:text-white/40 focus:border-yellow-300/60 focus:ring-2 focus:ring-yellow-400/10'
    const labelClass = 'mb-2 block font-sans text-sm font-medium text-yellow-50/90'
    const iconClass = 'absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-200/60'
    const sectionClass = 'overflow-hidden rounded-3xl border border-yellow-400/20 bg-black/30 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl'
    const passwordButtonClass = 'absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/50 transition hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400'

    if (profileLoading) {
        return (
            <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-red-950 font-sans text-white">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-red-900/60 via-red-950 to-green-950/70" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                        <Snowflake className="h-12 w-12 animate-spin text-yellow-300" />
                    </div>
                    <p className="animate-pulse font-serif text-lg text-yellow-100">Đang chuẩn bị hồ sơ...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
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

            {/* HEADER - ĐỒNG BỘ TRANG CHỦ */}
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
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 md:pt-32">
                {/* PAGE HEADING */}
                <div className="mb-8 text-center">
                    <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200 sm:text-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>Mùa yêu thương</span>
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <h1 className="font-serif text-3xl font-black text-yellow-300 drop-shadow-md sm:text-4xl md:text-5xl">Hồ Sơ Của Tôi</h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-red-100/80 sm:text-base">Quản lý thông tin cá nhân và bảo vệ tài khoản của bạn trong mùa lễ hội yêu thương.</p>
                </div>

                {/* MESSAGE */}
                {message && (
                    <div role="status" aria-live="polite" className={`mx-auto mb-6 flex max-w-5xl items-start gap-3 rounded-xl border p-4 text-sm shadow-lg backdrop-blur-xl ${message.type === 'success' ? 'border-green-300/25 bg-green-950/60 text-green-100' : 'border-red-300/25 bg-red-950/70 text-red-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-300" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />}
                        <span className="flex-1 leading-relaxed">{message.text}</span>
                        <button type="button" onClick={() => setMessage(null)} aria-label="Đóng thông báo" className="rounded-lg p-1 transition hover:bg-white/10">×</button>
                    </div>
                )}

                <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* PROFILE CARD */}
                    <aside className="lg:col-span-4">
                        <section className={`${sectionClass} relative p-6 text-center sm:p-8`}>
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-red-900/35 via-transparent to-green-950/30" />
                            <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-transparent via-yellow-400 to-transparent" />
                            <Snowflake className="pointer-events-none absolute right-5 top-5 h-7 w-7 text-yellow-100/20" />
                            <Sparkles className="pointer-events-none absolute bottom-6 left-5 h-5 w-5 text-yellow-300/30" />

                            <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border-2 border-yellow-400/70 bg-linear-to-br from-red-800 to-red-950 p-1 shadow-[0_0_35px_rgba(234,179,8,0.15)] sm:h-32 sm:w-32">
                                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-red-950">
                                    {avatarUrl.trim() ? (
                                        <img src={avatarUrl.trim()} alt="Ảnh đại diện" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                    ) : (
                                        <User className="h-14 w-14 text-yellow-200/70 sm:h-16 sm:w-16" />
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-red-950 bg-yellow-400 text-red-950 shadow-lg">
                                    <Camera className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="relative">

                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-100/60">Thành viên Giáng Sinh</p>
                                <h2 className="wrap-break-word font-serif text-2xl font-bold text-yellow-200 sm:text-3xl">{fullName || 'Chưa đặt tên'}</h2>
                                {userInfo?.email && <p className="mt-2 break-all text-sm text-red-100/70">{userInfo.email}</p>}
                                {username && <p className="mt-2 break-all text-sm text-red-100/60">@{username}</p>}

                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <span className="rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
                                        {userInfo?.role || 'USER'}
                                    </span>
                                </div>

                                <div className="mx-auto my-6 h-px w-4/5 bg-linear-to-r from-transparent via-yellow-400/35 to-transparent" />

                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3 rounded-xl border border-yellow-400/10 bg-black/20 p-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-300">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-white/45">Tên hiển thị</p>
                                            <p className="truncate text-sm font-medium text-white/90">{fullName || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl border border-yellow-400/10 bg-black/20 p-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-400/10 ${userInfo?.isActive ? 'text-green-200' : 'text-red-300'}`}>
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-white/45">Trạng thái tài khoản</p>
                                            <p className={`text-sm font-medium ${userInfo?.isActive ? 'text-green-200' : 'text-red-300'}`}>
                                                {userInfo?.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-yellow-400/10 bg-black/20 p-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-400/10 ${userInfo?.isActive ? 'text-green-200' : 'text-red-300'}`}>
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-white/45">Email xác minh</p>
                                            <p className={`text-sm font-medium ${userInfo?.isActive ? 'text-green-200' : 'text-red-300'}`}>
                                                {userInfo?.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-yellow-400/10 bg-black/20 p-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-200">
                                            <Settings className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-white/45">Ngày tham gia</p>
                                            <p className="text-sm font-medium text-white/90">
                                                {userInfo?.createdAt && !Number.isNaN(new Date(userInfo.createdAt).getTime())
                                                    ? new Date(userInfo.createdAt).toLocaleDateString('vi-VN')
                                                    : 'Chưa có thông tin'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-6 font-serif text-sm italic leading-relaxed text-yellow-100/60">“Trao yêu thương, nhận hạnh phúc” ✨</p>
                            </div>
                        </section>

                        {/* SNOWFLAKES */}
                        <div className="mt-4 rounded-2xl border border-blue-300/20 bg-black/25 p-5 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-blue-300">
                                    <Snowflake className="h-7 w-7" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-white/50">Số dư bông tuyết</p>
                                    <p className="font-serif text-2xl font-bold text-blue-300">
                                        {(userInfo?.snowflakes ?? 0).toLocaleString('vi-VN')} bông tuyết
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-blue-100/60">
                                ❄️ Bông tuyết là điểm tích lũy của bạn trong mùa Giáng Sinh.
                            </p>
                        </div>

                        {/* COINS */}
                        <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-black/25 p-5 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10 text-2xl">
                                    🪙
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-white/50">Số dư xu</p>
                                    <p className="font-serif text-2xl font-bold text-yellow-300">
                                        {(userInfo?.coins ?? 0).toLocaleString('vi-VN')} xu
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-yellow-100/60">
                                🪙 Xu chỉ sử dụng cho Tết Countdown, không áp dụng cho website Christmas Wishes.
                            </p>
                        </div>

                        <div className="mt-4 rounded-2xl border border-yellow-400/15 bg-black/25 p-5 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-300/10 text-yellow-300">
                                    <Gift className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-yellow-200">Góc nhỏ yêu thương</h3>
                                    <p className="mt-1 text-xs leading-relaxed text-red-100/65">Lưu giữ những khoảnh khắc đáng nhớ của mùa lễ hội.</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* SETTINGS */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* PERSONAL INFORMATION */}
                        <section className={sectionClass}>
                            <div className="h-1 w-full bg-linear-to-r from-transparent via-yellow-400/70 to-transparent" />
                            <div className="p-5 sm:p-7">
                                <div className="mb-6 flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
                                        <Settings className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-yellow-200 sm:text-2xl">Thông Tin Cá Nhân</h2>
                                        <p className="mt-1 text-sm leading-relaxed text-red-100/60">Cập nhật thông tin và ảnh đại diện của bạn.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div>
                                        <label htmlFor="fullName" className={labelClass}>Tên hiển thị</label>
                                        <div className="relative">
                                            <User className={iconClass} />
                                            <input id="fullName" type="text" maxLength={100} autoComplete="name" className={inputClass} placeholder="Nhập tên bạn muốn hiển thị" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="avatarUrl" className={labelClass}>Đường dẫn ảnh đại diện</label>
                                        <div className="relative">
                                            <Camera className={iconClass} />
                                            <input id="avatarUrl" type="url" className={inputClass} placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed text-red-100/45">Dán đường dẫn ảnh công khai để cập nhật avatar.</p>
                                    </div>

                                    {avatarUrl.trim() && (
                                        <div className="flex items-center gap-3 rounded-xl border border-yellow-400/10 bg-black/20 p-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-yellow-300/30 bg-red-950">
                                                <img src={avatarUrl.trim()} alt="Xem trước ảnh đại diện" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-yellow-100/90">Xem trước ảnh đại diện</p>
                                                <p className="truncate text-xs text-white/40">{avatarUrl}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3 border-t border-yellow-400/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs leading-relaxed text-white/40">Thông tin sẽ được lưu vào hồ sơ của bạn.</p>
                                        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/70 bg-linear-to-r from-yellow-500 to-yellow-300 px-6 py-3 text-sm font-bold text-red-950 shadow-lg transition duration-300 hover:scale-[1.02] hover:from-yellow-300 hover:to-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </section>

                        {/* PASSWORD */}
                        <section className={sectionClass}>
                            <div className="h-1 w-full bg-linear-to-r from-transparent via-green-500/70 to-transparent" />
                            <div className="p-5 sm:p-7">
                                <div className="mb-6 flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-400/20 bg-green-400/10 text-green-200">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-yellow-200 sm:text-2xl">Bảo Mật Tài Khoản</h2>
                                        <p className="mt-1 text-sm leading-relaxed text-red-100/60">Đổi mật khẩu để giữ tài khoản luôn an toàn.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <div>
                                        <label htmlFor="currentPassword" className={labelClass}>Mật khẩu hiện tại</label>
                                        <div className="relative">
                                            <KeyRound className={iconClass} />
                                            <input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" required className={`${inputClass} pr-12`} placeholder="Nhập mật khẩu hiện tại" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className={passwordButtonClass}>{showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="newPassword" className={labelClass}>Mật khẩu mới</label>
                                            <div className="relative">
                                                <Lock className={iconClass} />
                                                <input id="newPassword" type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" required className={`${inputClass} pr-12`} placeholder="Tạo mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'} className={passwordButtonClass}>{showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className={labelClass}>Xác nhận mật khẩu mới</label>
                                            <div className="relative">
                                                <Lock className={iconClass} />
                                                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required className={`${inputClass} pr-12`} placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'} className={passwordButtonClass}>{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-green-400/15 bg-green-950/30 p-4">
                                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-200"><ShieldCheck className="h-4 w-4" />Yêu cầu mật khẩu</p>
                                        <ul className="space-y-1.5 text-xs leading-relaxed text-red-100/65">
                                            <li>• Tối thiểu 8 ký tự.</li>
                                            <li>• Có ít nhất một chữ hoa và một chữ thường.</li>
                                            <li>• Có ít nhất một chữ số và một ký tự đặc biệt.</li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col gap-3 border-t border-yellow-400/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs leading-relaxed text-white/40">Không chia sẻ mật khẩu với bất kỳ ai.</p>
                                        <button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword} className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/50 bg-linear-to-r from-red-800 to-red-950 px-6 py-3 text-sm font-bold text-yellow-100 shadow-lg transition duration-300 hover:scale-[1.02] hover:border-yellow-300/80 hover:from-red-700 hover:to-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="relative z-10 mt-8 border-t border-yellow-400/10 bg-black/20 px-4 py-5 text-center text-xs text-white/50 backdrop-blur-sm md:text-sm">
                <p>© {new Date().getFullYear()} Christmas Wishes</p>
                <p className="mt-1 text-yellow-100/40">Made with ❤️ for a magical Christmas</p>
            </footer>
        </main>
    )
}