'use client'

// hooks/useGameClock.ts — Đồng hồ GMT+7, đếm ngược tới 00:00 VN
import { useState, useEffect } from 'react'
import { getVnDayKey } from '@/constants/games'

interface GameClock {
    vnNow: Date
    vnDayKey: string   // "YYYY-MM-DD"
    vnMonthDay: string // "MM-DD"
    /** Giây còn lại tới 00:00 VN */
    secondsToMidnight: number
    /** Formatted "HH:MM:SS" tới 00:00 */
    countdownToMidnight: string
}

export function useGameClock(): GameClock {
    const [vnNow, setVnNow] = useState(new Date())

    useEffect(() => {
        const id = setInterval(() => setVnNow(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    const dayKey = getVnDayKey(vnNow)
    const md = dayKey.slice(5)

    // Tính giây tới 00:00 VN
    const vnDateStr = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(vnNow)
    const [hh, mm, ss] = vnDateStr.slice(11).split(':').map(Number)
    const elapsed = hh * 3600 + mm * 60 + ss
    const secondsToMidnight = 86400 - elapsed

    const pad = (n: number) => String(n).padStart(2, '0')
    const h = Math.floor(secondsToMidnight / 3600)
    const m = Math.floor((secondsToMidnight % 3600) / 60)
    const s = secondsToMidnight % 60
    const countdownToMidnight = `${pad(h)}:${pad(m)}:${pad(s)}`

    return { vnNow, vnDayKey: dayKey, vnMonthDay: md, secondsToMidnight, countdownToMidnight }
}
