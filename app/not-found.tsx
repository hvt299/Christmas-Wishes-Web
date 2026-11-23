
import Link from 'next/link'
import { Snowflake, Home, MapPinOff, Gift, Sparkles } from 'lucide-react'

export default function NotFound() {
    return (
        <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#450a0a] px-4 py-10 font-sans text-white">
            {/* BACKGROUND EFFECTS */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/15 blur-[100px]" />
                <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
                <Snowflake className="absolute left-[8%] top-[12%] h-10 w-10 text-white/20" />
                <Snowflake className="absolute right-[12%] top-[20%] h-14 w-14 animate-spin-slow text-yellow-100/20" />
                <Snowflake className="absolute bottom-[15%] left-[15%] h-9 w-9 text-white/15" />
                <Snowflake className="absolute bottom-[12%] right-[10%] h-8 w-8 text-white/20" />
                <Snowflake className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-white/3" />
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 mx-auto w-full max-w-lg text-center">
                <section className="rounded-2xl border border-white/10 bg-black/25 p-6 shadow-2xl backdrop-blur-md sm:p-10">
                    {/* MAIN ICON */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_35px_rgba(234,179,8,0.08)] sm:h-28 sm:w-28">
                            <MapPinOff className="h-12 w-12 text-yellow-200 sm:h-14 sm:w-14" />
                        </div>
                    </div>

                    {/* ERROR CODE */}
                    <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-yellow-200">
                        <Sparkles className="h-4 w-4" />
                        Lạc giữa mùa đông
                        <Sparkles className="h-4 w-4" />
                    </div>

                    <h1 className="bg-linear-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text font-serif text-8xl font-black leading-tight text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.4)] sm:text-9xl">
                        404
                    </h1>

                    <h2 className="mt-2 font-sans text-2xl font-bold text-yellow-200 sm:text-3xl">
                        Lạc đường rồi! 🦌
                    </h2>

                    <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
                        Có vẻ như trang bạn đang tìm đã bị tuyết phủ kín hoặc Ông già Noel đã mang nó đi mất rồi. Đừng lo, chúng ta vẫn có thể quay về nơi bắt đầu!
                    </p>

                    {/* STATUS MESSAGE */}
                    <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-left">
                        <div className="flex items-start gap-3">
                            <Snowflake className="mt-0.5 h-5 w-5 shrink-0 text-yellow-200" />
                            <div>
                                <p className="text-sm font-semibold text-white/90">
                                    Không tìm thấy trang
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-white/55">
                                    Đường dẫn có thể không tồn tại hoặc đã được thay đổi. Hãy trở về trang chủ để tiếp tục hành trình Giáng Sinh nhé.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* HOME BUTTON */}
                    <Link href="/" className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-100/30 bg-linear-to-r from-yellow-500 to-yellow-200 py-3.5 font-sans text-sm font-bold text-red-950 shadow-[0_4px_20px_rgba(234,179,8,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:from-yellow-300 hover:to-yellow-100 hover:shadow-[0_8px_30px_rgba(234,179,8,0.25)] active:translate-y-0 active:scale-[0.99]">
                        <Home className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span>Quay về trang chủ</span>
                        <Snowflake className="h-4 w-4 text-red-950/60 transition-transform duration-500 group-hover:rotate-180" />
                    </Link>

                    {/* SECONDARY MESSAGE */}
                    <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="text-sm text-white/60">
                            Đừng để lạc mất phép màu nhé!
                        </p>
                        <Link href="/" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-yellow-200 transition hover:text-yellow-100 hover:underline">
                            <Gift className="h-4 w-4" />
                            Trở lại Trạm Quà Giáng Sinh
                        </Link>
                    </div>
                </section>

                {/* FOOTER */}
                <div className="mt-5 flex items-center justify-center gap-2 text-center">
                    <Gift className="h-4 w-4 text-yellow-200/50" />
                    <p className="text-xs text-white/40">
                        Mỗi món quà là một niềm vui được sẻ chia.
                    </p>
                </div>
            </div>
        </main>
    )
}