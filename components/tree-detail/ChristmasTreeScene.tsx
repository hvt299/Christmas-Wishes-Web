'use client'

import { useMemo, type CSSProperties } from 'react'
import TreeDecoration from '@/components/tree-detail/TreeDecoration'
import {
    TREE_DECORATION_CATALOG,
    TREE_GIFT_POSITIONS,
    TREE_ITEMS_PER_PAGE,
    getThemeConfig,
} from '@/constants/tree-decorations'
import type { TreeDecorationType, TreeDetail, TreeGift, TreeSceneItem, TreeTheme } from '@/types/tree-detail.types'

export interface ChristmasTreeSceneProps {
    theme?: TreeTheme
    tree?: TreeDetail | null
    gifts?: TreeGift[]
    items?: TreeSceneItem[] | TreeGift[]
    currentPage?: number
    canViewContents?: boolean
    isOwner?: boolean
    onGiftSelect?: (gift: TreeGift) => void
    onGiftClick?: (gift: TreeGift) => void
    onSelectGift?: (gift: TreeGift) => void
}

const FAIRY_LIGHTS = [
    { x: 44, y: 19, color: 'gold', delay: 0 },
    { x: 56, y: 20, color: 'ice', delay: 0.3 },
    { x: 35, y: 29, color: 'red', delay: 0.6 },
    { x: 48, y: 31, color: 'gold', delay: 0.9 },
    { x: 63, y: 30, color: 'green', delay: 1.2 },
    { x: 26, y: 41, color: 'ice', delay: 0.2 },
    { x: 41, y: 43, color: 'gold', delay: 0.5 },
    { x: 57, y: 44, color: 'red', delay: 0.8 },
    { x: 72, y: 42, color: 'gold', delay: 1.1 },
    { x: 19, y: 55, color: 'gold', delay: 0.4 },
    { x: 33, y: 57, color: 'green', delay: 0.7 },
    { x: 49, y: 58, color: 'ice', delay: 1.0 },
    { x: 67, y: 57, color: 'gold', delay: 1.3 },
    { x: 81, y: 56, color: 'red', delay: 0.1 },
    { x: 25, y: 70, color: 'red', delay: 0.5 },
    { x: 48, y: 72, color: 'gold', delay: 0.8 },
    { x: 74, y: 71, color: 'ice', delay: 1.2 },
]

