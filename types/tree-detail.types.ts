export type TreeTheme = 'classic' | 'winter' | 'aurora' | (string & {})

export type TreeStatus = 'ACTIVE' | 'INACTIVE'

export type TreeGiftOrnamentType =
    | 'gift_box'
    | 'bauble'
    | 'bell'
    | 'candy_cane'
    | 'snowflake'
    | 'stocking'
    | 'star'
    | 'envelope'

export type TreeDecorationType = TreeGiftOrnamentType

export type TreeDecorationZone = 'canopy' | 'base'

export type TreeDecorationSource = 'gift' | 'ambient'

export type TreeGiftTheme = 'red_box' | 'green_box' | 'gold_box' | 'blue_box' | 'purple_box' | (string & {})

export type WishDecorationType = string

/**
 * Thông tin người dùng được phép hiển thị trên cây.
 */
export interface TreeUserSummary {
    _id?: string
    id?: string
    username?: string
    fullName?: string
    avatar?: string | null
}

/**
 * Nội dung hộp quà.
 * Chỉ tồn tại trong response khi backend cho phép chủ cây xem.
 */
export interface TreeGiftContent {
    _id?: string
    id?: string
    giftId?: string
    content?: string
    theme?: TreeGiftTheme
    ornamentType?: TreeGiftOrnamentType
    isOpened?: boolean
    openedAt?: string | null
}

/**
 * Nội dung lời ước gắn với hộp quà.
 */
export interface TreeWishContent {
    message: string
    decorationType?: WishDecorationType
}

/**
 * Một phần tử quà do API GET /trees/:id trả về.
 */
export interface TreeGift {
    _id?: string
    id?: string
    giftId?: string
    sender: TreeUserSummary | null
    createdAt?: string
    theme?: TreeGiftTheme
    ornamentType?: TreeGiftOrnamentType
    isOpened?: boolean
    openedAt?: string | null
    gift?: TreeGiftContent | null
    wish?: TreeWishContent | null
}

/**
 * Chi tiết cây từ GET /trees/:id.
 */
export interface TreeDetail {
    _id: string
    name: string
    year: number
    theme?: TreeTheme
    status?: TreeStatus
    owner: TreeUserSummary | null
    gifts: TreeGift[]
    contentsUnlocked: boolean
    isOwner?: boolean
    hasSentGift?: boolean
}

/**
 * Vị trí một vật trang trí trên cây.
 * x và y sử dụng phần trăm của khu vực cây.
 */
export interface TreeDecorationPosition {
    zone: TreeDecorationZone
    x: number
    y: number
    rotation: number
    scale: number
}

/**
 * Cấu hình hiển thị của một loại vật trang trí.
 */
export interface TreeDecorationDefinition {
    type: TreeDecorationType
    label: string
    visual: string
    icon: string
    description: string
}

/**
 * Vật trang trí tĩnh, không đại diện cho quà thật.
 */
export interface TreeAmbientDecoration {
    id: string
    type: Exclude<TreeDecorationType, 'gift_box'>
    x: number
    y: number
    rotation: number
    scale: number
    opacity: number
}

/**
 * Dữ liệu đã được frontend ánh xạ để hiển thị trên cây.
 */
export interface TreeSceneItem {
    id: string
    type: TreeDecorationType
    source: TreeDecorationSource
    position: TreeDecorationPosition
    gift?: TreeGift
}

/**
 * Thông tin phân trang quà trên cùng một cây.
 */
export interface TreePaginationState {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
}

/**
 * Payload gửi hộp quà & lời chúc.
 */
export interface CreateTreeGiftPayload {
    treeId: string
    receiverId: string
    content: string
    theme?: string
    ornamentType?: TreeGiftOrnamentType
    wishMessage?: string
    wishDecorationType?: string
}

/**
 * Thông báo dùng trong trang chi tiết.
 */
export interface TreeDetailNotice {
    type: 'success' | 'error' | 'info'
    text: string
}
