'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gift, LogOut, User, Snowflake, Settings, X, Sparkles, TreePine, Gamepad2, Calendar } from 'lucide-react'
import ChristmasCountdown from '@/components/ChristmasCountdown'
import ChristmasCelebration from '@/components/ChristmasCelebration'
import ChristmasAtmosphere from '@/components/ChristmasAtmosphere'
import ChristmasTreeFlipCard from '@/components/ChristmasTreeFlipCard'
import { SnowflakeBalance } from '@/components/games/SnowflakeBalance'
import { useGameStore } from '@/store/useGameStore'
import Cookies from 'js-cookie'
import { getValidAuthToken, clearAuthData } from '@/utils/auth'
import { getVietnamDateParts } from '@/utils/christmasHelper'
import api from '@/lib/api'

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
      let dec = month === 12
      let arrived = month === 12 && day >= 25

      // Hỗ trợ xem trước kịch bản qua query param (?preview=christmas hoặc ?preview=countdown)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const preview = params.get('preview')
        if (preview === 'christmas') {
          dec = true
          arrived = true
        } else if (preview === 'countdown') {
          dec = true
          arrived = false
        }
      }

      setIsDecember(dec)
      setIsChristmasArrived(arrived)
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

      // Tải profile mới nhất từ server MongoDB (chuẩn theo Tet-Countdown)
      api.get('/users/profile')
        .then((res) => {
          const freshUser = res.data?.data || res.data
          if (freshUser) {
            setUser(freshUser)
            if (typeof freshUser.snowflakes === 'number') {
              useGameStore.getState().setSnowflakes(freshUser.snowflakes)
            }
            try {
              localStorage.setItem('user_info', JSON.stringify(freshUser))
            } catch {
              /* noop */
            }
          }
        })
        .catch((err) => console.error('Lỗi lấy profile:', err))
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

      {/* HIỆU ỨNG KHÔNG KHÍ & CỖ XE SANTA BAY QUA BẦU TRỜI */}
      <ChristmasAtmosphere isChristmasSeason={isChristmasArrived} />

      {/* NAVBAR */}
      <header className="fixed left-0 top-0 z-50 w-full border-b border-yellow-400/20 bg-red-950/40 px-3 py-2 shadow-lg backdrop-blur-xl transition-all sm:px-4 sm:py-2.5 md:px-8 md:py-3">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 sm:gap-3">
          {/* LOGO */}
          <Link href="/" className="group flex shrink-0 items-center gap-1.5 font-serif text-lg font-bold text-yellow-400 drop-shadow-md transition hover:scale-105 hover:text-yellow-200 sm:gap-2 sm:text-xl md:text-2xl">
            <Snowflake className="h-6 w-6 shrink-0 animate-spin text-yellow-300 md:h-7 md:w-7" style={{ animationDuration: '10s' }} />
            <span className="hidden sm:inline">Christmas Wishes</span>
          </Link>

          {/* USER INFO & BALANCE (COMPACT & SLEEK) */}
          {user ? (
            <div className="flex items-center gap-1 rounded-full border border-yellow-400/30 bg-black/40 py-0.5 pl-1 pr-1.5 shadow-xl backdrop-blur-md sm:gap-2 sm:py-1 sm:pl-1.5 sm:pr-2">
              {/* 1. AVATAR + TÊN (BẤM VÀO ĐỂ VÀO PROFILE) */}
              <Link href="/profile" title="Cài đặt tài khoản" className="group flex items-center gap-1.5 rounded-full px-1 py-0.5 transition hover:bg-yellow-400/10 sm:gap-2 sm:px-1.5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Ảnh đại diện" referrerPolicy="no-referrer" className="h-7 w-7 shrink-0 rounded-full border border-yellow-400/70 object-cover shadow-sm sm:h-8 sm:w-8" />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-yellow-300 to-yellow-600 text-red-950 font-bold shadow-inner sm:h-8 sm:w-8">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                )}
                <span className="max-w-16 truncate text-xs font-medium text-white transition group-hover:text-yellow-300 xs:max-w-24 sm:max-w-28 sm:text-sm md:max-w-36">{displayName}</span>
                <Settings className="h-3 w-3 shrink-0 text-white/50 transition group-hover:text-yellow-300 sm:h-3.5 sm:w-3.5" />
              </Link>

              <div className="h-4 w-px shrink-0 bg-yellow-400/20 sm:h-5" />

              {/* 2. SỐ BÔNG TUYẾT */}
              <SnowflakeBalance />

              <div className="h-4 w-px shrink-0 bg-yellow-400/20 sm:h-5" />

              {/* 3. NÚT ĐĂNG XUẤT */}
              <button type="button" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất" className="shrink-0 rounded-full p-1 text-white/60 transition hover:bg-red-900/40 hover:text-red-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 sm:p-1.5">
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="shrink-0 rounded-full border border-yellow-300/70 bg-linear-to-r from-yellow-500 to-yellow-300 px-3.5 py-1.5 text-xs font-bold text-red-950 shadow-lg transition hover:scale-105 hover:from-yellow-300 hover:to-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-5 sm:py-2 sm:text-sm">
              Đăng Nhập
            </Link>
          )}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl grow flex-col justify-center px-4 pb-6 pt-20 md:px-6 md:pb-8 md:pt-24">
        <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-6">
          {/* LEFT: TREE MANAGEMENT / DECEMBER ANNOUNCEMENT (3D FLIP CARD) */}
          {user && (
            <section className="order-2 flex w-full flex-col items-center justify-center lg:col-span-3 lg:order-1">
              <ChristmasTreeFlipCard
                isDecember={isDecember}
                isChristmasSeason={isChristmasArrived}
                currentYear={currentYear}
                enableFlip={true}
              />
            </section>
          )}

          {/* CENTER: CHRISTMAS COUNTDOWN HOẶC CELEBRATION */}
          <section className="order-1 flex w-full min-w-0 flex-col items-center justify-center text-center lg:col-span-6 lg:col-start-4 lg:order-2">
            {!isChristmasArrived ? (
              <>
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-yellow-200 drop-shadow-lg md:text-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Mùa yêu thương</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>

                  <h1 className="bg-linear-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text font-serif text-4xl font-black uppercase leading-tight text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.7)] sm:text-5xl md:text-6xl lg:text-7xl">
                    Giáng Sinh
                  </h1>

                  <p className="mt-1 font-serif text-2xl font-bold tracking-[0.3em] text-transparent bg-linear-to-b from-yellow-100 via-yellow-300 to-amber-500 bg-clip-text drop-shadow-[0_3px_8px_rgba(234,179,8,0.4)] md:text-3xl">
                    {currentYear ?? '••••'}
                  </p>
                </div>

                <div className="mt-3 sm:mt-4 w-full max-w-md rounded-3xl border border-yellow-400/25 bg-black/25 px-3 py-4 shadow-2xl backdrop-blur-sm sm:px-4 md:py-5">
                  <ChristmasCountdown />
                </div>

                <p className="mt-4 max-w-lg rounded-full border border-white/10 bg-black/25 px-4 py-2 text-center font-handwriting text-lg text-yellow-100 shadow-lg backdrop-blur-sm md:text-xl">
                  “Trao yêu thương, nhận hạnh phúc” ✨
                </p>
              </>
            ) : (
              <ChristmasCelebration currentYear={currentYear} />
            )}
          </section>

          {/* RIGHT: TREE & GIFT ACTIONS */}
          {user && (
            <section className="order-3 flex w-full flex-col gap-3 lg:col-span-3 lg:col-start-10 lg:order-3 transition-all duration-300">
              {!isDecember && (
                <div className="text-center grayscale opacity-60">
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
                <div
                  className={`flex items-center gap-3 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition duration-300 ${
                    isDecember
                      ? 'border-2 border-green-400/40 bg-linear-to-r from-green-900/90 to-green-950/90 hover:-translate-y-1 hover:border-green-300 hover:shadow-[0_10px_30px_rgba(34,197,94,0.15)]'
                      : 'border border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-300/20 bg-green-400/10 text-green-300 transition-all duration-300 ${
                      isDecember
                        ? 'group-hover:scale-110'
                        : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'
                    }`}
                  >
                    <TreePine className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2
                      className={`font-serif text-lg font-bold transition-colors ${
                        isDecember ? 'text-green-300' : 'text-white/70'
                      }`}
                    >
                      Cây của tôi
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">Cây quà và kỷ niệm mỗi mùa</p>
                  </div>
                  <span
                    className={`text-lg transition group-hover:translate-x-1 ${
                      isDecember ? 'text-green-300' : 'text-white/40'
                    }`}
                  >
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/snowflake-game"
                className={`group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                  !isDecember ? 'cursor-not-allowed' : ''
                }`}
              >
                <div
                  className={`flex items-center gap-3 rounded-2xl p-3.5 shadow-lg backdrop-blur-md transition duration-300 ${
                    isDecember
                      ? 'border border-sky-200/20 bg-linear-to-r from-slate-900/90 to-slate-800/90 hover:-translate-y-0.5 hover:border-sky-200/50 hover:shadow-[0_8px_24px_rgba(125,211,252,0.08)]'
                      : 'border border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-200/15 bg-sky-300/10 text-sky-200 transition-all duration-300 ${
                      isDecember
                        ? 'group-hover:scale-110'
                        : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'
                    }`}
                  >
                    <Snowflake className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2
                      className={`font-serif text-base font-bold transition-colors ${
                        isDecember ? 'text-sky-200' : 'text-white/70'
                      }`}
                    >
                      Săn Bông Tuyết
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">Vui chơi cùng mùa tuyết trắng</p>
                  </div>
                  <span
                    className={`text-sm transition group-hover:translate-x-1 ${
                      isDecember ? 'text-sky-200' : 'text-white/40'
                    }`}
                  >
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/mini-games"
                className={`group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 ${
                  !isDecember ? 'cursor-not-allowed' : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition duration-300 ${
                    isDecember
                      ? 'border border-yellow-400/30 bg-linear-to-br from-red-900/95 via-red-950/95 to-red-950 hover:-translate-y-1 hover:border-yellow-400/60 hover:shadow-[0_10px_30px_rgba(234,179,8,0.12)]'
                      : 'border border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-3 -top-4 text-6xl opacity-10 transition group-hover:rotate-12 ${
                      isDecember ? '' : 'grayscale group-hover:grayscale-0'
                    }`}
                  >
                    🎮
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-300/20 bg-yellow-400/10 text-yellow-300 transition-all duration-300 ${
                        isDecember
                          ? 'group-hover:scale-110'
                          : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'
                      }`}
                    >
                      <Gamepad2 className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2
                        className={`font-serif text-lg font-bold transition-colors ${
                          isDecember ? 'text-yellow-300' : 'text-white/70'
                        }`}
                      >
                        Mini Games
                      </h2>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/50">Cùng chơi, cùng đón mùa đông</p>
                      <p
                        className={`mt-2.5 text-xs font-bold transition ${
                          isDecember ? 'text-yellow-200 group-hover:text-yellow-100' : 'text-white/60 group-hover:text-white/80'
                        }`}
                      >
                        Khám phá trò chơi →
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 mt-auto w-full border-t border-yellow-400/10 bg-black/20 px-4 py-3 text-center text-xs text-white/50 backdrop-blur-sm md:text-sm">
        <p>© {currentYear ?? new Date().getFullYear()} Christmas Wishes</p>
        <p className="mt-0.5 text-yellow-100/40">Made with ❤️ for a magical Christmas</p>
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