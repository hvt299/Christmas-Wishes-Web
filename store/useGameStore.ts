// store/useGameStore.ts — Zustand store cho trạng thái game
import { create } from 'zustand'
import type { GameId, GameStatus, LedgerEntry } from '@/types/games'

interface GameQuota {
    used: number
    max: number | null
    status: GameStatus
}

interface GameStore {
    // Số dư
    snowflakes: number
    setSnowflakes: (n: number) => void

    // Thu chi hôm nay
    todayEarned: number
    todaySpent: number
    addTransaction: (amount: number) => void

    // Quota + trạng thái từng game
    gameQuotas: Partial<Record<GameId, GameQuota>>
    setGameQuotas: (quotas: Partial<Record<GameId, GameQuota>>) => void
    incrementQuota: (game: GameId) => void

    // Số game đang mở
    openGameCount: number

    // Sổ cái local (trang hiện tại)
    ledgerEntries: LedgerEntry[]
    prependLedger: (entry: LedgerEntry) => void
}

function getInitialSnowflakes(): number {
    if (typeof window !== 'undefined') {
        const userInfo = localStorage.getItem('user_info')
        if (userInfo) {
            try {
                const parsed = JSON.parse(userInfo)
                if (typeof parsed.snowflakes === 'number') {
                    return parsed.snowflakes
                }
            } catch {
                /* noop */
            }
        }
    }
    return 0
}

export const useGameStore = create<GameStore>((set, get) => ({
    snowflakes: getInitialSnowflakes(),
    setSnowflakes: (n) => {
        const valid = Math.max(0, n)
        if (typeof window !== 'undefined') {
            const userInfo = localStorage.getItem('user_info')
            if (userInfo) {
                try {
                    const parsed = JSON.parse(userInfo)
                    parsed.snowflakes = valid
                    localStorage.setItem('user_info', JSON.stringify(parsed))
                } catch {
                    /* noop */
                }
            }
        }
        set({ snowflakes: valid })
    },

    todayEarned: 0,
    todaySpent: 0,
    addTransaction: (amount) => {
        if (amount > 0) set((s) => ({ todayEarned: s.todayEarned + amount }))
        else if (amount < 0) set((s) => ({ todaySpent: s.todaySpent + Math.abs(amount) }))
    },

    gameQuotas: {},
    setGameQuotas: (quotas) => {
        const openCount = Object.values(quotas).filter((q) => q?.status === 'open').length
        set({ gameQuotas: quotas, openGameCount: openCount })
    },
    incrementQuota: (game) => {
        const q = get().gameQuotas[game]
        if (!q) return
        const newUsed = q.used + 1
        const newStatus: GameStatus =
            q.max !== null && newUsed >= q.max ? 'quota_reached' : q.status
        set((s) => ({
            gameQuotas: {
                ...s.gameQuotas,
                [game]: { ...q, used: newUsed, status: newStatus },
            },
        }))
    },

    openGameCount: 0,

    ledgerEntries: [],
    prependLedger: (entry) =>
        set((s) => ({ ledgerEntries: [entry, ...s.ledgerEntries] })),
}))
