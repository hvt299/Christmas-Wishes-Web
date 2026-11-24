// lib/sound-effects.ts
// Interactive Web Audio API sound effects for Christmas Wishes Games.
// Zero external assets, zero missing 404s, works instantly on mobile & desktop browsers.

class SoundEffectsManager {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  /** Button tap / micro interaction */
  public playClick() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  }

  /** Bắt bông tuyết trong Snowflake Game */
  public playCatch(type: 'snow' | 'crystal' | 'gold' | 'coal' | 'shadow') {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime

    if (type === 'snow') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.13)
    } else if (type === 'crystal') {
      // Sparkling chord
      ;[1046, 1318, 1567].forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.03)
        gain.gain.setValueAtTime(0.09, now + idx * 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.15)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.03)
        osc.stop(now + idx * 0.03 + 0.16)
      })
    } else if (type === 'gold') {
      // Golden bell arpeggio
      ;[659, 830, 987, 1318].forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.04)
        gain.gain.setValueAtTime(0.14, now + idx * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.04)
        osc.stop(now + idx * 0.04 + 0.26)
      })
    } else if (type === 'coal') {
      // Deep thud
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(160, now)
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.15)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.18)
    } else if (type === 'shadow') {
      // Eerie low buzz
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(110, now)
      osc.frequency.linearRampToValueAtTime(45, now + 0.25)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.3)
    }
  }

  /** Lật thẻ */
  public playCardFlip() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    // White noise swoosh / snap
    const bufferSize = ctx.sampleRate * 0.05
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800, now)
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.05)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    noise.start(now)
  }

  /** Lật trúng mục tiêu */
  public playCardMatch() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.05)
      gain.gain.setValueAtTime(0.12, now + idx * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.05)
      osc.stop(now + idx * 0.05 + 0.22)
    })
  }

  /** Lật trúng bẫy */
  public playTrapHit() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.linearRampToValueAtTime(110, now + 0.2)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.25)
  }

  /** Khiên bảo vệ chặn bẫy */
  public playShieldBlock() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    ;[800, 1200, 1600].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.04)
      gain.gain.setValueAtTime(0.12, now + idx * 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.04)
      osc.stop(now + idx * 0.04 + 0.22)
    })
  }

  /** Vòng quay may mắn: Kim gõ qua nan */
  public playWheelTick() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1400, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.025)
  }

  /** Vòng quay may mắn: Trúng thưởng / dừng kim */
  public playWheelWin() {
    this.playWinFanfare()
  }

  /** Mở hộp quà: bung nắp & lấp lánh */
  public playBoxOpen(isReward: boolean = true) {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Pop sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(280, now)
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.06)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)

    // Sparkle if reward
    if (isReward) {
      setTimeout(() => {
        if (this.isMuted || !this.ctx) return
        const t = this.ctx.currentTime
        ;[880, 1174, 1480].forEach((freq, idx) => {
          const sOsc = this.ctx!.createOscillator()
          const sGain = this.ctx!.createGain()
          sOsc.type = 'sine'
          sOsc.frequency.setValueAtTime(freq, t + idx * 0.04)
          sGain.gain.setValueAtTime(0.1, t + idx * 0.04)
          sGain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.18)
          sOsc.connect(sGain)
          sGain.connect(this.ctx!.destination)
          sOsc.start(t + idx * 0.04)
          sOsc.stop(t + idx * 0.04 + 0.2)
        })
      }, 50)
    }
  }

  /** Thắng lớn / Jackpot / Hoàn thành ván đỉnh cao */
  public playWinFanfare() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.07)
      gain.gain.setValueAtTime(0.15, now + idx * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.07)
      osc.stop(now + idx * 0.07 + 0.38)
    })
  }
}

export const soundEffects = new SoundEffectsManager()
