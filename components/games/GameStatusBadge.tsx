'use client'

// components/games/GameStatusBadge.tsx
import type { GameStatus } from '@/types/games'

interface Props {
    status: GameStatus
    className?: string
}

const CONFIG: Record<GameStatus, { label: string; dot: string; ring: string; text: string }> = {
    open:          { label: 'Đang mở',          dot: 'bg-green-400 animate-ping',  ring: 'bg-green-400', text: 'text-green-300'  },
    coming_soon:   { label: 'Sắp mở',           dot: 'bg-blue-400',               ring: 'bg-blue-400',  text: 'text-blue-300'   },
    closed:        { label: 'Đã đóng',           dot: 'bg-zinc-500',               ring: 'bg-zinc-500',  text: 'text-zinc-400'   },
    quota_reached: { label: 'Hết lượt hôm nay', dot: 'bg-yellow-400',             ring: 'bg-yellow-400',text: 'text-yellow-300' },
}

export function GameStatusBadge({ status, className = '' }: Props) {
    const cfg = CONFIG[status]
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold ${cfg.text} ${className}`}
        >
            <span className="relative flex h-2 w-2 shrink-0">
                {status === 'open' && (
                    <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`} />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.ring}`} />
            </span>
            {cfg.label}
        </span>
    )
}
