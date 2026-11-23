'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Snowflake, CheckCircle, XCircle, ArrowLeft, Loader2, Gift, ShieldCheck, Sparkles } from 'lucide-react'
import axios from 'axios'

function VerifyContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Đang kiểm tra danh sách của Ông già Noel...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường link trong email!')
            return
        }

        const verifyEmailToken = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
                const response = await axios.get(`${API_URL}/auth/verify`, { params: { token } })
                setStatus('success')
                setMessage(response.data.message || 'Tài khoản của bạn đã được kích hoạt thành công!')
            } catch (err: any) {
                setStatus('error')
                const errorMessage = err.response?.data?.message
                setMessage(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage || 'Link xác thực không hợp lệ hoặc đã hết hạn.')
            }
        }

        verifyEmailToken()
    }, [token])

    const primaryButtonClass = 'mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-yellow-300/70 bg-linear-to-r from-yellow-500 to-yellow-300 py-3.5 font-sans text-sm font-bold text-red-950 shadow-lg transition duration-300 hover:scale-[1.02] hover:from-yellow-300 hover:to-yellow-200 hover:shadow-[0_8px_30px_rgba(234,179,8,0.2)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950'

    if (status === 'loading') {
        return (
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-yellow-400/25 bg-black/30 p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-10">
                <div className="h-1 w-full bg-linear-to-r from-transparent via-yellow-400 to-transparent" />
                <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-yellow-400/30 bg-linear-to-br from-red-900/90 to-red-950 shadow-[0_0_35px_rgba(234,179,8,0.12)]">
                    <Snowflake className="h-10 w-10 animate-spin text-yellow-300" />
                    <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-200" />
                </div>

                <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200">
                    <Sparkles className="h-4 w-4" />
                    <span>Mùa yêu thương</span>
                    <Sparkles className="h-4 w-4" />
                </div>

                <h1 className="font-serif text-xl font-black text-yellow-300 drop-shadow-md sm:text-2xl">Đang xác thực tài khoản</h1>
                <p className="mt-3 text-sm leading-relaxed text-red-100/80">{message}</p>
                <Loader2 className="mx-auto mt-5 h-5 w-5 animate-spin text-yellow-200/70" />
            </div>
        )
    }

    const isSuccess = status === 'success'

    return (
        <div className="relative z-10 w-full max-w-lg">
            <section className="overflow-hidden rounded-3xl border border-yellow-400/25 bg-black/30 text-center shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className={`h-1 w-full ${isSuccess ? 'bg-linear-to-r from-transparent via-yellow-400 to-transparent' : 'bg-linear-to-r from-transparent via-red-400/70 to-transparent'}`} />

                <div className="p-5 sm:p-10">
                    {/* HEADER */}
                    <div className="mb-5">
                        <div className={`relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border shadow-[0_0_35px_rgba(234,179,8,0.12)] ${isSuccess ? 'border-yellow-400/30 bg-linear-to-br from-red-900/90 to-red-950' : 'border-red-300/20 bg-linear-to-br from-red-900/80 to-red-950'}`}>
                            <div className="absolute inset-1 rounded-xl border border-yellow-300/10" />
                            {isSuccess ? <CheckCircle className="relative h-11 w-11 text-yellow-300" /> : <XCircle className="relative h-11 w-11 text-red-300" />}
                            <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-200" />
                            <Snowflake className="absolute -bottom-2 -left-2 h-5 w-5 text-yellow-100/70" />
                        </div>

                        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200">
                            <Sparkles className="h-4 w-4" />
                            <span>Mùa yêu thương</span>
                            <Sparkles className="h-4 w-4" />
                        </div>

                        <h1 className="font-serif text-2xl font-black text-yellow-300 drop-shadow-md sm:text-3xl">
                            {isSuccess ? 'Xác Thực Thành Công!' : 'Xác Thực Thất Bại'}
                        </h1>

                        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-red-100/80">{message}</p>
                    </div>

                    {/* STATUS INFORMATION */}
                    <div className={`rounded-2xl border p-4 text-left ${isSuccess ? 'border-yellow-400/20 bg-linear-to-r from-red-900/40 to-green-950/40' : 'border-red-300/20 bg-red-950/40'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isSuccess ? 'border-yellow-300/20 bg-yellow-400/10' : 'border-red-300/20 bg-red-500/10'}`}>
                                {isSuccess ? <ShieldCheck className="h-5 w-5 text-yellow-300" /> : <XCircle className="h-5 w-5 text-red-300" />}
                            </div>
                            <div>
                                <p className={`font-serif text-sm font-bold ${isSuccess ? 'text-yellow-200' : 'text-red-200'}`}>
                                    {isSuccess ? 'Tài khoản đã sẵn sàng' : 'Chưa thể kích hoạt tài khoản'}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-white/65">
                                    {isSuccess ? 'Bạn có thể đăng nhập và bắt đầu lan tỏa những điều tốt đẹp.' : 'Vui lòng kiểm tra liên kết xác thực hoặc thử đăng nhập để kiểm tra trạng thái tài khoản.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* LOGIN BUTTON */}
                    <Link href="/login" className={primaryButtonClass}>
                        <Gift className="h-5 w-5" />
                        {isSuccess ? 'Đăng Nhập Ngay' : 'Về Trang Đăng Nhập'}
                    </Link>

                    {!isSuccess && (
                        <Link href="/forgot-password" className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-black/20 px-5 py-2.5 text-sm font-bold text-yellow-300 transition duration-300 hover:border-yellow-300/50 hover:bg-yellow-400/10 hover:text-yellow-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                            <ShieldCheck className="h-4 w-4" />
                            Cần khôi phục tài khoản?
                        </Link>
                    )}

                    {/* BACK TO HOME */}
                    <div className="mt-6 border-t border-yellow-400/15 pt-5">
                        <Link href="/" className="group inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-black/20 px-5 py-2.5 text-sm font-semibold text-white/70 transition duration-300 hover:border-yellow-300/50 hover:bg-yellow-400/10 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="mt-5 text-center">
                <p className="font-serif text-sm text-yellow-100/60">Trao yêu thương, nhận hạnh phúc</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                    <Gift className="h-4 w-4 text-yellow-200/50" />
                    <p className="text-xs text-white/40">Made with ❤️ for a magical Christmas</p>
                </div>
            </div>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-red-950 px-4 py-10 font-sans text-white selection:bg-yellow-400 selection:text-red-950 sm:px-8">
            {/* BACKGROUND */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-linear-to-b from-red-950 via-red-950 to-green-950">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-[100px]" />
                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
                <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/4-[120px]" />
                <Snowflake className="absolute left-[8%] top-[12%] h-10 w-10 text-yellow-100/20" />
                <Snowflake className="absolute right-[12%] top-[20%] h-14 w-14 animate-spin text-yellow-100/20" />
                <Snowflake className="absolute bottom-[15%] left-[15%] h-9 w-9 text-white/15" />
                <Snowflake className="absolute bottom-[12%] right-[10%] h-8 w-8 text-yellow-100/20" />
                <Sparkles className="absolute left-[25%] top-[35%] h-5 w-5 text-yellow-300/20" />
                <Sparkles className="absolute bottom-[30%] right-[25%] h-6 w-6 text-yellow-300/20" />
            </div>

            {/* BACK TO LOGIN */}
            <Link href="/login" title="Quay lại trang đăng nhập" className="group absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-yellow-400/20 bg-black/30 px-4 py-2.5 text-sm text-white/80 shadow-lg backdrop-blur-xl transition duration-300 hover:border-yellow-300/60 hover:bg-red-900/50 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 sm:left-8 sm:top-8">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Đăng nhập
            </Link>

            <Suspense fallback={<div className="relative z-10 flex items-center gap-3 rounded-2xl border border-yellow-400/20 bg-black/30 p-6 text-sm text-white/70 shadow-xl backdrop-blur-xl"><Loader2 className="h-5 w-5 animate-spin text-yellow-300" />Đang tải dữ liệu...</div>}>
                <VerifyContent />
            </Suspense>
        </main>
    )
}