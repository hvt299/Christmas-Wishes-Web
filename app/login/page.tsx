'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Snowflake, Gift, User, Mail, Lock, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import { getValidAuthToken, setAuthSession, clearAuthData } from '@/utils/auth'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({ username: '', fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [checkingUser, setCheckingUser] = useState(true)

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const isExpired = params?.get('session_expired') === 'true' || params?.get('expired') === 'true'

    if (isExpired) {
      clearAuthData()
      setMessage({ type: 'error', text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' })
      setCheckingUser(false)
      return
    }

    const token = getValidAuthToken()
    if (token) {
      router.replace('/')
    } else {
      setCheckingUser(false)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (isSignUp && !passwordRegex.test(formData.password)) {
      setMessage({ type: 'error', text: 'Mật khẩu quá yếu! Vui lòng nhập tối thiểu 8 ký tự, gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.' })
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        await api.post('/users/register', { username: formData.username, fullName: formData.fullName, email: formData.email, password: formData.password })
        setMessage({ type: 'success', text: 'Đăng ký thành công! Hãy kiểm tra email để xác nhận nhé.' })
        setTimeout(() => setIsSignUp(false), 2500)
      } else {
        const res = await api.post('/auth/login', { username: formData.username, password: formData.password })
        const { access_token, user } = res.data
        setAuthSession(access_token, user)
        router.push('/')
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message
      setMessage({ type: 'error', text: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || 'Có lỗi xảy ra!' })
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        const res = await api.post('/auth/google', { token: tokenResponse.access_token })
        const { access_token, user } = res.data
        setAuthSession(access_token, user)
        router.push('/')
      } catch {
        setMessage({ type: 'error', text: 'Đăng nhập Google thất bại!' })
        setLoading(false)
      }
    },
    onError: () => setMessage({ type: 'error', text: 'Lỗi khởi tạo Google Login' })
  })

  if (checkingUser) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-red-950 font-sans text-white">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-red-900/60 via-red-950 to-green-950/70" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
            <Snowflake className="h-12 w-12 animate-spin text-yellow-300" />
          </div>
          <p className="animate-pulse font-serif text-lg text-yellow-100">Đang kiểm tra danh sách của Ông già Noel...</p>
        </div>
      </main>
    )
  }

  const inputClass = 'w-full rounded-xl border border-yellow-400/15 bg-black/25 py-3 pl-11 pr-4 font-sans text-sm text-white placeholder:text-white/40 outline-none transition duration-300 focus:border-yellow-300/60 focus:ring-2 focus:ring-yellow-400/10'
  const labelClass = 'mb-2 block font-sans text-sm font-medium text-yellow-50/90'
  const primaryButtonClass = 'flex w-full items-center justify-center gap-2 rounded-full border border-yellow-300/70 bg-linear-to-r from-yellow-500 to-yellow-300 py-3.5 font-sans text-sm font-bold text-red-950 shadow-lg transition duration-300 hover:scale-[1.02] hover:from-yellow-300 hover:to-yellow-200 hover:shadow-[0_8px_30px_rgba(234,179,8,0.2)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100'

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-red-950 px-4 py-10 font-sans text-white selection:bg-yellow-400 selection:text-red-950">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-linear-to-b from-red-950 via-red-950 to-green-950">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/4 blur-[120px]" />
        <Snowflake className="absolute left-[8%] top-[12%] h-10 w-10 text-yellow-100/20" />
        <Snowflake className="absolute right-[12%] top-[20%] h-14 w-14 animate-spin text-yellow-100/20" />
        <Snowflake className="absolute bottom-[15%] left-[15%] h-9 w-9 text-white/15" />
        <Snowflake className="absolute bottom-[12%] right-[10%] h-8 w-8 text-yellow-100/20" />
        <Sparkles className="absolute left-[25%] top-[35%] h-5 w-5 text-yellow-300/20" />
        <Sparkles className="absolute bottom-[30%] right-[25%] h-6 w-6 text-yellow-300/20" />
      </div>

      {/* HOME LINK */}
      <Link href="/" title="Quay lại trang chủ" className="group absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-yellow-400/20 bg-black/30 px-4 py-2.5 text-sm text-white/80 shadow-lg backdrop-blur-xl transition duration-300 hover:border-yellow-300/60 hover:bg-red-900/50 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 sm:left-8 sm:top-8">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Trang chủ
      </Link>

      {/* AUTH CARD */}
      <div className="relative z-10 w-full max-w-md">
        <section className="overflow-hidden rounded-3xl border border-yellow-400/25 bg-black/30 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="h-1 w-full bg-linear-to-r from-transparent via-yellow-400 to-transparent" />

          <div className="p-5 sm:p-8">
            {/* HEADER */}
            <div className="mb-7 text-center">
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-yellow-400/30 bg-linear-to-br from-red-900/90 to-red-950 shadow-[0_0_35px_rgba(234,179,8,0.12)]">
                <div className="absolute inset-1 rounded-xl border border-yellow-300/10" />
                <Gift className="relative h-10 w-10 text-yellow-300" />
                <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-200" />
                <Snowflake className="absolute -bottom-2 -left-2 h-5 w-5 text-yellow-100/70" />
              </div>

              <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200">
                <Sparkles className="h-4 w-4" />
                <span>Mùa yêu thương</span>
                <Sparkles className="h-4 w-4" />
              </div>

              <h1 className="font-serif text-2xl font-black text-yellow-300 drop-shadow-md sm:text-3xl">{isSignUp ? 'Đăng Ký Nhận Quà' : 'Đăng Nhập'}</h1>
              <p className="mt-2 text-sm leading-relaxed text-red-100/80">{isSignUp ? 'Tạo tài khoản để cùng lan tỏa những điều tốt đẹp.' : 'Chào mừng bạn quay trở lại!'}</p>
            </div>

            {/* LOGIN / REGISTER TABS */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-yellow-400/15 bg-black/30 p-1.5">
              <button type="button" onClick={() => { setIsSignUp(false); setMessage(null) }} className={`rounded-full px-3 py-2.5 text-sm font-bold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 ${!isSignUp ? 'bg-linear-to-r from-yellow-500 to-yellow-300 text-red-950 shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-yellow-100'}`}>Đăng nhập</button>
              <button type="button" onClick={() => { setIsSignUp(true); setMessage(null) }} className={`rounded-full px-3 py-2.5 text-sm font-bold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 ${isSignUp ? 'bg-linear-to-r from-yellow-500 to-yellow-300 text-red-950 shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-yellow-100'}`}>Đăng ký</button>
            </div>

            {/* AUTH FORM */}
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label htmlFor="fullName" className={labelClass}>Tên hiển thị</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-200/60" />
                      <input id="fullName" type="text" name="fullName" required autoComplete="name" className={inputClass} placeholder="Tên của bạn" value={formData.fullName} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="register-username" className={labelClass}>Tên đăng nhập</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-200/60" />
                      <input id="register-username" type="text" name="username" required autoComplete="username" className={inputClass} placeholder="Tên đăng nhập không dấu" value={formData.username} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="auth-username" className={labelClass}>{isSignUp ? 'Email' : 'Tên đăng nhập hoặc Email'}</label>
                <div className="relative">
                  {isSignUp ? <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-200/60" /> : <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-200/60" />}
                  <input id="auth-username" type={isSignUp ? 'email' : 'text'} name={isSignUp ? 'email' : 'username'} required autoComplete={isSignUp ? 'email' : 'username'} className={inputClass} placeholder={isSignUp ? 'you@example.com' : 'Tên đăng nhập hoặc email'} value={isSignUp ? formData.email : formData.username} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-200/60" />
                  <input id="password" type={showPassword ? 'text' : 'password'} name="password" required autoComplete={isSignUp ? 'new-password' : 'current-password'} className={`${inputClass} pr-11`} placeholder={isSignUp ? 'Tối thiểu 8 ký tự' : 'Nhập mật khẩu'} value={formData.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-white/50 transition hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {isSignUp ? <p className="mt-2 text-xs leading-relaxed text-yellow-100/50">Gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p> : <div className="mt-2 text-right"><Link href="/forgot-password" className="text-xs font-semibold text-yellow-300 transition hover:text-yellow-100 hover:underline">Quên mật khẩu?</Link></div>}
              </div>

              {message && <div role="alert" aria-live="polite" className={`rounded-xl border p-3 text-sm leading-relaxed ${message.type === 'success' ? 'border-green-300/20 bg-green-500/10 text-green-200' : 'border-red-300/20 bg-red-500/10 text-red-200'}`}>{message.text}</div>}

              <button type="submit" disabled={loading} className={primaryButtonClass}>
                {loading ? <><Snowflake className="h-5 w-5 animate-spin" />Đang xử lý...</> : <><Gift className="h-5 w-5" />{isSignUp ? 'Đăng Ký' : 'Đăng Nhập'}</>}
              </button>

              <div className="relative flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-linear-to-r from-transparent to-yellow-400/20" />
                <span className="text-xs font-medium text-yellow-100/50">Hoặc</span>
                <div className="h-px flex-1 bg-linear-to-l from-transparent to-yellow-400/20" />
              </div>

              <button type="button" onClick={() => loginWithGoogle()} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-full border border-yellow-400/20 bg-white/4 py-3 text-sm font-semibold text-white/80 transition duration-300 hover:border-yellow-300/50 hover:bg-white/8 hover:text-yellow-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Đăng nhập bằng Google
              </button>
            </form>

            {/* SWITCH AUTH MODE */}
            <div className="mt-6 border-t border-yellow-400/15 pt-5 text-center">
              <p className="text-sm text-white/60">
                {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setMessage(null) }} className="ml-2 font-bold text-yellow-300 transition hover:text-yellow-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">{isSignUp ? 'Đăng nhập ngay' : 'Đăng ký ngay'}</button>
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-5 text-center">
          <p className="font-serif text-sm text-yellow-100/60">Trao yêu thương, nhận hạnh phúc</p>
          <p className="mt-2 text-xs text-white/35">Made with ❤️ for a magical Christmas</p>
        </div>
      </div>
    </main>
  )
}