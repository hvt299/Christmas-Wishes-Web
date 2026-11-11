'use client'

import type { CSSProperties } from 'react'
import { TREE_DECORATION_CATALOG } from '@/constants/tree-decorations'
import type { TreeAmbientDecoration, TreeDecorationType, TreeGift, TreeSceneItem } from '@/types/tree-detail.types'

export interface TreeDecorationProps {
    item?: TreeSceneItem | TreeAmbientDecoration
    type?: TreeDecorationType
    colorClass?: string
    onSelect?: (gift: TreeGift) => void
    animationDelay?: number
}

export const getGiftColorClass = (theme?: string): string => {
    const normalized = theme?.toLowerCase() ?? 'red_box'
    if (normalized.includes('green')) return 'green'
    if (normalized.includes('gold') || normalized.includes('yellow')) return 'gold'
    if (normalized.includes('blue') || normalized.includes('sky')) return 'blue'
    if (normalized.includes('purple') || normalized.includes('violet')) return 'purple'
    return 'red'
}

/**
 * 8 Custom Vector Ornaments rendered with SVG, golden hanging loop, and high festive detail.
 */
export const renderDecorationSvg = (type: TreeDecorationType, colorClass: string) => {
    switch (type) {
        case 'gift_box': {
            const boxColors: Record<string, { main: string; dark: string; light: string; ribbon: string }> = {
                red: { main: '#dc2626', dark: '#991b1b', light: '#f87171', ribbon: '#fbbf24' },
                green: { main: '#16a34a', dark: '#14532d', light: '#4ade80', ribbon: '#fbbf24' },
                gold: { main: '#eab308', dark: '#854d0e', light: '#fef08a', ribbon: '#dc2626' },
                blue: { main: '#0284c7', dark: '#0c4a6e', light: '#38bdf8', ribbon: '#fef08a' },
                purple: { main: '#9333ea', dark: '#581c87', light: '#c084fc', ribbon: '#facc15' },
            }
            const colors = boxColors[colorClass] || boxColors.red

            return (
                <svg viewBox="0 0 44 48" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]">
                    {/* Hanging String Loop */}
                    <path d="M22 1 C22 1 19 6 22 9" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
                    {/* Bow */}
                    <path d="M17 11 C13 7 13 14 19 12 C21 11 22 13 22 13 C22 13 23 11 25 12 C31 14 31 7 27 11 Z" fill={colors.ribbon} />
                    <circle cx="22" cy="12.5" r="2.2" fill="#d97706" />
                    {/* Lid */}
                    <rect x="7" y="13" width="30" height="7" rx="2" fill={colors.main} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
                    <rect x="20" y="13" width="4" height="7" fill={colors.ribbon} />
                    {/* Box Body */}
                    <rect x="9" y="20" width="26" height="23" rx="2" fill={colors.dark} />
                    <rect x="10" y="20" width="24" height="22" rx="1.5" fill={colors.main} />
                    {/* Vertical Ribbon */}
                    <rect x="20" y="20" width="4" height="22" fill={colors.ribbon} />
                    {/* Horizontal Ribbon */}
                    <rect x="9" y="29" width="26" height="4" fill={colors.ribbon} />
                    {/* Highlight */}
                    <rect x="11" y="22" width="7" height="3" rx="1" fill={colors.light} opacity="0.4" />
                </svg>
            )
        }

        case 'bauble': {
            const baubleGradients: Record<string, { start: string; mid: string; end: string }> = {
                red: { start: '#fecaca', mid: '#dc2626', end: '#7f1d1d' },
                green: { start: '#bbf7d0', mid: '#16a34a', end: '#14532d' },
                gold: { start: '#fef08a', mid: '#eab308', end: '#713f12' },
                blue: { start: '#bae6fd', mid: '#0284c7', end: '#0c4a6e' },
                purple: { start: '#e9d5ff', mid: '#9333ea', end: '#581c87' },
            }
            const g = baubleGradients[colorClass] || baubleGradients.red

            return (
                <svg viewBox="0 0 44 48" className="w-full h-full drop-shadow-[0_5px_9px_rgba(0,0,0,0.5)]">
                    {/* Loop */}
                    <circle cx="22" cy="5" r="3.5" stroke="#facc15" strokeWidth="1.6" fill="none" />
                    {/* Cap */}
                    <rect x="18" y="7" width="8" height="4" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                    {/* Sphere */}
                    <circle cx="22" cy="27" r="17" fill={`url(#bauble-grad-${colorClass})`} />
                    {/* Gloss Reflection */}
                    <ellipse cx="17" cy="21" rx="5" ry="2.5" fill="#ffffff" opacity="0.55" transform="rotate(-30 17 21)" />
                    <circle cx="27" cy="33" r="2" fill="#ffffff" opacity="0.25" />
                    <defs>
                        <radialGradient id={`bauble-grad-${colorClass}`} cx="35%" cy="30%">
                            <stop offset="0%" stopColor={g.start} />
                            <stop offset="45%" stopColor={g.mid} />
                            <stop offset="100%" stopColor={g.end} />
                        </radialGradient>
                    </defs>
                </svg>
            )
        }

        case 'bell':
            return (
                <svg viewBox="0 0 44 48" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.45)]">
                    {/* Hanging Ring & Bow */}
                    <circle cx="22" cy="4" r="3" stroke="#facc15" strokeWidth="1.5" fill="none" />
                    <path d="M16 8 C12 5 12 11 18 10 C21 9 22 11 22 11 C22 11 23 9 26 10 C32 11 32 5 28 8 Z" fill="#ef4444" />
                    <circle cx="22" cy="9.5" r="1.8" fill="#991b1b" />
                    {/* Bell Body */}
                    <path d="M22 9 C16 9 14 18 11 28 C9 34 7 35 7 36 L37 36 C37 35 35 34 33 28 C30 18 28 9 22 9 Z" fill="url(#bell-body-grad)" />
                    {/* Rim */}
                    <rect x="6" y="35" width="32" height="4.5" rx="2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.6" />
                    {/* Clapper */}
                    <circle cx="22" cy="40.5" r="3.2" fill="#854d0e" />
                    <defs>
                        <linearGradient id="bell-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="35%" stopColor="#facc15" />
                            <stop offset="85%" stopColor="#b45309" />
                            <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>
                    </defs>
                </svg>
            )

        case 'candy_cane':
            return (
                <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.4)]">
                    {/* Hanging String */}
                    <path d="M19 1 C19 1 20 6 15 10" stroke="#facc15" strokeWidth="1.5" fill="none" opacity="0.8" />
                    {/* Candy Stick */}
                    <path
                        d="M13 44 L13 19 C13 9 27 9 27 19"
                        stroke="url(#candy-stripes)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />
                    {/* Holly Bow in center */}
                    <circle cx="13" cy="24" r="2.5" fill="#dc2626" />
                    <circle cx="16" cy="26" r="2.2" fill="#b91c1c" />
                    <ellipse cx="9" cy="23" rx="4" ry="2" fill="#15803d" transform="rotate(-30 9 23)" />
                    <ellipse cx="18" cy="22" rx="4" ry="2" fill="#16a34a" transform="rotate(30 18 22)" />
                    <defs>
                        <pattern id="candy-stripes" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                            <rect width="6" height="12" fill="#dc2626" />
                            <rect x="6" width="6" height="12" fill="#ffffff" />
                        </pattern>
                    </defs>
                </svg>
            )

        case 'snowflake':
            return (
                <svg viewBox="0 0 44 48" className="w-full h-full drop-shadow-[0_0_8px_rgba(186,230,253,0.7)] text-sky-100">
                    {/* Loop */}
                    <circle cx="22" cy="4" r="2.8" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.8" />
                    <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                        <line x1="22" y1="8" x2="22" y2="44" />
                        <line x1="6.5" y1="17" x2="37.5" y2="35" />
                        <line x1="6.5" y1="35" x2="37.5" y2="17" />
                        {/* Branches */}
                        <path d="M17 12 L22 17 L27 12" fill="none" stroke="#7dd3fc" />
                        <path d="M17 40 L22 35 L27 40" fill="none" stroke="#7dd3fc" />
                        <path d="M9 25 L14 22 L11 18" fill="none" stroke="#7dd3fc" />
                        <path d="M35 27 L30 30 L33 34" fill="none" stroke="#7dd3fc" />
                    </g>
                    {/* Center Core */}
                    <circle cx="22" cy="26" r="3.5" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="1.5" />
                </svg>
            )

        case 'stocking':
            return (
                <svg viewBox="0 0 42 48" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.45)]">
                    {/* Loop */}
                    <path d="M14 2 Q10 5 13 8" stroke="#facc15" strokeWidth="1.6" fill="none" />
                    {/* Stocking Boot */}
                    <path
                        d="M13 13 L27 13 L27 27 C27 32 33 33 33 39 C33 44 28 46 23 46 C15 46 13 38 13 34 Z"
                        fill="#dc2626"
                    />
                    {/* Heel and Toe accent */}
                    <path d="M23 46 C15 46 13 38 13 34 L13 31 C13 38 18 43 23 43 Z" fill="#15803d" />
                    {/* White Fluffy Cuff */}
                    <rect x="11" y="8" width="18" height="7" rx="3.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
                    {/* Holly leaf */}
                    <circle cx="20" cy="18" r="2" fill="#ef4444" />
                    <ellipse cx="17" cy="18" rx="3" ry="1.5" fill="#16a34a" />
                </svg>
            )

        case 'star':
            return (
                <svg viewBox="0 0 44 48" className="w-full h-full drop-shadow-[0_0_10px_rgba(253,224,71,0.65)]">
                    {/* Loop */}
                    <circle cx="22" cy="4" r="3" stroke="#facc15" strokeWidth="1.5" fill="none" opacity="0.85" />
                    {/* 5-pointed star */}
                    <path
                        d="M22 8 L26.8 20.5 L40.5 21.5 L30 30.5 L33.2 44 L22 37 L10.8 44 L14 30.5 L3.5 21.5 L17.2 20.5 Z"
                        fill="url(#star-ornament-grad)"
                        stroke="#fef08a"
                        strokeWidth="0.8"
                    />
                    {/* Inner Facet Lines */}
                    <line x1="22" y1="8" x2="22" y2="28" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
                    <line x1="40.5" y1="21.5" x2="22" y2="28" stroke="#ca8a04" strokeWidth="1" opacity="0.5" />
                    <line x1="3.5" y1="21.5" x2="22" y2="28" stroke="#fef08a" strokeWidth="1" opacity="0.5" />
                    <line x1="33.2" y1="44" x2="22" y2="28" stroke="#ca8a04" strokeWidth="1" opacity="0.6" />
                    <line x1="10.8" y1="44" x2="22" y2="28" stroke="#854d0e" strokeWidth="1" opacity="0.6" />
                    <defs>
                        <radialGradient id="star-ornament-grad" cx="45%" cy="38%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="35%" stopColor="#fde047" />
                            <stop offset="80%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#a16207" />
                        </radialGradient>
                    </defs>
                </svg>
            )

        case 'envelope':
            return (
                <svg viewBox="0 0 44 48" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
                    {/* Loop */}
                    <path d="M22 2 C22 2 20 6 22 9" stroke="#facc15" strokeWidth="1.5" fill="none" opacity="0.85" />
                    {/* Envelope Body */}
                    <rect x="4" y="12" width="36" height="28" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2" />
                    {/* Bottom Fold Lines */}
                    <path d="M4 40 L22 26 L40 40" stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.35" />
                    {/* Top Flap */}
                    <path d="M4 12 L22 28 L40 12" fill="#fef9c3" stroke="#d97706" strokeWidth="1.4" />
                    {/* Red Wax Seal */}
                    <circle cx="22" cy="27" r="4.5" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
                    <circle cx="22" cy="27" r="3" fill="#ef4444" />
                    {/* Heart symbol on stamp */}
                    <path d="M21 26 A1 1 0 0 1 23 26 Q22 29 22 29 Q21 29 21 26 Z" fill="#ffffff" opacity="0.9" />
                </svg>
            )

        default:
            return (
                <svg viewBox="0 0 44 48" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]">
                    <rect x="9" y="16" width="26" height="24" rx="2" fill="#dc2626" />
                    <rect x="20" y="16" width="4" height="24" fill="#fbbf24" />
                    <rect x="9" y="26" width="26" height="4" fill="#fbbf24" />
                </svg>
            )
    }
}

