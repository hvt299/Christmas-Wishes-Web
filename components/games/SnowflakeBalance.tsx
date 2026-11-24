'use client'

// components/games/SnowflakeBalance.tsx
// Hiển thị số dư ❄️ — subscribe từ useGameStore
import { Snowflake } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'

interface Props {
    className?: string
    showLabel?: boolean
}

export function SnowflakeBalance({ className = '', showLabel = false }: Props) {
    const snowflakes = useGameStore((s) => s.snowflakes)

    return (
        <span
            title="Số bông tuyết hiện có"
            className={`inline-flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-blue-400/10 px-2.5 py-1.5 text-blue-200 ${className}`}
        >
            <Snowflake className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
            <span className="text-sm font-bold tabular-nums">
                {snowflakes.toLocaleString('vi-VN')}
            </span>
            {showLabel && <span className="text-xs text-blue-300/70">❄️</span>}
        </span>
    )
}
