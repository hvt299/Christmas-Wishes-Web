'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Snowflake, Mail, ArrowLeft, Send, Loader2, KeyRound, Gift, Sparkles } from 'lucide-react'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const res = await api.post('/auth/forgot-password', { email })
            setMessage({ type: 'success', text: res.data.message || 'Đã gửi link khôi phục! Vui lòng kiểm tra email, kể cả mục thư rác nhé.' })
            setEmail('')
        } catch (error: any) {
            const errorMsg = error.response?.data?.message
            setMessage({ type: 'error', text: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || 'Có lỗi xảy ra! Vui lòng thử lại.' })
        } finally {
            setLoading(false)
        }
    }

    const inputClass = 'w-full rounded-xl border border-yellow-400/15 bg-black/25 py-3 pl-11 pr-4 font-sans text-sm text-white placeholder:text-white/40 outline-none transition duration-300 focus:border-yellow-300/60 focus:ring-2 focus:ring-yellow-400/10'
    const labelClass = 'mb-2 block font-sans text-sm font-medium text-yellow-50/90'
    const primaryButtonClass = 'flex w-full items-center justify-center gap-2 rounded-full border border-yellow-300/70 bg-gradient-to-r from-yellow-500 to-yellow-300 py-3.5 font-sans text-sm font-bold text-red-950 shadow-lg transition duration-300 hover:scale-[1.02] hover:from-yellow-300 hover:to-yellow-200 hover:shadow-[0_8px_30px_rgba(234,179,8,0.2)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100'

    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-red-950 px-4 py-10 font-sans text-white selection:bg-yellow-400 selection:text-red-950 sm:px-8">
            {/* BACKGROUND */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-gradient-to-b from-red-950 via-red-950 to-green-950">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-[100px]" />
                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.04] blur-[120px]" />
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

            {/* MAIN CARD */}
            <div className="relative z-10 w-full max-w-lg">
                <section className="overflow-hidden rounded-3xl border border-yellow-400/25 bg-black/30 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

                    <div className="p-5 sm:p-10">
                        {/* HEADER */}
                        <div className="mb-7 text-center">
                            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-red-900/90 to-red-950 shadow-[0_0_35px_rgba(234,179,8,0.12)]">
                                <div className="absolute inset-1 rounded-xl border border-yellow-300/10" />
                                <KeyRound className="relative h-10 w-10 text-yellow-300" />
                                <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-200" />
                                <Snowflake className="absolute -bottom-2 -left-2 h-5 w-5 text-yellow-100/70" />
                            </div>

                            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200">
                                <Sparkles className="h-4 w-4" />
                                <span>Mùa yêu thương</span>
                                <Sparkles className="h-4 w-4" />
                            </div>

                            <h1 className="font-serif text-2xl font-black text-yellow-300 drop-shadow-md sm:text-3xl">Quên Mật Khẩu?</h1>
                            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-red-100/80">Đừng lo nhé! Hãy nhập email đã đăng ký để nhận liên kết khôi phục mật khẩu.</p>
                        </div>

                        {/* INFORMATION CARD */}
                        <div className="mb-6 rounded-2xl border border-yellow-400/20 bg-gradient-to-r from-red-900/40 to-red-950/40 p-4 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10">
                                    <Mail className="h-5 w-5 text-yellow-300" />
                                </div>
                                <div>
                                    <p className="font-serif text-sm font-bold text-yellow-200">Khôi phục tài khoản</p>
                                    <p className="mt-1 text-xs leading-relaxed text-white/65">Liên kết sẽ được gửi đến email của bạn. Đừng quên kiểm tra cả thư mục spam nhé.</p>
                                </div>
                            </div>
                        </div>

                        {/* RESET FORM */}
                        <form onSubmit={handleReset} className="space-y-5">
                            <div>
                                <label htmlFor="reset-email" className={labelClass}>Email đã đăng ký</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-200/60" />
                                    <input id="reset-email" type="email" name="email" autoComplete="email" required className={inputClass} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>

                            {message && <div role="alert" aria-live="polite" className={`rounded-xl border p-3 text-sm leading-relaxed ${message.type === 'success' ? 'border-green-300/20 bg-green-500/10 text-green-200' : 'border-red-300/20 bg-red-500/10 text-red-200'}`}>{message.text}</div>}

                            <button type="submit" disabled={loading} className={primaryButtonClass}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                {loading ? 'Đang gửi...' : 'Gửi Link Khôi Phục'}
                            </button>
                        </form>

                        {/* BACK TO LOGIN */}
                        <div className="mt-6 border-t border-yellow-400/15 pt-5 text-center">
                            <p className="text-sm text-white/60">Nhớ lại mật khẩu rồi?</p>
                            <Link href="/login" className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-black/20 px-5 py-2.5 text-sm font-bold text-yellow-300 transition duration-300 hover:border-yellow-300/50 hover:bg-yellow-400/10 hover:text-yellow-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                                <ArrowLeft className="h-4 w-4" />
                                Quay lại đăng nhập
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
        </main>
    )
}