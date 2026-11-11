import { CalendarDays, Gift, LockKeyhole, UnlockKeyhole, UserRound } from 'lucide-react'
import type { TreeDetail, TreeUserSummary } from '@/types/tree-detail.types'

export interface TreeInfoOverlayProps {
    tree?: TreeDetail | null
    owner?: TreeUserSummary | null
    year?: number
    totalGifts?: number
    giftCount?: number
    giftsCount?: number
    isOwner?: boolean
    contentsUnlocked?: boolean
    canViewContents?: boolean
    isAuthenticated?: boolean
    canSendGift?: boolean
    onSendGift?: () => void
    onOpenSendGift?: () => void
    onShare?: () => void
    onShareTree?: () => void
}

export default function TreeInfoOverlay(props: TreeInfoOverlayProps) {
    const owner = props.owner || props.tree?.owner || null
    const year = props.year ?? props.tree?.year ?? new Date().getFullYear()
    const rawGifts = props.totalGifts ?? props.giftCount ?? props.giftsCount ?? props.tree?.gifts?.length ?? 0
    const totalGifts = typeof rawGifts === 'number' && !Number.isNaN(rawGifts) ? rawGifts : 0
    const isOwner = Boolean(props.isOwner)
    const contentsUnlocked = Boolean(props.contentsUnlocked ?? props.canViewContents ?? props.tree?.contentsUnlocked)

    const ownerName = owner?.fullName || owner?.username || 'Chủ nhân cây thông'

    const accessStatus = !contentsUnlocked
        ? `Mở khóa lúc 00:00 · 25/12/${year}`
        : isOwner
            ? 'Bạn có thể khám phá quà'
            : 'Chỉ chủ cây được xem nội dung'

    return (
        <div className="cw-tree-info-overlay" style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }} role="group" aria-label="Thông tin cây Giáng Sinh">
            <div className="cw-tree-hud cw-tree-hud--top-left">
                <span className="cw-tree-hud__icon">
                    <UserRound size={18} aria-hidden="true" />
                </span>
                <div>
                    <p className="cw-tree-hud__label">CHỦ NHÂN CÂY</p>
                    <p className="cw-tree-hud__value">{ownerName}</p>
                </div>
            </div>

            <div className="cw-tree-hud cw-tree-hud--top-right">
                <span className="cw-tree-hud__icon">
                    <CalendarDays size={18} aria-hidden="true" />
                </span>
                <div>
                    <p className="cw-tree-hud__label">MÙA GIÁNG SINH</p>
                    <p className="cw-tree-hud__value">{year}</p>
                </div>
            </div>

            <div className="cw-tree-hud cw-tree-hud--bottom-left">
                <span className="cw-tree-hud__icon">
                    <Gift size={18} aria-hidden="true" />
                </span>
                <div>
                    <p className="cw-tree-hud__label">QUÀ TẶNG</p>
                    <p className="cw-tree-hud__value">{(totalGifts ?? 0).toLocaleString('vi-VN')} món quà</p>
                </div>
            </div>

            <div className="cw-tree-hud cw-tree-hud--bottom-right">
                <span className="cw-tree-hud__icon">
                    {contentsUnlocked ? <UnlockKeyhole size={18} aria-hidden="true" /> : <LockKeyhole size={18} aria-hidden="true" />}
                </span>
                <div>
                    <p className="cw-tree-hud__label">TRẠNG THÁI LỜI CHÚC</p>
                    <p className="cw-tree-hud__value">{accessStatus}</p>
                </div>
            </div>
        </div>
    )
}
