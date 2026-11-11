
'use client'

import { useEffect, useState } from 'react'

interface GiftOpeningAnimationProps {
    isOpening: boolean
    onComplete?: () => void
    giftColor?: 'red' | 'green' | 'gold' | 'blue' | 'purple'
}

export default function GiftOpeningAnimation({ isOpening, onComplete, giftColor = 'red' }: GiftOpeningAnimationProps) {
    const [animationCompleted, setAnimationCompleted] = useState(false)

    useEffect(() => {
        if (!isOpening) {
            setAnimationCompleted(false)
            return
        }

        const timeoutId = window.setTimeout(() => {
            setAnimationCompleted(true)
            onComplete?.()
        }, 1900)

        return () => window.clearTimeout(timeoutId)
    }, [isOpening, onComplete])

    return (
        <div className={`cw-gift-opening ${isOpening ? 'is-opening' : ''} ${animationCompleted ? 'is-complete' : ''}`} role="img" aria-label={isOpening ? 'Đang mở hộp quà Giáng Sinh' : 'Hộp quà Giáng Sinh'}>
            <div className="cw-gift-opening__glow" aria-hidden="true" />

            <div className={`cw-gift-box cw-tree-decoration--${giftColor}`} aria-hidden="true">
                <div className="cw-gift-box__body" />
                <div className="cw-gift-box__lid" />
                <div className="cw-gift-box__bow" />
            </div>

            {animationCompleted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                    <span className="text-4xl animate-ping">✨</span>
                </div>
            )}
        </div>
    )
}