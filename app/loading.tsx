import { Snowflake, Sparkles } from 'lucide-react'

export default function Loading() {
    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-red-950 px-4 font-sans text-white">
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

            {/* LOADING CARD */}
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                    <Snowflake className="h-12 w-12 animate-spin text-yellow-300" />
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-200 animate-pulse" />
                </div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-yellow-200">
                    <Sparkles className="h-4 w-4" />
                    <span>Phép màu Giáng Sinh</span>
                    <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-yellow-100 sm:text-3xl">
                    Đang thắp sáng cây thông...
                </h2>
                <p className="mt-2 text-sm text-red-100/70">
                    Chờ một chút để những điều kỳ diệu xuất hiện ✨
                </p>
            </div>
        </main>
    )
}
