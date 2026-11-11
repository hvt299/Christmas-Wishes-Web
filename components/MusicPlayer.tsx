'use client'

import { useEffect, useRef, useState } from 'react'
import { useMusicStore } from '@/store/useMusicStore'
import { Disc3, Music2, Sparkles, Volume2, VolumeX } from 'lucide-react'

export default function MusicPlayer() {
  const { isPlaying, currentSongUrl, togglePlay } = useMusicStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = isMuted
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch((error) => console.log('Chặn autoplay:', error))
    } else {
      audio.pause()
    }
  }, [isPlaying, currentSongUrl])

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (value > 0 && isMuted) setIsMuted(false)
  }

  const handleMute = () => {
    if (isMuted || volume === 0) {
      setIsMuted(false)
      if (volume === 0) setVolume(0.5)
    } else {
      setIsMuted(true)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 md:bottom-6 md:right-6">
      <audio ref={audioRef} src={currentSongUrl || ''} loop />

      {showVolume && (
        <div className="absolute bottom-16 right-0 w-56 rounded-2xl border border-yellow-300/30 bg-gradient-to-br from-red-900/95 via-red-950/95 to-green-950/95 p-4 shadow-[0_0_25px_rgba(234,179,8,0.2)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200 md:bottom-[4.5rem]">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="font-serif text-sm font-bold text-yellow-200">Âm lượng Giáng Sinh</span>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={handleMute} aria-label={isMuted || volume === 0 ? 'Bật tiếng' : 'Tắt tiếng'} className="shrink-0 rounded-full p-1.5 text-yellow-200/80 transition hover:bg-white/10 hover:text-yellow-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => handleVolumeChange(Number(e.target.value))} aria-label="Điều chỉnh âm lượng" className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300" />

            <span className="w-9 text-right text-xs font-semibold tabular-nums text-yellow-100">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>

          <p className="mt-3 text-center text-[11px] text-white/45">Điều chỉnh giai điệu theo ý bạn ✨</p>
        </div>
      )}

      {!isPlaying && !showVolume && (
        <div className="absolute bottom-16 right-0 w-48 animate-bounce rounded-2xl border border-yellow-300/40 bg-gradient-to-br from-red-900/95 via-red-950/95 to-green-950/95 p-3 text-center shadow-[0_0_25px_rgba(234,179,8,0.15)] backdrop-blur-xl md:bottom-[4.5rem]">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-yellow-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-bold tracking-wide">Giai điệu mùa lễ hội</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs leading-relaxed text-red-100/90">Bật nhạc để đón không khí Giáng Sinh nhé! 🎄</p>
          <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-yellow-300/40 bg-red-950" />
        </div>
      )}

      <div className="relative">
        <button type="button" onClick={togglePlay} title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc Giáng Sinh'} aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc Giáng Sinh'} aria-pressed={isPlaying} className={`group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-300/70 shadow-[0_0_20px_rgba(234,179,8,0.2)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-yellow-200 hover:shadow-[0_0_30px_rgba(234,179,8,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950 md:h-14 md:w-14 ${isPlaying ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700' : 'bg-gradient-to-br from-red-800/95 via-red-950/95 to-green-950/95'}`}>
          <span className="pointer-events-none absolute inset-1 rounded-full border border-white/15" />
          <span className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-300/10 via-transparent to-white/10 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

          {isPlaying ? (
            <Disc3 className="relative z-10 h-5 w-5 animate-spin text-red-950 md:h-6 md:w-6" />
          ) : (
            <Music2 className="relative z-10 h-5 w-5 animate-pulse text-yellow-200 transition-colors group-hover:text-yellow-100 md:h-6 md:w-6" />
          )}
        </button>

        <button type="button" onClick={() => setShowVolume((prev) => !prev)} title={showVolume ? 'Đóng chỉnh âm lượng' : 'Chỉnh âm lượng'} aria-label={showVolume ? 'Đóng chỉnh âm lượng' : 'Chỉnh âm lượng'} aria-expanded={showVolume} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-yellow-200/70 bg-red-950 text-yellow-200 shadow-md transition hover:scale-110 hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
          {showVolume ? <span className="text-xs font-bold">×</span> : isMuted || volume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}