export default function TreeDecoration({
    item,
    type: explicitType,
    colorClass: explicitColor,
    onSelect,
    animationDelay = 0,
}: TreeDecorationProps) {
    if (!item) {
        const type: TreeDecorationType = explicitType || 'gift_box'
        const colorClass = explicitColor || 'red'
        return (
            <span className="inline-flex items-center justify-center w-full h-full" aria-hidden="true">
                {renderDecorationSvg(type, colorClass)}
            </span>
        )
    }

    const isSceneItem = 'position' in item
    const isRealGift = 'source' in item && item.source === 'gift'
    const gift = isRealGift ? item.gift : undefined

    const type: TreeDecorationType = explicitType || item.type || 'gift_box'
    const definition = TREE_DECORATION_CATALOG[type] || TREE_DECORATION_CATALOG.gift_box

    const x = isSceneItem ? item.position.x : item.x
    const y = isSceneItem ? item.position.y : item.y
    const rotation = isSceneItem ? item.position.rotation : item.rotation
    const scale = isSceneItem ? item.position.scale : item.scale
    const opacity = isSceneItem ? 1 : item.opacity

    const style = {
        '--cw-x': `${x}%`,
        '--cw-y': `${y}%`,
        '--cw-rotation': `${rotation}deg`,
        '--cw-scale': scale,
        '--cw-opacity': opacity,
        animationDelay: `${animationDelay}s`,
    } as CSSProperties

    const senderName = gift?.sender?.fullName || gift?.sender?.username || 'Người gửi ẩn danh'
    const giftTheme = gift?.theme || gift?.gift?.theme || 'red_box'
    const colorClass = getGiftColorClass(giftTheme)

    if (!isRealGift) {
        return (
            <span className="cw-tree-ambient" style={style} aria-hidden="true">
                {renderDecorationSvg(type, 'gold')}
            </span>
        )
    }

    return (
        <button
            type="button"
            className="cw-tree-decoration group"
            style={style}
            onClick={() => gift && onSelect?.(gift)}
            disabled={!gift || !onSelect}
            aria-label={`${definition.label} từ ${senderName}`}
            title={`${definition.label} từ ${senderName} - Chạm để xem`}
        >
            {/* Ornament Graphic */}
            {renderDecorationSvg(type, colorClass)}

            {/* Decomytree-style Sender Tag Tooltip */}
            <span className="cw-tree-decoration__tooltip">
                {senderName}
            </span>

            {/* Unread Indicator Pulse Dot */}
            {gift && gift.isOpened === false && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white/70" />
                </span>
            )}
        </button>
    )
}
