// lib/local-ledger.ts
// Bộ nhớ đệm & lưu trữ lịch sử nhận thưởng (hỗ trợ cả offline / test mode và đồng bộ server)
import type { LedgerEntry, GameId } from '@/types/games'

const STORAGE_KEY = 'christmas_wishes_ledger_cache'

export function saveLocalLedger(
  game: GameId,
  amount: number,
  balanceAfter: number,
  type: 'earn' | 'spend' = amount >= 0 ? 'earn' : 'spend',
) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list: LedgerEntry[] = raw ? JSON.parse(raw) : []
    const newEntry: LedgerEntry = {
      _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      game,
      type,
      amount,
      balanceAfter,
      sessionId: `session-${Date.now()}`,
      dayKey: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    }
    list.unshift(newEntry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 60)))
  } catch {
    /* noop */
  }
}

export function getLocalLedger(game?: GameId, type?: 'earn' | 'spend'): LedgerEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    let list: LedgerEntry[] = JSON.parse(raw)
    if (game) list = list.filter((e) => e.game === game)
    if (type) list = list.filter((e) => e.type === type)
    return list
  } catch {
    return []
  }
}
