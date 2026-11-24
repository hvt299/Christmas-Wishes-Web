'use client'

// components/games/GameHeader.tsx
// Header chuẩn Giáng Sinh đồng nhất với my-trees: Logo, Nút quay lại, Số bông tuyết, Nút đăng xuất
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Snowflake, LogOut } from 'lucide-react'
import { SnowflakeBalance } from './SnowflakeBalance'
import { clearAuthData } from '@/utils/auth'

interface Props {
  backHref?: string
  backLabel?: string
}

export function GameHeader({
  backHref = '/mini-games',
  backLabel = 'Quay lại',
}: Props) {
  const router = useRouter()

  const handleLogout = () => {
    clearAuthData()
    router.replace('/login')
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-yellow-400/20 bg-red-950/40 px-4 py-3 shadow-lg backdrop-blur-xl md:px-8">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        {/* Left: Branding */}
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2 font-serif text-xl font-bold text-yellow-400 transition hover:scale-105 hover:text-yellow-200 md:text-2xl"
        >
          <Snowflake className="h-7 w-7 shrink-0 animate-spin md:h-8 md:w-8" />
          <span className="hidden sm:inline">Christmas Wishes</span>
        </Link>

        {/* Right: Actions, Balance & Logout */}
        <div className="flex min-w-0 items-center gap-1 rounded-full border border-yellow-400/30 bg-black/40 py-1 pl-1 pr-2 shadow-lg backdrop-blur-md md:gap-2">
          {/* Back button */}
          <Link
            href={backHref}
            title={backLabel}
            className="group flex min-w-0 items-center gap-2 rounded-full px-2 py-1.5 text-sm text-white/80 transition hover:bg-red-900/50 hover:text-yellow-200 md:gap-2.5 md:px-3"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs md:text-sm">{backLabel}</span>
          </Link>

          <div className="mx-1 h-6 w-px shrink-0 bg-white/20" />

          {/* Snowflake balance */}
          <SnowflakeBalance />

          <div className="mx-1 h-6 w-px shrink-0 bg-white/20" />

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="shrink-0 rounded-full p-2 text-white/70 transition hover:bg-red-900/60 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </nav>
    </header>
  )
}
