import type { TreeAmbientDecoration, TreeDecorationDefinition, TreeDecorationPosition, TreeDecorationType, TreeTheme } from '@/types/tree-detail.types'

export const TREE_ITEMS_PER_PAGE = 12

export const TREE_CANOPY_ITEMS_PER_PAGE = 9

export const TREE_BASE_ITEMS_PER_PAGE = TREE_ITEMS_PER_PAGE - TREE_CANOPY_ITEMS_PER_PAGE

export interface TreeThemeConfig {
    id: 'classic' | 'winter' | 'aurora'
    name: string
    badge: string
    shortDesc: string
    description: string
    tagClass: string
    accentColor: string
    previewGradient: string
}

export const TREE_THEMES: Record<'classic' | 'winter' | 'aurora', TreeThemeConfig> = {
    classic: {
        id: 'classic',
        name: 'Cổ điển',
        badge: '🎄 Cổ điển',
        shortDesc: 'Xanh thông truyền thống, ấm cúng & nồng nàn',
        description: 'Tán thông xanh rừng già tự nhiên với ánh trăng vàng mật, đèn vàng kim ấm áp và nơ đỏ rực rỡ.',
        tagClass: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
        accentColor: '#facc15',
        previewGradient: 'from-emerald-950 via-[#073b29] to-red-950',
    },
    winter: {
        id: 'winter',
        name: 'Mùa đông',
        badge: '❄️ Mùa đông',
        shortDesc: 'Băng tuyết tinh khôi, ánh sao pha lê trắng bạc',
        description: 'Bầu trời đêm băng giá phương Bắc, tán thông phủ đầy tuyết trắng xóa và ánh đèn xanh lơ lấp lánh.',
        tagClass: 'border-sky-400/30 bg-sky-500/15 text-sky-200',
        accentColor: '#38bdf8',
        previewGradient: 'from-[#051026] via-[#0d2b45] to-[#1e3a5f]',
    },
    aurora: {
        id: 'aurora',
        name: 'Ánh cực quang',
        badge: '✨ Ánh cực quang',
        shortDesc: 'Huyền bí diệu kỳ, dải lụa cực quang xanh tím',
        description: 'Bầu trời cực quang huyền ảo với các dải chuyển sắc ngọc bích - tím hồng, ma thuật Giáng Sinh lộng lẫy.',
        tagClass: 'border-purple-400/30 bg-purple-500/15 text-purple-200',
        accentColor: '#c084fc',
        previewGradient: 'from-[#080417] via-[#1e0836] to-[#042f2e]',
    },
}

export const getThemeConfig = (theme?: string): TreeThemeConfig => {
    if (theme === 'winter') return TREE_THEMES.winter
    if (theme === 'aurora') return TREE_THEMES.aurora
    return TREE_THEMES.classic
}

/**
 * Danh mục 8 loại vật phẩm trang trí Giáng Sinh.
 */
export const TREE_DECORATION_CATALOG: Record<TreeDecorationType, TreeDecorationDefinition> = {
    gift_box: {
        type: 'gift_box',
        label: 'Hộp quà ấm áp',
        visual: 'gift-box',
        icon: '🎁',
        description: 'Hộp quà buộc nơ lấp lánh, gửi gắm trọn vẹn tình cảm',
    },
    bauble: {
        type: 'bauble',
        label: 'Quả châu lấp lánh',
        visual: 'bauble',
        icon: '🔴',
        description: 'Quả cầu thủy tinh lung linh phản chiếu ánh nến',
    },
    bell: {
        type: 'bell',
        label: 'Chuông ngân Giáng Sinh',
        visual: 'bell',
        icon: '🔔',
        description: 'Tiếng chuông rộn rã báo hiệu tin vui và may mắn',
    },
    candy_cane: {
        type: 'candy_cane',
        label: 'Kẹo gậy ngọt ngào',
        visual: 'candy-cane',
        icon: '🍬',
        description: 'Thanh kẹo sọc đỏ trắng mang vị ngọt ngào mùa lễ hội',
    },
    snowflake: {
        type: 'snowflake',
        label: 'Bông tuyết pha lê',
        visual: 'snowflake',
        icon: '❄️',
        description: 'Bông hoa tuyết tinh khôi rơi nhẹ từ bầu trời đông',
    },
    stocking: {
        type: 'stocking',
        label: 'Tất quà Noel',
        visual: 'stocking',
        icon: '🧦',
        description: 'Chiếc tất ấm áp chứa đựng những điều ước nhỏ bé',
    },
    star: {
        type: 'star',
        label: 'Ngôi sao may mắn',
        visual: 'star',
        icon: '⭐',
        description: 'Ánh sao sáng dẫn lối và mang lại hy vọng tươi đẹp',
    },
    envelope: {
        type: 'envelope',
        label: 'Phong thư yêu thương',
        visual: 'envelope',
        icon: '💌',
        description: 'Bức thư tay mộc mạc gửi gắm những lời chúc chân thành',
    },
}

/**
 * Vị trí 12 món quà trên cây theo bố cục decomytree:
 * 9 món phân bố hài hòa trên tán cây, 3 món dưới gốc tuyết.
 */
export const TREE_GIFT_POSITIONS: TreeDecorationPosition[] = [
    { zone: 'canopy', x: 50, y: 22, rotation: -2, scale: 0.95 },
    { zone: 'canopy', x: 38, y: 33, rotation: -6, scale: 0.95 },
    { zone: 'canopy', x: 62, y: 33, rotation: 5, scale: 0.95 },
    { zone: 'canopy', x: 27, y: 47, rotation: -7, scale: 0.98 },
    { zone: 'canopy', x: 50, y: 45, rotation: 1, scale: 1.02 },
    { zone: 'canopy', x: 73, y: 47, rotation: 6, scale: 0.98 },
    { zone: 'canopy', x: 20, y: 62, rotation: -8, scale: 1.0 },
    { zone: 'canopy', x: 39, y: 63, rotation: -4, scale: 1.02 },
    { zone: 'canopy', x: 61, y: 63, rotation: 4, scale: 1.02 },
    { zone: 'canopy', x: 80, y: 62, rotation: 8, scale: 1.0 },
    { zone: 'base', x: 32, y: 84, rotation: -6, scale: 1.08 },
    { zone: 'base', x: 68, y: 84, rotation: 6, scale: 1.08 },
]

export const TREE_AMBIENT_DECORATIONS: TreeAmbientDecoration[] = []

export const TREE_LIGHT_POSITIONS = [
    { x: 43, y: 20, color: 'gold' },
    { x: 57, y: 27, color: 'red' },
    { x: 36, y: 34, color: 'ice' },
    { x: 65, y: 39, color: 'gold' },
    { x: 48, y: 42, color: 'green' },
    { x: 29, y: 47, color: 'gold' },
    { x: 72, y: 51, color: 'red' },
    { x: 39, y: 56, color: 'ice' },
    { x: 58, y: 60, color: 'gold' },
    { x: 30, y: 65, color: 'green' },
    { x: 69, y: 67, color: 'gold' },
    { x: 45, y: 74, color: 'red' },
    { x: 58, y: 77, color: 'ice' },
] as const

export const TREE_SCENE_CONFIG = {
    maxWidth: 960,
    desktopHeight: 720,
    mobileHeight: 560,
} as const
