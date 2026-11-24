'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gift, LogOut, User, Snowflake, Settings, X, Sparkles, TreePine, Gamepad2, Calendar } from 'lucide-react'
import ChristmasCountdown from '@/components/ChristmasCountdown'
import { SnowflakeBalance } from '@/components/games/SnowflakeBalance'
import { useGameStore } from '@/store/useGameStore'
import Cookies from 'js-cookie'
import { getValidAuthToken, clearAuthData } from '@/utils/auth'
import { getVietnamDateParts } from '@/utils/christmasHelper'

type UserInfo = {
  fullName?: string
  username?: string
  avatar?: string
  snowflakes?: number
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isDecember, setIsDecember] = useState(false)
  const [isChristmasArrived, setIsChristmasArrived] = useState(false)
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  useEffect(() => {
    try {
      const { year, month, day } = getVietnamDateParts(new Date())
      setCurrentYear(year)
      setIsDecember(month === 12)
      setIsChristmasArrived(month === 12 && day >= 25)
    } catch {
      const now = new Date()
      setCurrentYear(now.getFullYear())
      setIsDecember(now.getMonth() === 11)
      setIsChristmasArrived(now.getMonth() === 11 && now.getDate() >= 25)
    }

    const userInfo = localStorage.getItem('user_info')
    const token = getValidAuthToken()

    if (userInfo && token) {
      try {
        const parsed = JSON.parse(userInfo) as UserInfo
        setUser(parsed)
        if (typeof parsed.snowflakes === 'number') {
          useGameStore.getState().setSnowflakes(parsed.snowflakes)
        }
      } catch (error) {
        console.error('Lỗi khi đọc dữ liệu người dùng:', error)
        clearAuthData()
        setUser(null)
      }
    } else {
      if (userInfo && !token) {
        clearAuthData()
        setUser(null)
      }
      const timer = window.setTimeout(() => setShowPopup(true), 1000)
      return () => window.clearTimeout(timer)
    }
  }, [])

  const displayName = user?.fullName || user?.username || 'Bạn'
  const avatarUrl = user?.avatar

  const handleLogout = () => {
    clearAuthData()
    setUser(null)
    setShowPopup(false)
    window.location.reload()
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-red-950 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Image src="/images/bg-merry-christmas.jpg" alt="Khung cảnh Giáng Sinh lung linh" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div className="fixed inset-0 z-0 bg-linear-to-b from-red-950/75 via-black/40 to-red-950/90" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-linear-to-br from-yellow-500/10 via-transparent to-green-950/30" />

      {/* NAVBAR */}
      <header className="fixed left-0 top-0 z-50 w-full border-b border-yellow-400/20 bg-red-950/40 px-4 py-3 shadow-lg backdrop-blur-xl md:px-8">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2 font-serif text-xl font-bold text-yellow-400 transition hover:scale-105 hover:text-yellow-200 md:text-2xl">
            <Snowflake className="h-7 w-7 shrink-0 animate-spin md:h-8 md:w-8" />
            <span className="hidden sm:inline">Christmas Wishes</span>
          </Link>

          {user ? (
            <div className="flex min-w-0 items-center gap-1 rounded-full border border-yellow-400/30 bg-black/40 py-1 pl-1 pr-2 shadow-lg backdrop-blur-md md:gap-2">
              <Link href="/profile" title="Cài đặt tài khoản" className="group flex min-w-0 items-center gap-2 rounded-full px-1.5 py-1 transition hover:bg-red-900/50 md:gap-3 md:px-2">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Ảnh đại diện" referrerPolicy="no-referrer" className="h-8 w-8 shrink-0 rounded-full border border-yellow-400/60 object-cover md:h-9 md:w-9" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-yellow-300 to-yellow-600 text-red-950 shadow-inner md:h-9 md:w-9">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <span className="max-w-24 truncate text-sm font-medium transition group-hover:text-yellow-300 md:max-w-40 md:text-base">{displayName}</span>
                <Settings className="h-4 w-4 shrink-0 text-white/50 transition group-hover:text-yellow-400" />
              </Link>

              <div className="mx-1 h-6 w-px shrink-0 bg-white/20" />

              {/* SỐ BÔNG TUYẾT */}
              <SnowflakeBalance className="px-2.5 py-2" />

              <div className="mx-1 h-6 w-px shrink-0 bg-white/20" />

              <button type="button" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất" className="shrink-0 rounded-full p-2 text-white/70 transition hover:bg-red-900/60 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="shrink-0 rounded-full border border-yellow-300/70 bg-linear-to-r from-yellow-500 to-yellow-300 px-4 py-2 text-sm font-bold text-red-950 shadow-lg transition hover:scale-105 hover:from-yellow-300 hover:to-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:px-6 md:text-base">
              Đăng Nhập
            </Link>
          )}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl grow flex-col justify-center px-4 pb-12 pt-28 md:px-6 md:pt-32">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-6">
          {/* LEFT: TREE MANAGEMENT / DECEMBER ANNOUNCEMENT */}
          <section className="order-2 flex w-full flex-col items-center justify-center lg:col-span-3 lg:order-1">
            {isDecember ? (
              <div className="w-full rounded-2xl border border-yellow-400/25 bg-black/35 p-5 text-center shadow-2xl backdrop-blur-xl md:p-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/50 bg-linear-to-br from-red-800 to-red-950 shadow-[0_0_25px_rgba(234,179,8,0.15)]">
                    <Gift className="h-9 w-9 text-yellow-300" />
                  </div>
                </div>

                <h2 className="mb-3 font-serif text-xl font-bold text-yellow-300 md:text-2xl">Cây Giáng Sinh</h2>
                <p className="text-sm leading-relaxed text-red-100/90">Mỗi mùa lễ hội, một cây quà mới, lưu giữ yêu thương qua năm tháng.</p>

                <div className="my-5 h-px bg-linear-to-r from-transparent via-yellow-400/40 to-transparent" />

                <div className="space-y-3 text-left text-sm text-white/80">
                  <p className="flex items-start gap-3"><span className="text-xl">🎄</span><span>Mỗi năm một cây, lưu giữ kỷ niệm riêng.</span></p>
                  <p className="flex items-start gap-3"><span className="text-xl">🎁</span><span>Chia sẻ cây để bạn bè gửi quà và lời chúc.</span></p>
                  <p className="flex items-start gap-3"><span className="text-xl">🔒</span><span>Mở quà sau ngày 25/12, giữ trọn bất ngờ.</span></p>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-yellow-400/25 bg-black/40 p-5 text-center shadow-2xl backdrop-blur-xl md:p-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/40 bg-linear-to-br from-amber-700/60 to-red-950/80 shadow-[0_0_25px_rgba(234,179,8,0.15)]">
                    <Calendar className="h-8 w-8 text-yellow-300" />
                  </div>
                </div>

                <h2 className="mb-2 font-serif text-xl font-bold text-yellow-300 md:text-2xl">
                  Hẹn Bạn Vào Tháng 12!
                </h2>

                <div className="my-4 h-px bg-linear-to-r from-transparent via-yellow-400/35 to-transparent" />

                <div className="space-y-2.5 text-left text-xs sm:text-sm text-white/80">
                  <p className="flex items-start gap-2.5">
                    <span className="text-base">🎄</span>
                    <span>Tạo và trang trí cây thông kỷ niệm riêng cho năm {currentYear ?? ''}.</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <span className="text-base">🎁</span>
                    <span>Gửi và nhận những phần quà bất ngờ cùng lời chúc ấm áp.</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <span className="text-base">❄️</span>
                    <span>Săn bông tuyết và tham gia các trò chơi nhận thưởng giới hạn.</span>
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* CENTER: CHRISTMAS COUNTDOWN */}
          <section className="order-1 flex w-full min-w-0 flex-col items-center justify-center text-center lg:col-span-6 lg:col-start-4 lg:order-2">
            <div className="text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-yellow-200 drop-shadow-lg md:text-base">
                <Sparkles className="h-4 w-4" />
                <span>Mùa yêu thương</span>
                <Sparkles className="h-4 w-4" />
              </div>

              <h1 className="bg-linear-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text font-serif text-4xl font-black uppercase leading-tight text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)] sm:text-5xl md:text-6xl lg:text-7xl">
                Giáng Sinh
              </h1>

              <p className="mt-1 font-serif text-3xl font-bold tracking-[0.3em] text-transparent bg-linear-to-b from-yellow-100 via-yellow-300 to-amber-500 bg-clip-text drop-shadow-[0_3px_8px_rgba(234,179,8,0.4)] md:text-4xl">
                {currentYear ?? '••••'}
              </p>
            </div>

            {/* Ẩn đồng hồ đếm ngược khi đã tới thời điểm Giáng Sinh (từ 25/12) */}
            {!isChristmasArrived && (
              <div className="mt-5 w-full rounded-3xl border border-yellow-400/25 bg-black/25 px-2 py-6 shadow-2xl backdrop-blur-sm sm:px-4 md:py-8">
                <ChristmasCountdown />
              </div>
            )}

            <p className="mt-6 max-w-lg rounded-full border border-white/10 bg-black/25 px-5 py-3 text-center font-handwriting text-xl text-yellow-100 shadow-lg backdrop-blur-sm md:text-2xl">
              “Trao yêu thương, nhận hạnh phúc” ✨
            </p>
          </section>

          {/* RIGHT: TREE & GIFT ACTIONS */}
          <section
            className={`order-3 flex w-full flex-col gap-3 lg:col-span-3 lg:col-start-10 lg:order-3 transition-all duration-300 ${
              !isDecember ? 'grayscale opacity-60' : ''
            }`}
          >
            {!isDecember && (
              <div className="text-center">
                <span className="inline-block rounded-full border border-yellow-400/25 bg-black/40 px-3 py-1 text-[11px] font-semibold text-yellow-200/90 shadow">
                  🔒 Mở cửa từ 01/12 đến 31/12
                </span>
              </div>
            )}

            <Link
              href="/my-trees"
              className={`group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-green-300 ${
                !isDecember ? 'cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center gap-3 rounded-2xl border-2 border-green-400/40 bg-linear-to-r from-green-900/90 to-green-950/90 p-4 shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-[0_10px_30px_rgba(34,197,94,0.15)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-300/20 bg-green-400/10 text-green-300 transition group-hover:scale-110">
                  <TreePine className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg font-bold text-green-300">Cây của tôi</h2>
                  <p className="mt-1 text-xs leading-relaxed text-green-100/80">Cây quà và kỷ niệm mỗi mùa</p>
                </div>
                <span className="text-lg text-green-300 transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            <Link
              href="/snowflake-game"
              className={`group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                !isDecember ? 'cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center gap-3 rounded-2xl border border-sky-200/20 bg-linear-to-r from-slate-900/90 to-slate-800/90 p-3.5 shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/50 hover:shadow-[0_8px_24px_rgba(125,211,252,0.08)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-200/15 bg-sky-300/10 text-sky-200 transition group-hover:scale-110">
                  <Snowflake className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-base font-bold text-sky-200">Săn Bông Tuyết</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200/70">Vui chơi cùng mùa tuyết trắng</p>
                </div>
                <span className="text-sm text-sky-200 transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            <Link
              href="/mini-games"
              className={`group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 ${
                !isDecember ? 'cursor-not-allowed' : ''
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl border border-yellow-400/30 bg-linear-to-br from-red-900/95 via-red-950/95 to-red-950 p-4 shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-yellow-400/60 hover:shadow-[0_10px_30px_rgba(234,179,8,0.12)]">
                <div className="pointer-events-none absolute -right-3 -top-4 text-6xl opacity-10 transition group-hover:rotate-12">🎮</div>
                <div className="relative flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10 text-yellow-300 transition group-hover:scale-110">
                    <Gamepad2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-lg font-bold text-yellow-300">Mini Games</h2>
                    <p className="mt-1 text-xs leading-relaxed text-red-100/80">Cùng chơi, cùng đón mùa đông</p>
                    <p className="mt-3 text-xs font-bold text-yellow-200 transition group-hover:text-yellow-100">Khám phá trò chơi →</p>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 mt-auto w-full border-t border-yellow-400/10 bg-black/20 px-4 py-5 text-center text-xs text-white/50 backdrop-blur-sm md:text-sm">
        <p>© {currentYear ?? new Date().getFullYear()} Christmas Wishes</p>
        <p className="mt-1 text-yellow-100/40">Made with ❤️ for a magical Christmas</p>
      </footer>

      {/* LOGIN POPUP */}
      {showPopup && !user && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPopup(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="christmas-popup-title" className="relative w-full max-w-sm rounded-3xl border-2 border-yellow-400 bg-linear-to-b from-red-900 via-red-950 to-green-950 p-7 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] sm:p-8" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setShowPopup(false)} className="absolute right-3 top-3 rounded-full p-2 text-red-200 transition hover:bg-white/10 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400" title="Đóng" aria-label="Đóng thông báo">
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-300/50 bg-yellow-400/10 shadow-inner">
                <Gift className="h-12 w-12 animate-bounce text-yellow-300" />
              </div>
            </div>

            <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-200">
              <Sparkles className="h-4 w-4" />
              Mùa lễ hội
              <Sparkles className="h-4 w-4" />
            </div>

            <h2 id="christmas-popup-title" className="mb-3 font-serif text-2xl font-bold text-yellow-300">Trạm Quà Giáng Sinh</h2>
            <p className="mb-6 text-sm leading-relaxed text-red-100">Đăng nhập ngay để tự tay gói những hộp quà bí mật và gửi lời chúc ấm áp đến người thân yêu nhé! 🎅🎁</p>

            <Link href="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-yellow-500 to-yellow-300 px-6 py-3 font-bold text-red-950 shadow-lg transition hover:scale-105 hover:from-yellow-300 hover:to-yellow-200">
              <Gift className="h-5 w-5" />
              Đăng nhập / Đăng ký
            </Link>

            <p className="mt-4 text-xs text-white/50">Giáng Sinh thêm trọn vẹn khi có bạn ✨</p>
          </div>
        </div>
      )}
    </main>
  )
}