export default function ChristmasTreeScene({
    theme = 'classic',
    tree,
    gifts,
    items,
    onGiftSelect,
    onGiftClick,
    onSelectGift,
}: ChristmasTreeSceneProps) {
    const activeTheme = (tree?.theme || theme || 'classic') as TreeTheme
    const themeConfig = getThemeConfig(activeTheme)
    const handleSelect = onGiftSelect || onGiftClick || onSelectGift

    const normalizedItems = useMemo<TreeSceneItem[]>(() => {
        const rawList = gifts || (items as any[]) || tree?.gifts || []

        return rawList.slice(0, TREE_ITEMS_PER_PAGE).map((rawItem: any, index: number) => {
            if (rawItem && 'position' in rawItem && rawItem.position) {
                return rawItem as TreeSceneItem
            }

            const gift = rawItem as TreeGift
            const giftId = gift?._id || gift?.giftId || gift?.id || gift?.gift?._id || `gift-${index}`
            const rawOrnamentType = gift?.ornamentType || gift?.gift?.ornamentType
            const ornamentType: TreeDecorationType =
                rawOrnamentType && rawOrnamentType in TREE_DECORATION_CATALOG
                    ? (rawOrnamentType as TreeDecorationType)
                    : 'gift_box'

            const position = TREE_GIFT_POSITIONS[index % TREE_GIFT_POSITIONS.length]

            return {
                id: `scene-gift-${giftId}-${index}`,
                type: ornamentType,
                source: 'gift',
                position,
                gift,
            }
        })
    }, [gifts, items, tree?.gifts])

    const isWinter = activeTheme === 'winter'
    const isAurora = activeTheme === 'aurora'

    return (
        <div className="relative mx-auto w-full max-w-[500px] select-none py-2" aria-label={`Cây thông ${themeConfig.name}`}>
            {/* Aurora Background Veil (Aurora Theme only) */}
            {isAurora && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none rounded-3xl opacity-40 blur-2xl"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 20%, rgba(192, 132, 252, 0.45), rgba(45, 212, 191, 0.25) 50%, transparent 75%)',
                        animation: 'cw-aurora-drift 8s ease-in-out infinite alternate',
                    }}
                />
            )}

            {/* Tree Vector Stage */}
            <div className="relative z-10 w-full" style={{ paddingBottom: '135%' }}>
                {/* Vector SVG Pine Tree Illustration */}
                <svg
                    viewBox="0 0 440 580"
                    className="absolute inset-0 h-full w-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] pointer-events-none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* CLASSIC PINE GRADIENTS */}
                        <linearGradient id="classic-tier-1" x1="220" y1="70" x2="220" y2="180" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#1e8555" />
                            <stop offset="100%" stopColor="#0a4025" />
                        </linearGradient>
                        <linearGradient id="classic-tier-2" x1="220" y1="150" x2="220" y2="280" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#177548" />
                            <stop offset="100%" stopColor="#08381f" />
                        </linearGradient>
                        <linearGradient id="classic-tier-3" x1="220" y1="240" x2="220" y2="390" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#13643c" />
                            <stop offset="100%" stopColor="#06301a" />
                        </linearGradient>
                        <linearGradient id="classic-tier-4" x1="220" y1="340" x2="220" y2="500" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#0e5230" />
                            <stop offset="100%" stopColor="#042413" />
                        </linearGradient>

                        {/* WINTER FROST PINE GRADIENTS */}
                        <linearGradient id="winter-tier-1" x1="220" y1="70" x2="220" y2="180" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2c729e" />
                            <stop offset="100%" stopColor="#0f3750" />
                        </linearGradient>
                        <linearGradient id="winter-tier-2" x1="220" y1="150" x2="220" y2="280" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#226087" />
                            <stop offset="100%" stopColor="#0c2d42" />
                        </linearGradient>
                        <linearGradient id="winter-tier-3" x1="220" y1="240" x2="220" y2="390" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#1b4f70" />
                            <stop offset="100%" stopColor="#092435" />
                        </linearGradient>
                        <linearGradient id="winter-tier-4" x1="220" y1="340" x2="220" y2="500" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#143e59" />
                            <stop offset="100%" stopColor="#061a26" />
                        </linearGradient>

                        {/* AURORA PINE GRADIENTS */}
                        <linearGradient id="aurora-tier-1" x1="220" y1="70" x2="220" y2="180" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2dd4bf" />
                            <stop offset="50%" stopColor="#146a62" />
                            <stop offset="100%" stopColor="#191036" />
                        </linearGradient>
                        <linearGradient id="aurora-tier-2" x1="220" y1="150" x2="220" y2="280" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#209888" />
                            <stop offset="60%" stopColor="#104e49" />
                            <stop offset="100%" stopColor="#130c29" />
                        </linearGradient>
                        <linearGradient id="aurora-tier-3" x1="220" y1="240" x2="220" y2="390" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#17786c" />
                            <stop offset="65%" stopColor="#0c3d39" />
                            <stop offset="100%" stopColor="#0e081f" />
                        </linearGradient>
                        <linearGradient id="aurora-tier-4" x1="220" y1="340" x2="220" y2="500" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#125950" />
                            <stop offset="70%" stopColor="#072a27" />
                            <stop offset="100%" stopColor="#080414" />
                        </linearGradient>

                        {/* TRUNK & SNOW GRADIENTS */}
                        <linearGradient id="trunk-grad" x1="195" y1="460" x2="245" y2="460" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2d170f" />
                            <stop offset="30%" stopColor="#5d321d" />
                            <stop offset="65%" stopColor="#7a4427" />
                            <stop offset="100%" stopColor="#22110a" />
                        </linearGradient>
                        <linearGradient id="snow-ground-grad" x1="220" y1="490" x2="220" y2="570" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                            <stop offset="40%" stopColor="#e0f2fe" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>

                    {/* Wooden Tree Trunk */}
                    <rect x="198" y="470" width="44" height="60" rx="6" fill="url(#trunk-grad)" />

                    {/* Bottom Snow Ground Mound */}
                    <path
                        d="M 25 530 Q 220 480 415 530 C 425 550, 410 565, 380 568 Q 220 575 60 568 C 30 565, 15 550, 25 530 Z"
                        fill="url(#snow-ground-grad)"
                    />

                    {/* PINE TIER 4 (Bottom - Widest) */}
                    <path
                        d="M 220 340 C 195 365, 140 395, 45 448 C 65 453, 85 450, 105 443 C 95 460, 78 472, 68 479 C 115 471, 150 460, 175 448 C 166 466, 150 478, 144 485 C 190 475, 215 465, 220 462 C 225 465, 250 475, 296 485 C 290 478, 274 466, 265 448 C 290 460, 325 471, 372 479 C 362 472, 345 460, 335 443 C 355 450, 375 453, 395 448 C 300 395, 245 365, 220 340 Z"
                        fill={isWinter ? 'url(#winter-tier-4)' : isAurora ? 'url(#aurora-tier-4)' : 'url(#classic-tier-4)'}
                    />

                    {/* PINE TIER 3 (Middle-Lower) */}
                    <path
                        d="M 220 245 C 198 270, 155 298, 75 345 C 95 350, 115 347, 132 340 C 122 355, 108 366, 98 372 C 142 365, 172 355, 192 345 C 185 361, 172 371, 166 377 C 205 368, 218 360, 220 358 C 222 360, 235 368, 274 377 C 268 371, 255 361, 248 345 C 268 355, 298 365, 342 372 C 332 366, 318 355, 308 340 C 325 347, 345 350, 365 345 C 285 298, 242 270, 220 245 Z"
                        fill={isWinter ? 'url(#winter-tier-3)' : isAurora ? 'url(#aurora-tier-3)' : 'url(#classic-tier-3)'}
                    />

                    {/* PINE TIER 2 (Middle-Upper) */}
                    <path
                        d="M 220 155 C 202 178, 170 205, 108 245 C 125 249, 142 246, 156 240 C 148 253, 137 262, 128 267 C 166 261, 190 252, 206 244 C 200 257, 190 265, 185 270 C 215 262, 219 257, 220 255 C 221 257, 225 262, 255 270 C 250 265, 240 257, 234 244 C 250 252, 274 261, 312 267 C 303 262, 292 253, 284 240 C 298 246, 315 249, 332 245 C 270 205, 238 178, 220 155 Z"
                        fill={isWinter ? 'url(#winter-tier-2)' : isAurora ? 'url(#aurora-tier-2)' : 'url(#classic-tier-2)'}
                    />

                    {/* PINE TIER 1 (Top Tier) */}
                    <path
                        d="M 220 72 C 208 92, 182 120, 138 155 C 152 158, 166 156, 178 151 C 171 161, 162 168, 154 172 C 185 167, 204 160, 216 154 C 212 163, 204 170, 200 174 C 218 168, 219 165, 220 163 C 221 165, 222 168, 240 174 C 236 170, 228 163, 224 154 C 236 160, 255 167, 286 172 C 278 168, 269 161, 262 151 C 274 156, 288 158, 302 155 C 258 120, 232 92, 220 72 Z"
                        fill={isWinter ? 'url(#winter-tier-1)' : isAurora ? 'url(#aurora-tier-1)' : 'url(#classic-tier-1)'}
                    />

                    {/* Snow Dips on Tier Edges (Winter & Classic) */}
                    {(isWinter || !isAurora) && (
                        <g fill="#ffffff" opacity={isWinter ? 0.92 : 0.45}>
                            {/* Tier 1 snow cap */}
                            <path d="M 220 72 C 214 85, 200 102, 185 115 C 196 112, 208 114, 220 110 C 232 114, 244 112, 255 115 C 240 102, 226 85, 220 72 Z" />
                            {/* Tier 2 snow highlights */}
                            <path d="M 128 243 C 145 238, 170 240, 190 232 C 200 237, 220 236, 220 236 C 220 236, 240 237, 250 232 C 270 240, 295 238, 312 243 C 285 248, 260 245, 245 250 C 235 246, 220 247, 220 247 C 220 247, 205 246, 195 250 C 180 245, 155 248, 128 243 Z" />
                            {/* Tier 3 snow highlights */}
                            <path d="M 98 343 C 125 338, 160 340, 185 332 C 198 337, 220 336, 220 336 C 220 336, 242 337, 255 332 C 280 340, 315 338, 342 343 C 310 349, 280 346, 262 352 C 250 347, 220 349, 220 349 C 220 349, 190 347, 178 352 C 160 346, 130 349, 98 343 Z" />
                        </g>
                    )}

                    {/* Draped Garland Bead Chains */}
                    <g stroke={isWinter ? '#bae6fd' : isAurora ? '#f472b6' : '#facc15'} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 8" opacity="0.85">
                        <path d="M 155 145 Q 220 180 285 145" fill="none" />
                        <path d="M 125 235 Q 220 280 315 235" fill="none" />
                        <path d="M 95 335 Q 220 390 345 335" fill="none" />
                        <path d="M 68 440 Q 220 500 372 440" fill="none" />
                    </g>

                    {/* Star Topper */}
                    <g transform="translate(220, 68)">
                        {/* Glow halo */}
                        <circle cx="0" cy="0" r="28" fill={isWinter ? '#38bdf8' : '#facc15'} opacity="0.3" filter="blur(8px)" />
                        {isWinter ? (
                            // Winter Snowflake Star
                            <g stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round">
                                <line x1="0" y1="-22" x2="0" y2="22" />
                                <line x1="-19" y1="-11" x2="19" y2="11" />
                                <line x1="-19" y1="11" x2="19" y2="-11" />
                                <circle cx="0" cy="0" r="4.5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
                            </g>
                        ) : (
                            // Radiant 8-pointed Festive Star
                            <g>
                                <path
                                    d="M 0 -24 L 5.5 -7.5 L 22 -7.5 L 8.5 2.5 L 14 18.5 L 0 8.5 L -14 18.5 L -8.5 2.5 L -22 -7.5 L -5.5 -7.5 Z"
                                    fill={isAurora ? 'url(#aurora-star-grad)' : 'url(#gold-star-grad)'}
                                    stroke="#fef08a"
                                    strokeWidth="0.8"
                                />
                                <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
                            </g>
                        )}
                    </g>

                    {/* Star Gradient Defs */}
                    <defs>
                        <radialGradient id="gold-star-grad" cx="45%" cy="40%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="35%" stopColor="#fef08a" />
                            <stop offset="70%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#d97706" />
                        </radialGradient>
                        <radialGradient id="aurora-star-grad" cx="45%" cy="40%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="40%" stopColor="#e9d5ff" />
                            <stop offset="75%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#7e22ce" />
                        </radialGradient>
                    </defs>
                </svg>

                {/* Twinkling Fairy Lights Overlay */}
                {FAIRY_LIGHTS.map((light, index) => {
                    const style: CSSProperties = {
                        left: `${light.x}%`,
                        top: `${light.y}%`,
                        animationDelay: `${light.delay}s`,
                    }

                    const lightColor = isWinter
                        ? (index % 2 === 0 ? 'ice' : 'gold')
                        : isAurora
                            ? (index % 3 === 0 ? 'purple' : index % 3 === 1 ? 'ice' : 'green')
                            : light.color

                    return (
                        <span
                            key={`fairy-light-${index}`}
                            className={`cw-tree-light cw-tree-light--${lightColor}`}
                            style={style}
                            aria-hidden="true"
                        />
                    )
                })}

                {/* THE 12 REAL GIFTS / ORNAMENTS OF THE CURRENT PAGE */}
                {normalizedItems.map((item, index) => (
                    <TreeDecoration
                        key={item.id}
                        item={item}
                        onSelect={handleSelect}
                        animationDelay={index * 0.1}
                    />
                ))}
            </div>
        </div>
    )
}
