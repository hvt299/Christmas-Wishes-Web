'use client'

import { TREE_ITEMS_PER_PAGE } from '@/constants/tree-decorations'

export interface TreePaginationProps {
    currentPage?: number
    page?: number
    totalItems: number
    pageSize?: number
    itemsPerPage?: number
    totalPages?: number
    pageCount?: number
    onPageChange?: (page: number) => void
    onChange?: (page: number) => void
}

export default function TreePagination(props: TreePaginationProps) {
    const safeTotalItems = Math.max(0, props.totalItems ?? 0)
    const safePageSize = Math.max(1, props.pageSize ?? props.itemsPerPage ?? TREE_ITEMS_PER_PAGE)
    const calculatedTotalPages = Math.ceil(safeTotalItems / safePageSize)
    const totalPages = Math.max(1, props.totalPages ?? props.pageCount ?? calculatedTotalPages)

    const rawCurrentPage = props.currentPage ?? props.page ?? 1
    const safeCurrentPage = Math.min(Math.max(1, rawCurrentPage), totalPages)

    const handlePageChange = (newPage: number) => {
        if (props.onPageChange) props.onPageChange(newPage)
        if (props.onChange) props.onChange(newPage)
    }

    if (totalPages <= 1) return null

    const startItem = (safeCurrentPage - 1) * safePageSize + 1
    const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems)

    const handlePrevious = () => {
        if (safeCurrentPage > 1) {
            handlePageChange(safeCurrentPage - 1)
        }
    }

    const handleNext = () => {
        if (safeCurrentPage < totalPages) {
            handlePageChange(safeCurrentPage + 1)
        }
    }

    return (
        <nav className="cw-tree-pagination" aria-label="Phân trang quà tặng">
            <button type="button" className="cw-tree-pagination__button" onClick={handlePrevious} disabled={safeCurrentPage === 1} aria-label="Trang trước">
                ← Trước
            </button>

            <span className="cw-tree-pagination__status" aria-live="polite">
                Trang {safeCurrentPage}/{totalPages} · {startItem}-{endItem}/{safeTotalItems} quà
            </span>

            <button type="button" className="cw-tree-pagination__button" onClick={handleNext} disabled={safeCurrentPage === totalPages} aria-label="Trang tiếp theo">
                Sau →
            </button>
        </nav>
    )
}
