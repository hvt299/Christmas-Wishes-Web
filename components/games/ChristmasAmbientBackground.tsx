'use client'

// components/games/ChristmasAmbientBackground.tsx
// Nền ambient Giáng Sinh lung linh kế thừa từ my-trees
import { Snowflake, Sparkles } from 'lucide-react'

export function ChristmasAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-linear-to-b from-red-950 via-red-950 to-green-950">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/20 blur-[100px]" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-300/10 blur-[100px]" />
      <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/4 blur-[120px]" />
      <Snowflake className="absolute left-[8%] top-[20%] h-10 w-10 text-yellow-100/15" />
      <Snowflake className="absolute right-[12%] top-[28%] h-14 w-14 animate-pulse text-yellow-100/15" />
      <Snowflake className="absolute bottom-[15%] left-[15%] h-9 w-9 text-white/10" />
      <Snowflake className="absolute bottom-[12%] right-[10%] h-8 w-8 text-yellow-100/15" />
      <Sparkles className="absolute left-[25%] top-[35%] h-5 w-5 text-yellow-300/20" />
      <Sparkles className="absolute bottom-[30%] right-[25%] h-6 w-6 text-yellow-300/20" />
    </div>
  )
}
