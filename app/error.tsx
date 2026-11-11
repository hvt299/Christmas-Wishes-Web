'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Home, RefreshCw, Snowflake, Sparkles } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Unhandled app error:', error)
    }, [error])

    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-red-950 px-4 py-10 font-sans text-white">
            {/* BACKGROUND EFFECTS */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-red-950 via-red-950 to-green-950">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-[100px]" />
                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
                <Snowflake className="absolute left-[8%] top-[20%] h-10 w-10 text-yellow-100/15" />
                <Snowflake className="absolute right-[12%] top-[28%] h-14 w-14 animate-pulse text-yellow-100/15" />
                <Snowflake className="absolute bottom-[15%] left-[15%] h-9 w-9 text-white/10" />
                <Snowflake className="absolute bottom-[12%] right-[10%] h-8 w-8 text-yellow-100/15" />
                <Sparkles className="absolute left-[25%] top-[35%] h-5 w-5 text-yellow-300/20" />
            </div>

            {/* ERROR CARD */}
            <div className="relative z-10 mx-auto w-full max-w-lg text-center">
                <section className="rounded-3xl border border-red-400/20 bg-black/35 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-red-400/30 bg-red-950/60 shadow-[0_0_35px_rgba(239,68,68,0.2)]">
                            <AlertCircle className="h-10 w-10 text-red-300" />
                        </div>
                    </div>

                    <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200">
                        <Sparkles className="h-4 w-4" />
                        <span>Sự cố bất ngờ</span>
                        <Sparkles className="h-4 w-4" />
                    </div>

                    <h1 className="font-serif text-3xl font-black text-yellow-200 sm:text-4xl">
                        Có chút tuyết rơi dày! ❄️
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-red-100/70 sm:text-base">
                        Đã có lỗi xảy ra trong quá trình xử lý yêu cầu. Hãy thử tải lại trang hoặc quay về trang chủ nhé.
                    </p>

                    {error?.message && (
                        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-950/50 p-3.5 text-left text-xs text-red-200/90">
                            <p className="font-semibold text-red-100">Chi tiết:</p>
                            <p className="mt-1 font-mono text-[11px] break-all">{error.message}</p>
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-yellow-200/40 bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3 text-sm font-bold text-[#35150e] shadow-lg transition hover:from-amber-300 hover:to-yellow-200"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Thử lại ngay</span>
                        </button>
                        <Link
                            href="/"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-yellow-300/40 bg-black/25 px-6 py-3 text-sm font-semibold text-yellow-100 transition duration-300 hover:border-yellow-300/70 hover:bg-yellow-400/10"
                        >
                            <Home className="h-4 w-4" />
                            <span>Về trang chủ</span>
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    )
}
