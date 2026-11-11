'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock3, LockKeyhole, Sparkles, UnlockKeyhole } from 'lucide-react'

export interface TreeCountdownProps {
    year: number
    isOwner?: boolean
    contentsUnlocked?: boolean
    isUnlocked?: boolean
    targetDate?: Date | null
    unlockTime?: Date | null
    currentTime?: number | null
    onUnlockTimeReached?: () => void
}

export default function TreeCountdown(props: TreeCountdownProps) {
    const { year, onUnlockTimeReached } = props
    const isOwner = Boolean(props.isOwner)
    const contentsUnlocked = Boolean(props.contentsUnlocked ?? props.isUnlocked)

    const targetTime = (props.unlockTime || props.targetDate)
        ? (props.unlockTime || props.targetDate)!.getTime()
        : new Date(`${year}-12-25T00:00:00+07:00`).getTime()

    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
    const hasNotifiedRef = useRef(false)
    const onUnlockTimeReachedRef = useRef(onUnlockTimeReached)

    useEffect(() => {
        onUnlockTimeReachedRef.current = onUnlockTimeReached
    }, [onUnlockTimeReached])

    useEffect(() => {
        hasNotifiedRef.current = false

        const updateCountdown = () => {
            const now = props.currentTime ?? Date.now()
            const remaining = Math.max(0, Math.ceil((targetTime - now) / 1000))

            setRemainingSeconds(remaining)

            if (remaining === 0 && !contentsUnlocked && !hasNotifiedRef.current) {
                hasNotifiedRef.current = true
                onUnlockTimeReachedRef.current?.()
            }
        }

        updateCountdown()

        const intervalId = window.setInterval(updateCountdown, 1000)

        return () => window.clearInterval(intervalId)
    }, [targetTime, contentsUnlocked, props.currentTime])

    const days = remainingSeconds === null ? '--' : Math.floor(remainingSeconds / 86400)
    const hours = remainingSeconds === null ? '--' : Math.floor((remainingSeconds % 86400) / 3600)
    const minutes = remainingSeconds === null ? '--' : Math.floor((remainingSeconds % 3600) / 60)
    const seconds = remainingSeconds === null ? '--' : remainingSeconds % 60

    const countdownUnits = [
        { label: 'Ngày', value: days },
        { label: 'Giờ', value: hours },
        { label: 'Phút', value: minutes },
        { label: 'Giây', value: seconds },
    ]

    return (
        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-amber-200/15 bg-[#071b16]/50 px-6 py-6 text-center text-amber-50 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl" aria-label="Đếm ngược mở khóa quà Giáng Sinh">
            {contentsUnlocked ? (
                <div className="flex flex-col items-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.15)]">
                        <UnlockKeyhole size={24} aria-hidden="true" />
                    </span>
                    <p className="flex items-center gap-2 font-serif text-lg font-bold text-yellow-200">
                        <Sparkles size={18} aria-hidden="true" />
                        ĐÃ ĐẾN MÙA KHÁM PHÁ QUÀ
                        <Sparkles size={18} aria-hidden="true" />
                    </p>
                    <p className="text-xs leading-relaxed text-red-100/70 sm:text-sm">
                        {isOwner ? 'Những món quà và lời chúc yêu thương đã sẵn sàng để bạn mở ra!' : 'Nội dung bên trong hộp quà chỉ dành riêng cho chủ nhân cây thông khám phá.'}
                    </p>
                </div>
            ) : remainingSeconds === 0 ? (
                <div className="flex flex-col items-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-300">
                        <Clock3 size={24} aria-hidden="true" />
                    </span>
                    <p className="font-serif text-lg font-bold text-yellow-200">ĐÃ ĐẾN THỜI ĐIỂM MỞ KHÓA</p>
                    <p className="text-xs leading-relaxed text-red-100/70 sm:text-sm">
                        {onUnlockTimeReached ? 'Đang đồng bộ trạng thái cây thông...' : 'Hãy tải lại cây để cập nhật quyền truy cập.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-yellow-200">
                        <LockKeyhole size={18} aria-hidden="true" />
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-200/90">Thời gian đếm ngược mở khóa</p>
                    </div>

                    <p className="font-serif text-sm sm:text-base font-semibold text-yellow-100">
                        Mở vào đúng 00:00 · 25/12/{year} <span className="text-xs font-normal text-red-100/60">(Giờ Việt Nam · GMT+7)</span>
                    </p>

                    <div className="grid w-full max-w-2xl grid-cols-4 gap-3 sm:gap-4 mx-auto" aria-label="Thời gian còn lại">
                        {countdownUnits.map((unit) => (
                            <div key={unit.label} className="rounded-2xl border border-amber-200/15 bg-black/35 px-2 py-3.5 sm:px-4 sm:py-4 shadow-inner">
                                <p className="font-serif text-2xl sm:text-4xl font-black tabular-nums text-yellow-300 drop-shadow">
                                    {String(unit.value).padStart(2, '0')}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-red-100/60 sm:text-xs">
                                    {unit.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
