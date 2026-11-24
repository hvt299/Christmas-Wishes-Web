'use client'

// components/games/GameFooter.tsx
// Footer chuẩn phong cách Giáng Sinh đồng nhất cho các trang game
interface Props {
  currentYear?: number | null
}

export function GameFooter({ currentYear }: Props) {
  const year = currentYear ?? new Date().getFullYear()

  return (
    <footer className="relative z-10 mt-8 border-t border-yellow-400/10 bg-black/20 px-4 py-5 text-center text-xs text-white/50 backdrop-blur-sm md:text-sm">
      <p>© {year} Christmas Wishes</p>
      <p className="mt-1 text-yellow-100/40">Made with ❤️ for a magical Christmas</p>
    </footer>
  )
}
