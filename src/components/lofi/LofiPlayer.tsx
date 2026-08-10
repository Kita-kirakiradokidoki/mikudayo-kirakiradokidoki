import { useEffect, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useLofiAudio } from './LofiAudioContext'
import { SITE_CONFIG } from '../../site.config'
import { withBase } from '../../lib/base'
import { useLang } from '../../i18n'

export default function LofiPlayer() {
  const { pick } = useLang()
  const tracks = SITE_CONFIG.lofi.audio.tracks
  const { audioRef, wantPlayRef, requestPlay } = useLofiAudio()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [muted, setMuted] = useState(false)
  const [needsGesture, setNeedsGesture] = useState(false)

  const current = tracks.length > 0 ? tracks[index % tracks.length] : null

  // create / swap the audio element when the track changes
  useEffect(() => {
    if (!current) return
    const el = new Audio(withBase(current.url))
    el.loop = false
    el.preload = 'metadata'
    el.volume = muted ? 0 : volume
    el.muted = muted
    el.addEventListener('play', () => setPlaying(true))
    el.addEventListener('pause', () => setPlaying(false))
    el.addEventListener('ended', () => setIndex((i) => (i + 1) % tracks.length))
    audioRef.current = el
    wantPlayRef.current = true
    if (SITE_CONFIG.lofi.audio.autoplay && wantPlayRef.current) {
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => setNeedsGesture(true))
    }
    return () => {
      el.pause()
      el.removeAttribute('src')
      el.load()
      audioRef.current = null
      setPlaying(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.url])

  // keep volume / mute in sync without recreating the element
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = muted ? 0 : volume
    el.muted = muted
  }, [volume, muted])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      requestPlay()
    } else {
      wantPlayRef.current = false
      el.pause()
    }
  }

  const goTo = (next: number) => {
    setIndex((next + tracks.length) % tracks.length)
  }

  if (!current) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md">
      {needsGesture && !playing && (
        <button
          onClick={() => {
            requestPlay()
            setNeedsGesture(false)
          }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-orange-500/20 transition-transform active:scale-[0.98]"
        >
          <span aria-hidden>🔊</span>
          {pick({ zh: '点击开启音乐', en: 'Tap to play music' })}
        </button>
      )}
      <div className="flex items-center gap-4">
        {/* spinning record disc */}
        <div className="relative size-16 shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black shadow-inner" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-300 to-orange-500" />
          <div
            className={`absolute inset-0 rounded-full ${playing ? 'animate-spin-slow' : ''}`}
            style={{
              background:
                'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0 2px, transparent 2px 6px)',
            }}
          />
          <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        </div>

        {/* track info + controls */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-amber-100">{current.title}</p>
          <p className="truncate text-xs text-white/50">{current.artist}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => goTo(index - 1)}
              aria-label={pick({ zh: '上一首', en: 'Previous' })}
              className="text-white/60 transition-colors hover:text-amber-200"
            >
              <SkipBack className="size-4" />
            </button>
            <button
              onClick={toggle}
              aria-label={pick({ zh: playing ? '暂停' : '播放', en: playing ? 'Pause' : 'Play' })}
              className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label={pick({ zh: '下一首', en: 'Next' })}
              className="text-white/60 transition-colors hover:text-amber-200"
            >
              <SkipForward className="size-4" />
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={pick({ zh: muted ? '取消静音' : '静音', en: muted ? 'Unmute' : 'Mute' })}
              className="text-white/60 transition-colors hover:text-amber-200"
            >
              {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label={pick({ zh: '音量', en: 'Volume' })}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
