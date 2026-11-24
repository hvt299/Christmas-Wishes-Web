// lib/games-api.ts — API layer cho tất cả game endpoints
import api from './api'
import type {
    GamesStatusResponse,
    SnowflakeStartResponse,
    SnowflakeFinishResponse,
    CatchLogEntry,
    CardFlipStartResponse,
    CardFlipFlipResponse,
    GiftGuessStartResponse,
    GiftGuessOpenResponse,
    LuckyWheelSpinResponse,
    LedgerResponse,
    GameId,
    GiftGuessMode,
    LuckyWheelMode,
} from '@/types/games'

export const gamesApi = {
    // ---- Status ----
    getStatus(): Promise<{ data: GamesStatusResponse }> {
        return api.get('/games/status')
    },

    // ---- Săn Bông Tuyết ----
    snowflakeStart(): Promise<{ data: SnowflakeStartResponse }> {
        return api.post('/games/snowflake/start')
    },
    snowflakeFinish(sessionId: string, catchLog: CatchLogEntry[]): Promise<{ data: SnowflakeFinishResponse }> {
        return api.post('/games/snowflake/finish', { sessionId, catchLog })
    },

    // ---- Lật thẻ ----
    cardFlipStart(): Promise<{ data: CardFlipStartResponse }> {
        return api.post('/games/card-flip/start')
    },
    cardFlipFlip(sessionId: string, cardIndex: number): Promise<{ data: CardFlipFlipResponse }> {
        return api.post('/games/card-flip/flip', { sessionId, cardIndex })
    },

    // ---- Đoán quà ----
    giftGuessStart(mode: GiftGuessMode): Promise<{ data: GiftGuessStartResponse }> {
        return api.post('/games/gift-guess/start', { mode })
    },
    giftGuessOpen(sessionId: string, boxIndex: number): Promise<{ data: GiftGuessOpenResponse }> {
        return api.post('/games/gift-guess/open', { sessionId, boxIndex })
    },

    // ---- Quay may mắn ----
    luckyWheelSpin(mode: LuckyWheelMode): Promise<{ data: LuckyWheelSpinResponse }> {
        return api.post('/games/lucky-wheel/spin', { mode })
    },

    // ---- Sổ cái ----
    getLedger(params?: {
        game?: GameId
        type?: 'earn' | 'spend'
        cursor?: string
        limit?: number
    }): Promise<{ data: LedgerResponse }> {
        return api.get('/games/ledger', { params })
    },
}
