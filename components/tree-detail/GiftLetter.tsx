'use client'

import { CalendarDays, Heart, Mail, X } from 'lucide-react'
import type { TreeWishContent } from '@/types/tree-detail.types'

interface GiftLetterProps {
    wish: TreeWishContent | null
    senderName: string
    senderAvatar?: string | null
    createdAt?: string | null
    onClose: () => void
}

export default function GiftLetter({ wish, senderName, senderAvatar, createdAt, onClose }: GiftLetterProps) {
    const initial = senderName.trim().charAt(0).toUpperCase() || '?'
    const message = wish?.message?.trim()

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null

    return (
        <article className="cw-gift-letter" aria-label="Lời chúc Giáng Sinh">
            <header className="cw-gift-letter__header">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Christmas Wishes</p>
                        <h3 className="text-lg font-bold text-red-950">Một lời chúc dành riêng cho bạn</h3>
                    </div>
                </div>

                <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-black/5 hover:text-gray-800" aria-label="Đóng lời chúc">
                    <X size={20} />
                </button>
            </header>

            <div className="cw-gift-letter__body">
                <div className="mb-5 flex items-center gap-3">
                    {senderAvatar ? (
                        <img src={senderAvatar} alt={senderName} className="h-11 w-11 rounded-full border-2 border-amber-200 object-cover" />
                    ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
                            {initial}
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="text-xs text-gray-500">Gửi từ</p>
                        <p className="truncate font-semibold text-gray-900">{senderName}</p>
                    </div>
                </div>

                {message ? (
                    <p className="whitespace-pre-wrap break-words text-base leading-8 text-gray-800">{message}</p>
                ) : (
                    <div className="py-6 text-center">
                        <Mail size={32} className="mx-auto mb-3 text-amber-500" />
                        <p className="font-medium text-gray-700">Món quà này không kèm lời chúc.</p>
                        <p className="mt-1 text-sm text-gray-500">Nhưng vẫn chứa đựng tình cảm của người gửi.</p>
                    </div>
                )}
            </div>

            <footer className="cw-gift-letter__footer">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {formattedDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarDays size={15} />
                            <span>{formattedDate}</span>
                        </div>
                    )}

                    <div className="ml-auto flex items-center gap-2 text-sm font-medium text-red-700">
                        <Heart size={16} fill="currentColor" />
                        <span>Made with love</span>
                    </div>
                </div>
            </footer>
        </article>
    )
}