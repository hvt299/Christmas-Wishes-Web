'use client'

// components/games/SnowflakeBalance.tsx
// Hiển thị số dư ❄️ — subscribe từ useGameStore và đồng bộ thời gian thực từ MongoDB
import { useEffect } from 'react'
import { Snowflake } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'

interface Props {
    className?: string
    showLabel?: boolean
}

export function SnowflakeBalance({ className = '', showLabel = false }: Props) {
    const snowflakes = useGameStore((s) => s.snowflakes)
    const refreshSnowflakes = useGameStore((s) => s.refreshSnowflakes)

    useEffect(() => {
        // Tự động tải số bông tuyết mới nhất từ backend MongoDB
        void refreshSnowflakes()

        // Tự động làm mới khi người dùng quay lại tab trình duyệt
        const handleRefresh = () => {
            void refreshSnowflakes()
        }
        window.addEventListener('focus', handleRefresh)
        document.addEventListener('visibilitychange', handleRefresh)

        return () => {
            window.removeEventListener('focus', handleRefresh)
            document.removeEventListener('visibilitychange', handleRefresh)
        }
    }, [refreshSnowflakes])

    return (
        <span
            title={`${snowflakes.toLocaleString('vi-VN')} Bông Tuyết`}
            className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-blue-300/25 bg-blue-500/15 px-2 py-0.5 sm:px-2.5 sm:py-1 text-blue-200 transition-colors ${className}`}
        >
            <Snowflake className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-blue-300" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-bold tabular-nums">
                {snowflakes >= 10000 ? `${(snowflakes / 1000).toFixed(1)}k` : snowflakes.toLocaleString('vi-VN')}
            </span>
            {showLabel && <span className="text-xs text-blue-300/70">❄️</span>}
        </span>
    )
}
