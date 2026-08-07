import { useState } from 'react'
import { Play, Pause, Music, Volume2, VolumeX } from 'lucide-react'
import { useBgm } from './AudioProvider'
import { withBase } from '../lib/base'

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

export default function FloatingPlayer() {
  const {
    available,
    playing,
    toggle,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    muted,
    toggleMute,
    meta,
  } = useBgm()
  const [collapsed, setCollapsed] = useState(true)

  if (!available) return null

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className={`relative z-50 origin-bottom-right scale-[1.2] overflow-hidden rounded-xl border bg-ink/80 shadow-xl backdrop-blur-md transition-[width,border-color] duration-[450ms] ${EASE} ${
        collapsed ? 'size-16 border-transparent' : 'w-[316px] border-line'
      }`}
    >
      <div className={`flex items-stretch ${collapsed ? 'gap-0 p-0' : 'gap-3 p-3'}`}>
        {/* left: square album cover (fixed size in both states) */}
        <button
          onClick={toggle}
          aria-label={playing ? '暂停' : '播放'}
          className={`relative size-16 shrink-0 overflow-hidden bg-ink-2 transition-[border-radius] duration-[450ms] ${EASE} ${
            collapsed ? '-m-px rounded-xl' : 'rounded-md border border-line'
          }`}
        >
          {meta.cover ? (
            <img src={withBase(meta.cover)} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-accent">
              <Music className="size-6" />
            </span>
          )}

          {/* playback progress: only when collapsed, 5px from the bottom inner edge */}
          {collapsed && (
            <span className="absolute inset-x-[5px] bottom-[5px] block h-[3px] rounded-full bg-black/40">
              <span
                className="block h-full rounded-full bg-accent transition-[width] duration-150"
                style={{ width: `${pct}%` }}
              />
            </span>
          )}
        </button>

        {/* right: title / progress / controls (animated in/out) */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden transition-[width,opacity] duration-[450ms] ${EASE} ${
            collapsed ? 'w-0 opacity-0' : 'w-[220px] opacity-100'
          }`}
        >
          <p className="truncate text-center font-mono text-xs tracking-wide text-paper">
            {meta.title}
          </p>
          {meta.artist && (
            <p className="truncate text-center font-mono text-[10px] text-dim">{meta.artist}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="w-8 text-right font-mono text-[10px] text-dim">{fmt(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded bg-line"
              style={{ accentColor: 'var(--color-accent)' }}
              aria-label="播放进度"
            />
            <span className="w-8 font-mono text-[10px] text-dim">{fmt(duration)}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              onClick={toggle}
              aria-label={playing ? '暂停' : '播放'}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-ink transition-transform hover:scale-105"
            >
              {playing ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 translate-x-[1px]" />
              )}
            </button>

            {/* volume control + mute toggle */}
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                onClick={toggleMute}
                aria-label={muted ? '取消静音' : '静音'}
                aria-pressed={muted}
                className={`shrink-0 transition-colors ${
                  muted ? 'text-amber' : 'text-dim hover:text-paper'
                }`}
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 w-16 cursor-pointer appearance-none rounded bg-line"
                style={{ accentColor: 'var(--color-accent)' }}
                aria-label="音量"
              />
              <span className="w-7 shrink-0 font-mono text-[10px] text-dim">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
